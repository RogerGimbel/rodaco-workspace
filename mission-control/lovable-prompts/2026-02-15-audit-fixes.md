# Lovable Prompts — Post-Audit Fixes (2026-02-15)
## Generated from live site audit + Roger's screenshots

---

## 🔴 CRITICAL FIX 1: Home Page Card Layout Broken

```
The second row of cards on the Home page has severe layout issues:

1. "Cost Analytics" card title is truncated to "COST ANALY..." and the "$0" value overflows
2. "System Performance" card title truncated to "SYSTE PERFO..." — the card is too narrow
3. These two cards and the Cron Jobs section are crammed together horizontally

Fix the Home page grid layout:
- Row 1 (top): MacBook card, Pi card, System Health card — these look fine, keep as-is (3 equal columns on desktop)
- Row 2 (middle): Cost Analytics, System Performance, Cron Jobs — these need to be 3 equal columns with enough width for full titles
- Row 3 (bottom): Active Tasks, Sub-Agents, Last Backup, Gateway — these stat cards look fine

For the Cost Analytics card:
- Ensure "Cost Analytics" title is fully visible (not truncated)
- The "$0" value should display nicely even when zero
- Add min-width or let the card flex properly

For the System Performance card:
- Ensure "System Performance" title is fully visible
- The "0.0 ms" metrics should be side-by-side but not overlapping
- "0 errors (24h)" badge, slowest/fastest tool badges should stack vertically if space is tight

For the Cron Jobs section:
- Each cron job card should have enough width to show name + last/next times
- Don't truncate job names

General: use CSS grid with `grid-template-columns: repeat(3, 1fr)` for each row, with proper gap. Cards should have `min-width: 0` and `overflow: hidden` with text-overflow: ellipsis only on truly long content, not titles.
```

---

## 🔴 CRITICAL FIX 2: Cron Jobs Show Negative Relative Times

```
On the Home page, the Cron Jobs section shows negative relative times like:
- "Next: -48s ago"
- "Next: -4835s ago" 
- "Next: -15635s ago"

This happens because the frontend calculates relative time from the "next" ISO timestamp, but some jobs have a "next" time that's slightly in the past (the job ran but nextRunAtMs hasn't been updated yet by the gateway).

Fix:
1. If "next" time is in the past, display "Running..." or "Due" instead of a negative time
2. If "next" time is null/undefined, display "—" (dash)
3. For "last" times, always show positive relative time: "4m ago", "19h ago"
4. Never display negative values — clamp to 0 and show "Just now" or "Due now"

The relative time formatting should handle:
- < 60s: "Xs ago" or "just now"
- < 60m: "Xm ago"  
- < 24h: "Xh ago"
- >= 24h: "Xd ago"
```

---

## 🟡 FIX 3: Ops Page Tabs — Content Not Loading Without Data

```
The Ops page has tabs (Tasks, Goals, Overnight) and an Overnight History section below.

Issues to fix:
1. Verify that clicking each tab actually fetches data and renders content
2. The Tasks tab should show expandable task cards from /api/v3/active-tasks
3. The Goals tab should show goal items from /api/v3/goals (may be empty — show "No goals set" empty state)
4. The Overnight tab should show the overnight log from /api/v3/overnight-log
5. Below the tabs, the Overnight History section should show build timeline from /api/v3/overnight-history

For the Overnight History, the API returns:
{
  "builds": [
    {
      "date": "2026-02-15",
      "duration": "23 minutes",
      "tasksCompleted": 0,
      "filesChanged": 0,
      "modelUsed": "unknown",
      "cost": 0,
      "summary": "**Duration**: 23 minutes   **Tasks Completed**: 3"
    }
  ],
  "totalBuilds": 2,
  "avgDuration": 0,
  "totalCost": 0
}

Note: some fields may be 0 or "unknown" — display them gracefully, don't hide cards just because data is sparse. Show "—" for unknown values.
```

---

## 🟡 FIX 4: Agent Page — Verify All 4 Tabs Work

```
The Agent page has 4 tabs: Status, Models, Sessions, Providers.

Verify each tab works:

1. Status tab: Should show agent info from /api/v3/agent
   Response: {"name":"Rodaco","model":"anthropic/claude-opus-4-6","uptime":"...","version":"2026.2.14"}
   Also show Session Health from /api/v3/metrics/session-health

2. Models tab: Should show model cards from /api/v3/agent/models
   Response: {"models":[{"alias":"grok","name":"xai/grok-4-1-fast-non-reasoning","bestFor":"General tasks"},...]}

3. Sessions tab: Should show session list from /api/v3/agent/sessions
   Response: {"sessions":[{"file":"...","startedAt":"...","age":"...","type":"..."},...]}

4. Providers tab: Should show provider usage from /api/v3/usage/providers
   
If any tab shows no content or crashes, add proper loading states and error handling. Each tab should independently fetch its data and show a skeleton loader while loading.
```

---

## 🟡 FIX 5: Projects Page — Verify BeerPair and Ocean One Tabs

```
The Projects page has tabs: BeerPair, Ocean One, Dashboard, Activity.

Check:
1. BeerPair tab loads data from /api/v3/projects/beerpair — should show project details, test results, marketing assets
2. Ocean One tab loads from /api/v3/projects/ocean-one — should show project info
3. Dashboard tab — what does this show? If empty, add "Coming soon" placeholder
4. Activity tab — should filter /api/v3/activity by project keywords

The BeerPair API returns rich data including:
- name, description, status, url
- techStack array
- credits object
- testResults array  
- marketingAssets array

Make sure all of this renders without crashing. Use optional chaining (?.) on all nested properties.
```

---

## 🟡 FIX 6: Knowledge Page — Graph, Search, Timeline Tabs

```
The Knowledge page has 3 tabs: Graph, Search, Timeline.

1. Graph tab: Should render a D3 force-directed graph from /api/v3/knowledge/graph
   - This returns {nodes: [...], edges: [...]} with entity types
   - If the graph library isn't loaded or crashes, show a fallback list view
   - Add error boundary around the graph component

2. Search tab: Should have a search input that queries /api/v3/knowledge/search?q=QUERY
   - Show results as a list of entity cards
   - Empty state: "Search your knowledge base"

3. Timeline tab: Calendar heatmap from /api/v3/knowledge/timeline
   - If no data, show "No daily notes found" empty state

Key: wrap each tab's content in an error boundary so one broken tab doesn't kill the whole page.
```

---

## 🟡 FIX 7: Research Page — Needs Tab Structure

```
The Research page currently shows "Competitive Analysis" and "Marketing Ideas" as headings but they appear to be flat sections, not tabs.

Fix:
1. Add a tab bar: "Marketing Ideas" | "Competitive Analysis"
2. Marketing Ideas tab: Kanban board with 3 columns (Ideas, In Progress, Completed)
   API: /api/v3/research/marketing returns {"ideas": [{title, description, project, category, status},...]}
   All 9 current ideas have status "idea" — they should all appear in the "Ideas" column
   
3. Competitive Analysis tab: Card list
   API: /api/v3/research/competitive returns {"analyses": [{date, title, competitor, findings},...]}
   Currently 2 entries — show as cards sorted by date descending

4. Both tabs should have proper empty states if no data
```

---

## 🟢 ENHANCEMENT 8: Add Error Boundaries Everywhere

```
Add a React Error Boundary component that wraps each major section/card on every page.

When a component crashes, instead of blanking the entire page, show:
- A card-sized error state: red-tinted border, warning icon
- Text: "This section encountered an error"
- "Retry" button that remounts the component
- In development: show the error message (small, muted text)

Wrap these components at minimum:
- Each card on the Home page (MacBook, Pi, Health, Cost, Performance, Cron, Overview, Usage, Activity)
- Each tab content on Ops, Agent, Projects, Knowledge, Research
- The Knowledge Graph visualization (D3 can crash on bad data)

This is critical — one bad API response should never blank the entire app.
```

---

## 🟢 ENHANCEMENT 9: Defensive Data Access

```
Audit ALL components that consume API data and add defensive checks:

1. Always use optional chaining: data?.property instead of data.property
2. Always provide defaults: data?.items ?? [] before calling .map()
3. Always check arrays before .slice(), .map(), .filter(), .forEach()
4. Always check objects before Object.keys(), Object.entries()
5. For numeric displays: (value ?? 0).toFixed(1) instead of value.toFixed(1)
6. For string displays: value ?? "—" instead of value

This prevents the TypeError crashes we've been seeing (like the byDay.slice error).

Common patterns to search for and fix:
- .slice( → add ?. before it or default to []
- .map( → add ?. before it or default to []
- .toFixed( → ensure value is a number first
- .length → ensure it's on an array/string, not undefined
```

---

## 🟢 ENHANCEMENT 10: Console Error Cleanup

```
The site currently shows 17 console errors. Clean these up:

1. Any remaining CORS-related fetch errors should be caught and shown as friendly UI error states (not console errors)
2. Add try/catch around all fetch calls
3. Use a centralized API client with error handling:
   
   async function apiGet(endpoint) {
     try {
       const res = await fetch(`${API_URL}/api/v3/${endpoint}`);
       if (!res.ok) throw new Error(`API ${res.status}`);
       return await res.json();
     } catch (err) {
       console.warn(`API call failed: ${endpoint}`, err.message);
       return null;
     }
   }

4. Components should check for null returns and show error states instead of crashing
```

---

## Implementation Order

1. **Fix 1** (card layout) — most visible issue
2. **Fix 2** (negative times) — data display bug
3. **Enhancement 8** (error boundaries) — prevents future blank screens
4. **Enhancement 9** (defensive data) — prevents future crashes
5. **Fix 3-7** (verify all page tabs work)
6. **Enhancement 10** (console cleanup)
