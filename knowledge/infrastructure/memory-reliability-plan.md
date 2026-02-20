# Memory Reliability Plan (3 Phases)

Updated: 2026-02-19
Owner: Roger + Rodaco

## Goal
Make memory resilient to compaction, crashes, and long-running multi-agent work.

## Phase 1 — Config Hardening (implemented)
- Raise memory flush threshold to trigger before destructive compaction pressure.
- Upgrade memory flush prompts to capture durable information only:
  - decisions
  - state changes
  - lessons
  - blockers/risks
  - explicit next actions + owner
- Relax context pruning to preserve useful near-term continuity.

## Phase 2 — Recall Enforcement (implemented)
- Enforced lookup-first behavior for memory-sensitive prompts (decisions, dates, prior work, preferences, todos).
- Applied to high-impact cron jobs:
  - Morning Brief
  - Overnight Build
  - Weekly Knowledge Synthesis
  - daily-ai-digest
- Rule text added directly in prompt payloads so scheduler runs with recall enforcement live.

## Phase 3 — Shared Memory Architecture (implemented baseline)
- Created shared canonical docs:
  - `shared/USER_PROFILE.md`
  - `shared/TEAM_CONVENTIONS.md`
  - `shared/ACTIVE_PRIORITIES.md`
- Added promotion docs:
  - `knowledge/infrastructure/obsidian-memory-promotion-pipeline.md`
- Cadence defined:
  - daily capture
  - weekly synthesis/deduplication

## Rollback
If recall quality or continuity degrades after Phase 1:
- reduce pruning strictness changes first,
- keep flush prompt improvements,
- retune threshold (e.g. 30k instead of 40k).
