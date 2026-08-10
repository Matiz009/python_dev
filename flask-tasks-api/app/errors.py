"""Uniform JSON error handling.

Every failure leaving this API — a raised ``ApiError``, an ``abort()``, a
Werkzeug HTTP exception, or an unhandled crash — is rendered by one of the
handlers below, so clients only ever have to parse a single error shape:

    {"error": {"code": "not_found", "message": "Task 7 does not exist"}}
"""

from __future__ import annotations

import uuid

from flask import Flask, current_app, g, jsonify, request
from werkzeug.exceptions import HTTPException

from .extensions import db


class ApiError(Exception):
    """An error with a deliberate HTTP status and machine-readable code."""

    status_code = 400
    code = "bad_request"

    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        code: str | None = None,
        details: dict | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        if code is not None:
            self.code = code
        self.details = details or {}


class ValidationError(ApiError):
    status_code = 422
    code = "validation_error"


class NotFoundError(ApiError):
    status_code = 404
    code = "not_found"


class ConflictError(ApiError):
    status_code = 409
    code = "conflict"


class AuthError(ApiError):
    status_code = 401
    code = "unauthorized"


class ForbiddenError(ApiError):
    status_code = 403
    code = "forbidden"


def _payload(code: str, message: str, details: dict | None = None) -> dict:
    body: dict = {"error": {"code": code, "message": message}}
    if details:
        body["error"]["details"] = details
    request_id = getattr(g, "request_id", None)
    if request_id:
        body["error"]["request_id"] = request_id
    return body


def wants_html() -> bool:
    """True for plain browser navigation, so humans get a page not JSON."""
    if request.path.startswith("/api/"):
        return False
    accept = request.accept_mimetypes
    return accept.accept_html and not accept.accept_json


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(exc: ApiError):
        return jsonify(_payload(exc.code, exc.message, exc.details)), exc.status_code

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc: HTTPException):
        code = (exc.name or "error").lower().replace(" ", "_")
        message = exc.description or exc.name or "HTTP error"
        if exc.code == 404 and wants_html():
            from flask import render_template

            return render_template("404.html"), 404
        return jsonify(_payload(code, message)), exc.code or 500

    @app.errorhandler(Exception)
    def handle_unexpected(exc: Exception):
        # Never leak a traceback or driver message to a client. The incident is
        # logged in full with the request id so it can be correlated later.
        db.session.rollback()
        current_app.logger.exception(
            "unhandled_exception",
            extra={"request_id": getattr(g, "request_id", None), "path": request.path},
        )
        if current_app.debug:
            raise exc
        return jsonify(_payload("internal_error", "An internal error occurred")), 500


def assign_request_id() -> None:
    """Adopt an upstream request id or mint one for this request."""
    g.request_id = (
        request.headers.get("X-Request-Id")
        or request.headers.get("X-Vercel-Id")
        or uuid.uuid4().hex
    )
