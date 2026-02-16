---
tags: [memory, audit, architecture, resilience]
date: 2026-02-16
---
# Memory System Audit — Feb 16, 2026

## What We Have (Current Architecture)

### Layer 1: Auto-Injected Context (every turn)
- `MEMORY.md` — 4.3KB hot context, injected via boot-md hook
- `AGENTS.md` — boot sequence instructions, injected via workspace context
- `SOUL.md` — personality/behavior, injected via workspace context
- `TOOLS.md` — local tool notes, injected via workspace context
- `IDENTITY.md` — who I am, injected via workspace context

### Layer 2: Boot Sequence (session start)
- Read `MEMORY.md` (redundant with auto-inject but explicit)
- Read `memory/active-tasks.md`
- Read `memory/YYYY-MM-DD.md` (today + yesterday)
- Read `memory/tasks/CURRENT.md`

### Layer 3: Crash Recovery Files
- `memory/tasks/CURRENT.md` — task journal with step-by-step state
- `memory/tasks/mc-v3-*.md` — specific task backlogs
- `memory/active-tasks.md` — broader task tracker

### Layer 4: Compaction Safeguards
- `compaction.reserveTokensFloor: 20000` — floor for post-compaction context
- `memoryFlush.enabled: true` — pre-compaction memory dump
- `memoryFlush.softThresholdTokens: 8000` — trigger threshold for flush

### Layer 5: Periodic Persistence
- `bin/checkpoint` — manual append to daily notes
- `/save` — git commit + push
- Cron: Weekly Knowledge Synthesis (Sundays)
- Cron: Daily Backup (4 AM)

### Layer 6: Semantic Search
- OpenClaw memory_search — 102 files, 601 chunks, OpenAI embeddings
- Sources: memory/*.md + knowledge/*.md + session transcripts

---

## GAPS FOUND

### 🔴 GAP 1: Overnight builds / cron jobs have NO crash recovery
**Problem:** When an isolated cron session (overnight build) crashes mid-task, there's NO mechanism to resume. The next night's run starts fresh from the cron prompt, with no knowledge of what the previous run completed.

**Evidence:** The overnight build task files (`mc-v3-ui-fixes.md`, `mc-v3-api-fixes.md`) use `[x]` checkboxes that the agent marks during work. But if the session crashes BETWEEN marking a checkbox and completing the next task, the intermediate state (half-edited files, uncommitted changes) is invisible to the next run.

**Fix needed:**
- Overnight builds should read task files at start to see what's already done
- They should also check `git status` / `git diff` to detect half-completed work
- Add a "last run status" section to each task file that gets written at the END of each run

### 🔴 GAP 2: Compaction summary loses task-specific context
**Problem:** When OpenClaw compacts, the summary is AI-generated and may miss critical micro-state: "I was on step 3 of 7, the file `X.tsx` has been edited but not built/deployed, the API server is stopped."

**Evidence:** Earlier today, after compaction (170k→22k), I lost the context that the Vite dev server wasn't picking up changes and needed a restart. The compaction summary mentioned the broad task but not the specific operational state.

**Fix needed:**
- CURRENT.md must be updated BEFORE compaction threshold (not after)
- The pre-compaction memory flush should explicitly reference CURRENT.md
- Consider: a pre-compaction hook that forces a CURRENT.md write

### 🔴 GAP 3: active-tasks.md is stale and redundant with CURRENT.md
**Problem:** `active-tasks.md` contains the Infrastructure Overhaul task from earlier today — which is DONE. Meanwhile `CURRENT.md` has the actual current state. Two files claiming to track "what's active" creates confusion.

**Fix:** Merge them. One file. `memory/tasks/CURRENT.md` is the source of truth for "what am I doing right now." `active-tasks.md` should either redirect to it or be deleted.

### 🟡 GAP 4: Boot sequence doesn't verify CURRENT.md is current
**Problem:** AGENTS.md says "read CURRENT.md" but doesn't say "check if the timestamp is stale." If CURRENT.md was last updated 3 days ago, it might contain irrelevant task state that confuses the new session.

**Fix:** Add to boot sequence: "If CURRENT.md `Updated` timestamp is >24h old, treat it as stale — read but don't assume the task is active."

### 🟡 GAP 5: No mechanism to detect "in-progress file edits"
**Problem:** If I crash while editing `rodaco-mc/src/components/home/DeviceCard.tsx`, the file might be half-written or the build might not have been deployed. The next session has no way to know this.

**Fix:** Before major edit sessions, write to CURRENT.md: "Editing files: [list]. Build status: not yet built. Deploy status: not yet deployed." After build+deploy, update it. This way, crash recovery can detect: "Files were edited but never built."

### 🟡 GAP 6: Cron jobs can't access CURRENT.md context
**Problem:** Isolated cron sessions don't inherit main session context. They get their cron prompt and that's it. They CAN read files from the workspace, but the cron prompt has to explicitly tell them to do so.

**Current state:** The overnight build cron prompt DOES say "Read mc-v3-ui-fixes.md" — good. But it doesn't say "Check CURRENT.md for main session state" or "Check git diff for uncommitted changes."

**Fix:** Add to all task-oriented cron prompts:
```
Before starting: check `git diff --stat` to see if there are uncommitted changes from a previous run.
Read `memory/tasks/CURRENT.md` for broader context.
```

### 🟡 GAP 7: MEMORY.md could exceed 5KB target
**Current:** 4.3KB. Growing. Every session adds lessons learned. No automated pruning.

**Fix:** Add to Weekly Knowledge Synthesis cron: "Check MEMORY.md size. If >4.5KB, move least-critical items to knowledge/ or archive."

### 🟢 GAP 8: No "session handoff" protocol for Roger
**Problem:** When Roger asks "what were you working on?" after a crash, I have to read 3-4 files to reconstruct state. This burns context tokens on recovery.

**Fix:** CURRENT.md should have a "TL;DR for Roger" section — 2-3 sentences max that I can paste immediately without reading anything else.

---

## WHAT'S WORKING WELL

1. **MEMORY.md auto-injection** — I always know my tools, projects, infra
2. **Checkpoint command** — fast, low-friction daily note writes
3. **Task-specific files** — mc-v3-ui-fixes.md with exact file paths and instructions
4. **Compaction config** — 20K reserve floor gives meaningful summary space
5. **Memory search** — 601 chunks across 102 files, semantic recall works
6. **Weekly synthesis cron** — prevents knowledge drift
7. **CURRENT.md pattern** — when used correctly, perfect crash recovery

---

## ACTION ITEMS

### Immediate (do now)
- [ ] Merge active-tasks.md content into CURRENT.md, delete or redirect active-tasks.md
- [ ] Add "TL;DR for Roger" section to CURRENT.md
- [ ] Update AGENTS.md boot sequence to check CURRENT.md staleness
- [ ] Add git-diff check to overnight build cron prompt

### Soon (this week)
- [ ] Add "last run status" footer to task files for cron job continuity
- [ ] Add MEMORY.md size check to Weekly Synthesis cron
- [ ] Add "files in flight" tracking to CURRENT.md during edit sessions
- [ ] Update overnight build to check for uncommitted changes before starting

### Future (nice to have)
- [ ] Automated pre-compaction CURRENT.md write (may need OpenClaw hook)
- [ ] Dashboard widget showing memory system health (file sizes, staleness, gaps)
