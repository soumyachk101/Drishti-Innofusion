"""Recompute orchestration: build graph, score nodes, enumerate paths, compute impact, cache."""
from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.services.risk_engine import compute_node_scores, blast_radius
from app.services.attack_paths import enumerate_paths, path_impact_usd, total_exposure
from app.services.engine_loader import load_engine
from app.models import AttackPath, AttackPathStep, Asset, Connection


_LAST_STATS: dict[str, dict] = {}


def recompute_org(db: Session, org_id: str) -> dict:
 G, nodes, findings_map = load_engine(db, org_id)

 # 1. Compute node scores
 scores = compute_node_scores(G, nodes)

 # 2. Compute blast radius for each asset
 blast_counts = {}
 blast_values = {}
 for asset_id in nodes:
 blast_counts[asset_id] = blast_radius(G, asset_id)
 from app.services.risk_engine import blast_radius_value as _brv
 blast_values[asset_id] = _brv(G, asset_id, nodes)

 # 3. Cache node scores + blast radius to Asset rows
 for asset_id, score in scores.items():
 db.query(Asset).filter(Asset.org_id == org_id, Asset.id == asset_id).update({
 "risk_score": round(score, 3),
 "blast_radius_count": blast_counts.get(asset_id, 0),
 })

 # 4. Persist edge weights back to connections
 for u, v, data in G.edges(data=True):
 if "relation" in data and u != "INTERNET":
 weight = round(data.get("weight", 0.0), 3)
 db.query(Connection).filter(
 Connection.org_id == org_id,
 Connection.from_asset_id == u,
 Connection.to_asset_id == v,
 ).update({"weight": weight})

 # 5. Enumerate paths
 paths = enumerate_paths(G, nodes)

 # 6. Compute impact
 for p in paths:
 p.impact_usd = round(path_impact_usd(p), 2)

 total_exp = round(total_exposure(paths), 2)

 # 7. Delete old cached paths + rewrite
 db.query(AttackPathStep).filter(AttackPathStep.path_id.in_(
 db.query(AttackPath.id).filter(AttackPath.org_id == org_id)
 )).delete(synchronize_session=False)
 db.query(AttackPath).filter(AttackPath.org_id == org_id).delete()

 for p in paths:
 ap = AttackPath(
 org_id=org_id,
 entry_label=p.entry_label,
 target_asset_id=p.target,
 hop_count=p.hop_count,
 path_risk=round(p.path_risk, 3),
 likelihood=round(p.likelihood, 3),
 impact_usd=p.impact_usd,
 narrative=p.narrative,
 )
 db.add(ap)
 db.flush()

 for i, hop in enumerate(p.hops):
 step = AttackPathStep(
 path_id=ap.id,
 step_index=i,
 asset_id=hop,
 edge_weight=None,
 )
 db.add(step)

 db.commit()

 stats = {
 "nodes": len(nodes),
 "edges": G.number_of_edges(),
 "paths": len(paths),
 "recompute_ms": 0.0,
 "top_path_risk": round(paths[0].path_risk, 3) if paths else 0.0,
 "total_exposure_usd": total_exp,
 }
 _LAST_STATS[org_id] = stats
 return stats


def get_last_stats(org_id: str) -> dict:
 return _LAST_STATS.get(org_id, {
 "nodes": 0, "edges": 0, "paths": 0,
 "recompute_ms": 0.0, "top_path_risk": 0.0, "total_exposure_usd": 0.0,
 })
