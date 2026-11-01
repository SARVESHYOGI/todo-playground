"""Shared pytest fixtures.

Points the app at a throwaway SQLite database and recreates the schema before
each test so the suite is fully isolated and repeatable.
"""

import os
import tempfile
from collections.abc import Iterator
from pathlib import Path

import pytest

_TMP_DB = Path(tempfile.gettempdir()) / "fastapi_todo_test.db"
if _TMP_DB.exists():
    _TMP_DB.unlink()

os.environ["DATABASE_URL"] = f"sqlite:///{_TMP_DB.as_posix()}"
os.environ["SECRET_KEY"] = "test-secret-key-with-at-least-32-characters"

from sqlmodel import SQLModel  # noqa: E402

from app.core.db import engine  # noqa: E402


@pytest.fixture(autouse=True)
def _reset_database() -> Iterator[None]:
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield
