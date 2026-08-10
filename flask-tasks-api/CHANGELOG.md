# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-08-10

First production release, rewritten from a single-file Flask prototype.

### Added

- Application factory (`create_app`) with per-environment configuration classes.
- SQLAlchemy 2.0 `Task` model with `created_at`/`updated_at` timestamps, plus Alembic
  migrations via Flask-Migrate.
- Full task CRUD under `/api/v1/tasks`, with pagination, `done` filtering and title
  search.
- API-key authentication on writes (`X-API-Key` or `Authorization: Bearer`), compared in
  constant time.
- Request validation that rejects unknown fields and returns `422` with the offending
  field name.
- One JSON error schema for every failure, with a `request_id` for correlation.
- Structured JSON logging, including per-request method, status and duration.
- `/healthz` (liveness) and `/readyz` (database readiness) probes.
- Rate limiting via Flask-Limiter, with tighter limits on mutating endpoints.
- Security headers on every response; 256 KiB request body cap.
- 57 tests covering routes, validation, authentication and the DDL guards.
- Vercel serverless entrypoint (`api/index.py` + `vercel.json`), a gunicorn `wsgi.py`
  entrypoint, and a Dockerfile.
- GitHub Actions CI: lint, tests on Python 3.11/3.12, and a migration round-trip against
  PostgreSQL.
- Documentation: README, API reference, deployment guide, architecture notes,
  contributing guide.

### Changed

- **Database access moved from raw `sqlite3` to SQLAlchemy behind `DATABASE_URL`.**
  SQLite remains the local default; production requires PostgreSQL, because Vercel's
  filesystem is read-only and ephemeral.
- API routes moved under the `/api/v1` prefix.
- The dynamic table API builds SQLAlchemy `Table` objects from a type whitelist instead
  of interpolating identifiers into f-string DDL.
- Task list responses are paginated rather than returning every row.

### Security

- The dynamic table API is disabled unless `FEATURE_DYNAMIC_TABLES=true` and
  `ADMIN_API_KEY` is set, and it refuses to touch the `tasks` and `alembic_version`
  tables.
- Database and driver error messages are no longer returned to clients; unhandled
  exceptions log a traceback server-side and return a generic 500.
- Debug mode is off in the production configuration.
