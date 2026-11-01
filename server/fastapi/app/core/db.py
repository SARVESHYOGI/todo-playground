from sqlmodel import SQLModel, create_engine

from app import models  # noqa: F401
from app.core.config import settings

engine = create_engine(str(settings.DATABASE_URL), pool_pre_ping=True)


def create_db_and_tables() -> None:
    """Create tables directly from the models (development convenience).

    Production should use Alembic migrations instead.
    """
    SQLModel.metadata.create_all(engine)
