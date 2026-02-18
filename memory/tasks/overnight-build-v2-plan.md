# Overnight Build v2 — Ambitious Features Plan

*Created: 2026-02-17*
*Status: PLANNING (not yet deployed)*

## Philosophy Shift
- **v1 (current):** Work through bug fix lists (mc-v3-ui-fixes.md, mc-v3-api-fixes.md)
- **v2 (proposed):** Full feature development — build new things, not just fix old things

## What Changes

### 1. Model Upgrade
- Current: `anthropic/claude-sonnet-4-5` 
- New: `anthropic/claude-sonnet-4-6` (better coding, instruction following, 1M context)
- Timeout: 1800s → 2400s (40 min, leverage bigger context for larger tasks)

### 2. Task Source: MISSION_CONTROL.md
Instead of hardcoded fix lists, the overnight build reads `MISSION_CONTROL.md` (or a new `memory/tasks/overnight-queue.md`) for:
- Feature requests queued during the day
- Roger can add items: "Build X tonight"
- Agent picks the top item, works it, marks done

### 3. Multi-Project Scope
Not just MC — the overnight build can work on:
- **Mission Control** (rodaco-mc + mission-control API)
- **Rodaco.co** (rodaco-site)
- **rogergimbel.dev** (rogergimbel-site)
- **BeerPair** (if/when Roger adds tasks)
- **Scripts/tooling** (bin/, skills/)

### 4. Smarter Workflow
```
Step 0: Crash recovery (same as v1 — check git diff, read CURRENT.md)
Step 1: Read overnight-queue.md → pick top un-done task
Step 2: Read relevant codebase into context (1M window = entire project)
Step 3: Plan the work (write plan to CURRENT.md)
Step 4: Implement (edit files, build, test)
Step 5: Take screenshots for verification
Step 6: Write summary to daily notes + mark task done in queue
Step 7: If time remains (<30 min used), pick next task
```

### 5. Guard Rails (same as v1)
- ❌ No git push
- ❌ No messages (it's 2 AM)
- ❌ No external API calls
- ❌ No destructive commands
- ✅ Build and deploy locally
- ✅ Write to memory files
- ✅ Take screenshots
- ✅ Spawn sub-agents for parallel work

## overnight-queue.md Format
```markdown
# Overnight Build Queue

## Priority 1 (do tonight)
- [ ] [MC] Add real-time WebSocket updates to Ops page
- [ ] [rodaco.co] Add case study section with BeerPair deep-dive

## Priority 2 (when P1 is done)  
- [ ] [MC] Implement dark/light theme toggle
- [ ] [rogergimbel.dev] Add blog/writing section

## Completed
- [x] [MC] Fix all P0 contrast issues (2026-02-17)
```

## Cron Job Update
The overnight build cron payload needs to be rewritten to:
1. Reference `memory/tasks/overnight-queue.md` instead of hardcoded MC fix lists
2. Use Sonnet 4.6
3. Support multi-project work
4. Leverage 1M context (read entire project into context)

## Migration Plan
1. Create `memory/tasks/overnight-queue.md` with initial tasks
2. Move remaining mc-v3-*-fixes.md items into the queue
3. Update overnight build cron with new payload
4. Test with a manual `cron run` during the day first
5. Monitor first overnight run via morning brief

## Risks
- Bigger scope = more chance of breaking things
- 1M context = higher API costs per run
- Feature dev is harder than bug fixes — may produce incomplete work
- Sub-agent spawns could hit rate limits

## Mitigations
- Guard rails prevent permanent damage (no push, no external)
- CURRENT.md crash recovery means incomplete work is resumable
- Morning brief reviews overnight results
- Queue has explicit priorities — agent doesn't freelance
