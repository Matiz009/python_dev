# Architecture

Why this project is shaped the way it is, and what changed from the single-file
prototype it grew out of.

---

## Request lifecycle

```
Vercel edge
   │  vercel.json rewrite: /(.*) → /api/index
   ▼
api/index.py            module-level `app` built once per cold start
   │
   ▼
create_app()            config → logging → extensions → error handlers
   │                    → blueprints → security headers → CLI
   ▼
before_request          assign_request_id, start timer
   │
   ▼
Blueprint view          schemas.py validates input
   │                    models.py / SQLAlchemy performs the query
   ▼
after_request           security headers, X-Request-Id, structured access log
```

An uncaught exception anywhere in the view layer is intercepted by the handlers in
`errors.py`, which roll back the session, log the traceback with the request id, and
return a generic JSON 500.

## Layout and responsibilities

| Module | Responsibility |
| --- | --- |
| `app/__init__.py` | Application factory, engine tuning, CLI commands |
| `app/config.py` | Config classes per environment; `DATABASE_URL` normalization |
| `app/extensions.py` | Uninitialized extension singletons (avoids circular imports) |
| `app/models.py` | SQLAlchemy 2.0 typed models and serialization |
| `app/schemas.py` | Request validation; raises `ValidationError` |
| `app/errors.py` | Error taxonomy and the handlers that render it |
| `app/security.py` | API-key checks, security headers |
| `app/logging_setup.py` | JSON formatter, access logging |
| `app/blueprints/*` | One module per feature area |

## Key decisions

### The application factory

Modules that create `app = Flask(__name__)` at import time cannot be configured per
environment, and tests end up sharing state with development. `create_app(config)` is
used identically by `flask run`, pytest, gunicorn and the Vercel handler, so what the
tests exercise is what production runs.

### SQLAlchemy instead of raw `sqlite3`

The prototype opened a connection per request with `sqlite3.connect("tasks.db")`. That
hard-wires the database, cannot work on a read-only serverless filesystem, and leaks
connections on any exception between `connect()` and `close()`.

SQLAlchemy gives one abstraction over SQLite (local, tests) and Postgres (production),
session lifecycle handled by Flask-SQLAlchemy, and Alembic migrations. No application
code branches on the backend.

### `NullPool` on Postgres only

Each serverless instance would otherwise hold a connection pool open against the
database's connection limit while sitting idle between invocations. `NullPool` opens a
connection per request and returns it immediately; real pooling belongs in a
provider-side pooler (PgBouncer, Neon's pooled endpoint). A long-lived container should
drop this branch — see the note in the deployment guide.

### Migrations, never `create_all()` at runtime

`db.create_all()` on startup means every cold start races to build the schema, and it
silently ignores changes to existing tables. Alembic makes schema changes explicit,
reviewable and reversible. `flask init-db` exists for local bootstrapping only.

### Validation up front

`schemas.py` rejects unknown fields rather than ignoring them, so `{"titel": "x"}`
fails loudly instead of creating an empty task. Every validation failure carries a
`details.field`, which is what a form-based client needs to highlight the right input.

It is hand-written rather than pulled from a validation library: the payloads are two
fields wide, and each dependency adds cold-start import time to every serverless
invocation.

### One error shape

The prototype mixed `abort(404)`, `jsonify({"error": ...}), 400`, and
`jsonify({"error": str(e)}), 500` — three shapes, one of which forwarded raw driver
messages to the client. Now a single `ApiError` hierarchy and three handlers produce one
schema for every failure, with internal details logged rather than returned.

Content negotiation is the one exception worth having: a browser hitting a bad URL gets
an HTML 404, while anything under `/api/` or asking for JSON gets JSON.

### Security posture

| Concern | Approach |
| --- | --- |
| Unauthenticated writes | `require_api_key` on all mutating task routes, constant-time comparison |
| Runtime DDL | Feature flag **and** separate admin key; reserved tables refused |
| SQL injection | No interpolated SQL; SQLAlchemy `Table` objects and bound parameters |
| Information disclosure | Generic 500s; tracebacks logged with a request id |
| Clickjacking / sniffing | `X-Frame-Options: DENY`, `nosniff`, HSTS in production |
| Oversized payloads | `MAX_CONTENT_LENGTH` = 256 KiB |
| Abuse | Flask-Limiter, tighter limits on writes |

The dynamic-table API deserves a note. Letting anonymous clients run `CREATE TABLE` and
`DROP TABLE` is not something a production API should normally do. It is retained
because it was in the original app and is useful for experimentation — but it is off by
default, separately keyed, and rewritten so identifiers can never reach SQL as raw
strings. The regex is still there, but it is now a validation nicety rather than the only
thing standing between a request and arbitrary DDL.

### Structured logging

Serverless platforms collect stdout. One JSON object per line makes logs queryable by
`request_id`, `status` or `duration_ms`, and the id is propagated from upstream
(`X-Request-Id`, `X-Vercel-Id`) when present so a trace survives across services.

### Health probes split in two

`/healthz` reports whether the process is alive and touches nothing, so a restart loop
can be distinguished from a database outage. `/readyz` runs `SELECT 1` and returns 503
when the database is unreachable — that is the one to alert on.

---

## What changed from the prototype

| Prototype | This project |
| --- | --- |
| One 315-line `app.py` | Blueprints by feature area |
| Module-level `Flask(__name__)` | `create_app()` factory |
| `sqlite3.connect("tasky.db")` per request | SQLAlchemy + `DATABASE_URL` |
| No schema management | Alembic migrations |
| `data["title"]` — `KeyError` → 500 | Validated input → 422 with field details |
| Unbounded `SELECT * FROM tasks` | Pagination with a configurable cap |
| Read-only tasks API (list/create/get) | Full CRUD |
| Anyone can create and drop tables | Feature flag + admin key + reserved tables |
| f-string DDL guarded by a regex | SQLAlchemy `Table` objects, type whitelist |
| `jsonify({"error": str(e)})` leaking driver errors | Generic 500 + server-side traceback |
| Mixed error shapes | One error schema |
| `app.run(debug=True)` | gunicorn / serverless entrypoints, debug off |
| No tests | 57 tests covering routes, validation, auth and guards |
| No configuration | Environment-driven config classes |
| No logging | Structured JSON access and error logs |

Behaviour deliberately preserved: the page routes (`/`, `/about`, `/about-me`,
`/contact`), the int-vs-string user routes, the `?q=` search echo, and the dynamic table
API's request and response shapes. API paths moved under `/api/v1` — a versioned prefix
means the next breaking change can ship as `/api/v2` without stranding existing clients.

## Possible next steps

Not implemented, in rough order of what a growing service tends to need:

- **Real authentication** — per-user accounts and scoped tokens instead of one shared
  key; task ownership follows from that.
- **Redis-backed rate limiting** — accurate global limits instead of per-instance ones.
- **Cursor pagination** — `OFFSET` degrades on large tables; keyset pagination on
  `(id)` does not.
- **OpenAPI schema** — generate `openapi.json` from the routes for typed clients and
  a Swagger UI.
- **Soft deletes** — a `deleted_at` column instead of `DELETE`, if history matters.
- **Error tracking** — Sentry, wired into the existing `handle_unexpected` handler.
