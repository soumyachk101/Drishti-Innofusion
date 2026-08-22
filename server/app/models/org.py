from sqlalchemy import String, Boolean, Integer, DateTime, Numeric, Text, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, uuid_pk
from datetime import datetime, timezone


class Organization(Base, TimestampMixin):
 __tablename__ = "organizations"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 name: Mapped[str] = mapped_column(String(200))
 slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)

 users: Mapped[list["User"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 agents: Mapped[list["Agent"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 assets: Mapped[list["Asset"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 risk_zones: Mapped[list["RiskZone"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 remediations: Mapped[list["Remediation"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 attack_paths: Mapped[list["AttackPath"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 network_devices: Mapped[list["NetworkDevice"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 live_observations: Mapped[list["LiveObservation"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 network_coverage: Mapped[list["NetworkCoverage"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 deep_scans: Mapped[list["DeepScan"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 netconfig_analyses: Mapped[list["NetconfigAnalysis"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 url_analyses: Mapped[list["UrlAnalysis"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 scans: Mapped[list["Scan"]] = relationship(back_populates="organization", cascade="all, delete-orphan")
 autoscan_configs: Mapped[list["AutoScanConfig"]] = relationship(back_populates="organization", cascade="all, delete-orphan")


class User(Base, TimestampMixin):
 __tablename__ = "users"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), index=True)
 name: Mapped[str | None] = mapped_column(String(120), nullable=True)
 email: Mapped[str] = mapped_column(String(255))
 password_hash: Mapped[str] = mapped_column(String(255))
 role: Mapped[str] = mapped_column(String(20), default="analyst")
 token_version: Mapped[int] = mapped_column(Integer, default=0)

 organization: Mapped["Organization"] = relationship(back_populates="users")

 __table_args__ = (UniqueConstraint("org_id", "email", name="uq_user_org_email"),)


class Agent(Base, TimestampMixin):
 __tablename__ = "agents"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), index=True)
 agent_key: Mapped[str] = mapped_column(String(64), index=True)
 token_hash: Mapped[str] = mapped_column(String(255))
 label: Mapped[str | None] = mapped_column(String(120), nullable=True)
 last_seen_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
 status: Mapped[str] = mapped_column(String(20), default="active")

 organization: Mapped["Organization"] = relationship(back_populates="agents")

 __table_args__ = (UniqueConstraint("org_id", "agent_key", name="uq_agent_org_key"),)
