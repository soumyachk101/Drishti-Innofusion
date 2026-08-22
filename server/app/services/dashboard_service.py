"""Dashboard and stats aggregation."""
from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import func, select

from app.models import Asset, AssetVulnerability, AttackPath, RiskZone


def get_dashboard(db: Session, org_id: str) -> dict:
 # Total exposure from cached attack paths
 total_exp = db.query(func.sum(AttackPath.impact_usd)).filter(
 AttackPath.org_id == org_id
 ).scalar() or 0.0

 # Open findings
 open_findings = db.query(func.count(AssetVulnerability.id)).filter(
 AssetVulnerability.org_id == org_id,
 AssetVulnerability.status == "open",
 ).scalar() or 0

 # Critical assets
 critical_assets = db.query(func.count(Asset.id)).filter(
 Asset.org_id == org_id,
 Asset.criticality == "critical",
 ).scalar() or 0

 # Top path
 top_path = db.query(AttackPath).filter(
 AttackPath.org_id == org_id
 ).order_by(AttackPath.path_risk.desc()).first()

 top_path_dict = None
 if top_path:
 top_path_dict = {
 "path_id": top_path.id,
 "entry": top_path.entry_label,
 "target": top_path.target_asset_id,
 "hops": top_path.hop_count,
 "risk_score": float(top_path.path_risk),
 "likelihood": float(top_path.likelihood),
 "impact_usd": float(top_path.impact_usd),
 "narrative": top_path.narrative or "",
 }

 # All paths
 all_paths = db.query(AttackPath).filter(AttackPath.org_id == org_id).order_by(
 AttackPath.path_risk.desc()
 ).limit(25).all()
 paths_list = [{
 "path_id": p.id,
 "entry": p.entry_label,
 "target": p.target_asset_id,
 "hops": p.hop_count,
 "risk_score": float(p.path_risk),
 "likelihood": float(p.likelihood),
 "impact_usd": float(p.impact_usd),
 "narrative": p.narrative or "",
 "top_hop_labels": [],
 "top_cves": [],
 } for p in all_paths]

 # Zone summary
 zones = db.query(RiskZone).filter(RiskZone.org_id == org_id).all()
 zone_summary = []
 for z in zones:
 count = db.query(func.count(Asset.id)).filter(Asset.org_id == org_id, Asset.zone_id == z.id).scalar() or 0
 crit = db.query(func.count(Asset.id)).filter(
 Asset.org_id == org_id, Asset.zone_id == z.id, Asset.criticality == "critical"
 ).scalar() or 0
 zone_summary.append({
 "zone": z.name,
 "count": count,
 "exposure_usd": 0.0,
 "avg_risk": 0.0,
 "critical_count": crit,
 })

 # Severity counts
 sev_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
 from app.models import Vulnerability
 sev_rows = db.query(
 Vulnerability.severity,
 func.count(AssetVulnerability.id),
 ).join(
 AssetVulnerability, AssetVulnerability.vulnerability_id == Vulnerability.id
 ).filter(
 AssetVulnerability.org_id == org_id,
 AssetVulnerability.status == "open",
 ).group_by(Vulnerability.severity).all()
 for sev, cnt in sev_rows:
 if sev in sev_counts:
 sev_counts[sev] = cnt

 return {
 "total_exposure_usd": float(total_exp),
 "open_findings": open_findings,
 "critical_assets": critical_assets,
 "top_path": top_path_dict,
 "paths": paths_list,
 "zone_summary": zone_summary,
 "severity_counts": sev_counts,
 "last_recompute_at": None,
 "recompute_ms": 0.0,
 }


def get_stats(db: Session, org_id: str) -> dict:
 from app.services.recompute import get_last_stats
 return get_last_stats(org_id)
