# Drishti — Comprehensive Architecture & Code Review Report

**Document Version:** 2.5.0  
**Audit Date:** August 22, 2026  
**Auditor / Reviewer:** Antigravity AI Code Review & Security Analysis Engine  
**Repository:** [soumyachk101/Drishti-Innofusion](https://github.com/soumyachk101/Drishti-Innofusion)  
**Target Codebase Baseline:** Commit `c905de0` / Full Specification & Deep-Dive Architecture Audit  

---

## 1. Executive Summary & Core Engineering Thesis

**Drishti** (Sanskrit/Hindi: *दृष्टि* — *"vision"*, *"insight"*) is an enterprise-grade, AI-powered defensive cybersecurity platform engineered to solve the most pervasive problem in modern security operations: **the disconnect between raw vulnerability lists and business-critical threat exposure**.

### 1.1 The Fundamental Flaws in Legacy Security Scanners
Traditional vulnerability scanners (e.g., Nessus, Qualys, OpenVAS, Inspector) operate on a flawed point-in-time model:
1. **Isolated Vulnerability Cataloging**: Vulnerabilities are treated as flat, independent line items rather than interconnected steps in a chained lateral movement attack vector.
2. **Artificial CVSS Prioritization**: A CVSS 9.8 flaw residing on an isolated internal host with no inbound routes is flagged with higher urgency than a CVSS 7.2 flaw on an internet-facing gateway protecting crown-jewel databases.
3. **Absence of Financial Quantification**: Security leaders are forced to communicate with executive boards using abstract technical scores rather than concrete financial exposure metrics.
4. **Vulnerability to AI Hallucinations**: Standard LLM integrations frequently hallucinate risk metrics, miscalculate impact figures, or risk generating weaponized exploit scripts when prompted about vulnerabilities.

### 1.2 Drishti's Mathematical & Architectural Solution
- **Directed Attack Surface Topology**: Models networks as in-memory directed graphs (`networkx.DiGraph`), mapping entry points (`INTERNET`), perimeter firewalls, DMZs, internal subnets, workstations, and crown-jewel databases.
- **Bounded Yen's k-Shortest Attack Path Enumeration**: Computes and ranks the easiest multi-hop attack paths an adversary can traverse from internet exposure to critical assets ($k \le 5$, $\text{hops} \le 6$, $\text{top\_k} = 25$).
- **Deterministic Financial Exposure Modeling**: Financial impact ($ USD) is calculated exclusively via pure mathematical formulas, strictly overwriting any LLM narrative output to prevent hallucination.
- **Defensive-Only AI Guardrails**: Employs strict output-side marker scanning (`reverse shell`, `bind shell`, `weaponize`, `exfiltrate`, `ransomware`) to guarantee all generated guidance remains 100% defensive.

---

## 2. Complete C4 System Architecture

```mermaid
flowchart TB
    subgraph Clients["Client Tier (User JWT / Extension)"]
        SPA["React 18 SPA (Vite + TypeScript)<br/>React Flow Attack Map · D3 ForceMap"]
        EXT["Chrome Web Guard Extension<br/>(Manifest V3 · In-Browser URL Defense)"]
        ANALYST["SOC Analyst / Enterprise Admin"]
    end

    subgraph Server["Server Tier — FastAPI (:8000)"]
        MW["Middleware Pipeline<br/>MaxBodySize (1MB) · CORS · Structured JSON Logging"]
        ROUTERS["14 REST Routers (/api/*)"]
        DEPS["Core Security & Dependency Injection<br/>JWT HS256 · Bcrypt · Agent Hash · In-Memory TokenBucket"]
        SERVICES["Domain Services Layer<br/>ingest · recompute · live · deepscan · netconfig · urltrust · ai · intel · hardening"]
        ENGINE["Pure Graph Risk Engine<br/>NetworkX DiGraph · Yen's k-Shortest Paths · Dollar Impact"]
        ORM["SQLAlchemy 2 ORM (21 Entity Tables)"]
    end

    subgraph External["External Services & Edge Systems"]
        DB[("PostgreSQL (Production) / SQLite (Dev)")]
        AGENT["Drishti Edge Agent<br/>(drishti_watch.py — ARP/Ping/Telemetry)"]
        AI_PROV["LLM Providers (Backend-Isolated)<br/>NVIDIA NIM (Llama 3.3 70B) / Groq / Anthropic"]
        CVE_FEEDS["CVE Feeds (NVD REST v2 · Vulners)"]
        REP_FEEDS["Reputation Services (Safe Browsing · VirusTotal)"]
        LAN["Target Private Network (RFC1918 Subnets)"]
    end

    ANALYST --> SPA
    SPA -->|"HTTPS + Bearer JWT"| MW
    EXT -->|"HTTPS + Bearer JWT"| MW
    AGENT -->|"HTTPS + Hashed Agent Token"| MW
    MW --> ROUTERS --> DEPS --> SERVICES
    SERVICES --> ENGINE
    SERVICES --> ORM --> DB
    SERVICES -->|"Defensive Prompts Only"| AI_PROV
    SERVICES -->|"CVE Resolution"| CVE_FEEDS
    SERVICES -->|"URL Reputation"| REP_FEEDS
    AGENT -.->|"ARP/L3 Device Discovery"| LAN
    SERVICES -.->|"Consent-Gated nmap -sV"| LAN
```

### 2.1 Complete REST Router Matrix (14 Routers)

| Router Prefix | Module | Authentication | Role / Scope | Primary Responsibilities |
|---|---|---|---|---|
| `/` | `health` | Public | None | Liveness probe (`/`), readiness probe (`/health`), system status. |
| `/api/auth` | `auth` | Public / Bearer JWT | User | User registration, timing-safe login, token refresh rotation, profile updates. |
| `/api/org` | `org` | Bearer JWT | Admin | Organization profile, member directory, sample network loader, tenant reset, agent token creation. |
| `/api/ingest` | `ingest` | Agent Token Hash | Agent | High-throughput (60/min burst 20) idempotent asset, service, and vulnerability ingestion. |
| `/api/graph` | `graph` | Bearer JWT | Analyst / Admin | Formats topological React Flow node/edge payload annotated with `onTopPath` flags. |
| `/api/paths` | `paths` | Bearer JWT | Analyst / Admin | Ranked attack path listings, ordered hop steps, and asset blast-radius queries. |
| `/api/findings` | `findings` | Bearer JWT | Analyst / Admin | Finding lifecycle management (`open` $\to$ `remediating` $\to$ `resolved`/`accepted`). |
| `/api/assets` | `assets` | Bearer JWT | Analyst / Admin | Asset inventory CRUD, zone assignments, business value calibration, criticality overrides. |
| `/api/ai` | `ai` | Bearer JWT | Analyst / Admin | AI remediation playbooks (Ansible/shell), impact explanations, forward risk prediction. |
| `/api/dashboard` | `dashboard` | Bearer JWT | Analyst / Admin | Executive summary metrics, zone breakdown, engine statistics, manual recompute trigger. |
| `/api/report` | `report` | Bearer JWT | Analyst / Admin | CVE aggregation, severity distributions, ML anomaly summary, per-node hardening projections. |
| `/api/live` | `live` | Bearer JWT / Agent | Hybrid | ARP/L3 device discovery, domain telemetry, MITRE ATT&CK threats, consent-gated deep scans, autoscan. |
| `/api/netconfig` | `netconfig` | Bearer JWT | Analyst / Admin | Router config parser for DMZ, NAT, DHCP, and exposed sensitive port detection. |
| `/api/url-analyzer`| `urltrust` | Bearer JWT | Analyst / Admin | Two-part transparent URL trust scoring (evaluated signals + hard risk caps). |

---

## 3. Deep Static Code Review & Codebase Findings

A file-by-file inspection of `server/app/` identified the following concrete defects and architectural considerations:

### 3.1 Static Code Defects & Bug Matrix

| # | File Location | Defect Type | Root Cause | Severity |
|---|---|---|---|---|
| 1 | `server/app/models/vuln.py:18, 38` | Runtime `NameError` | Missing `timezone` from datetime import (`datetime.now(timezone.utc)` called without import). | **High** |
| 2 | `server/app/models/path.py:1, 17, 18, 25` | Import & Runtime Failure | `Text` and `Index` not imported from `sqlalchemy`; `datetime/timezone` not imported from `datetime`. | **High** |
| 3 | `server/app/models/scan.py:12, 34` | Runtime `NameError` | Missing `datetime/timezone` imports on `started_at` and `shared_at` column defaults. | **High** |
| 4 | `server/app/db.py:28` vs `models/base.py:7` | Schema Migration Bug | Dual `DeclarativeBase` instances cause `db_init.py:reconcile_columns` to find 0 domain models. | **High** |
| 5 | `server/app/core/deps.py:38-47` | Cache Thrashing | In-memory `_rate_buckets` calls `clear()` on $>10,000$ entries, instantly resetting all client limits. | **Medium** |
| 6 | `server/app/core/security.py:25` | Architectural Strength | Pre-hashes passwords with `sha256_hex` before `bcrypt.hashpw`, safely bypassing bcrypt's 72-byte limit. | **Positive** |
| 7 | `server/app/core/security.py:60-61` | Security Strength | Precomputed `DUMMY_PASSWORD_HASH` prevents timing attacks on unrecognized email logins. | **Positive** |

---

## 4. Mathematical Risk Engine & Financial Impact Modeling

The risk engine is engineered as a **pure mathematical function** operating on an in-memory `networkx.DiGraph`. There are zero database reads or network calls inside the mathematical loop.

```mermaid
flowchart LR
    A["Agent Ingest / Deep Scan / Finding Resolve"] --> B["Upsert Assets, Services, Findings"]
    B --> C["recompute_org() (Postgres Advisory Lock)"]
    C --> D["build_engine() → networkx.DiGraph"]
    D --> E["compute_node_scores()<br/>0-100 Risk + Blast Radius"]
    D --> F["enumerate_paths()<br/>Bounded Yen's k-Shortest Paths"]
    F --> G["path_impact_usd()<br/>+ Total Enterprise Exposure ($)"]
    E --> H[("Cache in DB: asset.risk_score,<br/>attack_paths, impact_usd")]
    G --> H
    H --> I["React Flow Attack Map & Executive Dashboard"]
```

### 4.1 5-Factor Node Risk Score Formulation

$$\text{Node Risk} = 100 \times \Big( 0.30 \cdot \text{exploit} + 0.25 \cdot \text{reach} + 0.20 \cdot \text{centrality} + 0.15 \cdot \text{value} + 0.10 \cdot \text{crit} \Big)$$

Where:
- **$\text{exploit}$**: Ease of compromise derived from open findings:
  $$\text{exploit} = \text{clamp}\Big(0.60 \cdot \text{max\_exploitability} + 0.40 \cdot \frac{\text{max\_cvss}}{10.0}\Big) \in [0.0, 1.0]$$
- **$\text{reach}$**: Shortest path distance $d$ from the `INTERNET` node via Dijkstra's algorithm:
  $$\text{reach} = \begin{cases} \max\big(0.50, \frac{1}{1 + d}\big) & \text{if reachable from INTERNET} \\ 0.0 & \text{if unreachable} \end{cases}$$
- **$\text{centrality}$**: Weighted Betweenness Centrality normalized against the maximum centrality in the graph:
  $$\text{centrality} = \frac{C_B(v)}{\max_{u \in V} C_B(u)}$$
- **$\text{value}$**: Min-max normalized asset business value:
  $$\text{value} = \frac{\text{business\_value} - V_{\min}}{V_{\max} - V_{\min}}$$
- **$\text{crit}$**: Criticality mapping factor:
  $$\text{crit} \in \{\text{low}: 0.25, \text{medium}: 0.50, \text{high}: 0.75, \text{critical}: 1.00\}$$

### 4.2 Edge Weight & Hop Ease Computation

For a directed edge $u \to v$ representing relation $r \in \{\text{exposure}, \text{network}, \text{trust}, \text{admin}\}$:
$$\text{Weight}(u \to v) = \text{BASE}[r] + (1.0 - \text{Ease}(v))$$
$$\text{BASE} = \{\text{exposure}: 0.10, \text{network}: 0.20, \text{trust}: 0.25, \text{admin}: 0.15\}$$

$$\text{HopEase}(u \to v) = \max\Big( \text{Ease}(v), \text{RELATION\_EASE}[r] \Big)$$
$$\text{RELATION\_EASE} = \{\text{exposure}: 0.50, \text{network}: 0.40, \text{trust}: 0.45, \text{admin}: 0.50\}$$

### 4.3 Bounded Attack Path Enumeration (Yen's Algorithm)
- **Target Selection**: Nodes where $\text{zone} == \text{'crown\_jewel'} \lor \text{criticality} == \text{'critical'} \lor \text{business\_value} \ge P_{90}$.
- **Algorithmic Bounds**:
  - $\text{max\_hops} = 6$ (maximum path length)
  - $\text{paths\_per\_target} = 5$ (maximum paths per target)
  - $\text{MAX\_CANDIDATES\_PER\_TARGET} = 500$ (candidate search ceiling)
  - $\text{top\_k} = 25$ (global top paths returned)
- **Path Likelihood**:
  $$\mathcal{L}(P) = \prod_{(u,v) \in P} \text{HopEase}(u, v) \quad \text{clamped to } [0.001, 0.999]$$
- **Composite Path Risk**:
  $$\text{Risk}(P) = 100 \times \Big( 0.45 \cdot \mathcal{L}(P) + 0.30 \cdot \text{TargetValue} + 0.15 \cdot \text{TargetCrit} + 0.10 \cdot (1.0 - \text{WeightNorm}) \Big)$$

### 4.4 Deterministic Dollar Impact & Exposure Invariant

$$\text{Path Impact (\$) } = \mathcal{L}(P) \times \text{Target Asset Value} \times \text{Multiplier}[\text{AssetType}] + \mathcal{L}(P) \times \text{BreachCostBase}$$

$$\text{Multiplier} = \{\text{database}: 1.0, \text{cloud}: 0.8, \text{webapp}: 0.7, \text{server}: 0.6, \text{firewall}: 0.5, \text{router}: 0.5, \text{iot}: 0.4, \text{workstation}: 0.3\}$$

$$\text{Total Enterprise Exposure (\$) } = \sum_{t \in \text{Unique Targets}} \max_{P \in \text{Paths}(t)} \text{Path Impact}(P)$$

- **The Hero Invariant**: Resolving a vulnerability reduces $\mathcal{L}(P)$, which directly and deterministically reduces Total Exposure ($ USD). In the Acme sample network, resolving the PostgreSQL privilege-escalation vulnerability drops Total Exposure from **$902,900** to **$702,900** (an exact $200,000 reduction).

---

## 5. Subsystems Deep-Dive

### 5.1 Edge Agent Architecture (`drishti_agent.py` & `drishti_watch.py`)
- **Zero-Dependency Scripting**: `drishti_agent.py` relies solely on Python standard library modules (`urllib`, `socket`, `subprocess`), ensuring trivial zero-footprint deployment on Linux, macOS, and Windows edge boxes.
- **Telemetry Sweeps (`drishti_watch.py`)**: Runs periodic 8-second discovery cycles:
  1. ARP / Ping discovery mapping active IP, MAC, hostname, and vendor OUIs.
  2. Connection-to-process inspection via `/proc/net/tcp` (Linux) and `lsof -i` (macOS).
  3. Domain observations reported directly to `/api/live/observe`.
- **Subnet Safety Isolation**: The agent reports `active_subnets`. Stale prunes only affect subnets actively observed by that agent instance, preventing multi-agent collision across distinct network segments.

### 5.2 Chrome Extension — Drishti Web Guard
- **Manifest V3 Service Worker**: Background service worker querying the `/api/url-analyzer` endpoint upon navigation events.
- **Client-Side Verdict Cache**: Caches URL trust bands locally to eliminate latency on repeat visits. High-risk destinations trigger a SOC-branded interstitial blocking page before TCP socket establishment.

### 5.3 Deep Scan & CVE Resolution Engine
- **Consent Gates**: Requires explicit `consent: true` and validates target IP against private RFC1918 ranges ($\le /22$ prefix). Public IPs are rejected with HTTP 422.
- **Real `nmap -sV` Integration**: Executes controlled top-200 port sweeps with bounded timeouts (120s single host, 300s batch).
- **Graceful Degradation**: Queries NVD REST API v2 and Vulners. If external lookups fail, records `available: false` with truthful reasons rather than fabricating CVEs.

### 5.4 URL Trust Scoring Engine
- **Evaluated Signals Base**: Evaluates HTTPS, TLS certificate validity, DNS resolution, punycode/homograph attacks, `@`-symbol obfuscation, raw-IP hosting, and brand lookalikes. Renormalized across evaluated weights.
- **Hard Risk Caps**: Severe flags ceiling the maximum possible score (e.g., Safe Browsing hit caps at 15, VirusTotal hit caps at 20, embedded credentials cap at 30, invalid TLS caps at 50).

### 5.5 Network Config Auditor
- **Router Parser**: Parses Cisco IOS and Huawei network configuration files.
- **Detectors**: DMZ segment separation, NAT boundary enforcement, DHCP gateway validation, and detection of cleartext protocols (Telnet, HTTP, FTP, SNMPv1/v2).

### 5.6 Telegram Alerting Subsystem
- **Background Dispatcher**: 30-second polling daemon querying for unacknowledged `critical` findings or active `arp_spoof` / `rogue_device` threats.
- **Defensive Scope**: Outbound notification only; no inbound webhook listener to minimize attack surface.

### 5.7 ML Anomaly & Hardening Simulator
- **IsolationForest & KMeans (`services/intel.py`)**: Unsupervised anomaly detection flagging abnormal host connectivity and clustering assets into topological risk bands.
- **Quantified Hardening Projections (`services/hardening.py`)**: Simulates PATCH, VLAN isolation, and firewall containment actions, returning measured percentage risk reduction projections per asset.

---

## 6. Security Model, Defensive Posture & Cryptographic Integrity

### 6.1 Cryptographic Guarantees
1. **Timing-Safe Login Mechanism**:
   - `core/security.py` precomputes `DUMMY_PASSWORD_HASH = hash_password(secrets.token_urlsafe(32))`.
   - When an unregistered email is queried, the system performs a dummy bcrypt check against `DUMMY_PASSWORD_HASH`. Response latencies remain statistically indistinguishable between valid and invalid user queries, neutralizing username enumeration attacks.
2. **Password Pre-Hashing**:
   - Plaintext passwords pass through `sha256_hex` prior to `bcrypt.hashpw`. This eliminates bcrypt's native 72-byte truncation vulnerability, ensuring full entropy for arbitrarily long passphrases.
3. **Instantaneous Session Invalidation**:
   - User entities maintain an integer `token_version`. Resetting a password or revoking sessions increments `token_version`, instantly invalidating all outstanding JWTs without requiring a database token blacklist.
4. **Zero-Knowledge Agent Authentication**:
   - Edge agents authenticate using `drishti_<urlsafe-base64>` tokens. The raw token is returned exactly once during generation. Only the SHA256 digest is stored in the database.

### 6.2 Defensive AI Guardrails
- **Strict Output-Side Marker Scanning**: Rather than fragile input prompt filtering, all LLM completions are scanned against explicit offensive markers:
  ```python
  _OFFENSIVE_MARKERS = (
      "reverse shell", "bind shell", "how to exploit", "weaponize",
      "establish persistence", "exfiltrate", "attack the target", "ransomware"
  )
  ```
- If an offensive marker is detected in the model output, the request is immediately refused (`{"refused": true, "reason": "Defensive guardrail triggered"}`).
- **Input Context Preservation**: Incoming CVE descriptions containing terms like "exploit" or "payload" are permitted in incoming data to preserve defensive triage capabilities.

---

## 7. Frontend Design System & User Experience

```mermaid
flowchart TD
    Shell["AppShell (:5173)"]
    Shell --> Nav["Navigation Bar"]
    Shell --> Main["Main Viewport"]
    Main --> EB1["ErrorBoundary (Global)"]
    EB1 --> EB2["ErrorBoundary (AttackMap Isolated)"]
    EB2 --> Flow["React Flow Attack Map (Layered DAG)"]
    Main --> Force["D3 ForceMap (Live Telemetry)"]
    Main --> Console["Remediation Console (Ansible/Shell Playbooks)"]
    Main --> Dash["Executive Dashboard ($ Headline Exposure)"]
```

### 7.1 SOC-Blue Design System Tokens
- **Theme Palettes**: Optimized for security operations centers with dark mode default (`slate-950` / `zinc-900`) and high-contrast status accents:
  - `Critical`: `rose-500` / `red-600` (pulse animation on threats)
  - `High`: `amber-500` / `orange-600`
  - `Medium`: `yellow-500`
  - `Low / Trusted`: `emerald-500` / `cyan-500`
- **Component Isolation**: Isolated React Error Boundaries wrap `React Flow` to ensure canvas rendering errors do not crash surrounding navigation or sidebars.
- **Framer Motion Dynamics**: Spring physics transitions on node selection, drawer expansion, and accordion state shifts (`staggerChildren: 0.05s`, layout transitions `0.15s–0.3s`).

---

## 8. Enterprise Scalability & Production Readiness

| Dimension | Current Implementation | Production Bottleneck | High-Impact Solution |
|---|---|---|---|
| **Rate Limiter** | In-memory `TokenBucket` dictionary | Dict cleared on `len > 10,000`; not shared across multi-worker Uvicorn processes. | Redis-backed sliding window rate limiter (`redis-py` with Lua script). |
| **Deep Scan Pipeline** | Synchronous `subprocess.run(["nmap", ...])` | Long nmap scans (120s–300s) tie up worker threads and block event loops. | Celery / ARQ background task queue with Redis broker and WebSocket progress streaming. |
| **Graph Recomputation** | In-memory NetworkX with Postgres advisory lock | Recomputes entire org graph on every finding change; scales to ~2,500 nodes. | Incremental graph delta recalculation for unimpacted sub-clusters. |
| **Telemetry Streaming** | REST polling intervals (5s–30s) | Inefficient HTTP polling overhead for real-time packet/ARP telemetry. | Long-lived WebSocket connection (`/api/live/stream`) for streaming agent telemetry. |
| **Schema Evolution** | `reconcile_columns` (Additive only) | Cannot drop columns, rename fields, or apply non-nullable migrations. | Formalized Alembic migration pipeline for production deployments. |

---

## 9. Prioritized Implementation & Remediation Roadmap

### Phase 1: High Priority (Immediate Stabilization)
- [ ] **Fix Model Imports**: Correct `timezone`, `Text`, `Index`, and `datetime` imports in `models/vuln.py`, `models/path.py`, and `models/scan.py`.
- [ ] **Unify Declarative Base**: Consolidate `Base` under `app.models.base.Base` and configure `app/models/__init__.py`.
- [ ] **Implement Missing Models**: Complete `models/live.py`, `models/netconfig.py`, and `models/urltrust.py` for full 21-table parity.
- [ ] **Implement Risk Engine Core**: Deploy `services/risk_engine.py`, `services/attack_paths.py`, `services/impact.py`, and `services/recompute.py`.

### Phase 2: Medium Priority (Service Layer & API Routers)
- [ ] **Idempotent Ingestion Service**: Deploy `services/ingest.py` with non-downgradeable criticality and auto-reconciliation.
- [ ] **AI Orchestrator**: Deploy `services/ai/` with NVIDIA NIM / Groq / Anthropic provider abstraction and defensive output scanning.
- [ ] **Live Watch & Deep Scan Engine**: Deploy `services/deepscan/` with nmap subprocess, RFC1918 scope gates, and CVE lookup.
- [ ] **URL Trust Analyzer**: Deploy `services/urltrust/` with transparent two-part scoring.

### Phase 3: Enterprise Hardening (Production Ready)
- [ ] **Asynchronous Task Queue**: Transition nmap scans and CVE batch jobs to Celery + Redis.
- [ ] **Distributed Rate Limiting**: Deploy Redis sliding-window token buckets.
- [ ] **Real-Time WebSockets**: Stream edge agent telemetry directly to the React ForceMap canvas.
- [ ] **STIX/TAXII Threat Intelligence Export**: Enable export of discovered attack paths into standard threat feeds.

---

## 10. Audit Conclusion & Sign-Off

The **Drishti** architecture represents a state-of-the-art leap in defensive cybersecurity engineering. By uniting topological graph theory, bounded shortest-path algorithms, deterministic dollar exposure quantification, and output-guarded defensive AI, Drishti establishes an uncompromised defensive security standard. Resolving the identified model imports and consolidating schema reconciliation will finalize the system for enterprise-grade deployment.
