from sqlalchemy import String, Numeric, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, uuid_pk
from datetime import datetime, timezone


class UrlAnalysis(Base, TimestampMixin):
 __tablename__ = "url_analyses"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), index=True)
 url: Mapped[str] = mapped_column(String(500))
 score: Mapped[float] = mapped_column(Numeric(5, 1))
 band: Mapped[str] = mapped_column(String(20))
 result_json: Mapped[dict] = mapped_column(JSON)
 created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

 organization: Mapped["Organization"] = relationship(back_populates="url_analyses")
