from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _register(email: str, password: str = "password123") -> str:
    client.post("/api/v1/users/register", json={
        "email": email, "password": password
    })
    r = client.post("/api/v1/login/access-token", data={
        "username": email, "password": password
    })
    token: str = r.json()["access_token"]
    return token


def test_todos_requires_auth() -> None:
    r = client.get("/api/v1/todos/")
    assert r.status_code == 401


def test_full_todo_crud() -> None:
    token = _register("crud@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # create
    r = client.post("/api/v1/todos/", json={
        "title": "Buy milk", "description": "2%", "completed": False
    }, headers=headers)
    assert r.status_code == 200
    todo = r.json()
    assert todo["title"] == "Buy milk"
    todo_id = todo["id"]

    # list
    r = client.get("/api/v1/todos/", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["count"] == 1
    assert data["data"][0]["id"] == todo_id

    # get single
    r = client.get(f"/api/v1/todos/{todo_id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["title"] == "Buy milk"

    # patch
    r = client.patch(f"/api/v1/todos/{todo_id}", json={
        "completed": True
    }, headers=headers)
    assert r.status_code == 200
    assert r.json()["completed"] is True

    # delete
    r = client.delete(f"/api/v1/todos/{todo_id}", headers=headers)
    assert r.status_code == 200
    assert r.json() == {"message": "Todo deleted successfully"}

    # list empty
    r = client.get("/api/v1/todos/", headers=headers)
    assert r.status_code == 200
    assert r.json()["count"] == 0


def test_todo_not_found_404() -> None:
    import uuid
    token = _register("404@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    r = client.get(f"/api/v1/todos/{uuid.uuid4()}", headers=headers)
    assert r.status_code == 404


def test_per_user_isolation() -> None:
    token_a = _register("a@example.com")
    token_b = _register("b@example.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    r = client.post("/api/v1/todos/", json={"title": "A's todo"}, headers=headers_a)
    todo_id = r.json()["id"]

    # B cannot see A's todo
    r = client.get(f"/api/v1/todos/{todo_id}", headers=headers_b)
    assert r.status_code == 404

    # B's list is empty
    r = client.get("/api/v1/todos/", headers=headers_b)
    assert r.json()["count"] == 0
