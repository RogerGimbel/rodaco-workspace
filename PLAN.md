---
tags: [plan, master, roadmap]
updated: 2026-02-16
---
# PLAN.md — Master Task List

*The single reference for all open work. Check this before asking "what should I do?"*
*Updated: 2026-02-16 19:05 ET*

---

## 🔴 P0 — Fix Now (Blocking or High-Impact)

### Mission Control v3 — Frontend (14 items)
📄 **Detail:** `memory/tasks/mc-v3-ui-fixes.md`
🔧 **Owner:** Overnight Build (2 AM ET daily) + live sessions
📍 **Pipeline:** Edit `rodaco-mc/src/` → `npm run build` → copy to `mission-control/public/`

- [ ] Badge contrast: "active" badge on Ops — green-on-green, ~3:1 ratio
- [ ] Badge contrast: "BeerPair" tags on Research — orange-on-orange, ~2.8:1
- [ ] Knowledge "Other" x3 dedup — categories missing from CATEGORY_META
- [ ] Broken Unicode in Last Backup card (Home) — emoji → Lucide icons
- [ ] "ACTIVE TASKS" duplicate label (Home) — rename detail section
- [ ] Gateway latency semantic color — green/yellow/red by threshold
- [ ] Cost period toggle active state (Home) — unclear which is selected
- [ ] Ops empty state — no CTA when task list is sparse
- [ ] Agent emoji rendering — role card icons show as □
- [ ] Pi device card disk labels — text wrapping on DOCKER/MEDIA
- [ ] System Health bars — no labels on indicators
- [ ] Scroll affordance — bottom stats row clipped with no hint
- [ ] Help button visibility — nearly invisible `?` icon
- [ ] Ops skeleton loaders — bare spinner instead of skeleton cards

### Mission Control v3 — API (10 items)
📄 **Detail:** `memory/tasks/mc-v3-api-fixes.md`
🔧 **Owner:** Overnight Build sub-agent + live sessions
📍 **Safety:** Stop API before editing, restart after

- [ ] **Model pricing** — all show "unknown"; add pricing lookup map with real per-token costs
- [ ] **Cost tracking** — always $0.00; calculate from token counts × pricing (provider returns zero)
- [ ] **Sub-agent count** — inflated to 1011; filter to recent/active sessions only
- [ ] Performance metrics — all zeros; add response time tracking middleware
- [ ] Cost trend — always null; depends on cost tracking fix
- [ ] Usage by provider — incomplete; aggregate from session JSONL by provider
- [ ] Model usage breakdown for Home page
- [ ] Real session count logic (active vs total)
- [ ] Gateway latency tracking over time
- [ ] Stale lock file cleanup

---

## 🟡 P1 — Memory System Hardening (4 remaining)

📄 **Audit detail:** `memory/2026-02-16-memory-audit.md`

### Done ✅
- [x] Deprecated `active-tasks.md` → CURRENT.md is single source of truth
- [x] Added "TL;DR for Roger" to CURRENT.md
- [x] Boot sequence: staleness check + `git diff --stat`
- [x] Overnight build: Step 0 crash recovery (git diff, task state, API health)
- [x] Context monitoring: tightened thresholds (50%/60%/75%/85%)

### Remaining
- [ ] **"Files in flight" tracking** — When editing multiple files, write to CURRENT.md which files are changed but not yet built/deployed. Crash recovery can then detect incomplete work.
- [ ] **"Last run status" footer on task files** — After each overnight build, append a summary (items completed, items failed, remaining count). Next run reads this for continuity.
- [ ] **MEMORY.md size guard** — Add to Weekly Synthesis cron: check MEMORY.md size, if >4.5KB archive least-critical items to knowledge/
- [ ] **Cron context enrichment** — Add to task-oriented cron prompts: "Read CURRENT.md for main session state"

---

## 🟢 P2 — Enhancements (When Time Allows)

### Mission Control
- [ ] Code-split large chunks (index.js is 857KB)
- [ ] Dark mode verification (all fixes were light-mode focused)
- [ ] Mobile responsiveness audit
- [ ] Add tooltips to truncated text (e.g., BUILD value on Home)

### Memory System
- [ ] Automated pre-compaction CURRENT.md write (may need OpenClaw hook or config)
- [ ] MC dashboard widget: memory system health (file sizes, staleness, search index freshness)
- [ ] Session handoff protocol: one-command "brief me" that reads CURRENT.md + last 2 checkpoints

### Infrastructure
- [ ] Push all changes to GitHub (pending Roger's approval)
- [ ] Clean up stale session files (~1000 in sessions dir)
- [ ] Investigate container OOM (swap permanently full, screenshots SIGKILL)

---

## 📋 How to Use This File

**Live chat:** Roger says "work on MC" → read the P0 section, pick next unchecked item
**Overnight build:** Cron reads task files directly (more detail than this summary)
**After crash/compaction:** Read CURRENT.md first (has TL;DR), then this file for full backlog
**Weekly review:** Check off completed items, reprioritize, add new discoveries

**Task file locations:**
- Frontend detail: `memory/tasks/mc-v3-ui-fixes.md`
- API detail: `memory/tasks/mc-v3-api-fixes.md`
- Memory audit: `memory/2026-02-16-memory-audit.md`
- Current task state: `memory/tasks/CURRENT.md`
