"""Shared pytest fixtures.

Each test gets a fresh in-memory SQLite database, so the suite never touches a
real file and tests cannot leak state into one another.
"""

from __future__ import annotations

import pytest

from app import create_app
from app.config import TestingConfig
from app.extensions import db as _db
from app.models import Task

ADMIN_KEY = TestingConfig.ADMIN_API_KEY


@pytest.fixture
def app():
    application = create_app(TestingConfig)
    with application.app_context():
        _db.create_all()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin_headers():
    return {"X-API-Key": ADMIN_KEY}


@pytest.fixture
def tasks(app):
    """Three persisted tasks: two open, one done."""
    items = [
        Task(title="Write tests", done=False),
        Task(title="Review the PR", done=False),
        Task(title="Deploy to Vercel", done=True),
    ]
    _db.session.add_all(items)
    _db.session.commit()
    return items
