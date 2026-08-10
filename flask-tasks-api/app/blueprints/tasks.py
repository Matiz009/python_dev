"""Tasks API — ``/api/v1/tasks``.

Reads are open; writes go through :func:`require_api_key`. All list queries are
paginated so a large table can never produce an unbounded response.
"""

from __future__ import annotations

from flask import Blueprint, jsonify, request, url_for
from sqlalchemy import select

from ..errors import NotFoundError
from ..extensions import db, limiter
from ..models import Task
from ..schemas import done_filter, pagination, task_create, task_update
from ..security import require_api_key

bp = Blueprint("tasks", __name__, url_prefix="/api/v1/tasks")


def _get_or_404(task_id: int) -> Task:
    task = db.session.get(Task, task_id)
    if task is None:
        raise NotFoundError(f"Task {task_id} does not exist")
    return task


@bp.get("")
def list_tasks():
    """List tasks, newest first.

    Query params: ``page``, ``per_page``, ``done`` (true/false), ``q`` (title
    substring search).
    """
    page, per_page = pagination()
    stmt = select(Task).order_by(Task.id.desc())

    done = done_filter()
    if done is not None:
        stmt = stmt.where(Task.done.is_(done))

    search = (request.args.get("q") or "").strip()
    if search:
        stmt = stmt.where(Task.title.ilike(f"%{search}%"))

    result = db.paginate(stmt, page=page, per_page=per_page, error_out=False)
    return jsonify(
        {
            "data": [task.to_dict() for task in result.items],
            "meta": {
                "page": result.page,
                "per_page": result.per_page,
                "total": result.total,
                "pages": result.pages,
                "has_next": result.has_next,
                "has_prev": result.has_prev,
            },
        }
    )


@bp.post("")
@require_api_key
@limiter.limit("30 per minute")
def create_task():
    """Create a task from ``{"title": "...", "done": false}``."""
    payload = task_create()
    task = Task(**payload)
    db.session.add(task)
    db.session.commit()

    response = jsonify({"data": task.to_dict()})
    response.status_code = 201
    response.headers["Location"] = url_for("tasks.get_task", task_id=task.id)
    return response


@bp.get("/<int:task_id>")
def get_task(task_id: int):
    """Fetch a single task."""
    return jsonify({"data": _get_or_404(task_id).to_dict()})


@bp.patch("/<int:task_id>")
@bp.put("/<int:task_id>")
@require_api_key
def update_task(task_id: int):
    """Partially update a task's ``title`` and/or ``done``."""
    task = _get_or_404(task_id)
    for field, value in task_update().items():
        setattr(task, field, value)
    db.session.commit()
    return jsonify({"data": task.to_dict()})


@bp.delete("/<int:task_id>")
@require_api_key
def delete_task(task_id: int):
    """Delete a task. Returns 204 with an empty body."""
    task = _get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return "", 204
