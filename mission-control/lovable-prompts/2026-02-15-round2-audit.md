# Lovable Prompts — Round 2 Audit (2026-02-15)
## Full walkthrough after initial fixes applied

---

## 🔴 CRITICAL FIX 1: Home Page — Backup Alert Shows "999h ago"

```
The System Health card shows a critical alert: "Last backup 999h ago" with a red badge. This is because the health score API can't determine the last backup time and defaults to 999 hours.

Two fixes needed:

1. API-side (I'll fix this): Make the backup check smarter — read the actual backup log or cron status

2. Frontend: When an alert message contains unrealistic values like "999h", display it more gracefully:
   - Instead of "Last backup 999h ago", show "Last backup: unknown" or "Backup status unavailable"
   - The critical red alert is correct if backups are truly failing, but "999h" looks like a bug to a human
   - Consider: if the value is > 168h (1 week), show "over 1 week ago" instead of exact hours
```

---

## 🔴 CRITICAL FIX 2: Home Page — Second Row Layout Still Needs Work

```
Looking at the Home page layout, the second row (Cost Analytics, System Performance, Cron Jobs) is improved but still has issues:

1. Cost Analytics and System Performance are roughly equal width in the left 2/3
2. Cron Jobs takes up the right 1/3 but extends WAY below the other two cards — it lists all cron jobs vertically and creates a massive height mismatch

Fix the layout:
- Row 2 should be 2 columns: left (Cost Analytics + System Performance stacked vertically) and right (Cron Jobs with a max-height and scrollable overflow)
- OR: make it 3 equal columns where the Cron Jobs card has max-height: 400px with overflow-y: auto (scrollable) so it doesn't push the page down
- The Cron Jobs list currently shows ALL jobs (potentially 10+). Limit visible to 5 with a "Show all" toggle
- Add a compact view for cron jobs: just name + green/yellow dot + next run time, one line each
```

---

## 🟡 FIX 3: Home Page — Active Tasks Shows Completed Tasks

```
The bottom stats bar shows "ACTIVE TASKS: 2" but both tasks are actually completed:
- "🔐 SOPS/age Secrets Hardening — ✅ COMPLETE"
- "🖥️ Mission Control v3 — ✅ COMPLETE"

The API (/api/v3/active-tasks) returns these because they're in the active-tasks.md file. But showing "2 active tasks" when both are complete is misleading.

Fix on frontend:
- Parse task titles for "✅ COMPLETE" or "COMPLETE" text
- Show separate counts: "0 active, 2 completed" or just show the active count
- If all tasks are complete, show "All clear ✅" instead of a number
- The task count badge should only count non-completed tasks
```

---

## 🟡 FIX 4: Agent Page — Models Show "cost: unknown" for Everything

```
On the Agent page Models tab, every model card shows "cost: unknown". This isn't helpful.

The API returns:
{"alias": "grok", "model": "Grok 4.1 Fast", "bestFor": "Default - general tasks", "cost": "unknown"}

Fix on frontend:
- If cost is "unknown", don't display a cost field at all — just hide it
- Show only: alias (large), model name (smaller), bestFor description
- Add a visual indicator for the current/default model (green border or star icon)
- The alias should be styled as a monospace badge (it's a command: /model grok)
```

---

## 🟡 FIX 5: Agent Page — Sessions Shows 0

```
The Sessions tab on the Agent page shows 0 sessions, but we clearly have active sessions running.

The API /api/v3/agent/sessions returns {"sessions": []} — the session parser might not be finding session files.

This is an API-side fix (I'll investigate), but on the frontend:
- If sessions is empty, show: "No active sessions found" with a note: "Sessions are transient and may not persist between restarts"
- Don't just show a blank area
```

---

## 🟡 FIX 6: Agent Page — Session Health Shows Warnings

```
The session health API returns real warnings:
- "Lock files detected - possible stale locks" (3 lock files)
- "Heap usage above 80%" (87.4%)

On the Agent Status tab, make sure these warnings are prominently displayed:
- Show as yellow/orange alert cards
- Heap at 87.4% should show a progress bar that's visually in the "warning" zone (yellow/orange)
- Lock file count (3) should be shown with explanation: "3 lock files present — may indicate stale processes"
- Session file size (1.19 MB) is healthy but approaching the 2MB danger zone — show as a progress bar (1.19/2.0 MB)
```

---

## 🟡 FIX 7: Overnight Build History — Most Fields Show "unknown" or 0

```
The Overnight History section on Ops page shows builds, but most data is sparse:
- 5 out of 7 builds show duration "unknown", model "unknown", cost 0, files changed 0
- Only the most recent build (Feb 15) has real duration data

Fix on frontend:
- For builds with all "unknown"/"0" values, show a minimal card: just the date + "Build completed (details unavailable)"
- Don't show "Model: unknown" and "Cost: $0.00" — it looks broken
- For builds WITH data, show the full card with all metrics
- Consider: only show the last 5 builds by default, "Show older" to expand
```

---

## 🟡 FIX 8: Pi Device Card — ROOT Disk Shows Red/Warning at 55%

```
From the screenshot, the Pi card shows ROOT disk bar as red/orange, but it's only at 55% usage (31/58 GB). That's totally fine.

Fix the color thresholds for disk usage bars:
- Green: 0-70%
- Yellow/Orange: 70-85%
- Red: 85-100%

Currently it seems to turn red too early. 55% should be solid green.

Also: the Pi temp shows 118°F — add a note or color code:
- Green: < 140°F (60°C)
- Yellow: 140-158°F (60-70°C)  
- Red: > 158°F (70°C)
118°F = 48°C which is perfectly healthy, should be green.
```

---

## 🟢 ENHANCEMENT 9: Home Page — Add Usage/Activity Below Cron Jobs

```
After scrolling past the cron jobs on the Home page, there should be more content:
- Token Usage chart (from /api/v3/usage) — bar chart or line chart showing daily usage
- Activity Feed (from /api/v3/activity) — recent events stream

From the screenshot these sections seem to be missing or not rendering. Verify:
1. Usage section exists and shows the byDay data as a chart
2. Activity feed exists and shows recent events
3. Both sections have the "failed to load" error state if API is unreachable, not just blank space

The usage data shape is:
{
  "byModel": {"claude-opus-4-6": {input: 774, output: 57893, cost: 0, calls: 480}},
  "byDay": [{"date": "2026-02-14", "input": 126, "output": 1630, "cost": 0}, ...],
  "totals": {input: 774, output: 57893, totalCost: 0}
}

Show: total calls, total tokens, daily trend chart
```

---

## 🟢 ENHANCEMENT 10: Knowledge Graph — Verify D3 Renders

```
The Knowledge Graph has 43 nodes and 50 edges. This is a good amount of data for a force-directed graph.

Verify on the Knowledge > Graph tab:
1. D3 force graph actually renders (not just empty space)
2. Nodes are visible, colored by type (people/projects/infrastructure/companies)
3. Edges connect nodes properly
4. Zoom and pan work
5. Hovering a node shows its name

If D3 isn't rendering, add a fallback: show nodes as a grouped list by type:
- People: Roger Gimbel, Dale, Stuart, ...
- Projects: BeerPair, Ocean One, Mission Control, ...
- Infrastructure: Intel MacBook, Raspberry Pi, ...

Each item clickable to see details from /api/v3/knowledge/entity?path=NAME
```

---

## 🟢 ENHANCEMENT 11: Research Page — Kanban Cards Need Polish

```
The Research page has Marketing Ideas and Competitive Analysis tabs.

For Marketing Ideas (Kanban):
- Currently all 9 ideas have status "idea" — they should all be in the first column
- Each card should show: title (bold), project tag (colored badge: "BeerPair"), category tag
- The card titles contain markdown bold (**text**) — strip the ** markers and just render bold text
- Cards should have subtle hover effect (lift/shadow)

For Competitive Analysis:
- 2 entries available — show as clean cards
- Date prominent, competitor name bold, findings as body text
- The title field contains "— " prefix (e.g., "— Marine Construction Software Landscape") — strip the leading dash

Empty columns in Kanban should show a dashed border with "No items" text
```

---

## 🟢 ENHANCEMENT 12: Global — Page Transition Animations

```
Add subtle page transition animations:
- When navigating between pages (Home → Ops → Agent), fade in the new content
- Tab switches should animate: slide or fade the content
- Cards should have stagger animation on initial load (first card appears, then second 50ms later, etc.)
- Keep animations fast (150-200ms max) — they should feel snappy, not slow

Use CSS transitions or Framer Motion (if already in the project).
Don't animate on auto-refresh — only on initial load and navigation.
```

---

## 🟢 ENHANCEMENT 13: MacBook Card — Show Temperature

```
The MacBook card shows CPU and RAM but no temperature. The API returns temperature: null because macOS doesn't expose CPU temp easily via SSH.

Instead of showing nothing, add:
- A "Model" line: "Intel i7-8850H" (from the API cpu.model field)
- Uptime formatted nicely: "10d 2h" instead of raw "10 days, 1:55"
- Maybe add a subtle "healthy" badge since CPU is at 7%
```

---

## 🟢 ENHANCEMENT 14: Creative — Add a "Rodaco Status" Hero Card

```
Add a special card at the very top of the Home page (before the device cards) — a "Rodaco Status" hero section:

- Left side: Rodaco logo/icon (⚡ emoji or a stylized "R")
- Center: "Rodaco is online" with a pulsing green dot
- Right side: Current model (claude-opus-4-6), uptime, version (2026.2.14)
- Background: subtle gradient (dark to slightly lighter), or a very subtle animated mesh/grid pattern
- Height: compact (80-100px), not too tall

This gives an immediate "everything is running" feeling when you open the dashboard.
Data from /api/v3/agent: name, model, uptime, version
Data from /api/v3/health: status
```

---

## Implementation Order

1. **Fix 2** — Second row layout / cron jobs overflow (most visible)
2. **Fix 8** — Pi disk color thresholds (easy, high impact)  
3. **Fix 1** — Backup alert "999h" display
4. **Fix 3** — Active tasks count (misleading data)
5. **Fix 4** — Hide "cost: unknown" on model cards
6. **Fix 7** — Overnight history "unknown" fields
7. **Enhancement 14** — Rodaco status hero card (wow factor)
8. **Enhancement 9** — Usage/Activity sections
9. **Enhancement 11** — Research card polish
10. **Fix 5-6** — Sessions + session health warnings
11. **Enhancement 10** — Knowledge graph verification
12. **Enhancement 12-13** — Animations + MacBook card
