# Drishti — Comprehensive Architecture & Code Review Report

**Document Version:** 1.0.0  
**Date:** August 2026  
**Auditor / Reviewer:** Antigravity AI Code Review & Architecture Analysis  
**Repository:** [soumyachk101/Drishti-Innofusion](https://github.com/soumyachk101/Drishti-Innofusion)  
**Target Codebase Baseline:** Commit `1e68eb1` / Drishti Specification Documentation  

---

## 1. Executive Summary

**Drishti** (Hindi for *"vision"* or *"sight"*) is an enterprise-grade, AI-powered defensive cybersecurity platform designed to bridge the gap between traditional point-in-time vulnerability scanning and business-centric threat exposure modeling.

Unlike legacy CVE scanners that report disconnected lists of vulnerabilities, Drishti:
1. **Models entire networks as directed graphs** using NetworkX to compute topological attack surfaces.
2. **Enumerates chained multi-hop attack paths** using Yen’s bounded shortest-path algorithm.
3. **Quantifies real dollar financial exposure** ($ USD) deterministically per attack path.
4. **Leverages LLMs exclusively for defensive remediation playbooks** under strict safety guardrails.

This review provides a comprehensive technical evaluation across Drishti's architecture, data model, security posture, API contracts, frontend systems, edge agent design, and scalability limits.

---

## 2. Architectural & Engineering Highlights

### 2.1 Pure Function Risk Engine Pattern
- **Decoupled Computation**: The core risk engine (`risk_engine.py`, `attack_paths.py`, `impact.py`) operates as pure mathematical functions over an in-memory `networkx.DiGraph`. There are zero database writes or HTTP calls inside the algorithm layer.
- **Explainability**: All scoring factors are centralized in a single `RiskConfig` configuration dataclass:
  $$\text{Node Risk} = 100 \times (0.30 \cdot \text{exploit} + 0.25 \cdot \text{reach} + 0.20 \cdot \text{centrality} + 0.15 \cdot \text{value} + 0.10 \cdot \text{crit})$$
- **Deterministic Dollar Impact**:
  $$\text{Path Impact (\$) } = \text{Likelihood} \times \text{Asset Value} \times \text{Multiplier} + \text{Likelihood} \times \text{Breach Base}$$
  *Key Strength:* The AI **never** calculates or alters financial impact figures; the backend overwrites LLM narrative output with engine-computed dollar figures.

### 2.2 Concurrency & Recomputation Safety
- On PostgreSQL backends, `recompute_org()` utilizes transactional advisory locks (`pg_advisory_xact_lock(crc32(org_id))`) to eliminate race conditions during concurrent agent ingestion or finding updates.
- Incremental recomputation is triggered asynchronously upon finding status changes, asset modifications, or scan ingestions.

---

## 3. Data Model & Database Architecture Evaluation

### 3.1 Entity Model (21 Tables)
The system is partitioned into clean domain boundaries across 9 model modules:
- **Tenancy & Auth**: `organizations`, `users`, `agents`
- **Topology & Assets**: `risk_zones`, `assets`, `services`, `connections`
- **Vulnerabilities & Fixes**: `vulnerabilities`, `asset_vulnerabilities`, `remediations`
- **Live Watch & Scanning**: `network_devices`, `live_observations`, `network_coverage`, `autoscan_configs`, `deep_scans`, `scans`, `threat_intel`
- **Audit & Intelligence**: `netconfig_analyses`, `url_analyses`, `attack_paths`, `attack_path_steps`

### 3.2 Schema Strengths
1. **Portable String UUIDs**: All primary keys are 36-character UUID strings, ensuring 100% interoperability between PostgreSQL (production) and SQLite (development/testing).
2. **Idempotent Ingestion Pipeline**: Ingestion guarantees idempotency via unique constraints `(org_id, ip)` for assets and `(asset_id, vulnerability_id)` for findings. Operator-assigned criticalities are protected from automated downgrades.
3. **Additive Schema Reconciliation**: `reconcile_columns` safely introduces new nullable/defaulted columns on boot without requiring full database drops.

---

## 4. Security Model & Defensive Posture Analysis

### 4.1 AI Defensive Guardrails & Output Sanitization
- **Strict Output-Side Marker Scanning**: Rather than fragile input prompt filtering, Drishti checks LLM completions against explicit offensive markers (`reverse shell`, `bind shell`, `weaponize`, `exfiltrate`, `ransomware`). A hit triggers an automatic defensive refusal.
- **Provider-Agnostic Engine**: Supports NVIDIA NIM (default Llama 3.3 70B), Groq, and Anthropic with deterministic template fallback when API keys are absent (`AI_MOCK=1`).

### 4.2 Authentication & Cryptographic Defenses
- **Timing-Safe Login**: Unknown email queries trigger a dummy bcrypt comparison against `DUMMY_PASSWORD_HASH`, mitigating timing attacks for user enumeration.
- **Token Invalidation**: `token_version` tracking in the JWT payload forces instantaneous revocation across all active sessions upon password reset.
- **Hashed Agent Tokens**: Edge agents authenticate with SHA256-hashed tokens (`drishti_<base64>`); plaintext tokens are never stored.
- **Scope & Consent Gates**: Deep scanning requires explicit `consent: true` and is strictly confined to private RFC1918 CIDRs ($\le /22$). Public IP scans are rejected with HTTP 422.

---

## 5. API & Service Layer Evaluation

| Router | Path Prefix | Evaluation & Findings |
|---|---|---|
| `auth` | `/api/auth` | HS256 JWT, refresh rotation, timing-safe authentication. |
| `ingest` | `/api/ingest` | Agent-token auth, burst rate limiting (60/min), atomic upserts. |
| `graph` | `/api/graph` | Formats React Flow nodes and edges annotated with `onTopPath` risk flags. |
| `paths` | `/api/paths` | Bounded Yen k-shortest paths (max 6 hops, top 25 paths globally). |
| `live` | `/api/live` | ARP/L3 telemetry, MITRE ATT&CK threat tagging (T1557, T1200, T1210, T1071). |
| `urltrust` | `/api/url-analyzer` | Two-part scoring (weighted evaluated signals + hard risk caps). |
| `deepscan` | `/api/live/deep-scan` | nmap `-sV` integration, NVD/Vulners CVE resolution. |
| `netconfig` | `/api/netconfig` | Audit parser for DMZ, NAT, DHCP, and cleartext protocols. |

---

## 6. Frontend & User Experience Design

- **SOC-Blue Design System**: Optimized for security analysts with dark/light themes, high-contrast risk badges, and interactive visualizations.
- **React Flow & D3 Force Integration**:
  - `AttackMap`: Static layered topological attack paths with blast-radius overlays.
  - `ForceMap`: Dynamic live network telemetry with count-keyed auto-fitting to prevent drift.
- **Resilience**: Nested React Error Boundaries isolate React Flow rendering errors from crashing the surrounding application navigation.

---

## 7. Identified Limitations & Production Gaps

| Area | Current State | Risk / Limitation | Recommended Fix |
|---|---|---|---|
| **Rate Limiting & Stats** | In-memory dictionaries (`_LAST_STATS`, `TokenBucket`) | Lost on process restart; does not scale across multi-worker deployments (e.g. Gunicorn/Uvicorn workers). | Integrate Redis-backed sliding window rate limiter and cache store. |
| **Deep Scan Execution** | Synchronous subprocess inside request handler | Long nmap scans (up to 120s–300s) can tie up worker threads. | Transition long scans to Celery / ARQ background task queues with WebSockets/SSE polling. |
| **Schema Evolution** | `reconcile_columns` (Additive only) | Cannot handle column renames, drops, or type alterations. | Introduce Alembic migration scripts for production deployments. |
| **Real-Time Streaming** | 5s–30s polling intervals | Inefficient for high-frequency live network packet streams. | Implement Server-Sent Events (SSE) or WebSockets on `/api/live/stream`. |

---

## 8. Prioritized Roadmap & Recommendations

### Phase 1: High Priority (Production Hardening)
- [ ] **Background Task Queue**: Move nmap deep scans and CVE batch lookups to Celery/Redis queue with webhook/socket status callbacks.
- [ ] **Distributed Cache**: Replace in-memory token buckets with Redis-based distributed rate limiting.
- [ ] **Alembic Formalization**: Generate baseline migration scripts while retaining `reconcile_columns` for standalone dev setups.

### Phase 2: Medium Priority (Enhancements)
- [ ] **WebSocket Telemetry**: Stream edge agent ARP detections and domain visits directly to `ForceMap` in real-time.
- [ ] **STIX/TAXII Threat Feed Export**: Implement export capabilities for discovered attack paths into standard threat intelligence feeds.

---

## 9. Conclusion

The **Drishti** architecture demonstrates high engineering maturity, clean domain separation, robust cryptographic practices, and an innovative mathematical approach to attack surface quantification. With the recommended background worker and caching enhancements, Drishti is well-positioned for enterprise-scale deployment.
