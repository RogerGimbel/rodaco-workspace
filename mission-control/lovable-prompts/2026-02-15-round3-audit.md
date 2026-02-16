# Lovable Prompts — Round 3 Audit (2026-02-15)
## Full walkthrough: every page, every tab, mobile, plus creative enhancements

---

## 🔴 CRITICAL 1: Hero Card Shows "Unknown" for Model/Version

```
The Rodaco Status hero card at the top of the Home page shows "⚡ Rodaco Unknown" — the model and version fields aren't populating.

The API /api/v3/agent returns:
{
  "name": "Rodaco",
  "model": "Grok 4.1 Fast (2M context, web/X search built-in)",
  "uptime": 354.8,
  "roles": [{"title": "CEO", "description": "Strategic Leadership"}, ...]
}

Note: there's no "version" field in this endpoint. The version comes from /api/v3/health:
{"status": "ok", "uptime": 354.8, ...}

But the OpenClaw version (2026.2.14) isn't in either endpoint currently.

Fix:
1. Fetch /api/v3/agent for name, model, uptime, roles
2. Display: "⚡ Rodaco" + "Online" with pulsing green dot + model name (just "Grok 4.1 Fast", trim the parenthetical) + uptime formatted as "Xd Xh"
3. If the API call fails, show "⚡ Rodaco" + "Connecting..." with a yellow pulsing dot instead of "Unknown"
4. Don't show "Unknown" as literal text — it looks broken
5. The roles array is interesting — consider showing the 4 role titles as small subtle badges: CEO · CTO · CIO · CMO
```

---

## 🔴 CRITICAL 2: All Non-Home Pages Show Empty Tab Content

```
MAJOR ISSUE: Every page besides Home renders tab buttons but NO content below them when data loads. Clicking tabs changes the active tab styling but the content area is blank.

Pages affected:
- Ops: Tasks, Goals, Overnight tabs — all empty below tabs
- Agent: Status, Models, Sessions, Providers — all empty
- Projects: BeerPair, Ocean One, Dashboard, Activity — all empty  
- Knowledge: Graph, Search, Timeline — all empty
- Research: Marketing Ideas, Competitive Analysis — all empty

This is likely because the error boundary catches the API failure and renders nothing, OR the tab content components aren't actually fetching/rendering data.

Fix for ALL pages:
1. Each tab should show a loading skeleton while fetching data
2. If the fetch fails, show the error card: "Failed to load [section]. Refresh to try again." with Retry button
3. If the fetch succeeds but data is empty, show an appropriate empty state
4. NEVER show just blank space below tabs — always show loading, error, empty, or content

Test by clicking every single tab on every page and verifying content appears.
```

---

## 🔴 CRITICAL 3: Mobile Sidebar Doesn't Collapse

```
On mobile viewport (375px), the sidebar navigation appears to still be visible as a fixed column, pushing the main content area to be very narrow.

Fix:
1. On mobile (<768px), the sidebar should collapse into a hamburger menu icon at top-left
2. Tapping the hamburger slides the sidebar in as an overlay (with a dark backdrop)
3. Tapping a nav item closes the sidebar and navigates
4. Tapping the backdrop closes the sidebar
5. The "M Mission Control" header should become a compact top bar on mobile with just the hamburger icon + "MC" text
6. Main content should use full viewport width on mobile
7. Add a bottom navigation bar on mobile as an alternative: 6 icons for Home/Ops/Agent/Projects/Knowledge/Research (like a native app)
```

---

## 🟡 FIX 4: Ops Page — Overnight Tab Has Bare Date Input

```
The Overnight tab on the Ops page shows a date input field (2026-02-15) with no context or label.

Fix:
1. Add a label: "View overnight log for:"
2. The date picker should default to today
3. Below the date picker, show the overnight log content for that date from /api/v3/overnight-log
4. The log content is rich markdown — render it properly with:
   - Headers (####) as bold section titles
   - Bullet lists properly formatted
   - Code blocks with monospace styling
   - Bold text (**text**) rendered correctly
5. Add quick navigation: "← Previous Day" and "Next Day →" buttons flanking the date picker
6. Below the log, show the Overnight History timeline from /api/v3/overnight-history
```

---

## 🟡 FIX 5: Agent Page — Rich Data Not Being Used

```
The /api/v3/agent endpoint returns rich personality data that should be displayed on the Status tab:

{
  "name": "Rodaco",
  "model": "Grok 4.1 Fast",
  "uptime": 354.8,
  "personality": "Concise when needed, thorough when it matters...",
  "traits": ["Have strong opinions.", "Never open with filler.", "Brevity is mandatory.", ...],
  "roles": [{"title": "CEO", "description": "Strategic Leadership"}, ...]
}

Build a visually interesting Status tab:
1. Agent Identity Card:
   - Name "Rodaco" large, with ⚡ icon
   - Model name as a badge
   - Uptime formatted nicely
   
2. Roles Section:
   - 4 role cards in a 2x2 grid: CEO, CTO, CIO, CMO
   - Each card shows title (large) + description (small)
   - Subtle icon for each: 👔 CEO, 💻 CTO, 📊 CIO, 📣 CMO

3. Personality Section:
   - Quote block with the personality text (italic, bordered left)
   
4. Traits:
   - Show as a tag cloud or horizontal badge list
   - Each trait as a small pill/chip

5. Session Health below (from /api/v3/metrics/session-health)
```

---

## 🟡 FIX 6: Projects Page — BeerPair Has Rich Data to Display

```
The BeerPair project API returns lots of useful data that should populate the BeerPair tab:

{
  "name": "BeerPair",
  "status": "live",
  "url": "beerpair.com",
  "description": "...",
  "credits": {"used": 0, "total": 10},
  "testResults": [],
  "appStoreStatus": "pending",
  "marketingAssets": [24 items],
  "techStack": ["Frontend: Vite + React", "Backend: Supabase", "Hosting: Vercel", ...],
  "team": [...],
  "currentWork": [...],
  "history": [...],
  "keyFiles": [...]
}

Build:
1. Header: "BeerPair" + status badge ("Live" in green) + link to beerpair.com (external link icon)
2. Description paragraph
3. Stats row: Credits (0/10 progress bar), App Store Status badge ("Pending" in yellow), Marketing Assets (24 count)
4. Tech Stack: horizontal badges/pills for each item
5. Current Work: as a checklist/task list
6. History: as a collapsible timeline
7. Marketing Assets: collapsible section, grouped by type (images, docs, etc.), count per type
8. Team: small avatar circles or name badges

Ocean One tab should show similar treatment with its data (services, automation goals, SEO findings, content gaps).
```

---

## 🟡 FIX 7: Knowledge Search — Add Search Input

```
The Knowledge Search tab needs a functional search input.

The search input should:
1. Show a search icon + text input: "Search knowledge base..."
2. On submit (enter key or search button), fetch /api/v3/knowledge/search?q=QUERY
3. Results appear as cards below:
   - Entity name (bold)
   - Snippet of matching content
   - Entity type badge (people/projects/infrastructure)
   - Click to expand full details
4. Show result count: "Found X results for 'query'"
5. Empty state before searching: "Search across all entities, daily notes, and memory"
6. No results state: "No results found for 'query'" with suggestions
7. Debounce the input (300ms) for live search as you type
```

---

## 🟢 ENHANCEMENT 8: Add a Command Palette / Quick Actions

```
Add a keyboard shortcut (Cmd+K or Ctrl+K) that opens a command palette overlay:

1. Search bar at top: "Type a command or search..."
2. Quick navigation: type page name to jump there (Home, Ops, Agent, etc.)
3. Quick actions:
   - "Refresh all data" — triggers global refresh
   - "View health score" — jumps to System Health
   - "Search knowledge: [query]" — searches knowledge graph
   - "View [project name]" — jumps to project tab
4. Recent items: show last 5 actions/navigations
5. Fuzzy matching on all items
6. Navigate with arrow keys, select with Enter, dismiss with Escape
7. Subtle backdrop blur behind the palette

This is a power-user feature that makes the dashboard feel premium and fast.
```

---

## 🟢 ENHANCEMENT 9: Add Real-Time WebSocket Status Indicator

```
Add a subtle connection status indicator in the top-right area (near the "Live Updated Xs ago" text):

1. When data loads successfully: green dot + "Live" + relative timestamp
2. When an API call fails: yellow dot + "Degraded" — show which endpoint failed
3. When ALL API calls fail: red dot + "Offline" — show "API unreachable" message
4. Add a hover tooltip showing:
   - Last successful refresh time
   - Number of endpoints healthy vs failing
   - Next auto-refresh countdown

Currently the "Live Updated Xs ago" exists but it could be more informative about the actual connection health.
```

---

## 🟢 ENHANCEMENT 10: Suggested Tasks on Ops Page

```
The API has a /api/v3/suggested-tasks endpoint with actionable suggestions:

{
  "tasks": [
    {"id": "st-001", "title": "Set up BeerPair error monitoring", "category": "infrastructure", "reasoning": "App is live with real users...", "effort": "medium", "priority": "high", "status": "pending"},
    ...
  ]
}

Add a "Suggested Tasks" section to the Ops page (below the existing tabs, or as a 4th tab):
1. Each task as a card showing: title, priority badge (high=red, medium=yellow, low=green), effort badge, category tag
2. Expand to see "reasoning" text
3. Two action buttons per task: "Approve" (POST /api/v3/suggested-tasks/:id/approve) and "Dismiss" (POST /api/v3/suggested-tasks/:id/reject)
4. Approved tasks move to a "Planned" section
5. This gives Roger a quick way to triage AI-generated task suggestions
```

---

## 🟢 ENHANCEMENT 11: Dark/Light Theme Toggle

```
The dashboard is currently dark-mode only. Add a theme toggle:

1. Small sun/moon icon button in the sidebar footer or top-right header
2. Click toggles between dark and light themes
3. Save preference to localStorage
4. Light theme: white/gray backgrounds, dark text, same accent colors
5. Keep the JARVIS/Bloomberg vibe in dark mode — light mode should feel clean and professional (like Linear or Notion)
6. Default to dark mode (current)
7. Respect system preference (prefers-color-scheme) on first visit
```

---

## 🟢 ENHANCEMENT 12: Add Breadcrumbs + Page Context

```
Add contextual breadcrumbs below the page title on all pages:

1. Home: just "Home" (no breadcrumb needed)
2. Ops > Tasks: "Ops / Tasks"
3. Agent > Models: "Agent / Models"  
4. Projects > BeerPair: "Projects / BeerPair"
5. Knowledge > Search: "Knowledge / Search"
6. Research > Marketing Ideas: "Research / Marketing Ideas"

Breadcrumbs should:
- Be clickable (clicking "Projects" goes back to default tab)
- Show the current active tab
- Use muted text with "/" separator
- Sit right below the page heading, above the tab buttons
- Help orientation, especially on mobile where context can be lost
```

---

## 🟢 ENHANCEMENT 13: Add Keyboard Navigation

```
Add keyboard shortcuts for power users:

1. Number keys 1-6 navigate to pages: 1=Home, 2=Ops, 3=Agent, 4=Projects, 5=Knowledge, 6=Research
2. Tab/Shift+Tab cycles through tabs within a page
3. R = refresh current page data
4. ? = show keyboard shortcut help overlay
5. Escape = close any open modal/overlay

Show a small "?" icon in the bottom-right corner that opens the shortcut reference.
Don't capture keystrokes when user is typing in an input field.
```

---

## 🟢 ENHANCEMENT 14: Add Notification Toast System

```
Add a toast notification system for real-time feedback:

1. When data refreshes successfully: brief green toast "Data refreshed" (auto-dismiss 2s)
2. When an API call fails: orange toast "Failed to load [section]" (stays until dismissed or retry succeeds)
3. When a suggested task is approved/dismissed: green toast "Task approved" / "Task dismissed"
4. When the Command Palette action completes: confirmation toast

Toast position: bottom-right
Style: glass card matching the dashboard aesthetic, subtle slide-in animation
Max 3 toasts stacked at once, oldest auto-dismiss first
```

---

## 🟢 ENHANCEMENT 15: Add "Last 24 Hours" Summary Card

```
Add a "Today's Summary" card to the Home page (between the hero card and device cards):

Compile data from multiple endpoints:
- Total API calls today (from /api/v3/usage byDay for today)
- Total cost today (from /api/v3/metrics/costs, "today" field)  
- Active sessions count
- Cron jobs that ran today (count from /api/v3/cron-status jobs where lastRun is today)
- Overnight build summary (one-liner from /api/v3/overnight-log)

Display as a single-row card with 5 mini stats:
📊 API Calls: 480 | 💰 Cost: $2.04 | 🔄 Sessions: 2 | ⏰ Cron Runs: 8 | 🌙 Build: "MC v3 audit — 23min"

This gives an instant "what happened today" snapshot.
```

---

## Implementation Order

### Wave 1 — Critical Fixes (do these first)
1. **Critical 2** — Fix empty tab content on ALL pages (biggest UX issue)
2. **Critical 3** — Mobile sidebar collapse + hamburger menu
3. **Critical 1** — Hero card "Unknown" text

### Wave 2 — Content Rendering
4. **Fix 5** — Agent Status tab with personality/roles
5. **Fix 6** — BeerPair/Ocean One project data
6. **Fix 4** — Overnight tab with date picker + markdown
7. **Fix 7** — Knowledge search input

### Wave 3 — Creative Enhancements
8. **Enhancement 15** — Today's summary card
9. **Enhancement 10** — Suggested tasks on Ops
10. **Enhancement 9** — Connection status indicator
11. **Enhancement 14** — Toast notifications
12. **Enhancement 8** — Command palette (Cmd+K)
13. **Enhancement 12** — Breadcrumbs
14. **Enhancement 13** — Keyboard navigation
15. **Enhancement 11** — Dark/light theme toggle
