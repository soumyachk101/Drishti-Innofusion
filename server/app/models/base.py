import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, Integer, DateTime, Numeric, Text, JSON, CheckConstraint, Index, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
 pass


def uuid_pk() -> str:
 return str(uuid.uuid4())


class TimestampMixin:
 created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
 updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
