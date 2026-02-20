# Obsidian → Canonical Memory Promotion Pipeline

Updated: 2026-02-19

## Objective
Prevent memory drift by promoting raw notes into durable, searchable, canonical memory.

## Layers
1. Raw capture: `notes/` and Obsidian vault notes
2. Operational memory: `memory/YYYY-MM-DD.md`, `memory/tasks/CURRENT.md`
3. Canonical memory: `MEMORY.md`, `knowledge/**/summary.md`, `shared/*.md`

## Promotion Triggers
Promote when content includes:
- decisions made
- preference changes
- stable project state changes
- lessons learned with repeat value
- recurring blockers/risk patterns

## Promotion Steps
1. Collect candidate snippets from daily notes/Obsidian.
2. Classify each snippet:
   - durable fact
   - temporary context
   - discard/noise
3. Write durable facts into canonical destination:
   - personal/team preference → `shared/USER_PROFILE.md` or `MEMORY.md`
   - project state → `knowledge/projects/<name>/summary.md`
   - operating rule → `shared/TEAM_CONVENTIONS.md`
4. If superseded, mark older fact as historical/superseded (do not silently delete truth).
5. Record promotion checkpoint in `memory/YYYY-MM-DD.md`.

## Cadence
- Daily: quick promotion of critical decisions/state changes
- Weekly: synthesis + dedup + stale cleanup

## Quality Standard
- Specific
- Source-linked when possible
- Minimal fluff
- Reversible (clear history when facts change)
