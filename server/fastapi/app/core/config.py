import json

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "Todo API"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = "changethis"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/todo"

    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def split_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return value
        if value.startswith("["):
            parsed: list[object] = json.loads(value)
            return [str(origin) for origin in parsed]
        return [origin.strip() for origin in value.split(",") if origin.strip()]


settings = Settings()
