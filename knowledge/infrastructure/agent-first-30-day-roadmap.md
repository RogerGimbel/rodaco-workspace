# Agent-First Web Enablement — 30-Day Roadmap

**Status:** Approved direction (execution board next)
**Date:** 2026-02-20
**Owner:** Roger + Rodaco
**Scope:** `bladekeeper.app`, `rodaco.co`, `rogergimbel.dev`
**Out of scope (explicit):** `beerpair.com` and other data-heavy sites for now

---

## 1) Strategic intent
Turn the current v0 agent contract into a repeatable operating system for web properties:
- fast agent execution,
- human-in-the-loop control,
- complete auditability,
- safe rollback.

This is a platform capability, not a one-off feature.

---

## 2) Starting point (already done)
- Week 1 Day 1–4 complete across all three properties
- Step 3 audit baseline complete
- Step 4 pilot live on BladeKeeper (`approve/reject/apply` with approval token + kill switch)
- rogergimbel.dev + rodaco.co remain propose-only
- Step 5 CLI parity shipped in `bin/rodaco`

References:
- `knowledge/infrastructure/agent-first-v0-spec.md`
- `memory/tasks/agent-abilities-todo.md`

---

## 3) 30-day outcomes (definition of success)
By day 30, we should have:
1. **Production-hardened apply flow** on BladeKeeper
2. **Unified human approval cockpit** for all three properties
3. **Contract v1 freeze** + onboarding playbook
4. **Measured business impact** with explicit go/no-go gate for data-heavy site rollout later

---

## 4) Weekly execution plan

## Week 1 — BladeKeeper hardening
**Goal:** zero-drama apply path

### Deliverables
- Durable audit storage (non-transient)
- Apply policy gates (field allowlist + risk classes)
- One-click rollback for each apply
- Daily E2E canary (`discover → query → propose → approve → apply`)

### Success metrics
- 100% of apply events auditable
- Rollback median < 5 minutes
- Canary pass rate > 95%
- 0 unapproved applies

---

## Week 2 — Approval cockpit in Mission Control
**Goal:** humans stay in control while agents move fast

### Deliverables
- Unified proposal queue across all three properties
- Diff-first review UI (what/why/impact/risk)
- Approve/reject actions with reason logging
- Filters by site/status/agent/run-id

### Success metrics
- Median proposal review time < 24 hours
- 100% of decisions include reason
- Time-to-answer "what changed?" < 30 seconds

---

## Week 3 — Contract v1 freeze + internal standard
**Goal:** reusable system, not custom plumbing

### Deliverables
- v1 contract freeze (discovery/meta/query/propose/audit semantics)
- Error-code standard + idempotency guarantees documented
- "Add new site in 1 day" onboarding playbook
- CLI docs with real workflow examples

### Success metrics
- Breaking changes: 0 after freeze
- New operator can run E2E in < 60 minutes
- 3/3 sites pass conformance checklist

---

## Week 4 — Value proof + scale gate
**Goal:** prove strategic value before expanding scope

### Deliverables
- KPI dashboard:
  - proposal volume
  - approval rate
  - cycle time
  - rollback rate
  - agent-assisted publish throughput
- Three recurring workflows per site (weekly)
- Written go/no-go rubric for onboarding serious-data properties later

### Success metrics
- 2–3x faster edit/release cycle vs manual baseline
- rollback rate < 5%
- >70% of routine edits initiated via proposal flow
- explicit scale decision captured in docs

---

## 5) Guardrails
- Keep `rodaco.co` and `rogergimbel.dev` propose-only until BladeKeeper stability goals are met
- No expansion to BeerPair or other serious-data sites during this 30-day cycle
- Every mutation must be reviewable + reversible
- No silent apply paths

---

## 6) Immediate execution artifact
D1–D30 board is now published at:
- `memory/tasks/agent-first-d1-d30-execution-board.md`

Includes:
- exact tasks,
- owner,
- done criteria,
- command references,
- dependencies/risks.
