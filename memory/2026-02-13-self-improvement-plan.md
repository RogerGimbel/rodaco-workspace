# Agent Self-Improvement Sprint — 2026-02-13

## Context
Roger asked: "What would improve you?" Three gaps identified:
1. Proactive work (overnight builds, morning briefs) produces nothing — no goals/backlog
2. Knowledge graph is messy — duplicates, stale files, no clean structure
3. No visibility into cron job results — can't self-monitor

## Phase 1: GOALS.md + Task Backlog
**Goal:** Give overnight builds and morning briefs something real to work with.

### 1a. Create GOALS.md
- [ ] Ask Roger about current priorities (Rodaco, BeerPair, Ocean One, infrastructure)
- [ ] Capture: what should I work on overnight? What's useful in a morning brief?
- [ ] Write GOALS.md with: active goals, backlog items, anti-goals (things NOT to do)
- [ ] Include "overnight build candidates" — small tasks I can safely do solo

### 1b. Update cron prompts
- [ ] Rewrite morning brief cron to reference GOALS.md + active-tasks.md
- [ ] Rewrite overnight build cron to reference GOALS.md backlog
- [ ] Both should write results to active-tasks.md

### 1c. Establish the active-tasks.md workflow
- [ ] Morning brief: check what overnight build did, summarize in brief
- [ ] Overnight build: pick from GOALS.md backlog, log work in active-tasks.md
- [ ] Heartbeat: check active-tasks.md for stalled items

## Phase 2: Knowledge Graph Cleanup
**Goal:** Single source of truth, no duplicates, clean structure.

### 2a. Audit and deduplicate
- [ ] Map all duplicate files (knowledge/MEMORY.md vs MEMORY.md, etc.)
- [ ] Pick canonical locations for everything
- [ ] Delete or consolidate duplicates
- [ ] Verify knowledge/INDEX.md is accurate

### 2b. Prune stale files
- [ ] Review knowledge/memory/*.md — these are OLD daily notes that predate memory/*.md
- [ ] Archive or remove if already captured in memory/ or MEMORY.md
- [ ] Review knowledge/chat-history/*.md — assess if still useful
- [ ] Remove knowledge/SOUL.md, knowledge/MISSION_CONTROL.md, knowledge/MORNING_BRIEF_TEMPLATE.md (if they're just copies)

### 2c. Standardize structure
- [ ] All entities: knowledge/{type}/{name}/summary.md
- [ ] All daily notes: memory/YYYY-MM-DD.md (nowhere else)
- [ ] Long-term: MEMORY.md (root, single file)
- [ ] Update AGENTS.md to reflect final structure
- [ ] Run weekly synthesis once manually to validate clean data

## Phase 3: Cron Result Logging + Self-Monitoring
**Goal:** Know if my background jobs are working without Roger telling me.

### 3a. Create cron status log
- [ ] Create `memory/cron-status.json` — tracks last run time + result per job
- [ ] Update backup cron to write success/failure to this file
- [ ] Update morning brief cron to write status
- [ ] Update overnight build cron to write status

### 3b. Add heartbeat check
- [ ] HEARTBEAT.md: read cron-status.json, alert if any job hasn't run in expected window
- [ ] Example: backup hasn't run in 36h → alert Roger
- [ ] Example: morning brief failed → note in next heartbeat

### 3c. Create self-monitoring cron
- [ ] Weekly job: review cron-status.json, check for patterns (repeated failures)
- [ ] Log findings to memory/YYYY-MM-DD.md

---

## Order of Operations (Revised)
1. **Phase 2 first** — knowledge graph cleanup (solo, no Roger input needed)
2. **Phase 3 next** — cron result logging (solo)
3. **Phase 1 last** — GOALS.md (needs dedicated Roger interview, full focus)

## After All Phases
- [ ] Commit and push all changes
- [ ] Update MEMORY.md with lessons learned
- [ ] Update active-tasks.md → mark complete

*Created: 2026-02-13 ~18:00 MT*
*Status: PHASES 2+3 COMPLETE — PHASE 1 WAITING FOR ROGER INTERVIEW*

## Completed
### Phase 2 (Knowledge Graph Cleanup) — Done 2026-02-13
- Removed 11 duplicate files (knowledge/MEMORY.md, SOUL.md, PROACTIVITY.md, MISSION_CONTROL.md, MORNING_BRIEF_TEMPLATE.md, knowledge/memory/*, flat people files, beerpair.md)
- Consolidated BeerPair files into knowledge/projects/beerpair/
- Relocated IMAGE_GENERATION.md to knowledge/tools/
- Cleaned root: removed beerpair-marketing-plan.html, parse-chat-history.py, SOUL.md.bak, MORNING_BRIEF_TEMPLATE.md
- Rewrote knowledge/INDEX.md with clean structure + canonical location rules
- Root now: 8 clean .md files (AGENTS, HEARTBEAT, IDENTITY, MEMORY, MISSION_CONTROL, SOUL, TOOLS, USER)

### Phase 3 (Cron Result Logging) — Done 2026-02-13
- Created memory/cron-status.json with staleness thresholds
- Updated backup, morning brief, overnight build crons to write status
- Added cron health check to HEARTBEAT.md (alert if jobs stale >36h)
- Fixed get-to-know-you: 5 daily jobs → 3 weekly (Mon/Wed/Fri)
- Rewrote overnight build prompt: focused, 30-60 min scope, Sonnet model, reads GOALS.md
- Rewrote morning brief prompt: reads cron-status.json, active-tasks.md, GOALS.md, 10 lines max
