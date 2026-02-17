# CURRENT TASK

*Updated 2026-02-17 13:13 ET*

## TL;DR
Reorganizing MEMORY.md — moving operational/tool/infra reference to TOOLS.md. Keeping MEMORY.md lean (<5KB) for actual memory.

## Status: ACTIVE

## Task: MEMORY.md → TOOLS.md Reorganization

### Safety Plan
1. Before any edits: git commit current state of MEMORY.md and TOOLS.md as backup
2. All changes are to workspace files only (no infra, no config, no external systems)
3. Recovery: `git checkout -- MEMORY.md TOOLS.md` reverts everything instantly

### Step-by-Step Plan

- [ ] Step 0: Git commit MEMORY.md + TOOLS.md as-is (backup snapshot)
- [ ] Step 1: Move "My Tools (Quick Reference)" section → TOOLS.md
- [ ] Step 2: Move "npm Install Gotchas (Lovable Sites)" → TOOLS.md
- [ ] Step 3: Move "Key Infrastructure" section → TOOLS.md
- [ ] Step 4: Move "Model Routing Policy" → TOOLS.md
- [ ] Step 5: Move tool-specific lessons from "Lessons Learned" → TOOLS.md
  - Agent-browser screenshots workaround
  - MC build deploy recipe
  - Light mode theming rule
- [ ] Step 6: Remove stale "Queued Projects" (all 3 items completed today)
- [ ] Step 7: Remove duplicate "Security Boundaries" (already in SOUL.md + AGENTS.md)
- [ ] Step 8: Review final MEMORY.md — should be <5KB, only personal context + lessons + active projects
- [ ] Step 9: Review final TOOLS.md — should have all operational reference, organized
- [ ] Step 10: Git commit the reorganized files

### What stays in MEMORY.md (actual memory)
- Active Projects (pointers to knowledge/)
- Roger's Preferences
- Non-tool Lessons Learned (session crashes, CURRENT.md discipline, cron crash recovery, etc.)
- Master Plan pointer
- Deep Reference pointers

### What moves to TOOLS.md (operational reference)
- Tool command reference (email, bird, gh, agent-browser, image gen, video gen, save, summarize)
- Infrastructure IPs/ports/services
- npm install gotchas
- Model routing policy
- Build/deploy recipes
- Tool-specific workarounds

### Recovery
If anything breaks: `git checkout -- MEMORY.md TOOLS.md`

### Previous Work (today)
- rodaco.co v1 deployed (ef98123, 240df59)
- rogergimbel.dev v2 deployed (38a5f00)
- Both sites: dev→GitHub→Lovable→production pattern validated
