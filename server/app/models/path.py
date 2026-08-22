from sqlalchemy import String, Integer, Numeric, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class AttackPath(Base, TimestampMixin):
 __tablename__ = "attack_paths"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), index=True)
 entry_label: Mapped[str] = mapped_column(String(120))
 target_asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True)
 hop_count: Mapped[int] = mapped_column(Integer)
 path_risk: Mapped[float] = mapped_column(Numeric(6, 3))
 likelihood: Mapped[float] = mapped_column(Numeric(4, 3))
 impact_usd: Mapped[float] = mapped_column(Numeric(14, 2))
 narrative: Mapped[str | None] = mapped_column(Text, nullable=True)
 computed_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

 target_asset: Mapped["Asset"] = relationship(foreign_keys=[target_asset_id], back_populates="target_paths")
 steps: Mapped[list["AttackPathStep"]] = relationship(back_populates="path", cascade="all, delete-orphan")

 __table_args__ = (
 UniqueConstraint("org_id", "entry_label", "target_asset_id", "computed_at", name="uq_path"),
 Index("ix_paths_org_risk", "org_id", "path_risk"),
 )


class AttackPathStep(Base, TimestampMixin):
 __tablename__ = "attack_path_steps"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 path_id: Mapped[str] = mapped_column(String(36), ForeignKey("attack_paths.id"), index=True)
 step_index: Mapped[int] = mapped_column(Integer)
 asset_id: Mapped[str] = mapped_column(String(36), ForeignKey("assets.id"), index=True)
 via_vulnerability_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
 edge_weight: Mapped[float | None] = mapped_column(Numeric(6, 3), nullable=True)

 path: Mapped["AttackPath"] = relationship(back_populates="steps")

 __table_args__ = (
 UniqueConstraint("path_id", "step_index", name="uq_path_step_index"),
 )
