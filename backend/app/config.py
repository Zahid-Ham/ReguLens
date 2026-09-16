"""Application Configuration Module.

Loads environment variables using Pydantic Settings with safe defaults.
Does not hardcode any sensitive credentials or Colab absolute paths.
"""

from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

# Base backend directory
BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings and environment configurations."""

    APP_NAME: str = "ReguLens API"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    DEBUG: bool = False

    # Server settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # CORS settings allowing local frontend development
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Data directory path (relative to backend root by default)
    DATA_DIR: Path = BACKEND_ROOT / "data"

    # Database configuration (defaults to local SQLite database in DATA_DIR)
    DATABASE_URL: str | None = None

    # Optional third-party API keys (loaded from environment only)
    GROQ_API_KEY: str | None = None
    FIREBASE_PROJECT_ID: str | None = None
    FIREBASE_CLIENT_EMAIL: str | None = None
    FIREBASE_PRIVATE_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Return a cached singleton instance of application settings."""
    return Settings()
