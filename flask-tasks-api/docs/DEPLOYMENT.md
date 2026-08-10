# Deployment Guide

How to get this API running on Vercel, plus alternatives and troubleshooting.

---

## Before you start: the serverless constraint

Vercel runs each request in a short-lived function with a **read-only filesystem**. The
only writable location is `/tmp`, which is local to one instance and erased when that
instance is recycled.

That rules out SQLite for production. Writes to a bundled `.db` file fail with
`readonly database`; writes to a copy in `/tmp` appear to succeed and then disappear —
the worse of the two failures, because nothing looks broken until data goes missing.

**You need a network database.** The steps below use PostgreSQL. This is the one
mandatory change from the original prototype; the application code is already
database-agnostic, so it is purely a configuration step.

---

## 1. Provision PostgreSQL

Any managed Postgres works. Free tiers that suit this project:

| Provider | Notes |
| --- | --- |
| [Neon](https://neon.tech) | Serverless Postgres, generous free tier, built-in pooler |
| Vercel Postgres | Integrates from the Vercel dashboard, sets `POSTGRES_URL` for you |
| [Supabase](https://supabase.com) | Postgres plus extras; use the connection-pooling URI |

**Use the pooled connection string** (Neon: the URL containing `-pooler`; Supabase: port
`6543`). Serverless platforms open many short-lived connections, and a pooler is what
keeps you from exhausting Postgres' connection limit under traffic.

Copy the URI — it looks like:

```
postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
```

`postgres://` and `postgresql://` are both fine; the app normalizes the scheme for
psycopg 3 at startup.

## 2. Push to Git

This directory must be the **repository root** so Vercel finds `vercel.json`,
`requirements.txt` and `api/index.py`.

```bash
cd flask-tasks-api
git init
git add .
git commit -m "Initial commit: production-ready Flask tasks API"
git branch -M main
git remote add origin https://github.com/<you>/flask-tasks-api.git
git push -u origin main
```

Confirm `.env` and `*.db` are ignored before pushing:

```bash
git status --ignored --short | grep -E "\.env|\.db"
```

## 3. Import into Vercel

At [vercel.com/new](https://vercel.com/new), import the repository. Leave the build
settings alone — there is no build step. `vercel.json` does two things:

- `rewrites` sends every path to `api/index.py`, so Flask's own router handles URLs.
- `functions` gives the function 1024 MB and a 15-second ceiling.

Python version comes from `.python-version` (3.12).

## 4. Set environment variables

Project → Settings → Environment Variables. Add these for **Production** (and Preview,
if you want previews to work):

| Variable | Value |
| --- | --- |
| `APP_ENV` | `production` |
| `SECRET_KEY` | Output of `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `DATABASE_URL` | Your pooled Postgres URI |
| `API_KEY` | Another generated secret — required for writes |

Optional:

| Variable | When you need it |
| --- | --- |
| `CORS_ORIGINS` | A browser front-end on another domain calls this API |
| `RATELIMIT_STORAGE_URI` | Redis URL for limits shared across instances |
| `LOG_LEVEL` | `DEBUG` while diagnosing something |
| `FEATURE_DYNAMIC_TABLES` + `ADMIN_API_KEY` | You actually want the DDL endpoints |

Leave `FEATURE_DYNAMIC_TABLES` unset unless you need it. Do **not** set `FLASK_DEBUG`
or `APP_ENV=development` in production: debug mode would expose an interactive
traceback console to the internet.

## 5. Run migrations against production

The app never creates tables at request time — implicit schema creation in a
serverless environment means every cold start races to build the schema. Migrations are
explicit and run once, from your machine:

```bash
# macOS / Linux
export APP_ENV=production
export FLASK_APP=wsgi.py
export SECRET_KEY=anything-for-this-command
export DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
flask db upgrade
```

```powershell
# Windows PowerShell
$env:APP_ENV="production"
$env:FLASK_APP="wsgi.py"
$env:SECRET_KEY="anything-for-this-command"
$env:DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
flask db upgrade
```

Use the **direct** (non-pooled) URL here if your provider offers one — some poolers
disallow DDL.

Expected output:

```
INFO  [alembic.runtime.migration] Running upgrade  -> 0e4959871341, create tasks table
```

## 6. Deploy and verify

Vercel deploys on push. Then:

```bash
BASE=https://<your-app>.vercel.app

curl $BASE/healthz     # {"status":"ok"}
curl $BASE/readyz      # {"database":"ok","status":"ok"}  <- proves DB connectivity
curl $BASE/api/v1/tasks

curl -X POST $BASE/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"title": "First production task"}'
```

If `/healthz` succeeds but `/readyz` reports `degraded`, the app is running and the
database is the problem — check `DATABASE_URL` and that step 5 ran.

---

## Ongoing operations

### Schema changes

```bash
# 1. Edit app/models.py
# 2. Autogenerate a migration against your local database
APP_ENV=development FLASK_APP=wsgi.py flask db migrate -m "add priority column"
# 3. READ the generated file in migrations/versions/ and fix it if needed.
#    Autogeneration misses renames and can emit dialect-specific defaults.
# 4. Apply locally, then to production
APP_ENV=development FLASK_APP=wsgi.py flask db upgrade
DATABASE_URL="<prod url>" APP_ENV=production FLASK_APP=wsgi.py flask db upgrade
```

Commit migrations alongside the model change so the two never drift apart.

### Logs

Logs go to stdout as one JSON object per line, which Vercel collects under the
Logs tab. Every request line carries `request_id`, `method`, `path`, `status` and
`duration_ms`, and error responses return the same id in `X-Request-Id` — so a user's
bug report maps directly onto a log entry.

```bash
vercel logs <deployment-url> --follow
```

### Rotating a key

Set the new `API_KEY` in Vercel, redeploy, then update clients. There is one active key
at a time; if you need overlapping keys, that is the point to move to a real token store.

---

## Local development

```bash
pip install -r requirements-dev.txt
cp .env.example .env

export FLASK_APP=wsgi.py APP_ENV=development
flask db upgrade
flask seed          # optional sample data
flask run           # http://127.0.0.1:5000, auto-reload on
```

With `APP_ENV=development` and `API_KEY` unset, writes need no key and errors render
Werkzeug's debugger. Neither is true under `APP_ENV=production`.

### Testing the serverless entrypoint locally

```bash
npm i -g vercel
vercel dev
```

This runs the function through Vercel's own runtime, which catches routing or
entrypoint mistakes that `flask run` cannot.

---

## Alternative: Docker

For hosts that run containers (Fly.io, Render, Railway, Cloud Run, a VM):

```bash
docker build -t flask-tasks-api .

docker run -p 8000:8000 \
  -e APP_ENV=production \
  -e SECRET_KEY="$(python -c 'import secrets;print(secrets.token_urlsafe(48))')" \
  -e DATABASE_URL="postgresql://user:password@host/dbname" \
  -e API_KEY=your-api-key \
  flask-tasks-api
```

The image runs gunicorn (2 workers × 4 threads) as a non-root user, with a healthcheck
on `/healthz`. Run `flask db upgrade` as a release step before starting new containers.

On a long-lived host you may prefer real connection pooling: the app switches to
`NullPool` only for Postgres because it assumes a serverless caller. For a persistent
container, remove that branch in `app/__init__.py::_init_extensions` and let SQLAlchemy
pool normally.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `500` on every DB endpoint, `/readyz` degraded | Migrations never ran | Run step 5 |
| `sqlite3.OperationalError: attempt to write a readonly database` | `DATABASE_URL` unset in production, so it fell back to SQLite | Set `DATABASE_URL` |
| `ModuleNotFoundError: No module named 'app'` | `api/index.py` missing or repo root wrong | Ensure `flask-tasks-api/` is the repository root |
| `psycopg.OperationalError: connection timeout` | Wrong host, or the provider blocks the IP | Verify the URI; check provider allowlists |
| `sslmode` errors | Provider requires TLS | Append `?sslmode=require` |
| `too many connections` | Non-pooled URL under load | Switch to the pooled connection string |
| `401 unauthorized` on writes | `API_KEY` set but not sent | Send `X-API-Key` |
| `403 feature_disabled` on `/api/v1/tables` | Intentional default | Set `FEATURE_DYNAMIC_TABLES=true` and `ADMIN_API_KEY` |
| Rate limits behave oddly across requests | In-memory buckets are per-instance | Set `RATELIMIT_STORAGE_URI` to Redis |
| Function timeout | Slow query or cold DB start | Raise `maxDuration` in `vercel.json`; add indexes |

### Reading a failure

Every error response carries a `request_id`. Search the Vercel logs for it to get the
matching entry, including the full traceback for 500s:

```bash
curl -i https://<your-app>.vercel.app/api/v1/tasks/999999
# X-Request-Id: 18a150982d454d7d90acd85396e6c08d
```
