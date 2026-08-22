from sqlalchemy import String, Boolean, Integer, DateTime, Numeric, Text, JSON, ForeignKey, UniqueConstraint, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class RiskZone(Base, TimestampMixin):
 __tablename__ = "risk_zones"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), index=True)
 name: Mapped[str] = mapped_column(String(120))
 kind: Mapped[str] = mapped_column(String(20))
 description: Mapped[str | None] = mapped_column(Text, nullable=True)

 organization: Mapped["Organization"] = relationship(back_populates="risk_zones")
 assets: Mapped[list["Asset"]] = relationship(back_populates="zone")

 __table_args__ = (
 CheckConstraint("kind IN ('dmz','internal','crown_jewel','cloud')", name="ck_risk_zone_kind"),
 )


class Asset(Base, TimestampMixin):
 __tablename__ = "assets"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), index=True)
 zone_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("risk_zones.id"), nullable=True)
 hostname: Mapped[str | None] = mapped_column(String(255), nullable=True)
 ip: Mapped[str] = mapped_column(String(45))
 os: Mapped[str | None] = mapped_column(String(120), nullable=True)
 asset_type: Mapped[str] = mapped_column(String(20))
 criticality: Mapped[str] = mapped_column(String(20))
 business_value: Mapped[float] = mapped_column(Numeric(14, 2), default=10000.0)
 internet_facing: Mapped[bool] = mapped_column(Boolean, default=False)
 risk_score: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)
 blast_radius_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
 meta: Mapped[dict | None] = mapped_column(JSON, nullable=True)

 organization: Mapped["Organization"] = relationship(back_populates="assets")
 zone: Mapped["RiskZone | None"] = relationship(back_populates="assets")
 services: Mapped[list["Service"]] = relationship(back_populates="asset", cascade="all, delete-orphan")
 findings: Mapped[list["AssetVulnerability"]] = relationship(back_populates="asset", cascade="all, delete-orphan")
 outgoing_connections: Mapped[list["Connection"]] = relationship(foreign_keys="Connection.from_asset_id", back_populates="from_asset", cascade="all, delete-orphan")
 incoming_connections: Mapped[list["Connection"]] = relationship(foreign_keys="Connection.to_asset_id", back_populates="to_asset", cascade="all, delete-orphan")
 deep_scans: Mapped[list["DeepScan"]] = relationship(back_populates="asset", cascade="all, delete-orphan")
 target_paths: Mapped[list["AttackPath"]] = relationship(back_populates="target_asset")

 __table_args__ = (
 UniqueConstraint("org_id", "ip", name="uq_asset_org_ip"),
 Index("ix_assets_org_internet", "org_id", "internet_facing"),
 CheckConstraint("asset_type IN ('server','database','workstation','firewall','router','webapp','iot','cloud')", name="ck_asset_type"),
 CheckConstraint("criticality IN ('critical','high','medium','low')", name="ck_asset_criticality"),
)


class Service(Base, TimestampMixin):
 __tablename__ = "services"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), index=True)
 asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True)
 scan_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("scans.id"), nullable=True)
 port: Mapped[int] = mapped_column(Integer)
 protocol: Mapped[str] = mapped_column(String(8))
 name: Mapped[str] = mapped_column(String(120))
 version: Mapped[str | None] = mapped_column(String(80), nullable=True)

 asset: Mapped["Asset"] = relationship(back_populates="services")
 scan: Mapped["Scan | None"] = relationship(back_populates="services")

 __table_args__ = (
 UniqueConstraint("asset_id", "port", "protocol", name="uq_service_asset_port"),
 CheckConstraint("protocol IN ('tcp','udp')", name="ck_service_protocol"),
 )


class Connection(Base, TimestampMixin):
 __tablename__ = "connections"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), index=True)
 from_asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True)
 to_asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True)
 relation: Mapped[str] = mapped_column(String(20))
 weight: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)
 note: Mapped[str | None] = mapped_column(String(255), nullable=True)

 from_asset: Mapped["Asset"] = relationship(foreign_keys=[from_asset_id], back_populates="outgoing_connections")
 to_asset: Mapped["Asset"] = relationship(foreign_keys=[to_asset_id], back_populates="incoming_connections")

 __table_args__ = (
 UniqueConstraint("from_asset_id", "to_asset_id", "relation", name="uq_connection"),
 CheckConstraint("relation IN ('network','admin','trust','exposure')", name="ck_connection_relation"),
 )
