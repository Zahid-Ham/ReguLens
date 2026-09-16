"""Database Setup & Session Management.

Configures SQLAlchemy engine, session maker, base model class,
and dependency injection providers with safe SQLite defaults for ReguLens.
"""

import os
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.config import get_settings

settings = get_settings()

# Default SQLite database path
default_db_path = settings.DATA_DIR / "regulens.db"
os.makedirs(settings.DATA_DIR, exist_ok=True)

db_url = settings.DATABASE_URL
if not db_url:
    # Use SQLite
    db_url = f"sqlite:///{default_db_path.as_posix()}"

# SQLite specific connect args
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False,
    future=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Initialize all database tables defined on Base and migrate schema if needed."""
    import app.models.analysis  # Ensure models are imported before creating tables
    Base.metadata.create_all(bind=engine)

    # Lightweight migration check for SQLite
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "analyses" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("analyses")]
            with engine.connect() as conn:
                if "ai_insights_data" not in columns:
                    conn.execute(text("ALTER TABLE analyses ADD COLUMN ai_insights_data JSON"))
                    conn.commit()
                if "processed_clauses_data" not in columns:
                    conn.execute(text("ALTER TABLE analyses ADD COLUMN processed_clauses_data JSON"))
                    conn.commit()
    except Exception as e:
        print(f"[init_db] Warning during schema migration check: {e}")


# Initialize database schema and columns on startup
init_db()


