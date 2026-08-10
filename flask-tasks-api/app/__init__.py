"""Application factory.

``create_app`` is the single entry point used by local development, the test
suite, gunicorn and the Vercel serverless handler alike, so every environment
boots the app through identical wiring.
"""

from __future__ import annotations

import os

from flask import Flask, jsonify

from .config import Config, get_config
from .errors import assign_request_id, register_error_handlers
from .extensions import cors, db, limiter, migrate
from .logging_setup import configure_logging

__version__ = "1.0.0"


def create_app(config: type[Config] | str | None = None) -> Flask:
    """Build and configure a Flask application instance."""
    app = Flask(__name__, instance_relative_config=False)

    config_class = config if isinstance(config, type) else get_config(config)
    app.config.from_object(config_class)
    # Optional untracked overrides, e.g. instance/config.py on a VM.
    app.config.from_pyfile("config.py", silent=True)

    configure_logging(app)
    _init_extensions(app)
    register_error_handlers(app)

    from .blueprints import register_blueprints
    from .security import register_security

    register_blueprints(app)
    register_security(app)
    _register_meta_routes(app)
    _register_cli(app)

    app.before_request(assign_request_id)

    app.logger.info(
        "app_initialized",
        extra={"path": f"env={config_class.__name__} version={__version__}"},
    )
    return app


def _init_extensions(app: Flask) -> None:
    engine_options: dict = {"pool_pre_ping": True}
    if app.config["SQLALCHEMY_DATABASE_URI"].startswith("postgresql"):
        # Serverless instances are short-lived and each one would otherwise hold
        # a pool open against Postgres' connection limit. NullPool opens a
        # connection per request and hands it straight back; use a provider-side
        # pooler (PgBouncer / Neon pooled URL) for the real pooling.
        from sqlalchemy.pool import NullPool

        engine_options["poolclass"] = NullPool
        engine_options["connect_args"] = {"connect_timeout": 10}
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = engine_options

    db.init_app(app)
    migrate.init_app(app, db)

    origins = [o.strip() for o in app.config.get("CORS_ORIGINS", "").split(",") if o.strip()]
    if origins:
        cors.init_app(app, resources={r"/api/*": {"origins": origins}})

    app.config["RATELIMIT_STORAGE_URI"] = app.config.get("RATELIMIT_STORAGE_URI", "memory://")
    limiter.init_app(app)
    if app.config.get("RATELIMIT_ENABLED"):
        limiter.default_limits = [app.config["RATELIMIT_DEFAULT"]]
    else:
        limiter.enabled = False


def _register_meta_routes(app: Flask) -> None:
    @app.get("/api/v1")
    def api_root():
        """Advertise the available endpoints."""
        return jsonify(
            {
                "name": "flask-tasks-api",
                "version": __version__,
                "endpoints": {
                    "tasks": "/api/v1/tasks",
                    "users": "/api/v1/users",
                    "search": "/api/v1/search?q=",
                    "tables": "/api/v1/tables (admin only, feature-flagged)",
                    "health": "/healthz",
                    "readiness": "/readyz",
                },
                "docs": "https://github.com/your-org/flask-tasks-api#readme",
            }
        )


def _register_cli(app: Flask) -> None:
    @app.cli.command("init-db")
    def init_db() -> None:
        """Create every table defined by the models (dev/bootstrap only).

        Use ``flask db upgrade`` for anything you intend to keep — migrations
        are the supported path for schema changes in production.
        """
        from . import models  # noqa: F401 - ensures models are registered

        db.create_all()
        app.logger.info("database tables created")

    @app.cli.command("seed")
    def seed() -> None:
        """Insert a few sample tasks for local experimentation."""
        from .models import Task

        samples = ["Read the deployment guide", "Provision Postgres", "Ship to Vercel"]
        db.session.add_all([Task(title=title) for title in samples])
        db.session.commit()
        app.logger.info("seeded %d tasks", len(samples))

    @app.cli.command("routes-json")
    def routes_json() -> None:
        """Print the URL map as JSON — handy for docs and smoke tests."""
        import json

        rules = [
            {
                "rule": str(rule),
                "endpoint": rule.endpoint,
                "methods": sorted(rule.methods - {"HEAD", "OPTIONS"}),
            }
            for rule in app.url_map.iter_rules()
            if rule.endpoint != "static"
        ]
        print(json.dumps(sorted(rules, key=lambda r: r["rule"]), indent=2))


# Convenience for `flask --app app run` and WSGI servers that want a module-level
# callable. Guarded so importing the package never builds an app unexpectedly.
if os.environ.get("EAGER_APP") == "1":  # pragma: no cover
    app = create_app()
