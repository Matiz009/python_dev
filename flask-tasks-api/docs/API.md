# API Reference

Base URL (local): `http://127.0.0.1:5000`
Base URL (production): `https://<your-app>.vercel.app`

All API endpoints live under `/api/v1`. Every request and response body is JSON.

---

## Conventions

### Response envelope

Successful responses put the resource under `data`. List endpoints add a `meta` object
with pagination state.

```json
{ "data": { "id": 1, "title": "Ship it", "done": false } }
```

### Errors

Every failure — validation, auth, not-found, rate limit, internal — uses one shape:

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

| Field | Notes |
| --- | --- |
| `code` | Stable machine-readable slug. Branch on this, not on `message` |
| `message` | Human-readable explanation. Wording may change |
| `details` | Optional; present for validation errors and reserved-name rejections |
| `request_id` | Also returned as the `X-Request-Id` header. Quote it in bug reports |

Error codes: `validation_error`, `unauthorized`, `forbidden`, `feature_disabled`,
`admin_key_not_configured`, `reserved_table`, `not_found`, `method_not_allowed`,
`conflict`, `too_many_requests`, `database_error`, `internal_error`.

### Authentication

Writes require an API key when `API_KEY` is configured. Either header works:

```bash
-H "X-API-Key: $API_KEY"
-H "Authorization: Bearer $API_KEY"
```

Reads are always public. A missing or wrong key returns `401 unauthorized`.

### Rate limiting

120 requests per minute per IP by default, with tighter limits on writes
(30/min for task creation, 10/min for table creation, 5/min for table drops).
Exceeding a limit returns `429`. Health probes are exempt.

---

## Tasks

The task object:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Auto-assigned |
| `title` | string | 1–255 characters, whitespace-trimmed |
| `done` | boolean | Defaults to `false` |
| `created_at` | string | ISO-8601 UTC |
| `updated_at` | string | ISO-8601 UTC, refreshed on every update |

### `GET /api/v1/tasks`

List tasks, newest first.

| Query param | Type | Default | Notes |
| --- | --- | --- | --- |
| `page` | integer ≥ 1 | `1` | Page number |
| `per_page` | integer ≥ 1 | `25` | Capped by `MAX_PAGE_SIZE` (100) |
| `done` | boolean | — | Filter by completion state |
| `q` | string | — | Case-insensitive substring match on `title` |

```bash
curl "http://127.0.0.1:5000/api/v1/tasks?done=false&per_page=10&q=deploy"
```

```json
{
  "data": [
    {
      "id": 3,
      "title": "Deploy to Vercel",
      "done": false,
      "created_at": "2026-08-10T10:38:04.066946+00:00",
      "updated_at": "2026-08-10T10:38:04.066955+00:00"
    }
  ],
  "meta": {
    "page": 1, "per_page": 10, "total": 1, "pages": 1,
    "has_next": false, "has_prev": false
  }
}
```

**Status codes:** `200` OK · `422` invalid query parameter

### `POST /api/v1/tasks`

Create a task. **Requires an API key.**

| Body field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | 1–255 characters after trimming |
| `done` | boolean | no | Defaults to `false` |

Unknown fields are rejected rather than ignored, so a typo fails loudly instead of
silently doing nothing.

```bash
curl -X POST http://127.0.0.1:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"title": "Write the docs", "done": false}'
```

`201 Created`, with a `Location` header pointing at the new resource:

```json
{
  "data": {
    "id": 1, "title": "Write the docs", "done": false,
    "created_at": "2026-08-10T10:38:04.066946+00:00",
    "updated_at": "2026-08-10T10:38:04.066955+00:00"
  }
}
```

**Status codes:** `201` created · `401` missing/invalid key · `422` validation failed ·
`429` rate limited

### `GET /api/v1/tasks/{id}`

```bash
curl http://127.0.0.1:5000/api/v1/tasks/1
```

**Status codes:** `200` OK · `404` no such task

### `PATCH /api/v1/tasks/{id}`

Partial update. **Requires an API key.** `PUT` is accepted as an alias and behaves
identically (partial, not replacing). Supply at least one of `title` or `done`.

```bash
curl -X PATCH http://127.0.0.1:5000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"done": true}'
```

**Status codes:** `200` OK · `401` · `404` · `422` empty or invalid body

### `DELETE /api/v1/tasks/{id}`

**Requires an API key.** Returns `204` with an empty body.

```bash
curl -X DELETE http://127.0.0.1:5000/api/v1/tasks/1 -H "X-API-Key: $API_KEY"
```

**Status codes:** `204` deleted · `401` · `404`

---

## Users and search

Demo endpoints carried over from the prototype. They illustrate Flask's URL converters
and query-string handling, and hold no persistent state — there is no users table.

| Endpoint | Response |
| --- | --- |
| `GET /api/v1/users` | `{"data": [], "meta": {"total": 0}}` |
| `POST /api/v1/users` | `202` — not implemented |
| `GET /api/v1/users/42` | `{"data": {"id": 42, "label": "User #42"}}` |
| `GET /api/v1/users/mati` | `{"data": {"name": "mati", "greeting": "Hello, mati!"}}` |
| `GET /api/v1/search?q=flask` | `{"query": "flask", "results": []}` |

A numeric path segment always matches the integer route; anything else falls through to
the string route.

---

## Dynamic tables (admin)

> **These endpoints create and drop real database tables.** They are disabled unless
> `FEATURE_DYNAMIC_TABLES=true` **and** `ADMIN_API_KEY` is set, and every request must
> present the admin key. The app's own `tasks` and `alembic_version` tables are reserved
> and cannot be read, modified or dropped here.
>
> Consider leaving this off in production. It exists because the original prototype had
> it; a normal API does not let clients define schema at runtime.

Identifiers must match `^[A-Za-z_][A-Za-z0-9_]{0,62}$`. Allowed column types: `TEXT`,
`INTEGER`, `REAL`, `NUMERIC`, `BLOB`. Maximum 32 columns.

### `GET /api/v1/tables`

```json
{ "data": { "tables": ["notes"] } }
```

### `POST /api/v1/tables`

An auto-incrementing `id` primary key is always added, so do not declare it.

```bash
curl -X POST http://127.0.0.1:5000/api/v1/tables \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -d '{"name": "notes", "columns": {"title": "TEXT", "views": "INTEGER"}}'
```

**Status codes:** `201` · `401` · `403` disabled/reserved · `409` already exists · `422`

### `GET /api/v1/tables/{table}`

Returns the schema plus a paginated page of rows (`?page`, `?per_page`).

```json
{
  "data": {
    "table": "notes",
    "columns": [
      { "name": "id", "type": "INTEGER", "nullable": false },
      { "name": "title", "type": "VARCHAR(1024)", "nullable": true }
    ],
    "rows": [{ "id": 1, "title": "hello", "views": 3 }]
  },
  "meta": { "page": 1, "per_page": 25, "total": 1 }
}
```

### `POST /api/v1/tables/{table}/rows`

Insert one row from a flat object of column/value pairs. Unknown columns are rejected,
and values must be strings, numbers, booleans or null.

```bash
curl -X POST http://127.0.0.1:5000/api/v1/tables/notes/rows \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $ADMIN_API_KEY" \
  -d '{"title": "hello", "views": 3}'
```

### `DELETE /api/v1/tables/{table}`

Drops the table and all its rows. **This cannot be undone.**

---

## Operations

### `GET /healthz`

Liveness. Touches no dependencies, so it stays `200` even when the database is down.

```json
{ "status": "ok" }
```

### `GET /readyz`

Readiness. Runs `SELECT 1`.

```json
{ "status": "ok", "database": "ok" }
```

Returns `503` with `{"status": "degraded", "database": "unreachable"}` when the database
cannot be reached — the check to point a monitor at.

### `GET /api/v1`

Service metadata and an endpoint index.

---

## HTML pages

| Path | Page |
| --- | --- |
| `/` | Landing page with quick-start examples |
| `/about` | About |
| `/about-me` | About the author |
| `/contact` | Contact / bug reporting |

Unknown paths return an HTML 404 for browsers and a JSON 404 for API clients, decided by
the request's `Accept` header and whether the path starts with `/api/`.
