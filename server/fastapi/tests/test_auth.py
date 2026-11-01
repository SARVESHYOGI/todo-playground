from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_and_login() -> None:
    # register
    r = client.post("/api/v1/users/register", json={
        "email": "test@example.com", "password": "password123", "username": "test"
    })
    assert r.status_code == 200
    # login
    r = client.post("/api/v1/login/access-token", data={
        "username": "test@example.com", "password": "password123"
    })
    assert r.status_code == 200
    token = r.json()["access_token"]
    assert token


def test_duplicate_email_409() -> None:
    r = client.post("/api/v1/users/register", json={
        "email": "dup@example.com", "password": "password123"
    })
    assert r.status_code == 200
    r = client.post("/api/v1/users/register", json={
        "email": "dup@example.com", "password": "password123"
    })
    assert r.status_code == 400
