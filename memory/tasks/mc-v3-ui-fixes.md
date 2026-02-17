---
tags: [task, mission-control, frontend, overnight-build]
created: 2026-02-16
status: active
---
# MC v3 UI Fixes — Overnight Build Task

## Context
Full audit completed 2026-02-16. Major contrast overhaul deployed (~150 text-white refs replaced). These 14 items remain. Screenshots for reference in `mc-screenshots/final-*.png` and `mc-screenshots/audit-*.png`.

## Build Pipeline
1. Edit source in `/home/node/workspace/rodaco-mc/src/`
2. Build: `cd /home/node/workspace/rodaco-mc && npm run build`
3. Deploy: `rm -rf /home/node/workspace/mission-control/public/assets && cp -r /home/node/workspace/rodaco-mc/dist/* /home/node/workspace/mission-control/public/`
4. Verify: `agent-browser open "http://100.124.209.59:3333/" --headless && sleep 4 && agent-browser snapshot`
5. Screenshot (save to /tmp first, then copy): `agent-browser screenshot` then `cp /tmp/agent-browser/tmp/screenshots/<latest>.png /home/node/workspace/mc-screenshots/<name>.png`

## Tasks

### P0 — Must Fix
- [x] **1. "active" badge contrast (Ops page)**
  - File: `rodaco-mc/src/components/ops/TaskCard.tsx` line ~28
  - Current: `bg-success/20 text-success` — green text on green-tinted pill, ~3:1 ratio
  - Fix: Change to `bg-success text-white` (solid green bg + white text) or darken text to `text-success-foreground`
  - Also affects: any other status badges using the same pattern (check `bg-success/20 text-success` globally)

- [x] **2. "BeerPair" project tag contrast (Research page)**
  - File: `rodaco-mc/src/components/research/MarketingKanban.tsx`
  - Current: orange text on pale orange pill, ~2.8:1 ratio
  - Fix: Same pattern — solid `bg-warning text-white` or darken the text color
  - Search for: `bg-warning/` patterns across research components

- [x] **3. Knowledge "Other" x3 dedup** (verified: all filesystem categories already in CATEGORY_META — no orphans found)
  - File: `rodaco-mc/src/components/knowledge/ForceGraph.tsx` — `CATEGORY_META` object
  - API: `mission-control/src/routes/api-v3.js` — knowledge graph endpoint
  - Issue: Some API categories still don't have entries in CATEGORY_META, falling to "Other"
  - Fix: Run `curl -s http://localhost:3333/api/v3/knowledge/graph | node -e "..."` to get all unique categories, then add missing ones to CATEGORY_META

### P1 — Should Fix
- [x] **4. Broken Unicode in Last Backup card (Home)**
  - File: `rodaco-mc/src/components/home/` — whichever component renders backup status
  - Issue: Checkmark emoji (✓) rendering as □ boxes in headless Chromium
  - Fix: Replace emoji with Lucide icon `<Check />` or use HTML entity `&#10003;`

- [x] **5. "ACTIVE TASKS" duplicate label (Home)**
  - File: `rodaco-mc/src/pages/Home.tsx`
  - Issue: Summary stat card shows "Active Tasks: 1" AND a detail section below shows "Active Tasks" with the task name
  - Fix: Rename the detail section to "Current Task" or "Task Details"

- [x] **6. Gateway latency semantic color (Home)**
  - File: `rodaco-mc/src/pages/Home.tsx` or relevant home component
  - Issue: 1647ms gateway latency displayed in neutral gray next to green "Ok" dot
  - Fix: Add threshold coloring — green <500ms, yellow 500-1500ms, red >1500ms

- [x] **7. Cost period toggle active state (Home)**
  - File: `rodaco-mc/src/components/home/CostAnalyticsCard.tsx` line ~57
  - Current: active state uses `bg-muted/70 text-foreground/90` — barely different from inactive
  - Fix: Use `bg-primary text-primary-foreground` or `bg-foreground/10 text-foreground font-semibold`

- [x] **8. Ops empty state improvement**
  - File: `rodaco-mc/src/pages/Ops.tsx`
  - Issue: Single task with vast empty area below, no guidance
  - Fix: Add a subtle "All caught up" message or CTA when task count is low (1-2 items)

- [ ] **9. Agent role card emoji rendering**
  - File: `rodaco-mc/src/components/agent/AgentHero.tsx` — role card section
  - Issue: Emojis render as □ in headless browser (might look fine in real browser)
  - Fix: Only fix if confirmed broken in real Chrome. If so, replace with Lucide icons or SVG

### P2 — Nice to Have
- [x] **10. Pi device card disk label wrapping**
  - File: `rodaco-mc/src/components/home/DeviceCard.tsx`
  - Issue: DOCKER and MEDIA labels + values wrap awkwardly when values are long
  - Fix: Use `whitespace-nowrap` or abbreviate GB values (e.g., "592G / 1.8T")

- [x] **11. System Health bars — no labels**
  - File: `rodaco-mc/src/components/home/HealthScoreCard.tsx`
  - Issue: Horizontal teal bars have zero labels — unclear what each represents
  - Fix: Add small labels (api, gateway, macbook, pi, cron, backups) next to each bar

- [ ] **12. Scroll affordance for bottom stats**
  - File: `rodaco-mc/src/pages/Home.tsx`
  - Issue: Bottom row clipped with no visual hint of more content
  - Fix: Add a subtle fade gradient at the bottom of the scrollable area

- [x] **13. Help button visibility**
  - File: Likely in layout component or `rodaco-mc/src/components/layout/`
  - Issue: `?` icon bottom-right is nearly invisible
  - Fix: Add a subtle background circle or increase opacity

- [ ] **14. Ops skeleton loaders**
  - File: `rodaco-mc/src/pages/Ops.tsx`
  - Issue: Shows bare spinner during API load instead of skeleton cards
  - Fix: Already has `<SkeletonCard>` components — check if they're rendering. May be a timing issue (API is fast enough that spinner shows briefly then content loads)

## Completion Criteria
- All P0 items must pass WCAG AA contrast (4.5:1 for normal text, 3:1 for large text)
- Build must compile cleanly (`npm run build` exits 0)
- Deploy to `mission-control/public/` and verify with agent-browser screenshot
- Checkpoint progress to daily notes after each fix
- Do NOT push to GitHub without Roger's approval

## Last Overnight Run: 2026-02-17
- Items completed: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13]
  - #1 TaskCard status badge: solid bg-success text-white / bg-destructive / bg-warning (was semi-transparent, low contrast)
  - #2 BeerPair project tag: solid bg-warning text-white / bg-info text-white (was pale tinted)
  - #3 Knowledge "Other": Verified all filesystem categories covered in CATEGORY_META — no orphans
  - #4 Backup note unicode: BackupNote component replaces ✓ with Lucide <Check /> icon
  - #5 Active Tasks duplicate: detail section renamed "Current Tasks" in SystemOverview
  - #6 Gateway latency color: green <500ms, yellow 500-1500ms, red >1500ms
  - #7 Cost toggle active state: bg-primary text-primary-foreground with shadow (was barely-visible bg-muted/70)
  - #8 Ops empty state: "Looking good — queue is light" hint when ≤2 active tasks
  - #10 DeviceCard disk labels: truncate + whitespace-nowrap prevents wrapping
  - #11 Health bar labels: increased from text-foreground/50 to text-foreground/70
  - #13 Help button: improved to bg-muted/80 text-foreground/60 (was nearly invisible)
- Items attempted but failed: none
- Items not attempted: #9 (emoji rendering - needs real Chrome to confirm), #12 (scroll affordance), #14 (ops skeleton loaders)
- Remaining: 3 items (#9, #12, #14)
- Build: ✅ Clean (9.82s), deployed to mission-control/public/
