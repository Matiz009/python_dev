# Flask Tasks API

A production-ready REST API for managing tasks, built with Flask and deployable to
Vercel as a single serverless function.

This is a hardened rewrite of a learning-project Flask app. It keeps the original
routes but adds the things a deployed service needs: an application factory,
SQLAlchemy models with Alembic migrations, API-key authentication, request
validation, uniform JSON errors, structured logging, rate limiting, health probes
and a test suite.

[![CI](https://github.com/your-org/flask-tasks-api/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/flask-tasks-api/actions/workflows/ci.yml)

---

## Contents

- [Why the database changed](#why-the-database-changed)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [API overview](#api-overview)
- [Deploying to Vercel](#deploying-to-vercel)
- [Project layout](#project-layout)
- [Testing and linting](#testing-and-linting)
- [Security notes](#security-notes)
- [Documentation](#documentation)

---

## Why the database changed

The original app called `sqlite3.connect("tasks.db")` directly. **That cannot work on
Vercel.** Serverless functions get a read-only filesystem apart from `/tmp`, and `/tmp`
is per-instance and erased when the instance is recycled — so every write would either
fail outright or silently vanish.

This project therefore talks to the database through SQLAlchemy and a single
`DATABASE_URL` setting:

| Environment | Database | Persistence |
| --- | --- | --- |
| Local development | SQLite file (default, no config needed) | Persists on your disk |
| Tests | SQLite in-memory | Discarded per test |
| **Production (Vercel)** | **PostgreSQL via `DATABASE_URL`** | **Durable** |

Nothing in the application code is SQLite- or Postgres-specific, so the same code runs
in all three. `postgres://` and `postgresql://` URLs are both accepted and normalized
for the psycopg 3 driver automatically.

## Quick start

```bash
git clone <your-repo-url> flask-tasks-api
cd flask-tasks-api

python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements-dev.txt

cp .env.example .env        # then edit SECRET_KEY

# Create the schema
export FLASK_APP=wsgi.py    # PowerShell: $env:FLASK_APP="wsgi.py"
export APP_ENV=development   # PowerShell: $env:APP_ENV="development"
flask db upgrade

# Optional: a few sample rows
flask seed

flask run                    # http://127.0.0.1:5000
```

Verify it:

```bash
curl http://127.0.0.1:5000/healthz
curl http://127.0.0.1:5000/api/v1/tasks
curl -X POST http://127.0.0.1:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task"}'
```

## Configuration

Every setting is an environment variable with a development-safe default. See
[`.env.example`](.env.example) for the annotated list.

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_ENV` | `production` | Selects the config class: `development`, `testing`, `production` |
| `SECRET_KEY` | insecure dev value | Signs sessions. **Must be set in production** |
| `DATABASE_URL` | local SQLite file | Postgres connection string in production |
| `API_KEY` | unset | Required for task writes. Unset = writes are open |
| `ADMIN_API_KEY` | unset | Required by the dynamic-table API |
| `FEATURE_DYNAMIC_TABLES` | `false` | Master switch for the DDL endpoints |
| `CORS_ORIGINS` | empty | Comma-separated origins allowed to call `/api/*` |
| `DEFAULT_PAGE_SIZE` / `MAX_PAGE_SIZE` | `25` / `100` | Pagination bounds |
| `RATELIMIT_ENABLED` | `true` | Toggle rate limiting |
| `RATELIMIT_DEFAULT` | `120 per minute` | Default limit per client IP |
| `RATELIMIT_STORAGE_URI` | `memory://` | Set to Redis for limits shared across instances |
| `LOG_LEVEL` / `LOG_JSON` | `INFO` / `true` | Logging verbosity and format |

Generate a real secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## API overview

Base path: `/api/v1`. Full reference with request/response examples in
[docs/API.md](docs/API.md).

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/tasks` | — | List tasks; `?page`, `?per_page`, `?done`, `?q` |
| `POST` | `/api/v1/tasks` | API key | Create a task |
| `GET` | `/api/v1/tasks/{id}` | — | Fetch one task |
| `PATCH` | `/api/v1/tasks/{id}` | API key | Update `title` and/or `done` |
| `DELETE` | `/api/v1/tasks/{id}` | API key | Delete a task |
| `GET` | `/api/v1/users/{id}` | — | Demo route (numeric converter) |
| `GET` | `/api/v1/users/{name}` | — | Demo route (string converter) |
| `GET` | `/api/v1/search?q=` | — | Demo route (query string) |
| `GET/POST/DELETE` | `/api/v1/tables[...]` | Admin key + flag | Dynamic table management |
| `GET` | `/healthz` | — | Liveness |
| `GET` | `/readyz` | — | Readiness (checks the database) |
| `GET` | `/`, `/about`, `/about-me`, `/contact` | — | Rendered HTML pages |

Successful responses wrap the payload in `data`, with list endpoints adding `meta`:

```json
{
  "data": [{ "id": 1, "title": "Ship it", "done": false,
             "created_at": "2026-08-10T10:38:04+00:00",
             "updated_at": "2026-08-10T10:38:04+00:00" }],
  "meta": { "page": 1, "per_page": 25, "total": 1, "pages": 1,
            "has_next": false, "has_prev": false }
}
```

Failures always use one shape, so a client needs only one error path:

```json
{
  "error": {
    "code": "validation_error",
    "message": "'title' must not be empty",
    "details": { "field": "title" },
    "request_id": "227424c78c47465b942fc15d0c715559"
  }
}
```

## Deploying to Vercel

Condensed version — the full walkthrough, including provisioning Postgres and running
migrations against it, is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

1. **Provision Postgres.** Vercel Postgres, [Neon](https://neon.tech) or Supabase.
   Copy the *pooled* connection string.
2. **Push this directory to its own Git repository**, then import it at
   [vercel.com/new](https://vercel.com/new). No build settings to change — `vercel.json`
   routes every request to `api/index.py`.
3. **Set environment variables** in Project → Settings → Environment Variables:

   ```
   APP_ENV=production
   SECRET_KEY=<generated secret>
   DATABASE_URL=<pooled postgres url>
   API_KEY=<generated key>
   ```

4. **Run the migration once** against the production database from your machine:

   ```bash
   DATABASE_URL="<pooled postgres url>" APP_ENV=production FLASK_APP=wsgi.py flask db upgrade
   ```

5. **Deploy and verify:**

   ```bash
   curl https://<your-app>.vercel.app/readyz
   # {"database":"ok","status":"ok"}
   ```

> The app never creates tables at request time. If you skip step 4 the API returns
> 500s and `/readyz` reports `degraded` — which is the intended behaviour, not a bug.

## Project layout

```
flask-tasks-api/
├── api/
│   └── index.py              # Vercel serverless entrypoint (WSGI `app`)
├── app/
│   ├── __init__.py           # Application factory + CLI commands
│   ├── config.py             # Environment-driven config classes
│   ├── extensions.py         # db, migrate, cors, limiter singletons
│   ├── models.py             # SQLAlchemy models
│   ├── schemas.py            # Request validation
│   ├── errors.py             # ApiError types + JSON error handlers
│   ├── security.py           # API-key auth, security headers
│   ├── logging_setup.py      # Structured JSON logging
│   ├── blueprints/
│   │   ├── tasks.py          # /api/v1/tasks
│   │   ├── users.py          # /api/v1/users, /api/v1/search
│   │   ├── tables.py         # /api/v1/tables (feature-flagged)
│   │   ├── pages.py          # HTML pages
│   │   └── health.py         # /healthz, /readyz
│   └── templates/
├── migrations/               # Alembic migrations
├── tests/                    # pytest suite
├── docs/                     # API, deployment, architecture
├── wsgi.py                   # gunicorn / Docker entrypoint
├── vercel.json               # Serverless routing
├── Dockerfile                # Container deployment alternative
└── requirements.txt
```

## Testing and linting

```bash
APP_ENV=testing pytest                        # 57 tests
APP_ENV=testing pytest --cov=app --cov-report=term-missing
ruff check .                                  # lint
ruff format .                                 # format
```

Useful CLI commands:

```bash
flask routes            # every registered route
flask routes-json       # the same, as JSON
flask db upgrade        # apply migrations
flask db migrate -m "…" # autogenerate a migration after a model change
flask seed              # insert sample tasks
```

## Security notes

- **Writes are authenticated.** `POST`/`PATCH`/`DELETE` on tasks require `X-API-Key`
  (or `Authorization: Bearer …`), compared in constant time. With `API_KEY` unset the
  API stays open, which is convenient locally — so always set it in production.
- **The dynamic-table API is off by default.** It creates and drops real tables, so it
  needs both `FEATURE_DYNAMIC_TABLES=true` and `ADMIN_API_KEY`, and it refuses to touch
  the app's own `tasks` and `alembic_version` tables.
- **No string-interpolated SQL.** The original app built `CREATE TABLE`/`DROP TABLE`
  statements with f-strings guarded by a regex. This version builds SQLAlchemy `Table`
  objects from a type whitelist and lets the dialect quote identifiers.
- **Errors never leak internals.** Unhandled exceptions log a full traceback server-side
  and return a generic 500 with a `request_id` for correlation.
- **Security headers** (`nosniff`, `DENY` framing, HSTS, referrer policy) are applied to
  every response; request bodies are capped at 256 KiB.

## Documentation

| Document | Contents |
| --- | --- |
| [docs/API.md](docs/API.md) | Endpoint reference, parameters, status codes, examples |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel walkthrough, Postgres setup, Docker, troubleshooting |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Design decisions and what changed from the prototype |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Local workflow, conventions, adding endpoints |

## License

MIT — see [LICENSE](LICENSE).
