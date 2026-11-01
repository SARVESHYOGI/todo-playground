# Todo API — FastAPI backend

FastAPI + SQLModel backend for the todo app, scaffolded after
[fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template)
and managed with [uv](https://docs.astral.sh/uv/).

## Layout

```
app/
  main.py            # FastAPI app: CORS + API router
  models.py          # SQLModel models (User, Todo) and API schemas
  crud.py            # database operations
  core/
    config.py        # pydantic-settings configuration
    security.py      # password hashing (pwdlib) + JWT (pyjwt)
    db.py            # engine + create_db_and_tables()
  api/
    deps.py          # get_db, SessionDep, get_current_user, CurrentUser
    main.py          # api_router
    routes/
      login.py       # POST /login/access-token (OAuth2 password flow)
      users.py       # register / me / password / admin CRUD
      todos.py       # per-user todo CRUD
      utils.py       # health check
tests/               # pytest
```

## Setup

```bash
cd server/fastapi
cp .env.example .env          # then edit DATABASE_URL and SECRET_KEY
uv sync                       # install (incl. dev group)
uv run python -c "from app.core.db import create_db_and_tables; create_db_and_tables()"
```

## Run

```bash
uv run fastapi dev app/main.py      # http://127.0.0.1:8000/docs
```

## Test / lint / types

```bash
uv run pytest
uv run ruff check .
uv run mypy app
```

The test suite points the app at an isolated temp SQLite database
(`tests/conftest.py`), so it runs without a PostgreSQL server.

A Postman collection for manual exploration lives in
`postman/FastAPI-Todo-Collection.json` (set the `token` variable from the
login response before calling the todo endpoints).

## Endpoints (prefix `/api/v1`)

| Method | Path | Auth |
|---|---|---|
| POST | `/login/access-token` | public (form: `username`=email, `password`) |
| POST | `/users/register` | public |
| GET | `/users/me` | user |
| PATCH | `/users/me` | user |
| PATCH | `/users/me/password` | user |
| GET | `/users/{id}` | self or superuser |
| GET/POST/PATCH/DELETE | `/users/...` | superuser |
| GET/POST | `/todos/` | user (scoped to owner) |
| GET/PATCH/DELETE | `/todos/{id}` | user (owner only) |
| GET | `/utils/health-check` | public |

## Not yet ported from the template

Alembic migrations (`app/alembic`), email templates, Sentry, the first-superuser
seeding (`initial_data.py`), Dockerfile, and serving the SPA from the backend.
