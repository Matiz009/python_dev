"""Tests for HTML pages, health probes and misc endpoints."""

from __future__ import annotations

import pytest


@pytest.mark.parametrize("path", ["/", "/about", "/about-me", "/contact"])
def test_pages_render(client, path):
    response = client.get(path)
    assert response.status_code == 200
    assert response.mimetype == "text/html"


def test_healthz(client):
    assert client.get("/healthz").get_json() == {"status": "ok"}


def test_readyz_reports_database(client):
    body = client.get("/readyz").get_json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"


def test_api_root_lists_endpoints(client):
    body = client.get("/api/v1").get_json()
    assert body["name"] == "flask-tasks-api"
    assert "tasks" in body["endpoints"]


def test_unknown_api_path_returns_json_404(client):
    response = client.get("/api/v1/nope")
    assert response.status_code == 404
    assert response.mimetype == "application/json"


def test_unknown_page_returns_html_404(client):
    response = client.get("/nope", headers={"Accept": "text/html"})
    assert response.status_code == 404
    assert response.mimetype == "text/html"


def test_method_not_allowed_is_json(client):
    response = client.delete("/api/v1/tasks")
    assert response.status_code == 405
    assert response.get_json()["error"]["code"] == "method_not_allowed"


class TestUsers:
    def test_numeric_id_uses_int_converter(self, client):
        assert client.get("/api/v1/users/42").get_json()["data"]["id"] == 42

    def test_name_uses_string_converter(self, client):
        assert client.get("/api/v1/users/mati").get_json()["data"]["name"] == "mati"

    def test_search_echoes_query(self, client):
        assert client.get("/api/v1/search?q=flask").get_json()["query"] == "flask"

    def test_search_defaults_to_empty(self, client):
        assert client.get("/api/v1/search").get_json()["query"] == ""
