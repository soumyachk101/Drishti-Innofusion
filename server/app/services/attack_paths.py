from __future__ import annotations
import networkx as nx
from dataclasses import dataclass

from app.services.risk_engine import NodeData, build_engine, _clamp

MAX_CANDIDATES_PER_TARGET = 500
max_hops = 6
paths_per_target = 5
top_k = 25


@dataclass
class AttackPathResult:
 path_id: str
 entry: str
 target: str
 entry_label: str
 target_label: str
 hop_count: int
 path_risk: float
 likelihood: float
 impact_usd: float
 narrative: str
 top_hop_labels: list[str]
 top_cves: list[str]
 hops: list[str]
 asset_type: str
 criticality: str
 business_value: float


def hop_ease(v: NodeData, relation: str) -> float:
 re = {"exposure": 0.5, "network": 0.4, "trust": 0.45, "admin": 0.5}
 eoc = _clamp(0.6 * v.max_exploitability + 0.4 * (v.max_cvss / 10.0))
 floor = re.get(relation, 0.4)
 return _clamp(max(eoc, floor))


def _score_path(G: nx.DiGraph, nodes: dict[str, NodeData], path: list[str]) -> tuple[float, float]:
 likelihood = 1.0
 weight_sum = 0.0
 for i in range(len(path) - 1):
 edge_data = G.get_edge_data(path[i], path[i + 1])
 relation = edge_data.get("relation", "network") if edge_data else "network"
 likelihood *= hop_ease(nodes.get(path[i + 1], NodeData("", "", "low", 0, False, False)), relation)
 likelihood = _clamp(likelihood, 0.001, 0.999)
 weight_sum += G[path[i]][path[i + 1]]["weight"] if G.has_edge(path[i], path[i + 1]) else 1.0

 target = nodes.get(path[-1])
 if target is None:
 return 0.0, likelihood

 value_norm = 1.0 # simplified; full version normalizes across all assets
 crit = {"low": 0.25, "medium": 0.5, "high": 0.75, "critical": 1.0}.get(target.criticality, 0.25)
 avg_weight = weight_sum / max(len(path) - 1, 1)
 weight_norm = avg_weight

 path_risk = 100.0 * (0.45 * likelihood + 0.30 * value_norm + 0.15 * crit + 0.10 * (1.0 - weight_norm))
 return path_risk, likelihood


def find_targets(G: nx.DiGraph, nodes: dict[str, NodeData]) -> list[str]:
 targets = []
 for nid, nd in nodes.items():
 if nd.is_crown_jewel:
 targets.append(nid)
 return targets


def enumerate_paths(G: nx.DiGraph, nodes: dict[str, NodeData], top_k: int = 25) -> list[AttackPathResult]:
 targets = find_targets(G, nodes)
 candidates = []
 total_candidates = 0

 for target in targets:
 # Find entry points (internet-facing or connected from INTERNET)
 entries = [n for n in G.predecessors(target) if n in nodes]
 if not entries:
 continue

 for entry in entries:
 if total_candidates >= MAX_CANDIDATES_PER_TARGET:
 break
 try:
 gen = nx.shortest_simple_paths(G, entry, target, weight="weight")
 count = 0
 for path in gen:
 if len(path) > max_hops + 1:
 break
 if count >= paths_per_target:
 break
 p_risk, likelihood = _score_path(G, nodes, path)
 nd_target = nodes.get(target)
 candidates.append(AttackPathResult(
 path_id="",
 entry=entry,
 target=target,
 entry_label=entry,
 target_label=target,
 hop_count=len(path) - 1,
 path_risk=p_risk,
 likelihood=likelihood,
 impact_usd=0.0,
 narrative="",
 top_hop_labels=[path[i] for i in range(1, min(len(path), 4))],
 top_cves=[],
 hops=path,
 asset_type=nd_target.asset_type if nd_target else "",
 criticality=nd_target.criticality if nd_target else "",
 business_value=nd_target.business_value if nd_target else 0.0,
 ))
 count += 1
 total_candidates += 1
 except (nx.NetworkXNoPath, nx.NodeNotFound):
 continue
 if total_candidates >= MAX_CANDIDATES_PER_TARGET:
 break

 # Sort by path_risk desc, then hop_count, then target
 candidates.sort(key=lambda p: (-p.path_risk, p.hop_count, p.target))
 return candidates[:top_k]


IMPACT_MULTIPLIER = {
 "database": 1.0, "cloud": 0.8, "webapp": 0.7, "server": 0.6,
 "firewall": 0.5, "router": 0.5, "iot": 0.4, "workstation": 0.3,
 }


def path_impact_usd(path: AttackPathResult, breach_cost_base: float = 500_000.0) -> float:
 mult = IMPACT_MULTIPLIER.get(path.asset_type, 0.5)
 value = path.business_value
 return path.likelihood * value * mult + path.likelihood * breach_cost_base


def total_exposure(paths: list[AttackPathResult], breach_cost_base: float = 500_000.0) -> float:
 seen: dict[str, float] = {}
 for p in paths:
 imp = path_impact_usd(p, breach_cost_base)
 if p.target not in seen or imp > seen[p.target]:
 seen[p.target] = imp
 return sum(seen.values())
