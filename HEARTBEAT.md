# HEARTBEAT.md - Checkpoint Loop

## SELF-HEALTH CHECK (every heartbeat — run FIRST)
Run: `/home/node/workspace/bin/health-check`
- If severity "ok" or "warn" → log and continue
- If severity "critical":
  1. Flush memory to `memory/YYYY-MM-DD.md` immediately
  2. Run `/home/node/workspace/bin/self-heal "auto: <issues>"`
  3. Do NOT continue with other heartbeat tasks (restart imminent)
- Parse JSON output for: zombies, disk_pct, gateway_health, ssh_to_host, stale_locks
- If ssh_to_host is false → alert Roger (self-heal capability lost)

## MISSION CONTROL SERVER (every heartbeat)
Ensure Mission Control dashboard is running on port 3333:
1. Run: `bash /home/node/workspace/mission-control/start.sh`
2. If it fails, check `/tmp/mission-control.log` for errors
URL: http://100.124.209.59:3333

## MEDIA STACK CHECK (once per day, ~midday)
If 20+ hours since last media stack check:
1. SSH to Pi: `docker ps --filter health=unhealthy --format {{.Names}}`
2. If unhealthy containers exist, check healer status: `systemctl status healer.service`
3. Only alert Roger if self-healing has failed (container unhealthy for >10 min)
4. Update lastMediaCheck in heartbeat-state.json

## CHECKPOINT ROUTINE (every heartbeat)

### 1. Memory Flush Check
- [ ] Context getting full or bloated? → Flush summary to `memory/YYYY-MM-DD.md`
- [ ] Learned something permanent (preference, pattern, lesson)? → Write to `MEMORY.md`
- [ ] New capability or workflow discovered? → Save to `skills/` or document in memory

### 2. Trigger-Based Writes (don't just wait for timer)
After ANY of these, checkpoint immediately:
- Major learning or insight
- Completing a significant task
- Before any restart or config change
- Context feeling cluttered

### 3. Fact Extraction (every heartbeat)
Review the last few conversation exchanges. If any durable facts emerged:
- Status changes, milestones, new decisions → update relevant `knowledge/*/summary.md`
- New entities mentioned → create summary.md + add to `knowledge/INDEX.md`
- Relationship updates (person↔project, infra changes) → update both sides
- Skip: casual chat, temporary info, already-captured facts

### 4. Quick Status
- [ ] Any pending tasks from MISSION_CONTROL.md that need attention?
- [ ] Anything urgent from overnight work?

## MOLTBOOK CHECK (every 4+ hours)
If 4+ hours since last Moltbook check:
1. Check claim status: `GET /api/v1/agents/status` with Bearer token
2. If claimed: Check feed for interesting posts
3. Engage if something valuable (upvote, comment, post)
4. Update lastMoltbookCheck in memory/heartbeat-state.json
API Key: stored in ~/.config/moltbook/credentials.json

## OPENCLAW NEWS SCAN (overnight build - 2 AM)
During overnight build, search X for OpenClaw developments:
1. Use bird (Grok-powered) to search for:
   - "openclaw integration OR openclaw technique OR openclaw setup"
   - "openclaw plugin OR openclaw mcp OR openclaw tool"
   - "openclaw released OR openclaw announcing OR openclaw new feature"
2. Analyze top 15-20 results for:
   - New integrations or tools
   - Innovative techniques/setups
   - Product announcements
   - Interesting use cases
3. Save findings to `memory/openclaw-news-YYYY-MM-DD.md`
4. Include summary in morning briefing (7 AM)

## THE RULE
**Context dies on restart. Memory files don't.**
Write early, write often. Future turns pull from memory files, not chat history.
The agent that checkpoints often remembers way more than the one that waits.
