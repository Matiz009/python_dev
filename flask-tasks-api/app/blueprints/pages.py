"""Server-rendered marketing pages."""

from __future__ import annotations

from flask import Blueprint, render_template

bp = Blueprint("pages", __name__)


@bp.get("/")
def index():
    return render_template("index.html")


@bp.get("/about")
def about():
    return render_template("about.html")


@bp.get("/about-me")
def about_me():
    return render_template("about-me.html")


@bp.get("/contact")
def contact():
    return render_template("contact.html")
