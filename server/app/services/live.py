# Drishti v0.1 — live network watch service | 11-Jul-2026
"""Live network watch: the edge agent reports each domain the host connects to;
we run the REAL URL Trust Analyzer on it (SSL, WHOIS, Safe Browsing, VirusTotal),
dedupe into a live threat node, and can draft a defensive block on demand.

Nothing here is mocked — the verdict is the same real analysis the URL Analyzer
uses. Purely defensive: we score and block domains, never attack anything."""
from __future__ import annotations

import logging
import re
from datetime import timedelta, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models import LiveObservation, NetworkDevice
from app.models.base import utcnow
from app.schemas.live import (
    BlockCommand,
    BlockFixOut,
    DeviceBatch,
    DeviceBatchResponse,
    LiveThreat,
    NetworkDeviceOut,
    ObserveResponse,
)
from app.services.urltrust import analyzer

logger = logging.getLogger("drishti")

# statuses that make a signal a "reason" worth surfacing on the node
_BAD = {"fail", "warn"}

# valid hostname: dot-separated labels of [a-z0-9-] (no leading/trailing hyphen),
# rejecting shell metacharacters, whitespace and any other invalid input.
_HOSTNAME_RE = re.compile(
    r"^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(?:\.(?!-)[a-z0-9-]{1,63}(?<!-))+$"
)


def _clean_domain(raw: str) -> str:
    d = (raw or "").strip().lower()
    for p in ("http://", "https://"):
        if d.startswith(p):
            d = d[len(p):]
    d = d.split("/")[0].split("?")[0]
    if d.startswith("www."):
        d = d[4:]
    return d.rstrip(".")


def _reasons_from(verdict: dict) -> list[str]:
    out = []
    for s in verdict.get("signals", []):
        if s.get("status") in _BAD and s.get("counted", True):
            out.append(s.get("detail") or s.get("label", ""))
    return out[:4]


def _bump_observation(row: LiveObservation, result, trimmed: dict, source_host: str | None) -> None:
    """Fold a fresh hit into an existing live threat node."""
    row.band = result.band
    row.score = float(result.score)
    row.verdict_json = trimmed
    row.hit_count = (row.hit_count or 0) + 1
    row.last_seen = utcnow()
    if source_host:
        row.source_host = source_host


def observe(db: Session, org_id: str, raw_domain: str, source_host: str | None = None) -> ObserveResponse:
    """Analyze a freshly-observed domain (real) and upsert its live threat node."""
    domain = _clean_domain(raw_domain)
    if not domain or "." not in domain:
        # ignore local/bare names (e.g. mDNS, single-label hostnames)
        raise NotFoundError("Not a public domain")
    if not _HOSTNAME_RE.match(domain):
        # reject anything with shell metacharacters / invalid hostname chars
        # before we ever store or analyze it
        raise NotFoundError("Not a public domain")

    result = analyzer.analyze(db, org_id, domain)  # REAL analysis (also stored in history)
    verdict = result.model_dump(mode="json")
    # keep the node payload small: signals + website + providers only
    trimmed = {
        "signals": verdict.get("signals", []),
        "website": verdict.get("website", {}),
        "providers": verdict.get("providers", {}),
        "ai_summary": verdict.get("ai_summary"),
    }

    row = db.scalar(
        select(LiveObservation).where(
            LiveObservation.org_id == org_id, LiveObservation.domain == domain
        )
    )
    if row is None:
        row = LiveObservation(
            org_id=org_id,
            domain=domain,
            url=result.url,
            band=result.band,
            score=float(result.score),
            verdict_json=trimmed,
            source_host=source_host,
            hit_count=1,
        )
        try:
            with db.begin_nested():
                db.add(row)
        except IntegrityError:
            # Lost the (org_id, domain) race to a concurrent observe — adopt its
            # row and fold this hit into it instead of 500-ing.
            row = db.scalar(
                select(LiveObservation).where(
                    LiveObservation.org_id == org_id, LiveObservation.domain == domain
                )
            )
            if row is None:
                raise
            _bump_observation(row, result, trimmed, source_host)
    else:
        _bump_observation(row, result, trimmed, source_host)
    db.commit()

    return ObserveResponse(
        id=row.id,
        domain=domain,
        band=result.band,
        score=float(result.score),
        is_threat=result.band != "Trusted",
    )


_ACTIVE_APPS_BY_HOST: dict[str, tuple[list[str], datetime]] = {}


def sync_active(db: Session, org_id: str, domains: list[str], source_host: str, active_apps: list[str] | None = None) -> dict:
    """Sync the active tabs and applications for a host, refreshing timestamps for open tabs."""
    if active_apps is not None:
        _ACTIVE_APPS_BY_HOST[source_host] = (active_apps, utcnow())

    cleaned_domains = [_clean_domain(d) for d in domains if d]
    updated = 0
    if cleaned_domains:
        stmt = select(LiveObservation).where(
            LiveObservation.org_id == org_id,
            LiveObservation.domain.in_(cleaned_domains)
        )
        rows = db.scalars(stmt).all()
        now = utcnow()
        for r in rows:
            r.last_seen = now
            updated += 1
        db.commit()
    return {"updated": updated}


def list_threats(db: Session, org_id: str, limit: int = 60) -> list[LiveThreat]:
    from datetime import timedelta
    # 24-hour window so observed network domains don't disappear while inspecting
    recent = utcnow() - timedelta(hours=24)
    rows = db.scalars(
        select(LiveObservation)
        .where(LiveObservation.org_id == org_id, LiveObservation.last_seen > recent)
        .order_by(LiveObservation.last_seen.desc())
        .limit(limit)
    ).all()
    return [
        LiveThreat(
            id=r.id,
            domain=r.domain,
            band=r.band,
            score=float(r.score),
            hit_count=r.hit_count or 1,
            source_host=r.source_host,
            reasons=_reasons_from(r.verdict_json or {}),
            verdict_json=r.verdict_json or {},
            first_seen=r.first_seen,
            last_seen=r.last_seen,
        )
        for r in rows
    ]


# ── network device discovery ─────────────────────────────────────────────────
# A tiny offline OUI table for common vendors — best-effort labelling only.
_OUI = {
    "001A11": "Google", "3C5AB4": "Google", "F4F5D8": "Google",
    "001451": "Apple", "3C0754": "Apple", "A4C361": "Apple", "F0189A": "Apple",
    "AC87A3": "Apple", "8866A5": "Apple", "DC2B2A": "Apple", "F80377": "Apple",
    "FCFC48": "Apple", "88665A": "Apple",
    "001377": "Samsung", "0021D1": "Samsung", "5CF6DC": "Samsung", "8425DB": "Samsung",
    "F0EE10": "Samsung", "FC0012": "Toshiba", "001A2B": "Cisco", "00259C": "Cisco",
    "B827EB": "Raspberry Pi", "DCA632": "Raspberry Pi", "E45F01": "Raspberry Pi",
    "00155D": "Microsoft", "D8D385": "Hewlett-Packard", "001B63": "Apple",
    "5C514F": "Intel", "A0C589": "Intel", "001E10": "Nokia",
    "F0272D": "Xiaomi", "286C07": "Xiaomi", "64B473": "Xiaomi",
    "0016EA": "Intel", "00248C": "ASUSTek", "AC220B": "ASUSTek",
    "001E58": "D-Link", "00179A": "D-Link", "C83A35": "Tenda",
}


def _infer_subnet24(ip: str | None) -> str | None:
    """Best-effort /24 CIDR for an IP with no observed netmask (legacy rows /
    old agents only — anything derived here is marked subnet_inferred)."""
    if not ip:
        return None
    import ipaddress

    try:
        return str(ipaddress.ip_network(f"{ip}/24", strict=False))
    except ValueError:
        return None


def _vendor_for(mac: str) -> str | None:
    m = mac.replace(":", "").replace("-", "").upper()
    if len(m) < 6:
        return None
    # locally-administered (randomized) MAC — common on modern phones for privacy
    try:
        first = int(m[0:2], 16)
    except ValueError:
        return None
    if first & 0x02:
        return "Private device (randomized MAC)"
    return _OUI.get(m[0:6])


def observe_devices(db: Session, org_id: str, batch: DeviceBatch) -> DeviceBatchResponse:
    """Upsert the devices the agent discovered; prune ONLY within the subnets
    this batch actually observed. Rows in any other subnet are untouched, so
    K agents on K subnets never delete each other's data — nothing here knows
    or assumes how many networks exist."""
    self_mac = (batch.self_mac or "").lower()

    def _device_subnet(d) -> tuple[str | None, bool]:
        """(cidr, inferred) — observed per-device, else batch-level, else /24 guess."""
        if getattr(d, "subnet", None):
            return d.subnet, False
        if batch.subnet:
            return batch.subnet, False
        return _infer_subnet24(d.ip), True

    # Dedup the batch: by MAC when present (a device can appear on multiple
    # IPs), else by (subnet, ip) for off-link hosts that legitimately have none.
    by_key: dict[tuple, "object"] = {}
    for d in batch.devices:
        mac = (d.mac or "").lower().strip()
        if mac in ("00:00:00:00:00:00", "ff:ff:ff:ff:ff:ff"):
            mac = ""
        if mac:
            by_key[("mac", mac)] = d
        elif getattr(d, "discovery", "arp") == "l3":
            subnet, _ = _device_subnet(d)
            by_key[("ip", subnet, d.ip)] = d
        # no MAC and not L3-discovered → unusable ARP row, drop it (old behaviour)

    seen_ids: set[str] = set()
    seen_macs: set[str] = set()
    observed_subnets: set[str] = set()
    new = 0
    for key, d in by_key.items():
        mac = key[1] if key[0] == "mac" else None
        subnet, inferred = _device_subnet(d)
        if subnet:
            observed_subnets.add(subnet)
        is_self = bool(self_mac and mac and mac == self_mac)
        is_gw = bool(batch.gateway_ip and d.ip == batch.gateway_ip)
        discovery = getattr(d, "discovery", "arp") or "arp"

        if mac:
            seen_macs.add(mac)
            row = db.scalar(
                select(NetworkDevice).where(
                    NetworkDevice.org_id == org_id, NetworkDevice.mac == mac
                )
            )
        else:
            row = db.scalar(
                select(NetworkDevice).where(
                    NetworkDevice.org_id == org_id,
                    NetworkDevice.mac.is_(None),
                    NetworkDevice.subnet == subnet,
                    NetworkDevice.ip == d.ip,
                )
            )
        if row is None:
            device = NetworkDevice(
                org_id=org_id, mac=mac, ip=d.ip, hostname=d.hostname,
                vendor=_vendor_for(mac) if mac else None,
                subnet=subnet, subnet_inferred=inferred,
                source_agent_id=batch.agent_id, label=batch.label,
                discovery=discovery,
                is_self=is_self, is_gateway=is_gw, online=True,
            )
            try:
                with db.begin_nested():
                    db.add(device)
                new += 1
                seen_ids.add(device.id)
                continue
            except IntegrityError:
                # Lost the dedupe-key race to a concurrent sweep — adopt its
                # row and update it instead of 500-ing.
                if mac:
                    row = db.scalar(
                        select(NetworkDevice).where(
                            NetworkDevice.org_id == org_id, NetworkDevice.mac == mac
                        )
                    )
                else:
                    row = db.scalar(
                        select(NetworkDevice).where(
                            NetworkDevice.org_id == org_id,
                            NetworkDevice.mac.is_(None),
                            NetworkDevice.subnet == subnet,
                            NetworkDevice.ip == d.ip,
                        )
                    )
                if row is None:
                    raise
        row.ip = d.ip
        if d.hostname:
            row.hostname = d.hostname
        row.subnet = subnet
        row.subnet_inferred = inferred
        row.discovery = discovery
        if batch.agent_id:
            row.source_agent_id = batch.agent_id
        if batch.label:
            row.label = batch.label
        # Recompute flags fresh each sweep — a device that was the gateway
        # (or self) on a previous network must not stay flagged on this one.
        row.is_self = is_self
        row.is_gateway = is_gw
        row.online = True
        row.last_seen = utcnow()
        seen_ids.add(row.id)

    # IPs currently held by an online device this sweep — used to drop stale
    # duplicates (e.g. the gateway reappearing under a randomized MAC).
    online_ips = {d.ip for d in by_key.values()}

    # Prune strictly within the subnets this batch observed. A batch for
    # 192.168.1.0/24 is a no-op for 10.0.5.0/24 — regardless of how many
    # subnets/agents exist.
    if observed_subnets:
        stale = db.scalars(
            select(NetworkDevice).where(
                NetworkDevice.org_id == org_id,
                NetworkDevice.subnet.in_(observed_subnets),
            )
        ).all()
        for row in stale:
            if row.id in seen_ids:
                continue
            if row.ip in online_ips:
                # stale duplicate of an IP that answered under another identity
                db.delete(row)
            else:
                row.online = False

    # Live tracking: this agent told us every subnet it is connected to right
    # now. Its rows on any OTHER subnet are from a network it has left (WiFi
    # switch) — offline them immediately instead of waiting for staleness.
    if batch.agent_id and batch.active_subnets is not None:
        left = db.scalars(
            select(NetworkDevice).where(
                NetworkDevice.org_id == org_id,
                NetworkDevice.source_agent_id == batch.agent_id,
                NetworkDevice.online.is_(True),
                NetworkDevice.subnet.notin_(batch.active_subnets),
            )
        ).all()
        for row in left:
            row.online = False

    # Safety net: age out any online row nobody has refreshed in a while — e.g. a
    # gateway a deep-scan created (with no sweeping agent_id) on a previous Wi-Fi,
    # which the agent-scoped rule above never touches and would otherwise linger
    # online forever, leaking a stale gateway onto the map.
    stale_cutoff = utcnow() - timedelta(minutes=3)
    stale = db.scalars(
        select(NetworkDevice).where(
            NetworkDevice.org_id == org_id,
            NetworkDevice.online.is_(True),
            NetworkDevice.last_seen < stale_cutoff,
        )
    ).all()
    for row in stale:
        row.online = False

    _upsert_inventoried_coverage(db, org_id, batch, observed_subnets)
    db.commit()
    return DeviceBatchResponse(total=len(by_key), new=new)


def _upsert_inventoried_coverage(
    db: Session, org_id: str, batch: DeviceBatch, observed_subnets: set[str]
) -> None:
    """Mark each subnet this batch swept as inventoried in network_coverage."""
    from app.models import NetworkCoverage

    for subnet in observed_subnets:
        count = len([d for d in batch.devices if _batch_device_subnet(batch, d) == subnet])
        row = db.scalar(
            select(NetworkCoverage).where(
                NetworkCoverage.org_id == org_id,
                NetworkCoverage.subnet == subnet,
            )
        )
        gw = batch.gateway_ip if _ip_in_subnet(batch.gateway_ip, subnet) else None
        if row is None:
            row = NetworkCoverage(
                org_id=org_id, subnet=subnet, status="inventoried",
                evidence=f"agent sweep ({batch.agent_id or 'unknown agent'})",
                gateway_ip=gw, label=batch.label, device_count=count,
            )
            db.add(row)
        else:
            row.status = "inventoried"
            row.evidence = f"agent sweep ({batch.agent_id or 'unknown agent'})"
            row.device_count = count
            if gw:
                row.gateway_ip = gw
            if batch.label:
                row.label = batch.label
            row.last_seen = utcnow()


def _batch_device_subnet(batch: DeviceBatch, d) -> str | None:
    return getattr(d, "subnet", None) or batch.subnet or _infer_subnet24(d.ip)


def _ip_in_subnet(ip: str | None, cidr: str | None) -> bool:
    if not ip or not cidr:
        return False
    import ipaddress

    try:
        return ipaddress.ip_address(ip) in ipaddress.ip_network(cidr, strict=False)
    except ValueError:
        return False


def report_coverage(db: Session, org_id: str, report) -> int:
    """Upsert agent-reported coverage rows (networks known to exist but not
    inventoried this run: skipped, unreachable, seen-but-not-joined SSIDs).
    Keyed by subnet when present, else by SSID — never both null."""
    from app.models import NetworkCoverage

    n = 0
    for net in report.networks:
        if not net.subnet and not net.ssid:
            continue  # no identity, nothing truthful to record
        q = select(NetworkCoverage).where(NetworkCoverage.org_id == org_id)
        if net.subnet:
            q = q.where(NetworkCoverage.subnet == net.subnet)
        else:
            q = q.where(NetworkCoverage.subnet.is_(None), NetworkCoverage.ssid == net.ssid)
        row = db.scalar(q)
        if row is None:
            db.add(NetworkCoverage(
                org_id=org_id, ssid=net.ssid, subnet=net.subnet,
                gateway_ip=net.gateway_ip, label=net.label,
                status=net.status, evidence=net.evidence,
            ))
        else:
            row.status = net.status
            row.evidence = net.evidence
            if net.ssid:
                row.ssid = net.ssid
            if net.gateway_ip:
                row.gateway_ip = net.gateway_ip
            if net.label:
                row.label = net.label
            row.last_seen = utcnow()
        n += 1
    db.commit()
    return n


def list_coverage(db: Session, org_id: str) -> list["CoverageOut"]:
    from app.models import NetworkCoverage
    from app.schemas.live import CoverageOut

    rows = db.scalars(
        select(NetworkCoverage)
        .where(NetworkCoverage.org_id == org_id)
        .order_by(NetworkCoverage.status, NetworkCoverage.last_seen.desc())
    ).all()
    return [
        CoverageOut(
            id=r.id, ssid=r.ssid, subnet=r.subnet, gateway_ip=r.gateway_ip,
            label=r.label, status=r.status, evidence=r.evidence,
            device_count=r.device_count or 0, last_seen=r.last_seen,
        )
        for r in rows
    ]


def backfill_device_subnets(db: Session) -> int:
    """One-shot bootstrap backfill: legacy rows predate the subnet column, so
    assume /24 (their agent only ever swept its own /24) and mark it inferred."""
    rows = db.scalars(
        select(NetworkDevice).where(NetworkDevice.subnet.is_(None))
    ).all()
    for row in rows:
        row.subnet = _infer_subnet24(row.ip)
        row.subnet_inferred = True
    if rows:
        db.commit()
    return len(rows)


_SEV_RANK = {"low": 0, "medium": 1, "high": 2, "critical": 3}


def _scan_status(db: Session, org_id: str) -> tuple[set[str], dict[str, tuple[int, str | None]]]:
    """(ips that have a successful deep scan, {asset_ip: (open_cve_count, worst_severity)})."""
    from app.models import Asset, AssetVulnerability, DeepScan, Vulnerability

    scanned_ips = set(
        db.scalars(
            select(DeepScan.target_ip).where(
                DeepScan.org_id == org_id, DeepScan.available.is_(True)
            )
        ).all()
    )
    by_ip: dict[str, tuple[int, str | None]] = {}
    rows = db.execute(
        select(Asset.ip, Vulnerability.severity)
        .join(AssetVulnerability, AssetVulnerability.asset_id == Asset.id)
        .join(Vulnerability, Vulnerability.id == AssetVulnerability.vulnerability_id)
        .where(Asset.org_id == org_id, AssetVulnerability.status == "open")
    ).all()
    for ip, severity in rows:
        count, worst = by_ip.get(ip, (0, None))
        count += 1
        if worst is None or _SEV_RANK.get(severity, 0) > _SEV_RANK.get(worst, 0):
            worst = severity
        by_ip[ip] = (count, worst)
    return scanned_ips, by_ip


def _deepscan_ports_by_ip(db: Session, org_id: str) -> dict[str, list[int]]:
    """{target_ip: [open ports]} from the latest available deep scan per IP —
    real nmap output, used to flag exposed risky services."""
    from app.models import DeepScan

    rows = db.scalars(
        select(DeepScan)
        .where(DeepScan.org_id == org_id, DeepScan.available.is_(True))
        .order_by(DeepScan.created_at.desc())
    ).all()
    out: dict[str, list[int]] = {}
    for r in rows:
        if r.target_ip in out:
            continue  # first row per IP is the newest (ordered desc)
        ports = (r.result_json or {}).get("ports") or []
        out[r.target_ip] = [int(p) for p in ports if isinstance(p, (int, float))]
    return out


# Live view = devices an agent is seeing RIGHT NOW. A row is shown only while
# it is online AND refreshed recently; the window is a safety net for a killed
# agent (sweeps run every ~8s, so 90s ≈ several missed sweeps).
_DEVICE_STALE_AFTER = timedelta(seconds=90)


def _normalize_host(h: str | None) -> str:
    if not h:
        return ""
    s = h.strip().lower()
    if s.endswith(".local"):
        s = s[:-6]
    return s.strip()


def _hosts_match(host_a: str | None, host_b: str | None) -> bool:
    if not host_a or not host_b:
        return False
    if host_a == host_b:
        return True
    na, nb = _normalize_host(host_a), _normalize_host(host_b)
    if not na or not nb:
        return False
    return na == nb or na in nb or nb in na


def list_devices(db: Session, org_id: str) -> list[NetworkDeviceOut]:
    rows = db.scalars(
        select(NetworkDevice)
        .where(NetworkDevice.org_id == org_id)
        .order_by(NetworkDevice.is_gateway.desc(), NetworkDevice.is_self.desc(), NetworkDevice.ip)
    ).all()
    scanned_ips, by_ip = _scan_status(db, org_id)
    cutoff = utcnow() - _DEVICE_STALE_AFTER

    recent_obs = db.scalars(
        select(LiveObservation).where(
            LiveObservation.org_id == org_id,
            LiveObservation.last_seen > (utcnow() - timedelta(minutes=5))
        )
    ).all()
    obs_by_host: dict[str, list[str]] = {}
    for obs in recent_obs:
        sh = obs.source_host or ""
        obs_by_host.setdefault(sh, []).append(obs.domain)

    out: list[NetworkDeviceOut] = []
    for r in rows:
        if not r.online:
            continue  # not connected right now — live view hides it
        last = r.last_seen
        if last is not None and last.tzinfo is None:
            last = last.replace(tzinfo=timezone.utc)  # SQLite rows come back naive
        if last is None or last < cutoff:
            continue
        # scanned = a real deep scan produced data for this device, OR the
        # autonomous scanner has run on it. Otherwise "not scanned" (never 0).
        scanned = r.ip in scanned_ips or r.last_scanned_at is not None
        vuln_count: int | None = None
        worst: str | None = None
        if scanned:
            vuln_count, worst = by_ip.get(r.ip, (0, None))  # 0 = real "no CVEs found"

        active_domains_set: set[str] = set()
        for k, doms in obs_by_host.items():
            if _hosts_match(k, r.ip) or _hosts_match(k, r.hostname) or (r.is_self and (k in ("manual", "localhost", "127.0.0.1", "") or _hosts_match(k, r.ip) or _hosts_match(k, r.hostname))):
                active_domains_set.update(doms)

        active_apps_set: set[str] = set()
        now_time = utcnow()
        for k, (apps, ts) in _ACTIVE_APPS_BY_HOST.items():
            if (now_time - ts).total_seconds() < 300:
                if _hosts_match(k, r.ip) or _hosts_match(k, r.hostname) or (r.is_self and (k in ("manual", "localhost", "127.0.0.1", "") or _hosts_match(k, r.ip) or _hosts_match(k, r.hostname))):
                    active_apps_set.update(apps)

        out.append(NetworkDeviceOut(
            id=r.id, ip=r.ip, mac=r.mac, hostname=r.hostname, vendor=r.vendor,
            subnet=r.subnet, subnet_inferred=bool(r.subnet_inferred),
            discovery=r.discovery or "arp", label=r.label,
            is_self=r.is_self, is_gateway=r.is_gateway, online=r.online,
            first_seen=r.first_seen, last_seen=r.last_seen,
            scanned=scanned, vuln_count=vuln_count, worst_severity=worst,
            last_scanned_at=r.last_scanned_at,
            active_domains=sorted(active_domains_set),
            active_apps=sorted(active_apps_set),
        ))
    return out


def clear_devices(db: Session, org_id: str) -> int:
    from sqlalchemy import delete

    rows = db.scalars(select(NetworkDevice).where(NetworkDevice.org_id == org_id)).all()
    n = len(rows)
    db.execute(delete(NetworkDevice).where(NetworkDevice.org_id == org_id))
    db.commit()
    return n


def clear(db: Session, org_id: str) -> int:
    """Wipe this org's live observations (reset the feed before a fresh demo)."""
    from sqlalchemy import delete

    rows = db.scalars(select(LiveObservation).where(LiveObservation.org_id == org_id)).all()
    n = len(rows)
    db.execute(delete(LiveObservation).where(LiveObservation.org_id == org_id))
    db.commit()
    return n


def block_fix(db: Session, org_id: str, obs_id: str, domain_hint: str | None = None) -> BlockFixOut:
    # 1. Search by observation UUID
    row = db.scalar(
        select(LiveObservation).where(
            LiveObservation.id == obs_id, LiveObservation.org_id == org_id
        )
    )
    # 2. Fallback: search by domain name if obs_id is a domain string or domain_hint given
    target_domain = domain_hint or obs_id
    if row is None:
        cleaned = _clean_domain(target_domain)
        if cleaned:
            row = db.scalar(
                select(LiveObservation).where(
                    LiveObservation.org_id == org_id, LiveObservation.domain == cleaned
                )
            )
    # 3. Fallback: generate observation on-the-fly if missing/cleared
    if row is None:
        cleaned = _clean_domain(target_domain)
        if cleaned and "." in cleaned:
            try:
                obs_res = observe(db, org_id, cleaned, source_host="manual")
                row = db.scalar(
                    select(LiveObservation).where(
                        LiveObservation.id == obs_res.id, LiveObservation.org_id == org_id
                    )
                )
            except Exception:
                pass

    if row is None:
        raise NotFoundError("Observation not found")

    reasons = _reasons_from(row.verdict_json or {})
    ctx = {
        "domain": row.domain,
        "band": row.band,
        "score": float(row.score),
        "signals": reasons,
    }
    fallback = _templated_block(row.domain, row.band, reasons)

    from app.services.ai import prompts
    from app.services.ai.client import generate

    system, user_json, schema = prompts.build_block_messages(ctx)
    data = generate(system, user_json, "block_domain", fallback, schema)

    if data.get("refused"):
        return BlockFixOut(refused=True, reason=data.get("reason") or "Not supported",
                           domain=row.domain, band=row.band)
    cmds = data.get("commands") or fallback["commands"]
    return BlockFixOut(
        domain=row.domain,
        band=row.band,
        summary=data.get("summary") or fallback["summary"],
        why_risky=data.get("why_risky") or reasons,
        commands=[BlockCommand(platform=c.get("platform", "hosts"), command=c.get("command", "")) for c in cmds],
    )


def _templated_block(domain: str, band: str, reasons: list[str]) -> dict:
    if band == "Trusted":
        summary = f"Advisory: {domain} is rated 'Trusted'. Blocking this domain may disrupt legitimate services. Apply egress block rules only if explicitly isolating host traffic."
        why_risky = reasons or ["Domain has verified infrastructure reputation and clean security signals.", "Blocking will prevent legitimate application traffic to this host."]
    else:
        summary = f"Isolate and block outbound network connections to {domain} (rated '{band}') to contain threat traffic."
        why_risky = reasons or [f"Reputation rating: {band}", "Observed suspicious network telemetry."]

    return {
        "refused": False,
        "summary": summary,
        "why_risky": why_risky,
        "commands": [
            {
                "platform": "hosts",
                "command": f"echo -e \"\\n0.0.0.0 {domain}\\n::1 {domain}\" | sudo tee -a /etc/hosts",
            },
            {
                "platform": "linux",
                "command": f"sudo ufw deny out to any proto tcp port 80,443 comment \"Block {domain}\" 2>/dev/null || true; echo -e \"0.0.0.0 {domain}\\n::1 {domain}\" | sudo tee -a /etc/hosts",
            },
            {
                "platform": "macos",
                "command": f"echo -e \"\\n0.0.0.0 {domain}\\n::1 {domain}\" | sudo tee -a /etc/hosts && sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder",
            },
            {
                "platform": "windows",
                "command": f"Add-Content -Path \"$env:windir\\System32\\drivers\\etc\\hosts\" -Value \"`n0.0.0.0 {domain}`n::1 {domain}\"; Clear-DnsClientCache; try {{ $ips = (Resolve-DnsName -Name \"{domain}\" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty IPAddress); if ($ips) {{ New-NetFirewallRule -DisplayName \"Drishti Block {domain}\" -Direction Outbound -Action Block -RemoteAddress $ips }} }} catch {{}}",
            },
            {
                "platform": "pihole",
                "command": f"sudo pihole --wild {domain} 2>/dev/null || sudo pihole -b {domain}",
            },
            {
                "platform": "router",
                "command": f"# MikroTik RouterOS / VyOS drop rule\n/ip firewall filter add chain=forward dst-address-list={domain} action=drop comment=\"Drishti Block {domain}\"",
            },
        ],
    }
