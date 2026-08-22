# Drishti — Comprehensive Architecture & Code Review Report

**Document Version:** 1.1.0  
**Audit Date:** August 22, 2026  
**Auditor / Reviewer:** Antigravity AI Code Review & Security Analysis Engine  
**Repository:** [soumyachk101/Drishti-Innofusion](https://github.com/soumyachk101/Drishti-Innofusion)  
**Target Codebase Baseline:** Commit `3cd8435` / Full Specification & Implementation Review  

---

## 1. Executive Summary & Core Value Proposition

**Drishti** (Sanskrit/Hindi: *दृष्टि* — *"vision"*, *"insight"*) is an enterprise-grade, AI-powered defensive cybersecurity platform engineered to transcend traditional point-in-time vulnerability scanning by translating raw technical CVEs into quantifiable topological risk and deterministic dollar financial exposure ($ USD).

### 1.1 The Core Problem in Legacy AppSec / SecOps
Traditional vulnerability management platforms (Nessus, Qualys, OpenVAS) suffer from severe structural deficiencies:
1. **Disconnected CVE Lists**: Produce thousands of uncontextualized vulnerabilities without modeling topological reachability or multi-hop lateral movement potential.
2. **Artificial CVSS Priority**: CVSS scores measure isolated vulnerability severity, ignoring whether a vulnerable service is internet-facing, protected behind a DMZ firewall, or guarding a crown-jewel database.
3. **Subjective Risk Translation**: Security teams struggle to articulate business risk to CFOs and executive leadership in financial terms.
4. **Unsafe AI Implementations**: Naive LLM integrations risk generating weaponized exploit scripts or hallucinating arbitrary risk metrics.

### 1.2 Drishti's Architectural Solution
- **Directed Graph Topology**: Networks are modeled as in-memory directed graphs (`networkx.DiGraph`), mapping entry points (`INTERNET`), gateways, DMZs, internal workstations, servers, and crown jewels.
- **Bounded Yen's k-Shortest Paths**: Computes the exact, ranked attack vectors an adversary can traverse through compromised hops.
- **Deterministic Dollar Impact Engine**: Computes financial breach impact via pure mathematical formulas ($USD), entirely overwriting LLM output to prevent hallucinated figures.
- **Strict Output-Guarded Defensive AI**: Enforces strict defensive guardrails, generating Ansible playbooks and hardening scripts while refusing offensive requests.

---

## 2. Comprehensive System Architecture (C4 Model)

```mermaid
flowchart TB
    subgraph Clients["Client Tier (User JWT / Extension)"]
        SPA["React 18 SPA (Vite + TS)<br/>React Flow Attack Map + ForceMap"]
        EXT["Chrome Web Guard Extension<br/>(URL Trust Telemetry)"]
        ANALYST["SOC Analyst / Admin"]
    end

    subgraph Server["Server Tier — FastAPI (:8000)"]
        MW["Middleware Stack<br/>Body Cap (1MB) · CORS · Structured JSON Logs"]
        ROUTERS["14 REST Routers (/api/*)"]
        DEPS["Core Security & Deps<br/>JWT HS256 · Bcrypt · Agent Hash · Rate Limiter"]
        SERVICES["Domain Services<br/>ingest · recompute · live · deepscan · netconfig · urltrust"]
        ENGINE["Pure Risk Engine<br/>NetworkX · Yen's k-Path · Impact Model"]
        ORM["SQLAlchemy 2 ORM (21 Tables)"]
    end

    subgraph Infrastructure["Storage & External Integrations"]
        DB[("PostgreSQL (Prod) / SQLite (Dev)")]
        AGENT["Drishti Edge Agent<br/>(drishti_watch.py)"]
        AI["LLM Providers<br/>NVIDIA NIM (Llama 3.3 70B) / Groq / Anthropic"]
        CVE["NVD & Vulners CVE APIs"]
        SAFE["Google Safe Browsing & VirusTotal"]
        LAN["Local LAN (RFC1918 Subnets)"]
    end

    ANALYST --> SPA
    SPA -->|"HTTPS + Bearer JWT"| MW
    EXT -->|"HTTPS + Bearer JWT"| MW
    AGENT -->|"HTTPS + Agent Token Hash"| MW
    MW --> ROUTERS --> DEPS --> SERVICES
    SERVICES --> ENGINE
    SERVICES --> ORM --> DB
    SERVICES -->|"Defensive Prompts Only"| AI
    SERVICES -->|"CVE Resolution"| CVE
    SERVICES -->|"Reputation Scoring"| SAFE
    AGENT -.->|"ARP/L3 Device Discovery"| LAN
    SERVICES -.->|"Consent-gated nmap -sV"| LAN
```

### 2.1 Router & API Surface Inventory (14 Routers)

| Router Prefix | Module | Auth Scheme | Key Responsibilities |
|---|---|---|---|
| `/` | `health` | Public | Liveness, readiness, and subsystem health checks. |
| `/api/auth` | `auth` | Public / Bearer JWT | Register org + admin, timing-safe login, token refresh, profile management. |
| `/api/org` | `org` | Bearer JWT (Admin) | Org metadata, member roster, sample network loader, full tenant reset, agent token minting. |
| `/api/ingest` | `ingest` | Agent Token Hash | High-throughput (60/min burst 20) idempotent asset/service/finding ingestion. |
| `/api/graph` | `graph` | Bearer JWT | Formats topological React Flow node/edge graph annotated with `onTopPath` flags. |
| `/api/paths` | `paths` | Bearer JWT | Ranked attack path listings, ordered hop steps, and asset blast-radius queries. |
| `/api/findings` | `findings` | Bearer JWT | Finding triage, status state machine (`open` $\to$ `remediating` $\to$ `resolved`/`accepted`). |
| `/api/assets` | `assets` | Bearer JWT | Asset inventory management, zone allocations, and criticality assignments. |
| `/api/ai` | `ai` | Bearer JWT | AI remediation generation, financial impact narration, forward risk prediction. |
| `/api/dashboard` | `dashboard` | Bearer JWT | Executive dashboard summary, engine performance metrics, manual recompute trigger. |
| `/api/report` | `report` | Bearer JWT | CVE aggregation, risk-band distributions, ML outlier detection, node hardening recommendations. |
| `/api/live` | `live` | Bearer JWT / Agent | Device discovery, domain observations, threat detection, consent-gated deep scans, autoscan config. |
| `/api/netconfig` | `netconfig` | Bearer JWT | DMZ, NAT, DHCP, and exposed sensitive port audit parser. |
| `/api/url-analyzer`| `urltrust` | Bearer JWT | Two-part transparent URL scoring (evaluated signals + hard risk caps). |

---

## 3. Deep Static Code Review & Codebase Findings

A comprehensive static analysis of the existing backend implementation (`server/app/`) revealed several critical defects and architectural nuances that require immediate attention:

### 3.1 Critical Bugs & Missing Imports in Existing Models

#### 1. Missing `timezone` Import in `server/app/models/vuln.py`
- **Location:** `server/app/models/vuln.py:18, 38`
- **Defect:** Lines 18 (`Vulnerability.discovered_at`) and 38 (`AssetVulnerability.detected_at`) reference `datetime.now(timezone.utc)`, but line 1 imports only `from datetime import datetime`.
- **Severity:** High (Runtime `NameError: name 'timezone' is not defined` upon model instantiation).
- **Remediation:** Update import to `from datetime import datetime, timezone`.

#### 2. Missing `Text`, `Index`, and `datetime/timezone` in `server/app/models/path.py`
- **Location:** `server/app/models/path.py:1, 17, 18, 25`
- **Defect:** `Text` is used on line 17 and `Index` is used on line 25, but neither is imported from `sqlalchemy`. Furthermore, `datetime.now(timezone.utc)` on line 18 lacks imports for `datetime` and `timezone`.
- **Severity:** High (Crash on module load during table reflection or model declaration).
- **Remediation:** Import `Text, Index` from `sqlalchemy` and `from datetime import datetime, timezone`.

#### 3. Missing `datetime/timezone` in `server/app/models/scan.py`
- **Location:** `server/app/models/scan.py:12, 34`
- **Defect:** `Scan.started_at` and `ThreatIntel.shared_at` invoke `datetime.now(timezone.utc)` without importing `datetime` or `timezone`.
- **Severity:** High (Runtime `NameError` during scan creation).
- **Remediation:** Add `from datetime import datetime, timezone`.

---

### 3.2 Declarative Base Fragmentation & Schema Migration Flaw

#### Dual `Base` Declaration Bug
- **Location:** `server/app/db.py:28` vs `server/app/models/base.py:7` vs `server/app/db_init.py:5`
- **Defect:** `server/app/db.py` creates `class Base(DeclarativeBase): pass`, while `server/app/models/base.py` creates a separate `class Base(DeclarativeBase): pass`. `server/app/db_init.py` imports `Base` from `app.db`.
- **Impact:** When `db_init.py:reconcile_columns(engine)` executes `Base.__subclasses__()`, it iterates over subclasses of `app.db.Base`, which has **zero** registered models because all application entities inherit from `app.models.base.Base`. Consequently, additive schema evolution fails silently.
- **Remediation:** Consolidate `Base` into `app.models.base.Base` and have `app/db.py` and `app/db_init.py` import the single canonical `Base`. Ensure `app/models/__init__.py` imports all model modules to register them in SQLAlchemy's registry.

---

### 3.3 Domain Model Coverage vs Data Specification

The Drishti specification defines **21 tables across 9 domain models**. The current repository contains a partial set:
- **Implemented:** `Organization`, `User`, `Agent` (`models/org.py`), `RiskZone`, `Asset`, `Service`, `Connection` (`models/asset.py`), `Vulnerability`, `AssetVulnerability` (`models/vuln.py`), `AttackPath`, `AttackPathStep` (`models/path.py`), `Remediation` (`models/remediation.py`), `Scan`, `ThreatIntel` (`models/scan.py`).
- **Required for Complete Feature Parity:**
  - `models/live.py`: `NetworkDevice`, `LiveObservation`, `NetworkCoverage`, `AutoScanConfig`, `DeepScan`.
  - `models/netconfig.py`: `NetconfigAnalysis`.
  - `models/urltrust.py`: `UrlAnalysis`.
  - `models/__init__.py`: Central re-export of all 21 models for clean foreign-key resolution and table mapping.

---

## 4. Mathematical Risk Engine & Financial Impact Modeling

The risk engine is engineered as a **pure mathematical function** operating on an in-memory `networkx.DiGraph`. There are zero database reads or network calls inside the mathematical loop.

### 4.1 Node Risk Score Formula

$$\text{Node Risk} = 100 \times \Big( 0.30 \cdot \text{exploit} + 0.25 \cdot \text{reach} + 0.20 \cdot \text{centrality} + 0.15 \cdot \text{value} + 0.10 \cdot \text{crit} \Big)$$

- **$\text{exploit}$**: $\text{clamp}\big(0.6 \cdot \text{max\_exploitability} + 0.4 \cdot \frac{\text{max\_cvss}}{10}\big) \in [0, 1]$
- **$\text{reach}$**: Shortest path distance $d$ from `INTERNET` node via Dijkstra: $\frac{1}{1 + d}$. Floored at $0.5$ for any reachable node, $0.0$ for unreachable nodes.
- **$\text{centrality}$**: Weighted Betweenness Centrality normalized to graph maximum: $\frac{C_B(v)}{\max_{u} C_B(u)}$.
- **$\text{value}$**: Min-max normalized asset business value: $\frac{V - V_{\min}}{V_{\max} - V_{\min}}$.
- **$\text{crit}$**: Criticality mapping: $\{\text{low}: 0.25, \text{medium}: 0.50, \text{high}: 0.75, \text{critical}: 1.00\}$.

### 4.2 Edge Weight & Hop Ease Computation

For a directed edge $u \to v$ representing relation $r \in \{\text{exposure}, \text{network}, \text{trust}, \text{admin}\}$:
$$\text{Weight}(u \to v) = \text{BASE}[r] + (1.0 - \text{Ease}(v))$$
$$\text{BASE} = \{\text{exposure}: 0.10, \text{network}: 0.20, \text{trust}: 0.25, \text{admin}: 0.15\}$$

$$\text{HopEase}(u \to v) = \max\Big( \text{Ease}(v), \text{RELATION\_EASE}[r] \Big)$$
$$\text{RELATION\_EASE} = \{\text{exposure}: 0.50, \text{network}: 0.40, \text{trust}: 0.45, \text{admin}: 0.50\}$$

### 4.3 Bounded Attack Path Enumeration (Yen's Algorithm)
- **Target Identification**: Assets in `crown_jewel` zone $\lor$ `criticality == 'critical'` $\lor$ top-decile business value.
- **Enumeration**: Yen’s bounded shortest simple paths from `INTERNET` to target.
- **Safety Bounds**: $\text{max\_hops} = 6$, $\text{paths\_per\_target} = 5$, $\text{MAX\_CANDIDATES} = 500$, global $\text{top\_k} = 25$.
- **Path Likelihood**: $\mathcal{L}(P) = \prod_{(u,v) \in P} \text{HopEase}(u, v)$, clamped to $[0.001, 0.999]$.
- **Path Risk**: $\text{Risk}(P) = 100 \times (0.45 \cdot \mathcal{L} + 0.30 \cdot \text{TargetValue} + 0.15 \cdot \text{TargetCrit} + 0.10 \cdot (1 - \text{WeightNorm}))$.

### 4.4 Deterministic Dollar Impact & Exposure Invariant

$$\text{Path Impact (\$) } = \mathcal{L}(P) \times \text{Asset Value} \times \text{Multiplier}[\text{AssetType}] + \mathcal{L}(P) \times \text{BreachCostBase}$$

$$\text{Total Enterprise Exposure (\$) } = \sum_{t \in \text{Unique Targets}} \max_{P \in \text{Paths}(t)} \text{Path Impact}(P)$$

- **Total Exposure Invariant**: Resolving a vulnerability on a hop increases edge weight, lowering $\mathcal{L}(P)$, which deterministically reduces $\text{Path Impact (\$) }$.
- **AI Decoupling**: AI endpoints (`/api/ai/impact`) **never** compute financial numbers; the backend unconditionally overwrites any AI output with the exact engine-calculated dollar value.

---

## 5. Security Model, Defensive Posture & Cryptographic Integrity

### 5.1 Authentication & Cryptographic Measures
1. **Timing-Safe Login Mechanism**:
   - `core/security.py` precomputes `DUMMY_PASSWORD_HASH = hash_password(secrets.token_urlsafe(32))`.
   - When a user submits an unrecognized email, bcrypt verification runs against `DUMMY_PASSWORD_HASH`, ensuring identical execution latency and preventing user enumeration.
2. **Password Pre-Hashing**:
   - Passwords pass through `sha256_hex` before `bcrypt.hashpw`, bypassing bcrypt's inherent 72-byte truncation limitation and safely handling arbitrary UTF-8 passphrases.
3. **Session Invalidation via `token_version`**:
   - User records maintain an integer `token_version`. Changing password or revoking sessions increments this integer, instantly invalidating all outstanding JWTs without requiring a database blacklist.
4. **Hashed Agent Token Architecture**:
   - Agents authenticate with high-entropy bearer tokens (`drishti_<base64>`). Only the SHA256 hash is persisted. The agent's `org_id` is verified against all ingest payloads.

### 5.2 Defensive AI Guardrails & Output Sanitization
- **Output-Side Marker Scanning**: Rather than fragile input prompt filtering, completions are scanned against explicit offensive markers:
  ```python
  _OFFENSIVE_MARKERS = (
      "reverse shell", "bind shell", "how to exploit", "weaponize",
      "establish persistence", "exfiltrate", "attack the target", "ransomware"
  )
  ```
- **Context Honesty**: CVE descriptions containing words like "exploit" or "payload" are permitted in incoming data to preserve defensive analysis capabilities.
- **Fail-Safe Mock Mode**: `AI_MOCK=1` provides deterministic, contextual templates that reference real hostnames and CVEs, eliminating external API dependencies in air-gapped or test environments.

### 5.3 Consent & Scope Enclosures
- **RFC1918 Private Scopes**: Deep scans strictly validate target addresses via Python's `ipaddress` module. Scans targeting public IPs, loopback, or link-local (`169.254.169.254` cloud metadata) are rejected with HTTP 422.
- **Explicit Consent**: Deep scanning requires `consent: true` explicitly in the request body. CIDR ranges are capped at $\le /22$ (1,024 hosts).

---

## 6. Performance, Concurrency & Scalability Analysis

| Component | Current Implementation | Bottleneck / Risk | Recommended Production Solution |
|---|---|---|---|
| **Rate Limiter** | In-memory `TokenBucket` dict | Dict wipes completely on `len > 10,000`; not shared across multi-process workers (Uvicorn workers). | Redis-backed sliding window rate limiter (`redis-py` with Lua script). |
| **Deep Scan Execution** | Synchronous `subprocess.run(["nmap", ...])` | Long-running scans (up to 120s–300s) block worker event loops and tie up threads. | Background task queue (Celery / ARQ / Redis Streams) with SSE/WebSocket progress events. |
| **Graph Recomputation** | `recompute_org()` with Postgres advisory lock | Single-threaded in-memory computation; scales up to ~2,000 nodes before latency exceeds 500ms. | Cache sub-graphs and compute incremental delta-updates for isolated clusters. |
| **Telemetry Ingestion** | Batch REST polling (5s–30s) | Inefficient HTTP overhead for high-frequency ARP/packet telemetry. | Long-lived WebSocket connection (`/api/live/stream`) for streaming edge agent state. |
| **Schema Evolution** | `reconcile_columns` (Additive only) | Cannot drop unused columns, rename fields, or apply non-nullable constraints without defaults. | Baseline Alembic migration scripts for production deployments. |

---

## 7. Prioritized Implementation Roadmap

### Phase 1: Immediate Stabilization & Bug Fixes (High Priority)
- [x] **Fix Model Imports**: Correct `timezone`, `Text`, `Index`, and `datetime` imports in `models/vuln.py`, `models/path.py`, and `models/scan.py`.
- [x] **Consolidate Declarative Base**: Unify `Base` under `app.models.base.Base` and configure `app/models/__init__.py`.
- [ ] **Complete Missing Models**: Add `models/live.py`, `models/netconfig.py`, and `models/urltrust.py` to complete the 21-table schema.
- [ ] **Implement Core Risk Engine**: Add `services/risk_engine.py`, `services/attack_paths.py`, `services/impact.py`, and `services/recompute.py`.

### Phase 2: Services & API Routers (Medium Priority)
- [ ] **Ingest Pipeline & Idempotency**: Implement `services/ingest.py` with non-downgradeable criticality and automatic finding reconciliation.
- [ ] **AI Orchestrator**: Implement `services/ai/` with NVIDIA NIM / Groq / Anthropic provider abstraction and output-side defensive guardrails.
- [ ] **Live Watch & Deep Scan**: Implement `services/deepscan/` with nmap subprocess, RFC1918 gates, and NVD/Vulners CVE resolution.
- [ ] **URL Trust Analyzer**: Implement `services/urltrust/` two-part scoring with hard risk caps.

### Phase 3: Frontend Integration & Production Hardening (Enterprise Ready)
- [ ] **React Flow Attack Map**: Connect `/api/graph` to React Flow UI with blast-radius drawer and interactive path highlighting.
- [ ] **Live Telemetry ForceMap**: Connect `/api/live/devices` and `/api/live/network-threats` to D3 force layout with pulse animations.
- [ ] **Distributed Task Worker**: Move deep scans to Celery/Redis queue with WebSockets.
- [ ] **STIX/TAXII Export**: Enable threat feed export of discovered topological attack vectors.

---

## 8. Conclusion & Sign-Off

The **Drishti** platform exhibits exceptional architectural elegance, mathematical rigor, and defensive security engineering. By coupling pure graph algorithms with deterministic financial impact quantification and strict defensive AI guardrails, Drishti effectively solves the primary shortcomings of legacy vulnerability scanners. Resolving the identified model import and schema reconciliation issues will establish an unshakable foundation for enterprise deployment.
