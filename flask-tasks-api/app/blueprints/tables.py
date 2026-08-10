"""Dynamic table (DDL) API — ``/api/v1/tables``.

This endpoint group lets a caller create, inspect, drop and insert into
arbitrary tables. That is inherently dangerous, so three layers guard it:

1. It is disabled unless ``FEATURE_DYNAMIC_TABLES=true``.
2. Every request must present ``ADMIN_API_KEY``; there is no open fallback.
3. Application-managed tables (``tasks``, ``alembic_version``) are reserved and
   cannot be inspected as generic tables, altered, or dropped.

Identifiers cannot be bound as SQL parameters, so instead of interpolating
strings this module builds real SQLAlchemy ``Table`` objects from a whitelist of
column types. The dialect then quotes every identifier itself, which is what
makes the operation injection-safe across both SQLite and PostgreSQL.
"""

from __future__ import annotations

import re

from flask import Blueprint, jsonify
from sqlalchemy import (
    BLOB,
    Column,
    Float,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    insert,
    inspect,
    select,
)
from sqlalchemy.exc import SQLAlchemyError

from ..errors import ApiError, ConflictError, NotFoundError, ValidationError
from ..extensions import db, limiter
from ..schemas import json_body, pagination
from ..security import require_admin_key

bp = Blueprint("tables", __name__, url_prefix="/api/v1/tables")

IDENTIFIER_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,62}$")

# Column types a caller may request, mapped to portable SQLAlchemy types.
ALLOWED_TYPES = {
    "TEXT": String(1024),
    "INTEGER": Integer(),
    "REAL": Float(),
    "NUMERIC": Numeric(),
    "BLOB": BLOB(),
}

# Never exposed or mutated through this API.
RESERVED_TABLES = {"tasks", "alembic_version"}

MAX_COLUMNS = 32


def _valid_identifier(name: object) -> bool:
    return isinstance(name, str) and bool(IDENTIFIER_RE.match(name))


def _require_identifier(name: object, kind: str) -> str:
    if not _valid_identifier(name):
        raise ValidationError(
            f"Invalid {kind}: must start with a letter or underscore and contain "
            "only letters, digits and underscores (max 63 characters)",
            details={kind.replace(" ", "_"): name},
        )
    return str(name)


def _reject_reserved(table: str) -> None:
    if table.lower() in RESERVED_TABLES:
        raise ApiError(
            f"'{table}' is managed by the application and not available through this API",
            status_code=403,
            code="reserved_table",
        )


def _user_tables() -> list[str]:
    names = inspect(db.engine).get_table_names()
    return sorted(n for n in names if n.lower() not in RESERVED_TABLES)


def _reflect(table: str) -> Table:
    """Load an existing table's real definition, or raise 404."""
    _reject_reserved(table)
    if table not in _user_tables():
        raise NotFoundError(f"Table '{table}' does not exist")
    return Table(table, MetaData(), autoload_with=db.engine)


@bp.get("")
@require_admin_key
def list_tables():
    """List every caller-created table."""
    return jsonify({"data": {"tables": _user_tables()}})


@bp.post("")
@require_admin_key
@limiter.limit("10 per minute")
def create_table():
    """Create a table.

    Body: ``{"name": "notes", "columns": {"title": "TEXT", "views": "INTEGER"}}``

    An auto-incrementing ``id`` primary key is always added.
    """
    data = json_body()
    name = _require_identifier(data.get("name"), "table name")
    _reject_reserved(name)

    columns = data.get("columns")
    if not isinstance(columns, dict) or not columns:
        raise ValidationError("'columns' must be a non-empty object")
    if len(columns) > MAX_COLUMNS:
        raise ValidationError(f"A table may define at most {MAX_COLUMNS} columns")

    definitions = [Column("id", Integer, primary_key=True, autoincrement=True)]
    for column, raw_type in columns.items():
        column = _require_identifier(column, "column name")
        if column.lower() == "id":
            raise ValidationError("'id' is added automatically and must not be declared")
        type_name = str(raw_type).upper()
        if type_name not in ALLOWED_TYPES:
            raise ValidationError(
                f"Invalid column type '{raw_type}'",
                details={"column": column, "allowed": sorted(ALLOWED_TYPES)},
            )
        definitions.append(Column(column, ALLOWED_TYPES[type_name]))

    if name in inspect(db.engine).get_table_names():
        raise ConflictError(f"Table '{name}' already exists")

    table = Table(name, MetaData(), *definitions)
    try:
        table.create(db.engine)
    except SQLAlchemyError as exc:
        raise ApiError(
            "Could not create the table", status_code=500, code="database_error"
        ) from exc

    return jsonify({"data": {"status": "created", "table": name}}), 201


@bp.get("/<string:table>")
@require_admin_key
def view_table(table: str):
    """Return a table's schema plus a page of its rows."""
    table = _require_identifier(table, "table name")
    reflected = _reflect(table)
    page, per_page = pagination()

    try:
        stmt = select(reflected).limit(per_page).offset((page - 1) * per_page)
        rows = [dict(row) for row in db.session.execute(stmt).mappings()]
        total = db.session.execute(select(db.func.count()).select_from(reflected)).scalar_one()
    except SQLAlchemyError as exc:
        raise ApiError("Could not read the table", status_code=500, code="database_error") from exc

    return jsonify(
        {
            "data": {
                "table": table,
                "columns": [
                    {"name": c.name, "type": str(c.type), "nullable": c.nullable}
                    for c in reflected.columns
                ],
                "rows": rows,
            },
            "meta": {"page": page, "per_page": per_page, "total": total},
        }
    )


@bp.delete("/<string:table>")
@require_admin_key
@limiter.limit("5 per minute")
def drop_table(table: str):
    """Drop a table and everything in it. This cannot be undone."""
    table = _require_identifier(table, "table name")
    reflected = _reflect(table)
    try:
        reflected.drop(db.engine)
    except SQLAlchemyError as exc:
        raise ApiError("Could not drop the table", status_code=500, code="database_error") from exc
    return jsonify({"data": {"status": "deleted", "table": table}})


@bp.post("/<string:table>/rows")
@require_admin_key
def add_row(table: str):
    """Insert one row from a flat JSON object of column/value pairs."""
    table = _require_identifier(table, "table name")
    reflected = _reflect(table)

    data = json_body()
    if not data:
        raise ValidationError("Body must be a non-empty JSON object")

    known = {c.name for c in reflected.columns}
    unknown = set(data) - known
    if unknown:
        raise ValidationError(
            f"Unknown column(s): {', '.join(sorted(unknown))}",
            details={"unknown_columns": sorted(unknown), "known_columns": sorted(known)},
        )
    for column, value in data.items():
        if not isinstance(value, str | int | float | bool | None):
            raise ValidationError(
                f"Value for '{column}' must be a string, number, boolean or null",
                details={"column": column},
            )

    try:
        result = db.session.execute(insert(reflected).values(**data))
        db.session.commit()
    except SQLAlchemyError as exc:
        db.session.rollback()
        raise ApiError("Could not insert the row", status_code=500, code="database_error") from exc

    new_id = result.inserted_primary_key[0] if result.inserted_primary_key else None
    return jsonify({"data": {"status": "created", "id": new_id}}), 201
