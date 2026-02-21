# Agent-First Web Contract v0

**Status:** Active rollout (baseline complete through Step 5; 30-day cycle D1+D2 complete)
**Owner:** Roger + Rodaco
**Date:** 2026-02-20
**Applies to:** `rogergimbel.dev`, `rodaco.co`, `bladekeeper.app`

## Execution Status Snapshot (2026-02-20)
- Week 1 Day 1–4 implementation is complete across all three properties.
- Step 3 audit baseline is complete across all three properties; BladeKeeper production deploy + verification completed.
- Step 4 pilot is now live on BladeKeeper: approve/reject/apply endpoints are enabled with one-time approval token + apply kill switch guard.
- rogergimbel.dev and rodaco.co remain propose-only (approve/reject/apply intentionally disabled).
- Deterministic deploys from OpenClaw Intel are unblocked: Supabase PAT is wired into encrypted secrets + runtime secret refresh completed + `agent-api` deploy succeeded from container.
- Step 5 CLI parity is implemented via `bin/rodaco` with command coverage for discover/meta/query/propose/proposals/approve/reject/apply/audit.
- Three end-to-end CLI transcripts are saved under `memory/tasks/step5-transcripts/`.
- Canonical remaining task list: `memory/tasks/agent-abilities-todo.md`.
- Canonical 30-day execution roadmap: `knowledge/infrastructure/agent-first-30-day-roadmap.md`.
- D1 (kickoff/baseline lock) is complete and logged in `memory/tasks/agent-first-d1-d30-execution-board.md`.
- D2 (durable audit) is complete on BladeKeeper; deployed backend is notifications-backed (`type=agent_audit_v0`) to avoid current migration-history drift blocking `db push`.
- D3 (write-path matrix) is complete: `read|propose|approve|reject|apply_attempt` all verified through durable audit entries.

## 1) Core Position

Websites are no longer only human UI surfaces. They are capability surfaces for both humans and agents.

**Rule:** Every new site ships with:
1. Discovery metadata
2. Read APIs
3. Safe write/proposal flow
4. Audit trail
5. CLI parity with APIs

---

## 2) Contract Layers

## A. Discovery Layer (public)
- `/.well-known/agent.json` — capability manifest
- `/llms.txt` — concise agent-readable docs map
- `/api/agent/v1/meta` — version, limits, auth modes, endpoint index
- `/api/agent/v1/openapi.json` — machine-readable API schema

### `agent.json` (minimum)
```json
{
  "name": "BladeKeeper",
  "agent_api": "https://bladekeeper.app/api/agent/v1",
  "version": "v0",
  "auth": ["none", "bearer"],
  "capabilities": ["read", "propose", "apply_with_approval"],
  "docs": ["https://bladekeeper.app/llms.txt"]
}
```

## B. API Layer (stable)
Base path: `/api/agent/v1`

**Required headers**
- `X-Agent-Id: <agent_name_or_uuid>`
- `X-Agent-Run-Id: <trace_id>`
- `Idempotency-Key: <uuid>` (required for write/propose/apply)

**Standard response envelope**
```json
{
  "ok": true,
  "data": {},
  "error": null,
  "meta": {
    "requestId": "req_123",
    "version": "v0",
    "ts": "2026-02-20T17:00:00Z"
  }
}
```

## C. Safety Layer (non-negotiable)
- Scope-based tokens (`read:*`, `propose:*`, `apply:*`)
- Writes are 2-step for v0: `propose` → human `approve` → `apply`
- Rate limits per token + per IP + per agent id
- Full audit log for every action
- Kill switch: disable `apply` globally per site

## D. CLI Layer
Single CLI: `rodaco agent ...` calling same API contract.

---

## 3) Auth Model v0

### Token types
1. **Public** (no auth): discovery + selected read endpoints
2. **Service Bearer token**: scoped, short TTL preferred
3. **Approval token**: one-time token for `apply` operations

### Scopes
- `read:public`
- `read:private`
- `propose:content`
- `propose:data`
- `apply:content`
- `apply:data`

### Approval policy
Any state-changing operation on prod requires:
- approved `proposalId`
- valid approval token
- actor identity in audit log

---

## 4) Shared Endpoint Set (all sites)

### Discovery
- `GET /meta`
- `GET /openapi.json`

### Health + limits
- `GET /health`
- `GET /limits`

### Proposals
- `POST /proposals` (create)
- `GET /proposals/:id` (status)
- `POST /proposals/:id/approve`
- `POST /proposals/:id/reject`
- `POST /proposals/:id/apply`

### Audit
- `GET /audit?from=&to=&actor=&action=`

---

## 5) Site-Specific v0 Maps

## 5.1 rogergimbel.dev (mostly read-first)

### Read endpoints
- `GET /profile`
- `GET /projects`
- `GET /timeline`
- `GET /posts`

### Propose endpoints
- `POST /proposals/content-update`
  - input: page slug + structured patch
  - output: proposal with diff preview

### Apply behavior
- `apply` opens branch + commit in site repo (no auto-publish)

**Goal for v0:** let agents draft/update site content safely without direct prod mutation.

## 5.2 rodaco.co (read + growth operations)

### Read endpoints
- `GET /services`
- `GET /case-studies`
- `GET /offers`
- `GET /proof-points`

### Propose endpoints
- `POST /proposals/landing-copy`
- `POST /proposals/case-study-draft`
- `POST /proposals/seo-page`

### Action endpoint (guarded)
- `POST /actions/lead-intake`
  - creates structured lead record (not auto-email)

**Goal for v0:** make marketing surface agent-addressable while keeping humans in review loop.

## 5.3 bladekeeper.app (full pilot)

### Read endpoints
- `GET /blades?query=&maker=&steel=&sort=`
- `GET /blades/:id`
- `GET /collections`
- `GET /stats`

### Propose endpoints
- `POST /proposals/blade-metadata-update`
- `POST /proposals/listing-copy`
- `POST /proposals/collection-reorg`

### Apply endpoints (approval required)
- `POST /proposals/:id/apply`

**Goal for v0:** prove end-to-end agent workflow on real app data with strict approval + audit.

---

## 6) CLI Surface (maps 1:1 to API)

```bash
rodaco agent discover <site>
rodaco agent meta <site>
rodaco agent query <site> <resource> [--params]
rodaco agent propose <site> <type> --input proposal.json
rodaco agent proposals list <site> [--status pending]
rodaco agent approve <site> <proposalId>
rodaco agent reject <site> <proposalId> --reason "..."
rodaco agent apply <site> <proposalId>
rodaco agent audit <site> [--from ... --to ...]
```

Examples:
```bash
rodaco agent discover bladekeeper
rodaco agent query bladekeeper blades --params 'maker=Benchmade&sort=value_desc'
rodaco agent propose rogergimbel content-update --input ./patch.json
```

---

## 7) Data + Audit Schema (minimum)

Audit record fields:
- `id`, `ts`, `site`, `agentId`, `runId`, `actor`
- `action` (`read|propose|approve|apply|reject`)
- `resource`
- `requestHash`
- `result` (`ok|error`)
- `proposalId` (if any)
- `diffSummary`

Store in append-only log (file or DB table).

---

## 8) Rollout Plan (2 weeks)

## Week 1
- Ship discovery + meta + openapi on all 3
- Ship read endpoints on all 3
- Ship audit logging baseline

## Week 2
- Ship proposal flow on all 3
- Enable `apply` only on BladeKeeper first
- Ship `rodaco` CLI v0 commands
- Run 3 scripted agent workflows end-to-end

---

## 9) Definition of Done (v0)

- Agent can discover capabilities with no human hints
- Agent can read relevant data for each site deterministically
- Agent can create proposals with schema-valid payloads
- Human can approve/reject/apply safely
- Every action is traceable in audit log
- Same workflow works via API and CLI

---

## 10) Strong Recommendation

Do **not** overbuild “AI magic” first. Ship boring, strict interfaces first:
- schemas
- scopes
- idempotency
- approval gates
- audits

That’s what makes agent-first real, reusable, and production-safe.

---

## 11) D5 Apply Policy Engine (v0 draft)

### Risk Classes
- **safe**: formatting, ordering, metadata cleanup, non-destructive field edits
- **sensitive**: value-impacting or visibility-impacting edits (price/value/visibility/sharing)
- **destructive**: deletes, irreversible state transitions, bulk rewrites

### v0 Enforcement Rules
1. **safe** changes may be `approve -> apply` with one-time approval token.
2. **sensitive** changes require explicit human reason at approval time and stricter audit metadata.
3. **destructive** changes are **blocked in v0** (`POLICY_CLASS_BLOCKED`) even if approved; require rollback-ready v1+ controls.
4. Apply kill switch always overrides all classes.
5. Unknown fields default to `destructive` (deny-by-default).

### BladeKeeper Field Policy (pilot)

**safe allowlist (apply permitted)**
- `name`, `model`, `manufacturer`, `blade_steel`, `handle_material`, `description`, `notes`, `collection_id`, `acquired_date`, `tags`

**sensitive (apply permitted with extra guardrails)**
- `value_estimate`, `purchase_price`, `visibility`, `for_sale`, `listing_copy`

**destructive (blocked in v0)**
- `delete_blade`, `delete_collection`, `bulk_replace`, `ownership_transfer`, `hard_reset_images`

### Required Audit Additions for Apply Attempts
- `policy.classification`: `safe|sensitive|destructive`
- `policy.decision`: `allow|deny`
- `policy.reason`: machine + human-readable reason
- `policy.fields`: normalized list of fields touched

### Error Codes
- `POLICY_CLASS_BLOCKED`
- `POLICY_FIELD_NOT_ALLOWLISTED`
- `POLICY_SENSITIVE_REASON_REQUIRED`
- `POLICY_KILL_SWITCH_ACTIVE`

### Rollout Note
- Keep `rogergimbel.dev` + `rodaco.co` propose-only until BladeKeeper pilot shows 7-day clean audit on policy decisions with no unapproved applies.