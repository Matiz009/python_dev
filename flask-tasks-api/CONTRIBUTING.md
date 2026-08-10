# Contributing

## Setup

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows PowerShell
source .venv/bin/activate          # macOS / Linux

pip install -r requirements-dev.txt
cp .env.example .env

export FLASK_APP=wsgi.py APP_ENV=development
flask db upgrade
flask run
```

## Before you push

```bash
ruff format .
ruff check .
APP_ENV=testing pytest
```

CI runs the same three commands on Python 3.11 and 3.12, plus a migration round-trip
against a real PostgreSQL service container.

## Conventions

- **Line length 100**, enforced by ruff. Let `ruff format` settle formatting arguments.
- **Docstrings** on every module and public function. Say why the code exists, not what
  the next line does.
- **Type hints** on function signatures. `from __future__ import annotations` at the top
  of each module.
- **Raise, don't return, errors.** Use the `ApiError` subclasses in `app/errors.py`; the
  handlers turn them into responses. Views should not build error JSON themselves.
- **Validate in `schemas.py`**, not in views. Views orchestrate; schemas decide what is
  acceptable input.
- **Never interpolate identifiers or values into SQL.** Use bound parameters, or
  SQLAlchemy constructs for identifiers.

## Adding an endpoint

1. Add or extend a blueprint in `app/blueprints/`. Group by resource, and register new
   blueprints in `app/blueprints/__init__.py`.
2. Put input validation in `app/schemas.py`, returning a clean dict of coerced values.
3. Decorate mutating routes with `@require_api_key`.
4. Return `{"data": ...}`, adding `{"meta": ...}` for anything that lists.
5. Write tests for the happy path **and** each failure mode — missing field, wrong type,
   absent resource, missing key.
6. Document it in `docs/API.md` and, if it belongs in the summary, `README.md`.

## Changing the schema

```bash
# after editing app/models.py
APP_ENV=development FLASK_APP=wsgi.py flask db migrate -m "add priority to tasks"
```

Then **read the generated file** in `migrations/versions/`. Autogeneration reliably
detects added and removed tables and columns, but it misinterprets renames as
drop-plus-add (data loss) and can emit dialect-specific defaults that only work on
SQLite. Prefer `sa.false()` and `sa.func.now()` over literal strings — see the initial
migration for the pattern.

Apply and verify the round-trip before committing:

```bash
flask db upgrade
flask db downgrade
flask db upgrade
```

Commit the migration in the same change as the model edit.

## Tests

`tests/conftest.py` provides:

| Fixture | Purpose |
| --- | --- |
| `app` | App on a fresh in-memory SQLite database, torn down per test |
| `client` | Flask test client |
| `tasks` | Three persisted tasks (two open, one done) |
| `admin_headers` | Admin API key header for the dynamic-table endpoints |

Build a differently configured app by subclassing `TestingConfig` inside the test — see
`keyed_client` in `tests/test_security.py`.

Assert on `error.code`, not on `error.message`: codes are the stable contract, messages
are free to be reworded.
