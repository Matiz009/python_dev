"""Flask extension singletons.

Kept in their own module so blueprints can import them without creating a
circular dependency on the application factory.
"""

from __future__ import annotations

from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """SQLAlchemy 2.0 declarative base."""


db = SQLAlchemy(model_class=Base)
migrate = Migrate()
cors = CORS()
limiter = Limiter(key_func=get_remote_address)
