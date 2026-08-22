from sqlalchemy import String, Numeric, Boolean, DateTime, JSON, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, uuid_pk
from datetime import datetime, timezone


class NetconfigAnalysis(Base, TimestampMixin):
 __tablename__ = "netconfig_analyses"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), index=True)
 used_declared_config: Mapped[bool] = mapped_column(Boolean, default=False)
 real_findings: Mapped[int] = mapped_column(Integer, default=0)
 result_json: Mapped[dict] = mapped_column(JSON)
 created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

 organization: Mapped["Organization"] = relationship(back_populates="netconfig_analyses")
