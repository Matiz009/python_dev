"""Environment-driven configuration.

Every setting has a safe default for local development. Anything that must
differ in production is read from an environment variable so that no secret
or environment detail is ever committed to the repository.
"""

from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _bool(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _int(name: str, default: int) -> int:
    try:
        return int(os.environ[name])
    except (KeyError, ValueError):
        return default


def normalize_database_url(url: str) -> str:
    """Make third-party connection strings usable by SQLAlchemy 2.x.

    Managed Postgres providers (Vercel, Neon, Supabase, Heroku) hand out URLs
    beginning with ``postgres://``, a scheme SQLAlchemy dropped. They are also
    driver-agnostic, while this project installs psycopg 3.
    """
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


class Config:
    """Base configuration shared by every environment."""

    # ---- Core -----------------------------------------------------------
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-insecure-key")
    JSON_SORT_KEYS = False

    # ---- Database -------------------------------------------------------
    # Local default: a file next to the project. Production: DATABASE_URL.
    SQLALCHEMY_DATABASE_URI = normalize_database_url(
        os.environ.get("DATABASE_URL") or f"sqlite:///{BASE_DIR / 'tasks.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ---- API behaviour --------------------------------------------------
    DEFAULT_PAGE_SIZE = _int("DEFAULT_PAGE_SIZE", 25)
    MAX_PAGE_SIZE = _int("MAX_PAGE_SIZE", 100)
    MAX_CONTENT_LENGTH = _int("MAX_CONTENT_LENGTH", 256 * 1024)  # 256 KiB bodies

    # ---- Security -------------------------------------------------------
    # Writes to /api/v1/tasks require this key when it is set. Leave unset
    # locally for an open API; ALWAYS set it in production.
    API_KEY = os.environ.get("API_KEY")
    # The dynamic table (DDL) API is destructive and stays off unless both the
    # feature flag and an admin key are present.
    ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY")
    FEATURE_DYNAMIC_TABLES = _bool("FEATURE_DYNAMIC_TABLES", False)
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "")

    # ---- Rate limiting --------------------------------------------------
    RATELIMIT_ENABLED = _bool("RATELIMIT_ENABLED", True)
    RATELIMIT_DEFAULT = os.environ.get("RATELIMIT_DEFAULT", "120 per minute")
    # In-memory buckets are per-instance; point this at Redis for real limits.
    RATELIMIT_STORAGE_URI = os.environ.get("RATELIMIT_STORAGE_URI", "memory://")

    # ---- Logging --------------------------------------------------------
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_JSON = _bool("LOG_JSON", True)


class DevelopmentConfig(Config):
    DEBUG = True
    LOG_JSON = _bool("LOG_JSON", False)


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL", "sqlite://")
    RATELIMIT_ENABLED = False
    FEATURE_DYNAMIC_TABLES = True
    ADMIN_API_KEY = "test-admin-key"
    SECRET_KEY = "test-key"


class ProductionConfig(Config):
    DEBUG = False
    PREFERRED_URL_SCHEME = "https"
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"


CONFIGS = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(name: str | None = None) -> type[Config]:
    """Resolve a config class from ``name`` or ``$FLASK_ENV``/``$APP_ENV``."""
    env = (name or os.environ.get("APP_ENV") or os.environ.get("FLASK_ENV") or "production").lower()
    return CONFIGS.get(env, ProductionConfig)
