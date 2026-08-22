"""Per-node hardening recommendations."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class NodeHardening:
 asset_id: str
 action: str
 risk_reduction: float
 detail: str


HARDENING_ACTIONS = [
 ("patch", "Apply missing patches", 35.0),
 ("vlan", "Segment into VLAN", 25.0),
 ("isolate", "Network isolation", 40.0),
 ("waf", "Deploy WAF", 20.0),
]


def compute_hardening(asset: Any, risk_score: float) -> list[NodeHardening]:
 """Return quantified hardening projections for an asset."""
 recommendations = []
 for action, desc, reduction in HARDENING_ACTIONS:
 if risk_score > 50 or action in ("patch", "isolate"):
 recommendations.append(NodeHardening(
 asset_id=asset.id,
 action=action,
 risk_reduction=min(reduction, risk_score),
 detail=f"{desc} could reduce risk by ~{min(reduction, risk_score):.0f}%",
 ))
 return recommendations
