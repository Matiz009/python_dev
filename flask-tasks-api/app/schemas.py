"""Request parsing and validation.

Hand-rolled rather than pulled from a validation library: the payloads here are
small, and this keeps the serverless cold-start dependency graph minimal. Each
helper raises :class:`ValidationError`, which the error handlers turn into a
422 response.
"""

from __future__ import annotations

from typing import Any

from flask import current_app, request

from .errors import ValidationError

TITLE_MAX_LENGTH = 255


def json_body() -> dict:
    """Return the request body as a dict, or fail with a clear 422."""
    if not request.is_json:
        raise ValidationError("Content-Type must be application/json")
    data = request.get_json(silent=True)
    if data is None:
        raise ValidationError("Request body must be valid JSON")
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object")
    return data


def _coerce_bool(value: Any, field: str) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str) and value.strip().lower() in {"true", "false", "1", "0"}:
        return value.strip().lower() in {"true", "1"}
    raise ValidationError(f"'{field}' must be a boolean", details={"field": field})


def _clean_title(value: Any) -> str:
    if not isinstance(value, str):
        raise ValidationError("'title' must be a string", details={"field": "title"})
    title = value.strip()
    if not title:
        raise ValidationError("'title' must not be empty", details={"field": "title"})
    if len(title) > TITLE_MAX_LENGTH:
        raise ValidationError(
            f"'title' must be at most {TITLE_MAX_LENGTH} characters",
            details={"field": "title", "max_length": TITLE_MAX_LENGTH},
        )
    return title


def task_create() -> dict:
    """Validate a task-creation body: ``{"title": str, "done": bool?}``."""
    data = json_body()
    unknown = set(data) - {"title", "done"}
    if unknown:
        raise ValidationError(
            f"Unknown field(s): {', '.join(sorted(unknown))}",
            details={"unknown_fields": sorted(unknown)},
        )
    if "title" not in data:
        raise ValidationError("'title' is required", details={"field": "title"})
    return {
        "title": _clean_title(data["title"]),
        "done": _coerce_bool(data.get("done", False), "done"),
    }


def task_update() -> dict:
    """Validate a partial task update. At least one known field is required."""
    data = json_body()
    unknown = set(data) - {"title", "done"}
    if unknown:
        raise ValidationError(
            f"Unknown field(s): {', '.join(sorted(unknown))}",
            details={"unknown_fields": sorted(unknown)},
        )
    changes: dict = {}
    if "title" in data:
        changes["title"] = _clean_title(data["title"])
    if "done" in data:
        changes["done"] = _coerce_bool(data["done"], "done")
    if not changes:
        raise ValidationError("Provide at least one of 'title' or 'done'")
    return changes


def pagination() -> tuple[int, int]:
    """Read ``?page=`` and ``?per_page=`` with bounds from config."""
    default_size = current_app.config["DEFAULT_PAGE_SIZE"]
    max_size = current_app.config["MAX_PAGE_SIZE"]

    page = _positive_int("page", 1)
    per_page = _positive_int("per_page", default_size)
    if per_page > max_size:
        raise ValidationError(
            f"'per_page' must be at most {max_size}",
            details={"field": "per_page", "max": max_size},
        )
    return page, per_page


def _positive_int(name: str, default: int) -> int:
    raw = request.args.get(name)
    if raw is None or raw == "":
        return default
    try:
        value = int(raw)
    except ValueError:
        raise ValidationError(f"'{name}' must be an integer", details={"field": name}) from None
    if value < 1:
        raise ValidationError(f"'{name}' must be 1 or greater", details={"field": name})
    return value


def done_filter() -> bool | None:
    """Read the optional ``?done=true|false`` filter."""
    raw = request.args.get("done")
    if raw is None or raw == "":
        return None
    return _coerce_bool(raw, "done")
