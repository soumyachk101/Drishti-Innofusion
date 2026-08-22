from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, uuid_pk
from datetime import datetime, timezone


class Scan(Base, TimestampMixin):
 __tablename__ = "scans"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), index=True)
 agent_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
 started_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
 finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
 asset_count: Mapped[int] = mapped_column(Integer, default=0)
 vuln_count: Mapped[int] = mapped_column(Integer, default=0)
 status: Mapped[str] = mapped_column(String(20), default="running")

 organization: Mapped["Organization"] = relationship(back_populates="scans")
 services: Mapped[list["Service"]] = relationship(back_populates="scan")
 threat_intel: Mapped[list["ThreatIntel"]] = relationship(back_populates="scan")

 __table_args__ = (
 CheckConstraint("status IN ('running','complete','failed')", name="ck_scan_status"),
 )


class ThreatIntel(Base, TimestampMixin):
 __tablename__ = "threat_intel"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
 indicator_hash: Mapped[str] = mapped_column(String(128))
 ttp_tags: Mapped[dict | None] = mapped_column(JSON, nullable=True)
 shared_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
 source: Mapped[str] = mapped_column(String(20))

 scan: Mapped["Scan | None"] = relationship(back_populates="threat_intel")

 __table_args__ = (
 CheckConstraint("source IN ('local','network')", name="ck_threat_intel_source"),
 )
