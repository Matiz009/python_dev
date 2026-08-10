"""API-key authentication and response hardening."""

from __future__ import annotations

import hmac
from collections.abc import Callable
from functools import wraps
from typing import Any

from flask import Flask, Response, current_app, request

from .errors import AuthError, ForbiddenError


def _presented_key() -> str | None:
    """Read the caller's key from ``X-API-Key`` or ``Authorization: Bearer``."""
    header = request.headers.get("X-API-Key")
    if header:
        return header.strip()
    auth = request.headers.get("Authorization", "")
    if auth.lower().startswith("bearer "):
        return auth[7:].strip()
    return None


def _matches(presented: str | None, expected: str) -> bool:
    # compare_digest keeps the check constant-time so a wrong key cannot be
    # discovered one character at a time by timing the response.
    return bool(presented) and hmac.compare_digest(presented, expected)


def require_api_key(view: Callable[..., Any]) -> Callable[..., Any]:
    """Protect a write endpoint. A no-op when ``API_KEY`` is unset (local dev)."""

    @wraps(view)
    def wrapper(*args: Any, **kwargs: Any):
        expected = current_app.config.get("API_KEY")
        if not expected:
            return view(*args, **kwargs)
        if not _matches(_presented_key(), expected):
            raise AuthError("A valid API key is required for this operation")
        return view(*args, **kwargs)

    return wrapper


def require_admin_key(view: Callable[..., Any]) -> Callable[..., Any]:
    """Protect the destructive DDL endpoints.

    Unlike :func:`require_api_key` this never opens up when unconfigured: with
    no ``ADMIN_API_KEY`` the endpoints refuse every request.
    """

    @wraps(view)
    def wrapper(*args: Any, **kwargs: Any):
        if not current_app.config.get("FEATURE_DYNAMIC_TABLES"):
            raise ForbiddenError(
                "The dynamic table API is disabled. Set FEATURE_DYNAMIC_TABLES=true to enable it.",
                code="feature_disabled",
            )
        expected = current_app.config.get("ADMIN_API_KEY")
        if not expected:
            raise ForbiddenError(
                "The dynamic table API requires ADMIN_API_KEY to be configured.",
                code="admin_key_not_configured",
            )
        if not _matches(_presented_key(), expected):
            raise AuthError("A valid admin API key is required for this operation")
        return view(*args, **kwargs)

    return wrapper


SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
}


def register_security(app: Flask) -> None:
    """Attach security headers to every response."""

    @app.after_request
    def _set_headers(response: Response) -> Response:
        for header, value in SECURITY_HEADERS.items():
            response.headers.setdefault(header, value)
        if not app.debug:
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
            )
        return response
