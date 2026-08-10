"""
Simple Flask app: static pages, user routes, and a SQLite-backed tasks API.
"""

import re
import sqlite3
from flask import Flask, render_template, request, jsonify, abort

app = Flask(__name__)

# ─────────────────────────────────────────────────────────────
# Basic / static pages
# ─────────────────────────────────────────────────────────────

@app.route('/')
def hello():
    return 'Hello, Welcome to the Flask App!'


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/about-me')
def about_me():
    return render_template('about-me.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')


# ─────────────────────────────────────────────────────────────
# User routes
# ─────────────────────────────────────────────────────────────

@app.route("/users/<int:user_id>")
def get_user(user_id):
    """Look up a user by numeric ID."""
    return f"User #{user_id}"


@app.route("/users/<string:name>")
def greet_user(name):
    """Greet a user by name (string route)."""
    return f"Hello, {name}!"


@app.route("/users", methods=["GET", "POST"])
def users_collection():
    """List all users (GET) or create a new one (POST)."""
    if request.method == "POST":
        return "Creating a user...", 201
    return "Listing all users"


# ─────────────────────────────────────────────────────────────
# Search
# ─────────────────────────────────────────────────────────────

@app.route("/search")
def search():
    """Reads ?q=... from the URL, defaults to empty string."""
    query = request.args.get("q", "")
    return f"Searching for: {query}"


@app.route("/demo-tasks", methods=["POST"])
def demo_task():
    data = request.get_json(silent=True) or {}   # dict from body
    if not isinstance(data, dict):
        return jsonify({"error": "Body must be a JSON object"}), 400
    title = data.get("title")
    return jsonify({"received": title})

# ─────────────────────────────────────────────────────────────
# Database helper
# ─────────────────────────────────────────────────────────────

def get_db():
    """Open a new SQLite connection with dict-like row access."""
    conn = sqlite3.connect("tasks.db")
    conn.row_factory = sqlite3.Row
    return conn


# ─────────────────────────────────────────────────────────────
# Tasks API (SQLite-backed)
# ─────────────────────────────────────────────────────────────

@app.route("/tasks", methods=["GET"])
def list_tasks():
    """Return all tasks as JSON."""
    conn = get_db()
    rows = conn.execute("SELECT * FROM tasks").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/tasks", methods=["POST"])
def add_task():
    """Create a new task from JSON body: {"title": "..."}."""
    data = request.get_json()
    conn = get_db()
    conn.execute(
        "INSERT INTO tasks (title, done) VALUES (?, ?)",
        (data["title"], False)  # ? placeholders prevent SQL injection
    )
    conn.commit()
    conn.close()
    return jsonify({"status": "created"}), 201


def db_lookup(task_id):
    """Fetch a single task row by ID, or None if not found."""
    conn = get_db()
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


@app.route("/tasks/<int:task_id>")
def get_task(task_id):
    """Get a single task by ID, handling DB errors and not-found."""
    try:
        task = db_lookup(task_id)
    except sqlite3.Error:
        return jsonify({"error": "DB error"}), 500
    if task is None:
        abort(404)
    return jsonify(task)


# ─────────────────────────────────────────────────────────────
# Table management (DDL)
#
# Table/column names can't use ? placeholders, so every identifier
# is checked against a strict whitelist before it goes into SQL.
# ─────────────────────────────────────────────────────────────

IDENTIFIER_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")

# Column types we allow clients to ask for.
ALLOWED_TYPES = {"TEXT", "INTEGER", "REAL", "BLOB", "NUMERIC"}


def valid_identifier(name):
    """True if `name` is a safe, unquoted SQL identifier."""
    return bool(name) and bool(IDENTIFIER_RE.match(name))


def table_exists(conn, table):
    """True if a user table with this name exists."""
    row = conn.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table,)
    ).fetchone()
    return row is not None


@app.route("/tables", methods=["GET"])
def list_tables():
    """List every user table in the database (the table collection)."""
    conn = get_db()
    rows = conn.execute(
        "SELECT name FROM sqlite_master "
        "WHERE type = 'table' AND name NOT LIKE 'sqlite_%' "
        "ORDER BY name"
    ).fetchall()
    conn.close()
    return jsonify({"tables": [r["name"] for r in rows]})


@app.route("/tables", methods=["POST"])
def create_table():
    """
    Create a table from JSON body:
        {"name": "notes", "columns": {"title": "TEXT", "views": "INTEGER"}}

    An INTEGER PRIMARY KEY `id` column is always added automatically.
    """
    data = request.get_json(silent=True) or {}
    name = data.get("name")
    columns = data.get("columns")

    if not valid_identifier(name):
        return jsonify({"error": "Invalid table name"}), 400
    if not isinstance(columns, dict) or not columns:
        return jsonify({"error": "'columns' must be a non-empty object"}), 400

    defs = ["id INTEGER PRIMARY KEY AUTOINCREMENT"]
    for col, col_type in columns.items():
        if not valid_identifier(col) or col.lower() == "id":
            return jsonify({"error": f"Invalid column name: {col}"}), 400
        col_type = str(col_type).upper()
        if col_type not in ALLOWED_TYPES:
            return jsonify({"error": f"Invalid column type: {col_type}"}), 400
        defs.append(f"{col} {col_type}")

    conn = get_db()
    try:
        if table_exists(conn, name):
            return jsonify({"error": f"Table '{name}' already exists"}), 409
        conn.execute(f"CREATE TABLE {name} ({', '.join(defs)})")
        conn.commit()
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"status": "created", "table": name}), 201


@app.route("/tables/<string:table>", methods=["GET"])
def view_table(table):
    """View a table's schema and its rows."""
    if not valid_identifier(table):
        return jsonify({"error": "Invalid table name"}), 400

    conn = get_db()
    try:
        if not table_exists(conn, table):
            abort(404)
        schema = conn.execute(f"PRAGMA table_info({table})").fetchall()
        rows = conn.execute(f"SELECT * FROM {table}").fetchall()
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({
        "table": table,
        "columns": [{"name": c["name"], "type": c["type"]} for c in schema],
        "rows": [dict(r) for r in rows],
        "count": len(rows),
    })


@app.route("/tables/<string:table>", methods=["DELETE"])
def delete_table(table):
    """Drop a table."""
    if not valid_identifier(table):
        return jsonify({"error": "Invalid table name"}), 400

    conn = get_db()
    try:
        if not table_exists(conn, table):
            abort(404)
        conn.execute(f"DROP TABLE {table}")
        conn.commit()
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"status": "deleted", "table": table})


@app.route("/tables/<string:table>/rows", methods=["POST"])
def add_row(table):
    """
    Insert a row into a table from a flat JSON body:
        {"title": "hello", "views": 3}
    """
    if not valid_identifier(table):
        return jsonify({"error": "Invalid table name"}), 400

    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Body must be a non-empty JSON object"}), 400

    conn = get_db()
    try:
        if not table_exists(conn, table):
            abort(404)

        # Only accept keys that are real columns on this table.
        known = {c["name"] for c in conn.execute(f"PRAGMA table_info({table})")}
        for col in data:
            if col not in known:
                return jsonify({"error": f"Unknown column: {col}"}), 400

        cols = list(data)
        placeholders = ", ".join("?" for _ in cols)
        cur = conn.execute(
            f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({placeholders})",
            [data[c] for c in cols]
        )
        conn.commit()
        new_id = cur.lastrowid
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

    return jsonify({"status": "created", "id": new_id}), 201


# ─────────────────────────────────────────────────────────────
# Error handlers
# ─────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    """Runs for ANY 404 in the app."""
    return jsonify({"error": "Not found", "status": 404}), 404


# ─────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True)