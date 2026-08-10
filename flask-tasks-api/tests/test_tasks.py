"""Tests for the tasks API."""

from __future__ import annotations

from app.models import Task


class TestListTasks:
    def test_empty_database_returns_empty_page(self, client):
        response = client.get("/api/v1/tasks")
        assert response.status_code == 200
        body = response.get_json()
        assert body["data"] == []
        assert body["meta"]["total"] == 0

    def test_returns_newest_first(self, client, tasks):
        body = client.get("/api/v1/tasks").get_json()
        assert [t["title"] for t in body["data"]] == [
            "Deploy to Vercel",
            "Review the PR",
            "Write tests",
        ]

    def test_filters_by_done(self, client, tasks):
        body = client.get("/api/v1/tasks?done=true").get_json()
        assert len(body["data"]) == 1
        assert body["data"][0]["title"] == "Deploy to Vercel"

    def test_searches_titles(self, client, tasks):
        body = client.get("/api/v1/tasks?q=deploy").get_json()
        assert len(body["data"]) == 1

    def test_paginates(self, client, tasks):
        body = client.get("/api/v1/tasks?per_page=2&page=2").get_json()
        assert len(body["data"]) == 1
        assert body["meta"]["pages"] == 2
        assert body["meta"]["has_prev"] is True

    def test_rejects_oversized_page_size(self, client):
        response = client.get("/api/v1/tasks?per_page=5000")
        assert response.status_code == 422
        assert response.get_json()["error"]["code"] == "validation_error"

    def test_rejects_non_integer_page(self, client):
        assert client.get("/api/v1/tasks?page=abc").status_code == 422


class TestCreateTask:
    def test_creates_and_returns_location(self, client):
        response = client.post("/api/v1/tasks", json={"title": "New task"})
        assert response.status_code == 201
        body = response.get_json()["data"]
        assert body["title"] == "New task"
        assert body["done"] is False
        assert response.headers["Location"].endswith(f"/api/v1/tasks/{body['id']}")

    def test_strips_whitespace(self, client):
        body = client.post("/api/v1/tasks", json={"title": "  padded  "}).get_json()
        assert body["data"]["title"] == "padded"

    def test_requires_title(self, client):
        response = client.post("/api/v1/tasks", json={})
        assert response.status_code == 422
        assert "title" in response.get_json()["error"]["message"]

    def test_rejects_empty_title(self, client):
        assert client.post("/api/v1/tasks", json={"title": "   "}).status_code == 422

    def test_rejects_overlong_title(self, client):
        assert client.post("/api/v1/tasks", json={"title": "x" * 256}).status_code == 422

    def test_rejects_unknown_fields(self, client):
        response = client.post("/api/v1/tasks", json={"title": "t", "priority": 9})
        assert response.status_code == 422
        assert response.get_json()["error"]["details"]["unknown_fields"] == ["priority"]

    def test_rejects_non_json_body(self, client):
        response = client.post("/api/v1/tasks", data="title=x")
        assert response.status_code == 422

    def test_rejects_json_array(self, client):
        assert client.post("/api/v1/tasks", json=[1, 2]).status_code == 422


class TestGetTask:
    def test_returns_task(self, client, tasks):
        response = client.get(f"/api/v1/tasks/{tasks[0].id}")
        assert response.status_code == 200
        assert response.get_json()["data"]["title"] == "Write tests"

    def test_missing_task_is_404_json(self, client):
        response = client.get("/api/v1/tasks/999999")
        assert response.status_code == 404
        assert response.get_json()["error"]["code"] == "not_found"


class TestUpdateTask:
    def test_patches_done(self, client, tasks):
        task_id = tasks[0].id
        response = client.patch(f"/api/v1/tasks/{task_id}", json={"done": True})
        assert response.status_code == 200
        assert response.get_json()["data"]["done"] is True

    def test_patches_title(self, client, tasks):
        response = client.patch(f"/api/v1/tasks/{tasks[0].id}", json={"title": "Renamed"})
        assert response.get_json()["data"]["title"] == "Renamed"

    def test_empty_body_is_rejected(self, client, tasks):
        assert client.patch(f"/api/v1/tasks/{tasks[0].id}", json={}).status_code == 422

    def test_missing_task_is_404(self, client):
        assert client.patch("/api/v1/tasks/999999", json={"done": True}).status_code == 404


class TestDeleteTask:
    def test_deletes(self, client, tasks, app):
        from app.extensions import db

        task_id = tasks[0].id
        assert client.delete(f"/api/v1/tasks/{task_id}").status_code == 204
        assert db.session.get(Task, task_id) is None

    def test_missing_task_is_404(self, client):
        assert client.delete("/api/v1/tasks/999999").status_code == 404
