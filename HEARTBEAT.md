# HEARTBEAT.md - Checkpoint Loop
# Keep this TINY. Heavy work belongs in cron jobs.

## 1. HEALTH (always first)
Run: `/home/node/workspace/bin/health-check`
- Critical → flush memory, run self-heal, STOP
- ssh_to_host false → alert Roger

## 2. MISSION CONTROL
Run: `bash /home/node/workspace/mission-control/start.sh`

## 3. ACTIVE TASKS
Read `memory/active-tasks.md` — resume anything stalled or abandoned.

## 4. CHECKPOINT
- Context bloated? → flush to `memory/YYYY-MM-DD.md`
- Learned something permanent? → write to `MEMORY.md`
- Major task just completed? → update `memory/active-tasks.md`

## THE RULE
Context dies on restart. Files don't. Write early, write often.
