"""WSGI entrypoint for traditional servers (gunicorn, uWSGI, Docker).

gunicorn --bind 0.0.0.0:8000 --workers 4 wsgi:app
"""

from __future__ import annotations

import os

from app import create_app

app = create_app(os.environ.get("APP_ENV", "production"))

if __name__ == "__main__":  # pragma: no cover - local convenience only
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)))
