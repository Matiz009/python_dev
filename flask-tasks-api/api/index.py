"""Vercel serverless entrypoint.

Vercel's Python runtime imports this file and looks for a module-level WSGI
callable named ``app``. Every request to the deployment is rewritten here by
``vercel.json``, so this one function serves the whole application.

The app is built at import time (once per cold start) and reused by every
subsequent invocation on the same instance.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# The function's working directory is not guaranteed to be the project root,
# so make the repository importable regardless of where it is invoked from.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app

app = create_app(os.environ.get("APP_ENV", "production"))
