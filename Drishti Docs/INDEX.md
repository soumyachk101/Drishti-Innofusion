# Drishti — Reverse Engineering Index

*Last updated: 2026-08-21 — Verified against source code at commit 1e68eb1*

| Document | Scope | Lines |
|----------|-------|-------|
| [PRD.md](./PRD.md) | Product vision, capabilities, user journeys, NFRs, constraints, AI integration patterns, success metrics | ~450 |
| [TRD.md](./TRD.md) | Technical requirements, formulas, stack, services, AI provider integration, performance targets | ~300 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | C4 views (context, container, component), data flow, deployment, key decisions, directory map, config reference | ~400 |
| [APP_FLOW.md](./APP_FLOW.md) | End-to-end sequence diagrams for all user journeys: onboarding, network setup, alert pipeline, AI agent, admin flows | ~350 |
| [DATA_MODEL.md](./DATA_MODEL.md) | All 21 SQLAlchemy tables, columns, relationships, constraints, idempotency rules | ~500 |
| [API_REFERENCE.md](./API_REFERENCE.md) | All 14 routers, endpoints, request/response schemas, auth, rate limits, error envelope | ~500 |
| [SECURITY_MODEL.md](./SECURITY_MODEL.md) | Threat model, auth/authz, data isolation, consent gates, AI safety, defensive posture, security gaps | ~400 |
| [UIUX.md](./UIUX.md) | Screen catalog, visual language, motion, error boundaries, form patterns, component inventory | ~400 |

---

## Frontend routing map (revision 2026-08-21)

| Path | Component | Page |
|------|-----------|------|
| `/` | `Landing` | Public marketing page |
| `/login` | `LoginPage` | User login form |
| `/signup` | `SignupPage` | User registration form |
| `/app` | `AppHome` | Onboarding / post-login hub |
| `/app/graph` | `AttackMap` | Attack map (React Flow) |
| `/app/live` | `LiveWatchPage` | Live network watch + ForceMap |
| `/app/paths` | `PathsPage` | Attack paths listing |
| `/app/paths/:id` | `PathDetailPage` | Single attack path detail |
| `/app/findings` | `FindingsPage` | Vulnerability findings list |
| `/app/assets` | `AssetsPage` | Asset inventory |
| `/app/assets/:id` | `AssetDetailPage` | Single asset detail |
| `/app/url-analyzer` | `UrlAnalyzerPage` | URL trust analysis |
| `/app/report` | `ReportPage` | Executive security report |
| `/app/remediate/:findingId` | `RemediationConsole` | AI remediation console |
| `/app/settings` | `SettingsPage` | User / org settings |

---

## Backend routing map (revision 2026-08-21)

| Prefix | Module | Key endpoints |
|--------|--------|---------------|
| `/` | `health` | `GET /`, `GET /health`, `GET /health/ready` |
| `/api/auth` | `auth` | `POST /register`, `POST /login`, `POST /refresh`, `GET /me`, `PATCH /me` |
| `/api/org` | `org` | `GET /me`, `GET /members`, `POST /load-sample`, `POST /reset`, `POST /agent-token` |
| `/api/ingest` | `ingest` | `POST /` (agent finding submission, rate-limited) |
| `/api/assets` | `assets` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id` |
| `/api/findings` | `findings` | `GET /`, `PATCH /:id` (resolve/dismiss) |
| `/api/graph` | `graph` | `GET /` (nodes + edges) |
| `/api/paths` | `paths` | `GET /`, `GET /:id/steps`, `GET /assets/:id/blast-radius` |
| `/api/ai` | `ai` | `POST /remediate`, `POST /impact`, `POST /predict` |
| `/api/dashboard` | `dashboard` | `GET /summary`, `GET /stats`, `POST /recompute` |
| `/api/report` | `report` | `GET /cves`, `GET /distribution`, `GET /ml`, `GET /hardening`, `POST /summary` |
| `/api/live` | `live` | `POST /observe`, `POST /sync_active`, `POST /check`, `GET /threats`, `DELETE /threats`, `POST /devices`, `GET /devices`, `POST /coverage`, `GET /coverage`, `GET /network-threats`, `POST /demo-attack`, `DELETE /demo-attack`, `POST /block/:id`, `POST /deep-scan`, `POST /deep-scan-range`, `GET /deep-scan/:id`, `GET /autoscan`, `PUT /autoscan` |
| `/api/netconfig` | `netconfig` | `POST /analyze`, `GET /last` |
| `/api/url-analyzer` | `urltrust` | `POST /analyze`, `GET /history`, `POST /block` |

---

## Service layer map (revision 2026-08-21)

| Service file(s) | Responsibility |
|-----------------|----------------|
| `risk_engine.py` | Pure graph scoring, blast radius, edge weights |
| `attack_paths.py` | Pure Yen k-shortest path enumeration |
| `impact.py` | Pure $ impact model |
| `recompute.py` | Orchestration: build → score → paths → impact → cache |
| `engine_loader.py` | DB → engine NodeData/EdgeData |
| `read_service.py` | Build graph payload for React Flow (includes live devices + threats) |
| `ingest.py` | Idempotent asset/service/finding upsert + recompute trigger |
| `accounts.py` | Register, profile, org management, sample loading |
| `dashboard_service.py` | Dashboard + stats aggregation |
| `intel.py` | CVE aggregation, risk-band distribution, ML (IsolationForest + KMeans), AI network summary |
| `ai/client.py` | LLM provider abstraction (NVIDIA NIM, Groq, Anthropic) |
| `ai/prompts.py` | , defensive guardrail, offensive-marker scan |
| `ai/service.py` | Remediate/impact/predict endpoints + caching |
| `live.py` | Device/domain observe, WiFi-aware tracking, coverage |
| `live_threats.py` | Threat detection engine + demo inject/clear |
| `autoscan.py` | Per-org scheduled deep-scan |
| `hardening.py` | Per-node quantified hardening recommendations |
| `deepscan/scanner.py` | nmap command builder + orchestrator |
| `deepscan/parser.py` | nmap XML → structured Host/Port/Service |
| `deepscan/cve_lookup.py` | NVD + Vulners CVE API client |
| `deepscan/integration.py` | apply_scan → upsert assets + trigger recompute |
| `deepscan/service.py` | Deep scan request handling + consent/scope gates |
| `netconfig/facts.py` | Network topology facts from live/declared config |
| `netconfig/detectors.py` | DMZ/NAT/DHCP detectors |
| `netconfig/integration.py` | Apply analysis findings to engine |
| `netconfig/service.py` | Netconfig request handling |
| `urltrust/analyzer.py` | URL trust analysis orchestrator |
| `urltrust/checks.py` | Individual check implementations (HTTPS, TLS, DNS, punycode, …) |
| `urltrust/scoring.py` | Two-part scoring algorithm |
| `urltrust/summary.py` | Network-wide URL summary |
| `urltrust/providers.py` | Google Safe Browsing + VirusTotal clients |
| `urltrust/network.py` | Network-wide correlation + blocks |
| `telegram_alerts.py` | Background Telegram notification dispatcher |

---

## Frontend feature modules (revision 2026-08-21)

| Feature folder | Key components |
|---------------|----------------|
| `landing/` | `Landing.tsx` |
| `auth/` | `LoginPage.tsx`, `SignupPage.tsx`, `AuthLayout.tsx` |
| `onboarding/` | `AppHome.tsx`, `Onboarding.tsx` |
| `dashboard/` | `Dashboard.tsx` |
| `graph/` | `AttackMap.tsx`, `GraphNode.tsx`, `BlastLegend.tsx` |
| `live/` | `LiveWatchPage.tsx`, `ForceMap.tsx` |
| `paths/` | `PathsPage.tsx`, `PathDetailPage.tsx`, `PathDetailPanel.tsx`, `BreachSimulation.tsx` |
| `findings/` | `FindingsPage.tsx` |
| `assets/` | `AssetsPage.tsx`, `AssetDetailPage.tsx`, `AssetDetailPanel.tsx` |
| `urltrust/` | `UrlAnalyzerPage.tsx` |
| `netconfig/` | `NetworkConfigSection.tsx` |
| `remediation/` | `RemediationConsole.tsx` |
| `report/` | `ReportPage.tsx` |
| `settings/` | `SettingsPage.tsx` |

---

## Configuration matrix (revision 2026-08-21)

| Env var | Default | Purpose |
|---------|---------|---------|
| `APP_ENV` | `""` | `local`/`dev`/`test` allows default JWT secret |
| `DATABASE_URL` | `sqlite:///./drishti.db` | Database connection |
| `JWT_SECRET` | `change-me` | HS256 signing key (fail-closed in production) |
| `JWT_ACCESS_MINUTES` | `15` | Access token TTL |
| `JWT_REFRESH_DAYS` | `7` | Refresh token TTL |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowlist |
| `AI_PROVIDER` | `nvidia` | `groq`, `nvidia`, or `anthropic` |
| `AI_MODEL` | `""` (provider default) | Override model name |
| `AI_MOCK` | `False` | Use canned fixtures instead of real LLM |
| `AI_MAX_TOKENS` | `2500` | LLM response limit |
| `AI_TIMEOUT_SECONDS` | `45.0` | LLM call timeout |
| `GROQ_API_KEY` | `""` | Groq API key |
| `NVIDIA_API_KEY` | `""` | NVIDIA NIM API key |
| `NVIDIA_BASE_URL` | `https://integrate.api.nvidia.com/v1` | NVIDIA NIM base URL |
| `ANTHROPIC_API_KEY` | `""` | Anthropic API key |
| `NVD_API_KEY` | `""` | NVD CVE lookup key (optional) |
| `VULNERS_KEY` | `""` | Vulners CVE lookup key |
| `DEEPSCAN_TIMEOUT_SECONDS` | `120.0` | nmap -sV timeout |
| `DEEPSCAN_CVE_TIMEOUT_SECONDS` | `12` | Per-CVE-lookup timeout |
| `DEEPSCAN_MAX_HOSTS` | `32` | Hosts per nmap batch |
| `DEEPSCAN_MAX_TOTAL_HOSTS` | `256` | Hard ceiling across batches |
| `DEEPSCAN_DISCOVERY_TIMEOUT_SECONDS` | `60` | Host discovery sweep timeout |
| `DEEPSCAN_RANGE_TIMEOUT_SECONDS` | `300` | Range-batch scan timeout |
| `URLTRUST_TIMEOUT_SECONDS` | `10.0` | URL trust analysis timeout |
| `BREACH_COST_BASE` | `500000.0` | Dollar model base cost per breach |
| `INGEST_MAX_BYTES` | `1048576` (1 MB) | Body size cap |
| `AUTO_SEED` | `True` | Seed org identity on fresh DB |
| `DEMO_SEED` | `False` | Seed Acme sample network on boot |
| `TELEGRAM_BOT_TOKEN` | `""` | Telegram bot token (optional) |
| `TELEGRAM_CHAT_ID` | `""` | Telegram chat ID (optional) |

---

## Document change log

| Date | Document | Change |
|------|----------|--------|
| 2026-08-21 | All | Complete verification against source code at commit 1e68eb1 |
| 2026-08-21 | INDEX | Added frontend routing map, backend routing map, service layer map, frontend feature modules, configuration matrix, change log |
| 2026-08-21 | TRD | Added auto-scan config, deep-scan-range, network-threats, network-coverage, url-analysis scoring details |
| 2026-08-21 | API_REFERENCE | Added new endpoints (live deep-scan, autoscan, coverage, network-threats, report ML/hardening/summary, org endpoints) |
| 2026-08-21 | DATA_MODEL | Verified 21 tables, added AutoScanConfig, DeepScan, NetconfigAnalysis, NetworkCoverage |
| 2026-08-21 | UIUX | Added netconfig feature, updated route list, updated component inventory |
| 2026-08-21 | SECURITY_MODEL | Added Telegram alerts security scope, updated rate limits |
| 2026-08-21 | ARCHITECTURE | Added AutoScanConfig to DB tables, updated service list |
| 2026-08-21 | APP_FLOW | Added deep-scan-range, autoscan, network-coverage flows |
| 2026-08-21 | PRD | Updated with new services (netconfig, autoscan, telegram, urltrust network summary) |

---

## How to use this folder

1. Start with **INDEX.md** for the navigation map and quick facts.
2. Read **TRD.md** for the technical formulas, coefficients, and implementation details.
3. Read **PRD.md** for the product requirements and feature descriptions.
4. Read **ARCHITECTURE.md** for the C4 model, data flow, and deployment topology.
5. Read **DATA_MODEL.md** for all 21 tables, columns, relationships, and constraints.
6. Read **API_REFERENCE.md** for every REST endpoint, request/response schema.
7. Read **UIUX.md** for every screen, component, motion pattern, and interaction.
8. Read **SECURITY_MODEL.md** for every guard, constraint, and check in code.
9. Read **APP_FLOW.md** for end-to-end sequence diagrams of all user journeys.

All `.md` files are self-contained with embedded Mermaid diagrams. PDF versions are auto-generated from these Markdown sources.

**Read order**: INDEX → TRD → PRD → ARCHITECTURE → DATA_MODEL → API_REFERENCE → SECURITY_MODEL → UIUX → APP_FLOW.

**How to use this repo**: `cd server && make up` (web on :5173, API on :8000, SQLite). `make help` for all targets. AI provider defaults to NVIDIA NIM (`nvidia`); also supports `groq` and `anthropic`. Set `AI_PROVIDER` and the matching API key in `.env`.

**Agent token**: Deploy `agent/drishti_watch.py` with a token from Settings → Agent token. Modes: `devices` (LAN discovery), `ingest` (host+services+vulns), `observe` (domains), `conn` (network traffic).

**Demo data**: Set `DEMO_SEED=1` in `.env` before first boot. Or run as admin → Settings → Load sample network.

**Verified against source code at commit**: `1e68eb1`
