"""Blueprint registry.

Each feature area is a blueprint so routes stay grouped and the application
factory has a single, obvious place to wire them up.
"""

from flask import Flask

from .health import bp as health_bp
from .pages import bp as pages_bp
from .tables import bp as tables_bp
from .tasks import bp as tasks_bp
from .users import bp as users_bp

__all__ = ["register_blueprints"]


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(pages_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(tables_bp)
