from sqlalchemy import String, Boolean, Integer, DateTime, Numeric, Text, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, uuid_pk
from datetime import datetime, timezone


class Vulnerability(Base, TimestampMixin):
 __tablename__ = "vulnerabilities"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), index=True)
 cve_id: Mapped[str | None] = mapped_column(String(30), unique=True, nullable=True)
 title: Mapped[str] = mapped_column(String(255))
 description: Mapped[str | None] = mapped_column(Text, nullable=True)
 cvss: Mapped[float] = mapped_column(Numeric(3, 1), default=5.0)
 severity: Mapped[str] = mapped_column(String(20))
 exploitability: Mapped[float] = mapped_column(Numeric(3, 2), default=0.30)
 cwe: Mapped[str | None] = mapped_column(String(30), nullable=True)
 discovered_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

 asset_vulnerabilities: Mapped[list["AssetVulnerability"]] = relationship(back_populates="vulnerability", cascade="all, delete-orphan")

 __table_args__ = (
 UniqueConstraint("org_id", "cve_id", name="uq_vuln_org_cve"),
 CheckConstraint("severity IN ('critical','high','medium','low','unknown')", name="ck_vuln_severity"),
 CheckConstraint("exploitability >= 0 AND exploitability <= 1", name="ck_vuln_exploit"),
 )


class AssetVulnerability(Base, TimestampMixin):
 __tablename__ = "asset_vulnerabilities"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), index=True)
 asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True)
 vulnerability_id: Mapped[str] = mapped_column(String(36), ForeignKey("vulnerabilities.id"), index=True)
 service_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("services.id"), nullable=True)
 status: Mapped[str] = mapped_column(String(20), default="open")
 detected_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
 resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

 asset: Mapped["Asset"] = relationship(back_populates="findings")
 vulnerability: Mapped["Vulnerability"] = relationship(back_populates="asset_vulnerabilities")
 service: Mapped["Service | None"] = relationship()
 remediations: Mapped[list["Remediation"]] = relationship(back_populates="asset_vulnerability", cascade="all, delete-orphan")

 __table_args__ = (
 UniqueConstraint("asset_id", "vulnerability_id", name="uq_finding_asset_vuln"),
 Index("ix_findings_org_status", "org_id", "status"),
 CheckConstraint("status IN ('open','remediating','resolved','accepted')", name="ck_finding_status"),
 )
