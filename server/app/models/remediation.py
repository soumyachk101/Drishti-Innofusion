from sqlalchemy import String, Text, Numeric, Boolean, DateTime, JSON, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, uuid_pk


class Remediation(Base, TimestampMixin):
 __tablename__ = "remediations"

 id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid_pk)
 org_id: Mapped[str] = mapped_column(String(36), index=True)
 asset_vulnerability_id: Mapped[str] = mapped_column(String(36), ForeignKey("asset_vulnerabilities.id"), index=True)
 kind: Mapped[str] = mapped_column(String(20))
 title: Mapped[str] = mapped_column(String(255))
 summary: Mapped[str] = mapped_column(Text)
 script: Mapped[str] = mapped_column(Text)
 risk_reduction: Mapped[float | None] = mapped_column(Numeric(5, 2), nullable=True)
 generated_by: Mapped[str] = mapped_column(String(20))
 model: Mapped[str | None] = mapped_column(String(60), nullable=True)
 reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
 details_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

 organization: Mapped["Organization"] = relationship(back_populates="remediations")
 asset_vulnerability: Mapped["AssetVulnerability"] = relationship(back_populates="remediations")

 __table_args__ = (
 CheckConstraint("kind IN ('ansible','shell','cloud_cli','manual')", name="ck_remediation_kind"),
 CheckConstraint("generated_by IN ('ai','human')", name="ck_remediation_gen"),
 )
