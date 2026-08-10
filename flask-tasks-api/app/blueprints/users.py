"""Users and search endpoints.

These are the demo routes carried over from the original prototype, kept
because they document Flask's URL converters and query-string handling. They
hold no persistent state — there is no users table.
"""

from __future__ import annotations

from flask import Blueprint, jsonify, request

bp = Blueprint("users", __name__, url_prefix="/api/v1")


@bp.get("/users")
def list_users():
    """Placeholder collection listing."""
    return jsonify({"data": [], "meta": {"total": 0}})


@bp.post("/users")
def create_user():
    """Placeholder creation endpoint — echoes nothing, persists nothing."""
    return jsonify({"status": "accepted", "detail": "User creation is not implemented"}), 202


# Registered before the string rule so a numeric segment always matches the
# int converter, exactly as Flask's own ordering rules require.
@bp.get("/users/<int:user_id>")
def get_user(user_id: int):
    """Look up a user by numeric id."""
    return jsonify({"data": {"id": user_id, "label": f"User #{user_id}"}})


@bp.get("/users/<string:name>")
def greet_user(name: str):
    """Greet a user by name."""
    return jsonify({"data": {"name": name, "greeting": f"Hello, {name}!"}})


@bp.get("/search")
def search():
    """Echo the ``?q=`` query parameter."""
    return jsonify({"query": request.args.get("q", ""), "results": []})
