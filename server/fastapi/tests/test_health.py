from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/api/v1/utils/health-check")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_openapi_schema_is_available() -> None:
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "Todo API"
    assert "/api/v1/todos/" in schema["paths"]


def test_todos_requires_authentication() -> None:
    response = client.get("/api/v1/todos/")
    assert response.status_code == 401
