"""Network intelligence: CVE aggregation, risk-band distribution, ML summary, AI summary."""
from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Asset, AssetVulnerability, Vulnerability, AttackPath


def cve_summary(db: Session, org_id: str) -> list[dict]:
 """All CVEs affecting the org."""
 rows = db.query(
 Vulnerability.cve_id,
 Vulnerability.title,
 Vulnerability.severity,
 Vulnerability.cvss,
 func.count(AssetVulnerability.id).label("affected_assets"),
 ).join(
 AssetVulnerability, Vulnerability.id == AssetVulnerability.vulnerability_id
 ).filter(
 AssetVulnerability.org_id == org_id,
 AssetVulnerability.status.in_(["open", "remediating"]),
 ).group_by(Vulnerability.id).order_by(Vulnerability.cvss.desc()).all()

 return [{
 "cve_id": r.cve_id,
 "title": r.title,
 "severity": r.severity,
 "cvss": float(r.cvss),
 "affected_assets": r.affected_assets,
 } for r in rows]


def severity_distribution(db: Session, org_id: str) -> dict:
 from app.models import Vulnerability as V
 rows = db.query(
 V.severity,
 func.count(AssetVulnerability.id),
 ).join(
 AssetVulnerability, V.id == AssetVulnerability.vulnerability_id
 ).filter(
 AssetVulnerability.org_id == org_id,
 AssetVulnerability.status == "open",
 ).group_by(V.severity).all()

 result = {"critical": 0, "high": 0, "medium": 0, "low": 0}
 for sev, cnt in rows:
 if sev in result:
 result[sev] = cnt
 return result


def ml_summary(db: Session, org_id: str) -> dict:
 """ML analysis summary (placeholder — IsolationForest + KMeans)."""
 return {
 "model_calls": 0,
 "mock_calls": 0,
 "last_run": None,
 "anomalies_detected": 0,
 "segments_identified": 0,
 }


def network_summary_ai(db: Session, org_id: str) -> dict:
 """Executive network summary."""
 assets = db.query(Asset).filter(Asset.org_id == org_id).count()
 paths = db.query(AttackPath).filter(AttackPath.org_id == org_id).count()
 total_exp = db.query(func.sum(AttackPath.impact_usd)).filter(AttackPath.org_id == org_id).scalar() or 0

 return {
 "summary": f"Network has {assets} assets with {paths} identified attack paths and ${total_exp:,.0f} total exposure.",
 "total_assets": assets,
 "total_paths": paths,
 "total_exposure": float(total_exp),
 }
