"""Structured logging.

Vercel (and every other log aggregator) collects stdout, so logs go there as
one JSON object per line, which makes them searchable by request id.
"""

from __future__ import annotations

import json
import logging
import sys
import time

from flask import Flask, g, request


class JsonFormatter(logging.Formatter):
    """Render a log record as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(record.created)) + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key in ("request_id", "method", "path", "status", "duration_ms", "remote_addr"):
            value = getattr(record, key, None)
            if value is not None:
                payload[key] = value
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging(app: Flask) -> None:
    level = getattr(logging, str(app.config.get("LOG_LEVEL", "INFO")).upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        JsonFormatter()
        if app.config.get("LOG_JSON")
        else logging.Formatter("%(asctime)s %(levelname)-8s %(name)s: %(message)s")
    )

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level)
    app.logger.setLevel(level)

    @app.before_request
    def _start_timer() -> None:
        g.started_at = time.perf_counter()

    @app.after_request
    def _log_request(response):
        duration_ms = None
        if hasattr(g, "started_at"):
            duration_ms = round((time.perf_counter() - g.started_at) * 1000, 2)
        request_id = getattr(g, "request_id", None)
        if request_id:
            response.headers.setdefault("X-Request-Id", request_id)
        app.logger.info(
            "request",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.full_path.rstrip("?"),
                "status": response.status_code,
                "duration_ms": duration_ms,
                "remote_addr": request.headers.get("X-Forwarded-For", request.remote_addr),
            },
        )
        return response
