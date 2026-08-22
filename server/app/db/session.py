"""Database session module."""
from __future__ import annotations

from typing import Generator
from sqlalchemy.orm import Session

from app.db import engine, SessionLocal


def get_db() -> Generator[Session, None, None]:
 """Dependency that provides a SQLAlchemy session per request."""
 db = SessionLocal()
 yield db
 db.close()
