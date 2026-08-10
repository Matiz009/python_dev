"""Tests for authentication, headers and the feature-flagged DDL API."""

from __future__ import annotations

import pytest

from app import create_app
from app.config import TestingConfig


@pytest.fixture
def keyed_client():
    """A client whose app requires an API key for writes."""

    class KeyedConfig(TestingConfig):
        API_KEY = "secret-write-key"

    app = create_app(KeyedConfig)
    from app.extensions import db

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


class TestWriteAuth:
    def test_reads_stay_open(self, keyed_client):
        assert keyed_client.get("/api/v1/tasks").status_code == 200

    def test_write_without_key_is_401(self, keyed_client):
        response = keyed_client.post("/api/v1/tasks", json={"title": "x"})
        assert response.status_code == 401
        assert response.get_json()["error"]["code"] == "unauthorized"

    def test_write_with_wrong_key_is_401(self, keyed_client):
        response = keyed_client.post(
            "/api/v1/tasks", json={"title": "x"}, headers={"X-API-Key": "nope"}
        )
        assert response.status_code == 401

    def test_write_with_header_key_succeeds(self, keyed_client):
        response = keyed_client.post(
            "/api/v1/tasks", json={"title": "x"}, headers={"X-API-Key": "secret-write-key"}
        )
        assert response.status_code == 201

    def test_write_with_bearer_token_succeeds(self, keyed_client):
        response = keyed_client.post(
            "/api/v1/tasks",
            json={"title": "x"},
            headers={"Authorization": "Bearer secret-write-key"},
        )
        assert response.status_code == 201

    def test_open_when_no_key_configured(self, client):
        assert client.post("/api/v1/tasks", json={"title": "x"}).status_code == 201


class TestSecurityHeaders:
    def test_headers_present(self, client):
        headers = client.get("/api/v1/tasks").headers
        assert headers["X-Content-Type-Options"] == "nosniff"
        assert headers["X-Frame-Options"] == "DENY"
        assert "X-Request-Id" in headers

    def test_upstream_request_id_is_reused(self, client):
        response = client.get("/api/v1/tasks", headers={"X-Request-Id": "abc123"})
        assert response.headers["X-Request-Id"] == "abc123"


class TestDynamicTablesGuards:
    def test_disabled_without_feature_flag(self):
        class DisabledConfig(TestingConfig):
            FEATURE_DYNAMIC_TABLES = False

        app = create_app(DisabledConfig)
        response = app.test_client().get("/api/v1/tables", headers={"X-API-Key": "test-admin-key"})
        assert response.status_code == 403
        assert response.get_json()["error"]["code"] == "feature_disabled"

    def test_requires_admin_key(self, client):
        assert client.get("/api/v1/tables").status_code == 401

    def test_reserved_table_cannot_be_dropped(self, client, admin_headers):
        response = client.delete("/api/v1/tables/tasks", headers=admin_headers)
        assert response.status_code == 403
        assert response.get_json()["error"]["code"] == "reserved_table"

    def test_reserved_table_cannot_be_created(self, client, admin_headers):
        response = client.post(
            "/api/v1/tables",
            json={"name": "tasks", "columns": {"x": "TEXT"}},
            headers=admin_headers,
        )
        assert response.status_code == 403

    @pytest.mark.parametrize(
        "name",
        ["1bad", "has-dash", "has space", "", "drop table x", "sel;ect"],
    )
    def test_invalid_identifiers_rejected(self, client, admin_headers, name):
        response = client.post(
            "/api/v1/tables", json={"name": name, "columns": {"x": "TEXT"}}, headers=admin_headers
        )
        assert response.status_code in (400, 404, 422)

    def test_invalid_column_type_rejected(self, client, admin_headers):
        response = client.post(
            "/api/v1/tables",
            json={"name": "notes", "columns": {"title": "VARCHAR(9); DROP TABLE tasks"}},
            headers=admin_headers,
        )
        assert response.status_code == 422

    def test_full_lifecycle(self, client, admin_headers):
        created = client.post(
            "/api/v1/tables",
            json={"name": "notes", "columns": {"title": "TEXT", "views": "INTEGER"}},
            headers=admin_headers,
        )
        assert created.status_code == 201

        assert (
            "notes"
            in client.get("/api/v1/tables", headers=admin_headers).get_json()["data"]["tables"]
        )

        duplicate = client.post(
            "/api/v1/tables",
            json={"name": "notes", "columns": {"title": "TEXT"}},
            headers=admin_headers,
        )
        assert duplicate.status_code == 409

        row = client.post(
            "/api/v1/tables/notes/rows",
            json={"title": "hello", "views": 3},
            headers=admin_headers,
        )
        assert row.status_code == 201

        bad_column = client.post(
            "/api/v1/tables/notes/rows", json={"nope": 1}, headers=admin_headers
        )
        assert bad_column.status_code == 422

        view = client.get("/api/v1/tables/notes", headers=admin_headers).get_json()
        assert view["data"]["rows"][0]["title"] == "hello"
        assert view["meta"]["total"] == 1

        assert client.delete("/api/v1/tables/notes", headers=admin_headers).status_code == 200
        assert client.get("/api/v1/tables/notes", headers=admin_headers).status_code == 404
