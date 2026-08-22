# Drishti — API Reference

*Reverse-engineered from the implemented FastAPI backend. All 14 routers, every endpoint, request/response
schemas, authentication, rate limits, and error envelope — organized by route group.*

*Last updated: 2026-08-21 — Verified against source code at commit 1e68eb1.*

---

## 1. Error envelope

All errors (except auth middleware) return:

```json
{
 "error": {
 "type": "string",
 "title": "Human-readable summary",
 "status": 400,
 "detail": "Detailed message",
 "instance": "Optional context"
 }
}
```

**Status codes**: `standard_http` (400, 401, 403, 404, 422, 409, 413, 429, 500).

---

## 2. Authentication

| Header | Value | Used by |
|--------|-------|---------|
| `Authorization: Bearer <access_token>` | JWT (HS256) | User endpoints |
| `Authorization: Bearer drishti_<base64>` | Hashed agent token | Agent ingest |

Refresh: `POST /api/auth/refresh` with `{refresh_token}`.

---

## 3. Route catalog

### 3.1 Health

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/` | None | Liveness probe |
| GET | `/health` | None | Detailed health |

### 3.2 Auth (`/api/auth`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/register` | None | Create org + admin user |
| POST | `/login` | None | Issue access + refresh tokens |
| POST | `/auth/refresh` | None | Rotate access token |
| GET | `/auth/me` | User | Current user profile |
| PATCH | `/auth/me` | User | Update user profile |

**Request schemas:**
```yaml
RegisterRequest:
 name: string
 email: string
 password: string # min 8 chars
 org_name: string

LoginRequest:
 email: string
 password: string

RefreshRequest:
 refresh_token: string
```

**Response:**
```yaml
TokenResponse:
 access_token: string
 refresh_token: string
 token_type: "bearer"
```

### 3.3 Organization (`/api`)

| Method | Path | Auth | Role | Purpose |
|--------|------|------|------|---------|
| GET | `/org` | User | — | Org info |
| GET | `/org/members` | User | admin | List org members |
| POST | `/org/load-sample` | User | admin | Load Acme sample network |
| POST | `/org/reset` | User | admin | Drop all org data |
| POST | `/org/agent-token` | User | admin | Issue new agent token |

### 3.4 Ingest (`/api`)

| Method | Path | Auth | Rate Limit | Purpose |
|--------|------|------|------------|---------|
| POST | `/ingest` | Agent | 60/min (burst 20) | Idempotent host/service/vuln upsert + recompute |

**Request:**
```yaml
IngestRequest:
 org_slug: string
 hostname: string
 ip: string
 asset_type: string # webapp, server, database, firewall, device, unknown
 services: IngestService[]
 vulnerabilities: IngestVulnerability[]
 connectivity: IngestConnection[]
 scan_metadata: IngestScanMetadata

IngestService:
 port: integer
 protocol: string # tcp, udp
 name: string
 version: string
 is_open: boolean

IngestVulnerability:
 id: string # e.g., CVE-2024-1234
 title: string
 severity: string
 cvss: float
 description: string

IngestConnection:
 from: string # IP
 to: string # IP
 relation: string # network, admin, trust, exposure
 via_service?: string
 via_cve?: string
```

**Response:**
```yaml
IngestResponse:
 asset_id: string
 services_upserted: integer
 vulnerabilities_upserted: integer
 connections_upserted: integer
 findings_created: integer
 findings_resolved: integer
 recompute_triggered: boolean
```

### 3.5 Graph (`/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/graph` | User | Attack map data (React Flow) |
| GET | `/stats` | User | Engine stats (recompute count, ms, AI counts) |

**Response (`/graph`):**
```yaml
GraphResponse:
 nodes: Node[]
 edges: Edge[]
 zones: ZoneInfo[]
 live_devices: NetworkDevice[]
 network_threats: NetworkThreat[]

Node:
 id: string
 type: "asset" | "gateway" | "device" | "threat"
 position: { x: float, y: float }
 data:
 label: string
 ip: string
 hostname: string
 zone: string
 risk_score: float
 asset_type: string
 criticality: string
 is_crown_jewel: boolean
 services: Service[]
 blast_radius_count: integer
 downstream_value_usd: float
 threat?: { kind, severity, mitre, recommendation }
 demo_label?: string

Edge:
 id: string
 source: string
 target: string
 label: string # port/cve/via_service
 risk_score: float
 onTopPath: boolean
 path_id?: string
 style:
 stroke: string
 strokeWidth: number
 animated: boolean
 data:
 relation: string
 port?: number
 cve?: string
 via_service?: string
```

### 3.6 Paths (`/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/paths` | User | List ranked attack paths |
| GET | `/paths/{path_id}` | User | Path detail (hop-by-hop) |

> **Note:** Blast radius is not a separate endpoint. It is computed client-side from graph data or via the `/graph` endpoint. The `BlastRadiusOut` schema is used internally by the read service.

**Response (`/paths`):**
```yaml
PathSummary:
 path_id: string
 entry: { ip, hostname }
 target: { ip, hostname, zone, risk_score }
 hops: integer
 risk_score: float # 0-100
 likelihood: float # 0-1
 impact_usd: float # engine-computed
 narrative: string # AI-generated or template
 top_hop_labels: string[]
 top_cves: string[]
```

### 3.7 Findings (`/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/findings` | User | List findings |
| PATCH | `/findings/{id}` | User | Update status |

**Query params:** `?status=open|remediating|resolved|accepted&severity=critical|high|medium|low`

**Request (`PATCH`):**
```yaml
FindingUpdate:
 status: string # open, remediating, resolved, accepted
 accepted_until?: datetime
```

**Response:**
```yaml
FindingOut:
 id: string
 asset_id: string
 asset_ip: string
 asset_hostname: string
 cve_id: string
 title: string
 severity: string
 cvss: float
 port: integer
 service_name: string
 status: string
 auto_resolved: boolean
 accepted_until: string
```

### 3.8 Assets (`/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/assets` | User | List assets |
| GET | `/assets/{id}` | User | Asset detail |
| PATCH | `/assets/{id}` | User | Update asset |

**Response (`AssetSummary`):**
```yaml
AssetSummary:
 id: string
 ip: string
 hostname: string
 zone: string
 asset_type: string
 criticality: string
 internet_facing: boolean
 risk_score: float
 is_crown_jewel: boolean
 blast_radius_count: integer
 downstream_value_usd: float
 last_scanned_at: string
```

**Response (`AssetDetail`):**
```yaml
AssetDetail:
 id: string
 ip: string
 hostname: string
 os: string
 zone: string
 asset_type: string
 criticality: string
 internet_facing: boolean
 base_value_usd: float
 risk_score: float
 is_crown_jewel: boolean
 blast_radius_count: integer
 downstream_value_usd: float
 services: ServiceOut[]
 findings: FindingOut[]
 hardening: NodeHardening[]
```

### 3.9 Dashboard (`/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/dashboard` | User | Dashboard data |
| GET | `/stats` | User | Engine + AI stats |
| POST | `/recompute` | User | Trigger manual recompute |

**Response (`/dashboard`):**
```yaml
Dashboard:
 total_exposure_usd: float
 open_findings: integer
 critical_assets: integer
 top_path: PathSummary
 paths: PathSummary[]
 zone_summary: ZoneSummary[]
 severity_counts: { critical: int, high: int, medium: int, low: int }
 last_recompute_at: string
 recompute_ms: float

ZoneSummary:
 zone: string
 count: integer
 exposure_usd: float
 avg_risk: float
 critical_count: integer
```

### 3.10 Report (`/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/report/cves` | User | All CVEs for org |
| GET | `/report/distribution` | User | Severity distribution chart |
| GET | `/report/hardening` | User | Per-node hardening projections |
| GET | `/report/ml` | User | ML analysis summary |
| POST | `/report/summary` | User | AI network summary |

### 3.11 AI (`/api/ai`)

| Method | Path | Auth | Role | Rate Limit | Purpose |
|--------|------|------|------|------------|---------|
| POST | `/ai/remediate` | User | admin, analyst | 20/min (burst 6) | Generate remediation |
| POST | `/ai/impact` | User | — | 20/min (burst 6) | AI impact narrative |
| POST | `/ai/predict` | User | — | 20/min (burst 6) | Forward-looking prediction |
| POST | `/ai/url-summary` | User | — | 20/min (burst 6) | URL trust analysis summary |

**Request schemas:**
```yaml
RemediateRequest:
 finding_id: str
 preferred_kind: "ansible" | "shell" | "cloud_cli" # default: "ansible"
 regenerate?: bool # default: false, force new LLM call

ImpactRequest:
 path_id: str

PredictRequest:
 asset_id: str
```

**Response (`/remediate`):**
```yaml
RemediationOut:
 id: str | None
 refused: bool # true when AI refused the request
 reason: str | None # refusal explanation
 kind: str # ansible, shell, cloud_cli, manual
 title: str
 summary: str
 script: str
 steps: list[str] # plain strings, not objects
 estimated_risk_reduction: float | None
 requires_restart: bool
 disclaimer: str
 reviewed: bool
 model: str | None
 context: dict | None # "what the AI saw" inspector field
```

**Response (`/impact`):**
```yaml
ImpactOut:
 refused: bool
 reason: str | None
 impact_usd: float
 headline: str
 narrative: str
 drivers: list[str]
 highest_leverage_action: str
```

**Response (`/predict`):**
```yaml
PredictOut:
 refused: bool
 reason: str | None
 from_asset: str
 predictions: list[PredictionItem]

PredictionItem:
 asset: str
 likelihood: float
 reason: str
 defensive_action: str
```

> **Note:** `POST /ai/network-summary` and `POST /ai/block` are not implemented in the current codebase. Network summaries are served by `GET /report/network-summary`, and domain blocking is handled by `POST /live/block/{obs_id}`.

### 3.12 Live (`/api`)

| Method | Path | Auth | Rate Limit | Purpose |
|--------|------|------|------------|---------|
| POST | `/live/observe` | Agent | — | Observe a domain |
| POST | `/live/sync_active` | Agent | — | Sync active tabs/apps |
| POST | `/live/check` | User | 20/min (burst 6) | Manual domain check |
| GET | `/live/threats` | User | — | Observed domain threats |
| DELETE | `/live/threats` | User | — | Clear all threats |
| POST | `/live/devices` | Agent | — | Ingest device list |
| GET | `/live/devices` | User | — | Live network devices |
| DELETE | `/live/devices` | User | — | Clear all devices |
| POST | `/live/coverage` | Agent | — | WiFi network coverage reporting |
| GET | `/live/coverage` | User | — | Network coverage list |
| GET | `/live/network-threats` | User | — | Detected network threats |
| POST | `/live/demo-attack` | User | — | Inject demo attack |
| DELETE | `/live/demo-attack` | User | — | Clear demo attack |
| POST | `/live/block/{obs_id}` | User | 20/min (burst 6) | Block a risky domain |
| POST | `/live/deep-scan` | User | 20/min (burst 6) | Consent-gated deep scan |
| POST | `/live/deep-scan-range` | User | 20/min (burst 6) | Full subnet scan |
| GET | `/live/deep-scan/{asset_id}` | User | — | Last deep-scan result |
| GET | `/live/autoscan` | User | — | Autoscan config |
| PUT | `/live/autoscan` | User | — | Update autoscan config |

**Request (`/live/deep-scan`):**
```yaml
DeepScanRequest:
 ip: string
 consent: bool # must be exactly true
```

**Request (`/live/deep-scan-range`):**
```yaml
DeepScanRangeRequest:
 cidr: string # e.g. "192.168.1.0/24"
 consent: bool # must be exactly true
```

### 3.13 Netconfig (`/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/netconfig/analyze` | User | Run DMZ/NAT/DHCP detectors |
| GET | `/netconfig/last` | User | Last analysis result |

**Request:**
```yaml
NetconfigAnalyzeRequest:
 scan_dmz: boolean
 scan_nat: boolean
 scan_dhcp: boolean
```

**Response:**
```yaml
NetconfigResult:
 dmz: { status: string, source: string, evidence: string }
 nat: { status: string, source: string, evidence: string }
 dhcp: { status: string, source: string, evidence: string }
```

### 3.14 URL Trust (`/api/url-analyzer`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/url-analyzer/analyze` | User/Agent | Analyze a URL |
| GET | `/url-analyzer/history` | User | Past analyses |

**Request:**
```yaml
URLAnalysisRequest:
 url: string
```

**Response:**
```yaml
URLAnalysisResult:
 url: string
 hostname: string
 score: integer # 0-100
 band: "trusted" | "caution" | "high_risk"
 signals: object # provider responses (never from cache)
 website: object # static site data
 providers: object # provider config
 summary: object # aggregated (includes AI summary when configured)
```

### 3.15 Assets (`/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/assets` | User | List assets |
| GET | `/assets/{id}` | User | Asset detail |
| PATCH | `/assets/{id}` | User | Update asset |

### 3.16 Remediation (frontend-triggered, server-routed)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/remediation/{finding_id}` | User | Generate remediation |
| PATCH | `/remediation/{id}` | User | Update (reviewed) |
| POST | `/remediation/{id}/regenerate` | User | Force new LLM call |

---

## 4. Rate limits (detail)

Rate limiting uses an in-memory token bucket per key (see `app/core/deps.py`). There are two buckets:

| Bucket | Rate | Burst | Key format |
|--------|------|-------|------------|
| Ingest | 60/min | 20 | `agent:<agent_id>` |
| AI | 20/min | 6 | `user:<user_id>` |

> **Note:** Auth endpoints (`/register`, `/login`, `/refresh`) do **not** have rate limiting in the current implementation. Body-size enforcement (1 MB) is handled by `MaxBodySizeMiddleware` at the ASGI level, not by the token bucket.

---

## 5. CORS

| Source | Pattern |
|--------|---------|
| `http://localhost:5173` | Dev web server (default from `CORS_ORIGINS` env) |
| `chrome-extension://*` | Chrome extension — matched by regex `chrome-extension://.*` |

> **Note:** The default `CORS_ORIGINS` env value is `http://localhost:5173` only. Additional origins are comma-separated in the env var. `allow_origin_regex` handles the Chrome extension pattern.

Allow credentials: yes. Allow methods: `*`. Allow headers: `*`.

---

## 6. Middleware stack (order)

Middleware is added in this order in `main.py`. Starlette wraps most-recently-added middleware first, so the **request execution order** (outermost to innermost) is:

1. **MaxBodySizeMiddleware** — ASGI streaming body cap (1 MB). Registered last so it becomes the outermost ASGI layer, catching oversized bodies before anything else sees them.
2. **CORSMiddleware** — Allowlist + `chrome-extension://.*` regex. Added via `app.add_middleware`.
3. **structured_log** — Adds request-id and logs method/path/status/latency. Added via `@app.middleware("http")`.

> **Note:** Rate limiting and authentication are **not** ASGI middleware. They are FastAPI dependency injections (`Depends`) applied per-route or per-router via the `dependencies=` parameter.

---

## 7. Endpoint groups with group-level auth

| Group | Auth | Role |
|-------|------|------|
| `ingest` | Agent token | `org_id` match |
| `auth` | None (self-auth) | — |
| `admin` (`/org/*`) | User JWT | `admin` role |
| `ai` | User JWT | `admin`, `analyst` (on `/remediate`); any user (on `/impact`, `/predict`, `/url-summary`) |
| `live` | User JWT or Agent token | `org_id` match |
| `netconfig` | User JWT | — |
| `url-analyzer` | User JWT or Agent token | `org_id` match |
| `graph`, `paths`, `findings`, `assets`, `dashboard`, `report` | User JWT | — |
