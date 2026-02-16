# Mission Control v3 - Overnight Build Lovable Prompts
**Created:** 2026-02-16 02:00 AM  
**By:** Rodaco (Overnight Build)

## 🎯 PRIORITY: NEW DATA ENDPOINTS AVAILABLE

The backend API just got 4 **brand new endpoints** with rich data. Frontend needs to display them!

### NEW ENDPOINTS (Add to appropriate pages):

#### 1. `/api/v3/wins` — Recent Achievements
**Returns:** Array of recent wins/completions from daily notes
```json
{
  "wins": [
    {
      "date": "2026-02-15",
      "text": "All new endpoints deployed and tested",
      "category": "General"
    }
  ]
}
```

**Suggested Location:** Home page — add a "🏆 Recent Wins" section below the devices

**Prompt for Lovable:**
```
Add a "Recent Wins" section to the Home page below the device cards.

API: GET /api/v3/wins?limit=5
Response: { wins: [{ date, text, category }] }

Design:
- Show as a compact list with checkmarks
- Each win: ✅ [text] - [date]
- Category badge (BeerPair = amber, Mission Control = blue, Infrastructure = gray, General = slate)
- Max height 200px with scroll
- Light border, subtle background
- Heading: "🏆 Recent Wins"
```

#### 2. `/api/v3/tools/top` — Most-Used Tools
**Returns:** Tool usage stats with error rates
```json
{
  "tools": [
    { "name": "exec", "count": 70, "errors": 0, "errorRate": 0 },
    { "name": "read", "count": 8, "errors": 0, "errorRate": 0 }
  ],
  "totalCalls": 171,
  "uniqueTools": 9
}
```

**Suggested Location:** Agent page — new "Tool Usage" section

**Prompt for Lovable:**
```
Add a "Tool Usage" section to the Agent page (/agent) below the model arsenal.

API: GET /api/v3/tools/top
Response: { tools: [{ name, count, errors, errorRate }], totalCalls, uniqueTools }

Design:
- Horizontal bar chart showing tool counts
- Bars colored by error rate: green (0%), yellow (>10%), red (>25%)
- Show top 10 tools
- Each bar: [tool name] [count] [error rate if >0]
- Summary stats at top: "171 tool calls | 9 unique tools"
```

#### 3. `/api/v3/projects/velocity` — Project Momentum
**Returns:** Weekly activity trends per project
```json
{
  "velocity": {
    "beerpair": {
      "total": 39,
      "week1": 28,
      "week2": 1,
      "week3": 10,
      "week4": 0,
      "momentum": "accelerating",
      "trend": "📈"
    }
  },
  "mostActive": "mission-control"
}
```

**Suggested Location:** Projects page — add velocity indicators to project cards

**Prompt for Lovable:**
```
Enhance the Projects page (/projects) to show project momentum/velocity.

API: GET /api/v3/projects/velocity
Response: { velocity: { [project]: { week1, week2, week3, week4, momentum, trend } }, mostActive }

Design:
- Add a momentum badge to each project card:
  - "accelerating" = green badge with 📈
  - "slowing" = red badge with 📉
  - "steady" = gray badge with →
- Add a sparkline (mini line chart) showing [week4, week3, week2, week1] activity
- Highlight the "mostActive" project with a gold star or crown icon
- Show total mentions as a small counter: "28 mentions this week"
```

#### 4. `/api/v3/knowledge/growth` — Knowledge Base Growth
**Returns:** Knowledge growth over time
```json
{
  "growth": [
    { "date": "2026-02-13", "fileCount": 23 },
    { "date": "2026-02-14", "fileCount": 30 },
    { "date": "2026-02-15", "fileCount": 38 }
  ],
  "current": {
    "files": 45,
    "categories": 8
  }
}
```

**Suggested Location:** Knowledge page — add growth chart at top

**Prompt for Lovable:**
```
Add a "Knowledge Growth" chart to the top of the Knowledge page (/knowledge).

API: GET /api/v3/knowledge/growth
Response: { growth: [{ date, fileCount }], current: { files, categories } }

Design:
- Line chart showing fileCount over time (dates on x-axis)
- Current stats displayed as hero numbers:
  - "45 files | 8 categories"
- Use amber accent color for the line
- Chart height: 150px
- Show trend percentage: "+87% in 3 days" (if data available)
```

---

## 🔧 FIXES NEEDED (From Live Site Audit)

### Fix 1: Backup Alert Not Displaying Properly
**Issue:** Home page shows "Last backup 44h ago" as a warning, but doesn't make it visually prominent

**Prompt:**
```
Fix backup alert display on Home page.

Current: Small gray text "Last backup 44h ago"
Expected: If lastBackup > 24h, show orange/amber warning banner at top of page

API: GET /api/v3/system-overview
Response includes: { lastBackup: "2026-02-14T11:01:00.000Z", lastBackupNote: null }

Design:
- If backup age > 24h and < 48h: amber banner "⚠️ Backup overdue (44h ago)"
- If backup age > 48h: red banner "🚨 CRITICAL: No backup in 2+ days"
- Banner should be dismissible (x button) but reappear on next refresh
- Position: top of home page content, below nav
```

### Fix 2: Overnight History Shows "unknown" Fields
**Issue:** `/api/v3/overnight-history` data is now richer, but frontend may show old format

**Prompt:**
```
Update Overnight History display to use new enhanced API response.

API: GET /api/v3/overnight-history
New response format:
{
  "builds": [{
    "date": "2026-02-15",
    "duration": "23 minutes" | null,
    "durationMinutes": 23 | null,
    "tasksCompleted": 3 | null,
    "modelUsed": "opus" | "sonnet" | "grok" | null,
    "cost": 0.15 | null,
    "summary": "Summary text",
    "highlights": ["Task 1", "Task 2"]
  }],
  "stats": {
    "totalTasks": 45
  }
}

Updates:
- Show "highlights" as bullet points when available
- Display "No data" or "—" for null fields (not "unknown")
- Show modelUsed as badge: opus=purple, sonnet=blue, grok=amber
- If cost is null, hide the cost field entirely (don't show "$0.00")
```

### Fix 3: Add Loading States
**Issue:** Some pages feel slow to load without spinners

**Prompt:**
```
Add loading states to all API-fetching pages.

Pattern:
- Show skeleton loaders for cards while data fetches
- Use Lucide "Loader2" icon with spin animation for charts
- Loading text: "Loading [page name]..."
- If API fails, show: "⚠️ Unable to load data" with retry button

Pages needing loading states:
- Home (devices, cron jobs, system overview)
- Projects (BeerPair, Ocean One)
- Knowledge (graph, timeline)
- Agent (sessions, models)
```

---

## 🎨 ENHANCEMENTS (Nice-to-have)

### Enhancement 1: Live Status Indicators
**Prompt:**
```
Add "live" pulse indicators to show real-time system status.

Locations:
1. Home page device cards:
   - Green pulse dot if device responding (CPU < 90%, temp OK)
   - Red pulse dot if issues detected
   
2. Cron jobs section:
   - Green dot: healthy job (consecutiveErrors === 0)
   - Red dot: failing job
   
Animation: subtle pulse every 2s (opacity 0.5 → 1 → 0.5)
```

### Enhancement 2: Command Copy Buttons
**Prompt:**
```
Add copy-to-clipboard buttons for technical info.

Locations:
- Agent page: add copy button next to each model alias
  - Clicking copies the alias (e.g. "sonnet")
- Knowledge page: add copy button to entity file paths
- Any code blocks or API endpoints shown

Use Lucide "Copy" icon, changes to "Check" for 2s after copying
```

### Enhancement 3: Dark Mode Polish
**Prompt:**
```
Audit dark mode contrast and readability.

Issues to fix:
- Ensure all cards have proper border contrast
- Text should be zinc-200 minimum (not zinc-400)
- Accent colors (amber) should be visible on dark bg
- Chart axes/labels should be lighter
- Hover states should be obvious (not too subtle)
```

---

## 🧪 TESTING CHECKLIST

After applying these prompts, verify:

- [ ] All 4 new endpoints rendering correctly
- [ ] Loading states show before data loads
- [ ] Error states handle API failures gracefully
- [ ] Backup alert appears when > 24h old
- [ ] Overnight history shows highlights (not "unknown")
- [ ] Project velocity shows momentum badges
- [ ] Tool usage chart displays with error rates
- [ ] Knowledge growth chart renders
- [ ] Recent wins section shows on home page
- [ ] Dark mode colors are readable everywhere
- [ ] Copy buttons work on agent page
- [ ] Live pulse dots animate on device cards

---

## 📊 BACKEND IMPROVEMENTS COMPLETED

### What Changed (2026-02-16 Overnight Build):

1. **Enhanced overnight-history parsing**
   - Now extracts highlights, duration, model, cost from flexible text patterns
   - Returns `null` instead of "unknown" for missing data
   - Added `durationMinutes` for calculations
   - Returns `highlights` array (top 5 bullet points)

2. **NEW: `/api/v3/wins`**
   - Scans daily notes for ✅, COMPLETE, SHIPPED, 🎉, 🚀 markers
   - Auto-categorizes by project (BeerPair, Mission Control, Infrastructure)
   - Deduplicates similar wins

3. **NEW: `/api/v3/tools/top`**
   - Shows most-used tools from session logs
   - Includes error rates per tool
   - Useful for debugging/monitoring

4. **NEW: `/api/v3/projects/velocity`**
   - Tracks mentions of projects in daily notes by week
   - Calculates momentum: accelerating/steady/slowing
   - Shows trend arrows (📈📉→)

5. **NEW: `/api/v3/knowledge/growth`**
   - Tracks knowledge base file count over time
   - Shows current state: files + categories

All endpoints tested and working! ✅

---

## 🚀 DEPLOYMENT NOTES

- Backend changes deployed to `https://mission.rogergimbel.dev`
- No breaking changes to existing endpoints
- All new endpoints return valid JSON (no errors)
- Frontend (https://rodaco-mc.lovable.app) needs updates to consume new data

Feed these prompts to Lovable one at a time for best results. Start with the NEW ENDPOINTS (highest value), then FIXES, then ENHANCEMENTS.
