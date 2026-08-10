"""Liveness and readiness probes."""

from __future__ import annotations

from flask import Blueprint, current_app, jsonify
from sqlalchemy import text

from ..extensions import db, limiter

bp = Blueprint("health", __name__)


@bp.get("/healthz")
@limiter.exempt
def healthz():
    """Liveness: the process is up and serving. No dependencies touched."""
    return jsonify({"status": "ok"})


@bp.get("/readyz")
@limiter.exempt
def readyz():
    """Readiness: the database answers, so this instance can serve traffic."""
    try:
        db.session.execute(text("SELECT 1"))
    except Exception as exc:
        current_app.logger.warning("readiness_check_failed: %s", exc)
        return jsonify({"status": "degraded", "database": "unreachable"}), 503
    return jsonify({"status": "ok", "database": "ok"})
