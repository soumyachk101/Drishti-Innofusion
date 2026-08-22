# Drishti — Security Model

*Reverse-engineered from the implemented product. Every guard, constraint, and check that exists in code — not design intent.*

*Last updated: 2026-08-21 — Verified against source code at commit 1e68eb1.*

---

## 1. Threat model (what the product defends against)

The platform is *purely defensive*. Its internal threat model covers:

| Threat | Mitigation | Implementation |
|--------|------------|---------------|
| **Offensive output** (model generates exploit code) | GUARDRAIL + output-side marker scan | `ai/prompts.py`, `ai/service.py` |
| ** via model** | Scoped context, no in user input | `ai/prompts.py` (constructions use f-string, not user input) |
| **Tampered asset criticality** | Operator-set value is write-through, never agent-overwritten | `services/ingest.py: operator criticality rule` |
| **Ungated deep-scan** | RFC1918-only + explicit consent gate | `deepscan/service.py` |
| **Unauthorized agent data injection** | Hash-verified agent token, org-slug cross-check | `api/ingest.py`, `core/security.py` |
| **Token replay after password change** | `token_version` bump invalidates all tokens | `services/accounts.py` |
| **Login user enumeration** | Timing-safe bcrypt with dummy hash for unknown emails | `core/security.py` |
| **Pre-auth DoS (body flooding)** | ASGI streaming body cap (1 MB) | `main.py: MaxBodySizeMiddleware` |
| **Cross-subnet data collision** | Agents only delete within their own observed subnets | `services/live.py: observe_devices` |
| **Trust-invented device state** | MAC is nullable; null MAC = never invented (off-link/L3 only) | `models/network_device.py` |
| **Prompt exfiltration from context** | Context is passed as data, never as a | `ai/client.py` |
| **Compromised demo data** | Demo rows labeled `DEMO-ATTACK` and cleared before injection | `services/live_threats.py` |
| **Race condition on ingest** | SAVEPOINT + IntegrityError rollback + adopt-or-reread | `services/ingest.py` |

---

## 2. Authentication & authorization

### User authentication (JWT)
- **Algorithm**: HS256 (`create_access_token`, `create_refresh_token`)
- **Library**: PyJWT
- **Access token**: 15 minutes
- **Refresh token**: 7 days
- **Token payload**: `{sub, org_id, type, token_version, iat, exp}`
- **Token versioning**: Every password change bumps `token_version`, invalidating all prior tokens
- **Secret source**: `JWT_SECRET` env var; **fail-closed** in production (raises if unset, refuses service)
- **Timing-safe login**: Unknown emails still hash against a dummy bcrypt hash — prevents account enumeration via response-time analysis

### Agent authentication (hashed token)
- **Token format**: `drishti_<urlsafe-base64(24 bytes)>`
- **Storage**: SHA256 hash only — plaintext returned once at issuance
- **Lookup**: `token_hash = sha256(candidate)` equality match
- **Active check**: `agent.status == "active"` or the call is rejected
- **Org-scope**: Agent's `org_id` is checked against the request context

### Role-based access control
| Role | Capabilities |
|------|-------------|
| `admin` | Load sample network, reset org data, rotate agent token |
| `analyst` | Read/write findings, assets, AI remediation, live watch |
| `viewer` | Read-only access (implied by frontend routing) |

### Rate limits
| Endpoint group | Limit | Burst | Key |
|----------------|-------|-------|-----|
| Auth (register/login/refresh) | 90/min | 60 | per client IP (+ per email) |
| Ingest | 60/min | 20 | per agent |
| AI endpoints | 20/min | 6 | per user |
| Body size | 1 MB hard cap | — | all requests |

Stale entries evicted when dict > 10,000 entries (TTL: 1 hour).

---

## 3. Data isolation

- Every query that touches user data joins on or filters by `org_id`
- The agent's `org_id` is verified at the agent level; the `org_slug` in the payload is cross-checked against the agent's org, and a mismatch is rejected with `ForbiddenError`
- The engine loads **only** the current org's data
- JWT payload carries the user's `org_id`; the engine only operates on that org's graph
- **Demo data** is labeled with `_DEMO_LABEL = "DEMO-ATTACK"` and cleared before re-injection

---

## 4. Consent gates

### Deep-scan consent
```python
request.consent is True # 422 if not True
```
- Target must be RFC1918 (private/LAN address space)
- CIDR prefix ≤ `/22`
- Explicit `consent: true` in the request body
- Non-consented / non-private targets are rejected with 422

### Subnet scan consent
- `scan_subnet` flag in `AutoScanConfig` — user must explicitly enable it
- Default: scans only the local host (`is_self` device)
- Setting `scan_subnet = True` enables scanning all discovered devices on the subnet

---

## 5. AI safety

### GUARDRAIL (every AI call)
```
- Only produce DEFENSIVE output
- NEVER produce exploit code, malware, reverse shells, payloads
- If cannot answer defensively → {"refused": true, "reason": "..."}
- Base answers ONLY on provided context
- Return ONLY valid JSON matching the schema
```

### AI task variants
| Task | Description |
|------|-------------|
| `remediation` | Generate defensive remediation steps for a finding |
| `impact` | Compute financial impact (engine-authoritative — AI value overwritten) |
| `url-summary` | Summarize and score a URL/domain for trust |
| `network-summary` | Summarize network observations and topology |
| `block` | Block content matching offensive markers (all-text scan) |

### LLM providers
| Provider | Env var | Role |
|----------|---------|------|
| **NVIDIA NIM** | `NVIDIA_API_KEY` | Default provider (Llama 3.3 70B via NVIDIA NIM) |
| Groq | `GROQ_API_KEY` | Fallback provider |
| Anthropic | `ANTHROPIC_API_KEY` | Fallback provider |

### Output-side defense markers
```python
_OFFENSIVE_MARKERS = (
 "reverse shell", "bind shell", "how to exploit", "weaponize",
 "establish persistence", "exfiltrate", "attack the target", "ransomware",
)
```
- Scans: title, summary, script (remediation); headline, narrative, drivers (impact); prediction texts (predict); all text (block)
- If matched: returns `{refused: true, reason: "Request could not be answered defensively."}`
- Deliberately narrower than "exploit"/"payload" — real CVE descriptions use those terms legitimately

### Input-side constraints (what's NOT guarded)
- CVE title/description input is **not** blocked on the offensive markers — describing a real vulnerability is defensive context
- Attack path labels (hop labels, CVE titles) are threat data — must always be analyzable
- Asset/neighbor names are inventory data — not subject to input guards

### Engine-authoritative dollars
- `POST /api/ai/impact` overwrites the AI's `impact_usd` with the engine-computed value — the AI cannot inflate or deflate financial figures

### Mock mode
- `AI_MOCK=1` uses canned fixtures or context-specific deterministic templates
- Templates reference the **real** hostname + CVE + port (not fabricated values)
- Hero fixture: PostgreSQL priv-esc CVE → ansible playbook (every other finding gets context-specific template)

---

## 6. Defensive posture (honesty model)

### What "unknown" looks like everywhere

| Service | Honest unknown |
|---------|---------------|
| Netconfig | `{status: "unknown", source: "observed", evidence: "..."}` |
| Deep scan | `{available: false, unavailable_reason: "nmap binary not found"}` |
| URL Trust | `{provider: {configured: false}}` — absent providers contribute zero weight |
| Vulnerability ingest | `{severity: "unknown", cvss: null}` when not provided |
| Service ingest | Stale open findings not in payload → auto-resolved, not skipped |
| Connection ingest | Unknown neighbors skipped (not fabricated) |

### Defensive scopes explicitly documented
- `services/telegram_alerts.py`: "Defensive scope: outbound NOTIFICATION only. No inbound listener, no webhook."
- `services/deepscan/scanner.py`: "Defensive scope: port scan + CVE lookup. No payload generation, no exploit check, no agentic run. Discovery only."
- `agent/drishti_watch.py`: "Agent discloses its mode (ingest/observe/devices) and only runs what was consented to."
- `services/urltrust/`: "Purely defensive: we score and block domains, never attack anything."
- `services/intel.py`: ML analysis service — purely analytical, no active network manipulation.

---

## 7. Input validation

| Layer | Validation | Enforcement |
|-------|-----------|-------------|
| Ingest body | Schema (Pydantic): hostname, ip, asset_type, services[], vulnerabilities[], connectivity[] | 422 on schema violation |
| Ingest agent auth | Bearer token hash lookup | 401 on invalid/disabled |
| Ingest org scope | `org_slug` cross-checked against agent's org | 403 on mismatch |
| Deep scan target | RFC1918 check (ipaddress module) | 422 if not private |
| Deep scan CIDR | Prefix ≤ /22 | 422 if too broad |
| Deep scan consent | `consent is True` (not truthy) | 422 if not exactly True |
| Domain observation | Hostname regex + shell-metacharacter stripping | 404 "Not a public domain" |
| Domain cleaning | Strip http(s)://, path, query, www, trailing dot | No injection surface |
| Body size | 1 MB hard cap (streaming) | 413 before processing |
| Hostname validation | `^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(?:\.(?!-)[a-z0-9-]{1,63}(?<!-))+$` | Regex, rejects shell metacharacters |

---

## 8. SQL injection safety

- **SQLAlchemy ORM** throughout — no string-concatenated SQL
- **Named parameter binding** in raw queries (e.g., `select(NetworkDevice).where(NetworkDevice.org_id == org_id)`)
- **No raw user strings** in query conditions

---

## 9. Secret management

| Secret | Source | Stored |
|--------|--------|--------|
| JWT signing key | `JWT_SECRET` env var | In-memory only (used for sign/verify) |
| User passwords | Plaintext → sha256 → bcrypt | `password_hash` in DB |
| Agent tokens | `secrets.token_urlsafe(24)` | `sha256(token_hash)` in DB |
| Groq API key | `GROQ_API_KEY` env var | In-memory client (never in DB) |
| NVIDIA API key | `NVIDIA_API_KEY` env var | In-memory client (never in DB) |
| Anthropic API key | `ANTHROPIC_API_KEY` env var | In-memory client (never in DB) |
| Telegram bot token | `TELEGRAM_BOT_TOKEN` env var | In-memory only (reads each scan tick) |
| NVD API key | `NVD_API_KEY` env var | In-memory only |
| Vulners key | `VULNERS_KEY` env var | In-memory only |

---

## 10. Race condition safety

| Pattern | Location | Mechanism |
|---------|----------|-----------|
| Asset upsert | `services/ingest.py` | SAVEPOINT + IntegrityError → adopt concurrent row |
| AutoScanConfig creation | `services/autoscan.py` | `db.begin_nested()` + IntegrityError → re-read |
| Live observation upsert | `services/live.py` | SAVEPOINT + IntegrityError → adopt concurrent row |
| Device batch upsert | `services/live.py` | SAVEPOINT + IntegrityError → adopt concurrent row |
| Agent token rotation | `services/accounts.py` | IntegrityError → rollback + ConflictError |

---

## 11. Security-relevant middleware

1. **`MaxBodySizeMiddleware`** — ASGI streaming body cap (1 MB). Rejects oversized bodies before buffering, preventing pre-auth DoS against `/ingest`.
2. **CORS** — Allowlist + `chrome-extension://.*` regex. Credentials allowed. The extension's random ID is matched via regex.
3. **Structured logging** — Every request gets a `request_id` (8-char UUID prefix). Logs include method, path, status, latency_ms.

---

## 12. Security gaps and known limitations

| Item | Severity | Status |
|------|----------|--------|
| `refresh_token` endpoint is rate-limited (90/min with 60 burst, per auth group) | Info | Rate-limited — contrary to earlier documentation |
| No CSRF protection on user endpoints (relies on Bearer tokens, not cookies) | OK | Bearer auth is not susceptible to CSRF |
| Demo attack injects real-looking threat data | Low | Clearly labeled; cleared on demand or before re-inject |
| Hardcoded demo token `agent-demo-token` exists in code | Medium | Should be removed or rotated before production deployment |
| Vercel `vercel.json` → Railway URL mismatch | Medium | Deployment configuration inconsistency — redirect target may not resolve in production |
| LLM output could hallucinate CVEs not in context | Mitigated | `AI_INSTRUCTIONS.md §2`: "Do not invent hosts, CVEs, versions, or numbers" in prompt |
| No token revocation list (blacklist) | Low | `token_version` in user record handles the common case (password change) |
