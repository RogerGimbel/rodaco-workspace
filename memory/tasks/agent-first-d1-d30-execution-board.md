# Agent-First Web Enablement — D1–D30 Execution Board

**Status:** Ready to execute
**Date:** 2026-02-20
**Owners:** Roger (approval + product decisions), Rodaco (implementation + orchestration)
**Scope:** `bladekeeper.app`, `rodaco.co`, `rogergimbel.dev`
**Out of scope:** `beerpair.com` and other serious-data properties in this cycle

## Operating Rules
- Keep `rodaco.co` + `rogergimbel.dev` propose-only until BladeKeeper hardening goals are met.
- No production apply without explicit human approval.
- Every mutation must be auditable + reversible.
- Daily checkpoint required.

## Standard Command Pack (reused across days)
```bash
# Discovery + health
bin/rodaco agent discover bladekeeper
bin/rodaco agent discover rodaco
bin/rodaco agent discover rogergimbel
openclaw status

# Proposals lifecycle
bin/rodaco agent proposals list bladekeeper --status pending
bin/rodaco agent proposals list rodaco --status pending
bin/rodaco agent proposals list rogergimbel --status pending

# Audit spot checks
bin/rodaco agent audit bladekeeper --params 'limit=20'
bin/rodaco agent audit rodaco --params 'limit=20'
bin/rodaco agent audit rogergimbel --params 'limit=20'
```

## Execution Log

### D1 — Kickoff + baseline lock (2026-02-20)
- Scope lock confirmed: in-scope = `bladekeeper.app`, `rodaco.co`, `rogergimbel.dev`; out-of-scope unchanged (`beerpair.com`, serious-data properties).
- Baseline health captured: `openclaw status` clean (gateway healthy; no critical runtime blockers).
- Discovery baseline captured (all HTTP 200):
  - `bin/rodaco agent discover bladekeeper`
  - `bin/rodaco agent discover rodaco`
  - `bin/rodaco agent discover rogergimbel`
- Proposal queue baseline:
  - `rodaco`: pending = 0
  - `rogergimbel`: pending = 0
  - `bladekeeper`: requires bearer token (`401 Missing authorization header` without auth)
- Audit baseline:
  - `rodaco` + `rogergimbel`: admin-gated (`403 AUDIT_ADMIN_REQUIRED` without admin key)
  - `bladekeeper`: auth-gated (`401 Missing authorization header` without bearer)
- D1 done criteria: ✅ complete

### D2 — BladeKeeper durable audit schema (2026-02-20)
- PAT refreshed and validated (`supabase projects list` succeeded).
- Durable audit write/read shipped and deployed in `supabase/functions/agent-api/index.ts`.
- Practical storage backend for D2 is now **durable `notifications` JSON records** (`type=agent_audit_v0`) to avoid migration-history drift blocking `db push`.
- Verification passed:
  - `bin/rodaco agent audit bladekeeper --params 'limit=5' --token <bearer>` returned 200
  - audit items include expected fields (`userId`, `agentId`, `runId`, `resource`, `action`, `result`, `requestHash`, `ts`)
  - meta reports `durable: true`
- D2 done criteria: ✅ complete
- Follow-up (non-blocking): keep `supabase/migrations/20260220222500_agent_audit_events.sql` as deferred path once migration history is repaired.

### D3 — BladeKeeper durable audit write-path matrix (2026-02-20)
- Ran end-to-end action matrix with dedicated `d3-*` run IDs:
  - `read`: `rodaco agent query bladekeeper blades --params 'limit=1'`
  - `propose`: created proposal A + proposal B
  - `approve`: approved proposal A
  - `apply_attempt`: applied proposal A with one-time approval token
  - `reject`: rejected proposal B
- Verification passed via durable audit query:
  - `rodaco agent audit bladekeeper --params 'limit=200' --token <bearer>`
  - actions seen: `read`, `propose`, `approve`, `reject`, `apply_attempt`
  - missing actions: none
  - proposal IDs exercised: A=`8c48d564-3989-4fa9-b701-a6b91ec20f29`, B=`45dcb146-fb6d-4162-9f3a-624e841723d6`
- D3 done criteria: ✅ complete

---

## D1–D30 Plan

| Day | Focus | Owner | Command Pack (exact / primary) | Done Criteria | Dependencies / Risks |
|---|---|---|---|---|---|
| D1 | Kickoff + baseline lock | Roger + Rodaco | `openclaw status` + run discovery on all 3 sites | Scope lock documented; baseline metrics captured | Risk: scope creep |
| D2 | BladeKeeper durable audit schema | Rodaco | implement migration + `bin/rodaco agent audit bladekeeper --params 'limit=5'` | Audit writes persisted in durable storage | Risk: DB migration drift |
| D3 | BladeKeeper durable audit write path | Rodaco | propose/approve/apply test + audit query | `read/propose/approve/apply` all appear in durable audit | Risk: missing action fields |
| D4 | BladeKeeper audit read hardening | Rodaco | audit queries with params (limit/filter/date) | Admin-scoped audit endpoint supports stable filters/pagination | Risk: perf on larger logs |
| D5 | Apply policy engine design | Roger + Rodaco | draft policy map in repo docs | Allowlist + risk classes approved (`safe/sensitive/destructive`) | Risk: over/under restrictive policy |
| D6 | Apply policy engine implementation | Rodaco | approve/apply with allowed + blocked payloads | Allowed fields apply; blocked fields rejected with explicit code | Risk: false positives blocking useful work |
| D7 | Rollback primitive + drill #1 | Rodaco | run apply then rollback script on BladeKeeper | Rollback path completes in <5 min and audited | Risk: partial rollback state |
| D8 | Daily E2E canary script | Rodaco | scripted flow using `bin/rodaco` (discover→query→propose→approve→apply) | Script exits non-zero on any stage failure | Risk: flaky approvals/tokens |
| D9 | Canary scheduling + alerting | Rodaco | wire cron + notification path | Canary runs automatically; failure alert delivered | Risk: noisy alerts |
| D10 | Kill-switch validation drill | Roger + Rodaco | toggle kill switch + apply attempt | Apply blocked when kill switch ON; auditable error emitted | Risk: switch not globally enforced |
| D11 | Mission Control queue API shape | Rodaco | define and expose queue data contract | Unified proposal queue payload available for all 3 sites | Risk: inconsistent per-site metadata |
| D12 | Mission Control queue UI | Rodaco | local build/run MC | Queue visible with site/status filters | Risk: UI-only without action parity |
| D13 | Diff-first review UI | Rodaco | open proposal detail from queue | Reviewer can see what/why/impact before decision | Risk: poor diff readability |
| D14 | Decision logging + SLA metrics | Rodaco | approve/reject from queue + audit checks | Every decision stores actor + reason + timestamp | Risk: missing reason enforcement |
| D15 | Contract v1 candidate freeze doc | Roger + Rodaco | update spec docs | v1 candidate documented with no ambiguous endpoints | Risk: unresolved edge cases |
| D16 | Error code + idempotency matrix | Rodaco | run idempotency replay tests | Deterministic replay behavior documented + verified | Risk: duplicate mutation under retry |
| D17 | Conformance test harness | Rodaco | scripted conformance run against all 3 | Pass/fail report generated per site | Risk: brittle test assumptions |
| D18 | Conformance remediation | Rodaco | fix failures + rerun harness | 3/3 sites green on conformance | Risk: regressions after fixes |
| D19 | CLI docs (operator grade) | Rodaco | update docs with real commands | Operator can run full lifecycle from docs alone | Risk: docs drift from CLI reality |
| D20 | “Add new site in 1 day” playbook | Roger + Rodaco | create checklist + template artifacts | Playbook complete and internally reviewed | Risk: hidden prerequisites |
| D21 | Dry-run onboarding simulation | Rodaco | simulate onboarding in sandbox path | New-site simulation completes within 1 working day | Risk: manual undocumented steps |
| D22 | KPI schema + instrumentation plan | Roger + Rodaco | define events + metric formulas | KPI definitions frozen (volume/rate/cycle/rollback) | Risk: vanity metrics |
| D23 | Proposal lifecycle telemetry wiring | Rodaco | fire proposal lifecycle events | Events emitted for propose/approve/reject/apply/rollback | Risk: missing correlation IDs |
| D24 | KPI dashboard in Mission Control | Rodaco | run MC + verify KPI cards | Dashboard shows live metrics across all 3 sites | Risk: stale data windows |
| D25 | Weekly workflow pack — rogergimbel | Rodaco | execute 3 proposal workflows | 3 successful proposal cycles logged (propose-only path) | Risk: low-signal proposals |
| D26 | Weekly workflow pack — rodaco | Rodaco | execute 3 proposal workflows | 3 successful proposal cycles logged (propose-only path) | Risk: copy quality variance |
| D27 | Weekly workflow pack — BladeKeeper | Rodaco + Roger | execute 3 approve/apply workflows | 3 successful approved applies + audit + rollback test sample | Risk: apply friction |
| D28 | 7-day pilot measurement cut | Roger + Rodaco | export KPI snapshot | Baseline vs current delta computed | Risk: insufficient sample size |
| D29 | Scale-gate review memo | Roger + Rodaco | write go/no-go memo | Explicit criteria-based decision draft ready | Risk: biased interpretation |
| D30 | Executive decision + next-cycle planning | Roger + Rodaco | review memo + commit next sprint | Signed decision: continue/hold/expand (still excluding BeerPair unless explicitly approved) | Risk: premature expansion |

---

## Weekly Exit Criteria

### Week 1 Exit (D1–D7)
- Durable audit live on BladeKeeper
- Apply policy gates enforced
- Rollback proven under drill

### Week 2 Exit (D8–D14)
- Daily canary + alerting in place
- Mission Control queue + diff + decisions operational

### Week 3 Exit (D15–D21)
- Contract v1 candidate frozen
- Conformance green for all 3 sites
- Onboarding playbook proven in simulation

### Week 4 Exit (D22–D30)
- KPI dashboard operational
- Workflow throughput and safety metrics measured
- Formal go/no-go decision documented

---

## Safety & Decision Gate
No onboarding of serious-data properties until all are true:
1. rollback rate < 5%
2. no unapproved apply incidents
3. canary pass rate > 95%
4. contract conformance 3/3 green for 7 straight days
