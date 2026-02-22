---
tags: [memory, hot-context, core]
updated: 2026-02-21
---
# MEMORY.md — Hot Context (Lean)

## Active priorities
- **BladeKeeper** live at bladekeeper.app; recent UI/feature sprint complete, awaiting Lovable publish. Vision: photo identify + auto-populate knife attributes.
- **BeerPair** live at beerpair.com; native apps in progress; B2B GTM assets done.
- **Mission Control v3** running on :3333 (combined API + frontend); remaining tasks in `memory/tasks/overnight-queue.md`.
- **Agent-First Web rollout** baseline + pilot complete; roadmap in `knowledge/infrastructure/agent-first-30-day-roadmap.md`.

## Runtime + model policy
- Default model: **Codex GPT-5.3** (`openai-codex/gpt-5.3-codex`).
- **Opus only when Roger explicitly asks**.
- Cron jobs currently pinned to Codex.
- OpenClaw version tracked in infra notes (don’t duplicate here).

## Automation status (high signal)
- Watchdogs: Mission Control + sites are active.
- Daily health check + daily AI digest retained and stabilized (2026-02-21 fixes).
- Get-to-Know-Roger cron jobs removed (Mon/Wed/Fri).

## Roger preferences (durable)
- Keep replies direct, useful, and non-generic.
- Don’t push code help unless asked.
- Don’t push to GitHub without explicit approval.
- Never send emails without explicit approval.
- Founder-led tone for Rodaco/rogergimbel positioning.

## Critical operating lessons
- **CURRENT.md is crash recovery source of truth.**
- “Stale” cron != failed cron. Repeated `status=error` = real problem.
- Cron reliability pattern: lean prompts, bounded output, explicit timeouts, best-effort delivery where appropriate.
- For session bloat: use `bin/session-hygiene` and runbook `memory/tasks/session-bloat-runbook.md`.
- Don’t rely on memory in chat context; checkpoint to files continuously.

## Where details live (read on demand)
- Project index: `knowledge/projects/REGISTRY.md`
- Infra index: `knowledge/INDEX.md`
- Tool/runtime specifics: `TOOLS.md`
- Task state: `memory/tasks/CURRENT.md`
- Daily log: `memory/2026-02-21.md`
- Cron details/history: `memory/logs/cron/`
- Incident logs: `memory/logs/incidents/`
- Hot-memory policy: `memory/HOT_MEMORY_POLICY.md`

## Notes
This file is intentionally compact. Keep only active state + durable rules + pointers.