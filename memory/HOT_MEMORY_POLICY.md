# Hot Memory Policy (Context-Control)

Goal: preserve continuity without bloating every session bootstrap.

## 1) Keep boot-loaded files lean
- `MEMORY.md`: <= ~120 lines, hot state only.
- `memory/tasks/CURRENT.md`: current task + next action only.
- `memory/YYYY-MM-DD.md`: short checkpoints, not full transcripts.

## 2) Put detail in cold storage
- Cron run details: `memory/logs/cron/YYYY-MM.md`
- Incident detail: `memory/logs/incidents/YYYY-MM.md`
- Deep technical writeups: `knowledge/.../details.md`
- Completed task postmortems: `memory/tasks/archive/`

## 3) Write pattern
- Checkpoint: one short line in daily note.
- Durable lesson: 1-2 bullets in MEMORY.md + pointer.
- Verbose command output: store in logs, then reference path.

## 4) Maintenance cadence
- Weekly: trim MEMORY.md, archive stale detail, keep pointers.
- On context pressure: checkpoint + update CURRENT.md, move detail out of hot files.
