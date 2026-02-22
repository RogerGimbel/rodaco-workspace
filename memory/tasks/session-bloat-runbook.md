# Session Bloat Runbook (No Gateway Restart)

## Fast Recovery (when chat gets weird/slow/overflow)
1. `/status` — check context %, compactions, model
2. `/compact Focus on decisions, current task, and next actions`
3. Retry your message
4. If still degraded: `/new continue from memory/tasks/CURRENT.md and today's memory checkpoint`

## Diagnose quickly
```bash
bash /home/node/workspace/bin/session-hygiene
```

## Safe cleanup (non-destructive archive of stale bloated sessions)
```bash
bash /home/node/workspace/bin/session-hygiene --apply
```

This only renames old inactive offender files to `*.jsonl.archived`.

## What counts as bloat
- Session file >= 1MB
- Any single JSONL line >= 100KB (usually giant tool output)
- Session folder total >= 60MB

## Prevention habits
- Never dump full schemas/logs by default; use `head`, `tail`, limits.
- Compact before pain: run `/compact` when context is ~50-60% and rising in tool-heavy tasks.
- Use checkpoints to file so `/new` doesn’t lose continuity.
- Keep work plans in `memory/tasks/CURRENT.md`.
