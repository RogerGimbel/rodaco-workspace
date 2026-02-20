# HEARTBEAT.md - Checkpoint Loop
# Keep this TINY. Heavy work belongs in cron jobs.

## 1. HEALTH (always first)
Run: `/home/node/workspace/bin/health-check`
- Critical → flush memory, run self-heal, STOP
- ssh_to_host false → alert Roger
- If `issues` contains `gateway:transient_unhealthy` or `gateway:still_unhealthy_suppressed`: do **NOT** send a scary outage message; log only.
- Only mention "manual restart" if `issues` contains `gateway:unhealthy` (sustained failure threshold met).
- NEVER send this legacy phrase: "MacBook is up but OpenClaw unhealthy HTTP 000 from health endpoint. Docker may need manual restart."
- Preferred wording for non-critical probe blips: "Transient health probe miss detected; auto-retrying."
- When alerting, include exact issue code(s) from health-check output (e.g., `gateway:unhealthy:000:count=3`) for debugging.

## 2. MISSION CONTROL
Run: `bash /home/node/workspace/mission-control/start.sh`

## 3. ACTIVE TASKS
Read `memory/active-tasks.md` — resume anything stalled or abandoned.
Check `memory/tasks/CURRENT.md` — if status is ACTIVE and Updated timestamp is >1h old, flag it in daily notes as "stale task detected".

## 4. CRON HEALTH
Read `memory/cron-status.json`. Alert Roger if any job is stale:
- morning_brief: >36h since lastRun
- overnight_build: >36h since lastRun
- daily_backup: >36h since lastRun

## 5. NOTES SYNTHESIS (every 3-5 days)
Check `notes/INDEX.md` — if last synthesis >3 days ago:
- Review recent notes for patterns, recurring themes
- Extract durable insights → MEMORY.md or knowledge/ entities
- Update INDEX.md theme sections
- Log synthesis date

## 6. CHECKPOINT
- Context bloated? → flush to `memory/YYYY-MM-DD.md`
- Learned something permanent? → write to `MEMORY.md`
- Major task just completed? → update `memory/active-tasks.md`

## THE RULE
Context dies on restart. Files don't. Write early, write often.
