# Agent Abilities Rollout — Remaining To-Do

**Status:** IDLE  
**Owner:** Roger + Rodaco  
**Last Updated:** 2026-02-20 18:39 ET

## What’s Done (Do Not Repeat)
- [x] Week 1 Day 1 — discovery scaffolding on all 3 properties
  - `/.well-known/agent.json`, `/llms.txt`, `/api/agent/v1/meta`, `/api/agent/v1/openapi.json`
- [x] Week 1 Day 2 — deterministic read endpoints shipped
  - rogergimbel-site: profile/projects/timeline/posts
  - rodaco-site: services/case-studies/offers/proof-points
  - bladekeeper: blades/collections/stats (seed + live adapter path)
- [x] Week 1 Day 3 — shared query contract + limits + BladeKeeper auth-ready edge adapter
- [x] Authenticated smoke tests passed for BladeKeeper read endpoints (`/blades`, `/collections`, `/stats`)
- [x] Rodaco runtime drift fixed by versioning `server.cjs`, `start.sh`, `supervisor.sh`

## Remaining Blockers
- [ ] No active blocker. Rollout baseline is complete through Step 5.
- [ ] Optional next hardening: durable audit storage for BladeKeeper + CLI docs in TOOLS.md.

## Remaining Tasks (Ordered)
### Step 1 — Unblock deterministic deploy from OpenClaw Intel
- [x] Add Supabase PAT to OpenClaw Intel secret management (not plaintext in repo)
  - Added to encrypted host secrets: `~/docker/openclaw/secrets.enc.yaml` under both `env.SUPABASE_ACCESS_TOKEN` and `files.supabase-token`.
- [x] Load refreshed secrets in runtime
  - Ran `/usr/local/bin/decrypt-secrets.sh ...` to regenerate `/tmp/secrets/env.sh` + `/tmp/secrets/supabase-token`.
- [x] Validate env presence from OpenClaw runtime (`echo ${SUPABASE_ACCESS_TOKEN:+set}` equivalent)
  - Confirmed: `/tmp/secrets/env.sh` contains `export SUPABASE_ACCESS_TOKEN=...` and token file exists.
- [x] Run deploy from container context:
  - `cd /home/node/workspace/projects/bladekeeper.app`
  - `/home/node/workspace/bin/supabase functions deploy agent-api --project-ref zocftrkoaokqvklugztj`
- [x] Post-deploy verify endpoint reachability
  - `/health`, `/meta`, `/limits`, `/openapi` all return auth-gated `401 Missing authorization header` (expected for auth-required mode), confirming deployed route availability.

### Step 2 — Week 1 Day 4 (safe write primitives)
- [x] Add `/proposals` skeleton endpoints (create/get/list) across all 3 surfaces
- [x] Add approval-state records (`pending|approved|rejected|applied`) — no apply mutation yet
- [x] Enforce idempotency keys for propose endpoints
- [x] Return uniform envelope (`ok/data/error/meta`) on proposal + operational endpoints touched in Day 4
- [x] Re-deploy BladeKeeper `agent-api` and verify new proposal endpoints in production
- [x] Rebuild and verify rogergimbel-site + rodaco-site proposal endpoints locally
- [~] Storage implementation note (BladeKeeper): proposal records currently stored in `notifications` as `type=agent_proposal_v0` due migration-history drift preventing immediate dedicated table rollout (`agent_proposals` migration drafted, not applied yet).

### Step 3 — Audit baseline (required before apply)
- [x] Add append-only audit record on every `read|propose|approve|reject|apply_attempt`
  - Complete on rogergimbel-site + rodaco-site (local validated)
  - Complete on BladeKeeper (`agent-api` deployed to production)
- [x] Include: `agentId`, `runId`, `resource`, `action`, `result`, `proposalId`, `requestHash`, `ts`
  - Verified in roger/rodaco audit payloads
  - BladeKeeper production contract confirms required fields via `/audit` metadata `fields[]`
- [x] Add `/audit` read endpoint (admin scoped)
  - roger/rodaco live locally (403 without admin key, 200 with admin key)
  - BladeKeeper production verified (`401` unauthenticated, `200` admin user)

### Step 4 — Week 2 apply gate (BladeKeeper first)
- [x] Implement approval token model + kill switch (BladeKeeper `agent-api`)
- [x] Enable `/proposals/:id/apply` only on BladeKeeper first
- [x] Keep rogergimbel.dev and rodaco.co at propose-only until BladeKeeper pilot is stable

### Step 5 — CLI parity (`rodaco agent`)
- [x] Ship `discover/meta/query/propose/proposals/approve/reject/apply/audit` commands mapping 1:1 API contract
  - Implemented in `bin/rodaco`.
  - rogergimbel/rodaco defaults target local API surfaces (`localhost:3335` / `localhost:3334`) with env override support.
  - BladeKeeper defaults target Supabase function endpoint.
- [x] Run 3 end-to-end scripted workflows and save transcripts
  - `memory/tasks/step5-transcripts/workflow-01-discovery.txt`
  - `memory/tasks/step5-transcripts/workflow-02-public-read-propose.txt`
  - `memory/tasks/step5-transcripts/workflow-03-bladekeeper-approve-apply.txt`

### Step 6 — 30-day execution cycle (current phase)
- [x] Capture approved 30-day roadmap in knowledge base
  - `knowledge/infrastructure/agent-first-30-day-roadmap.md`
- [x] Produce day-by-day execution board (D1–D30) with owners + done criteria
  - `memory/tasks/agent-first-d1-d30-execution-board.md`
- [~] Start Week 1 hardening lane on BladeKeeper
  - [x] D1 kickoff + baseline lock complete (see `memory/tasks/agent-first-d1-d30-execution-board.md` execution log)
  - [x] D2 durable audit storage live (notifications-backed `agent_audit_v0`, deployed + verified)
  - [x] D3 write-path matrix complete (`read|propose|approve|reject|apply_attempt` verified in durable audit)
  - [ ] apply policy gates (allowlist + risk classes)
  - [ ] one-click rollback path
  - [ ] daily E2E canary with alerting
- [ ] Keep rogergimbel.dev + rodaco.co propose-only until BladeKeeper hardening KPIs are met

## Verification Checklist
- [x] Discovery works with no hints on all 3
- [x] Read APIs deterministic under query contract
- [x] Proposal flow schema-valid and idempotent
- [x] Human approval required for all state change
- [x] Full traceability fields + admin audit contract verified (BladeKeeper durable storage live via notifications-backed `agent_audit_v0`)
- [x] API and CLI behavior parity confirmed

## Canonical References
- Contract spec: `knowledge/infrastructure/agent-first-v0-spec.md`
- 30-day roadmap: `knowledge/infrastructure/agent-first-30-day-roadmap.md`
- D1–D30 execution board: `memory/tasks/agent-first-d1-d30-execution-board.md`
- Crash recovery source: `memory/tasks/CURRENT.md`
- This task list: `memory/tasks/agent-abilities-todo.md`
