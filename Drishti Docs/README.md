# Drishti — Reverse-Engineering Docs

Reverse-engineered product & engineering documentation for **Drishti** (repo `Citadel-1.0`),
reconstructed directly from source (`server/`, `web/`, `agent/`, `extension/`). Every claim here
traces to real code — no aspirational features. Where the code says "unknown / not fabricated",
these docs say the same.

> **Drishti** is a **defensive-only** attack-path intelligence platform. It models a network the way
> an attacker reads it, traces the real routes from the internet to crown-jewel assets, prices each
> path in **dollars**, and drafts a human-reviewed **Ansible fix** — but it **never attacks**. Resolve
> a finding and total org exposure recomputes live because the math is real (`$902,900 → $702,900` on
> the seeded demo, asserted by `make smoke`).

---

## The documents

| # | Doc | What it answers |
|---|-----|-----------------|
| 1 | [PRD.md](PRD.md) | **Product Requirements** — problem, personas, goals/non-goals, feature requirements, user stories, success metrics, scope. |
| 2 | [TRD.md](TRD.md) | **Technical Requirements** — stack, the risk-engine math (formulas + coefficients), every service spec, NFRs, testing, deployment. |
| 3 | [ARCHITECTURE.md](ARCHITECTURE.md) | **Architecture** — C4 context/container/component diagrams, data flow, deployment topology, key design decisions, repo map. |
| 4 | [APP_FLOW.md](APP_FLOW.md) | **App Flow** — end-to-end user journeys and data flows as sequence diagrams (auth, ingest→recompute, remediate→exposure-drop, live watch, deep scan, netconfig). |
| 5 | [DATA_MODEL.md](DATA_MODEL.md) | **Data Model** — ER diagram, per-table dictionary, constraints, cascade rules, identity/dedup keys, schema evolution. |
| 6 | [API_REFERENCE.md](API_REFERENCE.md) | **API Reference** — every endpoint (method, path, auth, request/response), error envelope, rate limits. |
| 7 | [SECURITY_MODEL.md](SECURITY_MODEL.md) | **Security Model** — defensive-only stance, consent gating, the "honesty model", auth internals, DoS controls, multi-tenancy. |

**Reading order for a newcomer:** PRD → ARCHITECTURE → APP_FLOW → DATA_MODEL → API_REFERENCE → TRD → SECURITY_MODEL.

---

## Project at a glance

| | |
|---|---|
| **Type** | Multi-tenant SaaS — network-risk intelligence, defensive security |
| **Backend** | FastAPI + SQLAlchemy 2 (Postgres in Docker / SQLite local), NetworkX risk engine, Python 3.11+ |
| **Frontend** | React 18 + Vite + TypeScript, React Flow (graph), Recharts, TanStack Query, Zustand, Tailwind |
| **AI** | Groq · Llama 3.3 70B (default) or Anthropic Claude — backend-only; `AI_MOCK=true` runs keyless |
| **Edge agent** | `agent/drishti_watch.py` — LAN device discovery + domain telemetry (consent-gated) |
| **Browser ext** | `extension/` — Chrome "Web Guard" calling the URL Trust Analyzer |
| **Risk engine** | Directed graph, INTERNET→asset paths (Yen's k-shortest), $ impact, blast radius |
| **Stance** | **Defensive only** — maps and prices risk, drafts fixes; runs no exploit, intercepts no traffic |

## Repo map

```
Citadel-1.0/
├─ server/            FastAPI backend
│  └─ app/
│     ├─ api/         14 routers (auth, ingest, graph, paths, findings, ai, live, netconfig, urltrust, report, …)
│     ├─ models/      SQLAlchemy models (21 tables)
│     ├─ schemas/     Pydantic request/response contracts
│     ├─ services/    business logic: risk_engine, attack_paths, impact, recompute, ingest,
│     │               ai/, urltrust/, deepscan/, netconfig/, live, live_threats, autoscan, hardening
│     ├─ seed/        Acme demo network + identity-only seed
│     ├─ core/        security (JWT/bcrypt), deps (auth/rate-limit), errors
│     ├─ config.py    env-driven settings (fail-closed on default JWT secret)
│     └─ main.py      app assembly, lifespan bootstrap, middleware
├─ web/               React SPA (src/features/* = one folder per screen)
├─ agent/             Live Watch edge agent (dns/history/conn/devices modes)
├─ extension/         Chrome Web Guard extension
├─ system-overview/   Long-form narrative overview (EN/HI/BN + PDFs) — gitignored
└─ reverse-engineering/   ← you are here
```

---

*Reconstructed on 2026-07-23 from the working tree. Section refs like "BACKEND.md §5" appearing in code
comments point to design notes that predate this folder; the formulas they describe are documented
here in [TRD.md](TRD.md).*
