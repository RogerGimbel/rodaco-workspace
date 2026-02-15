# Mission Control v3 — Lovable Starter Prompt

Copy everything below the line into Lovable as your initial prompt.

---

Build a React dashboard app called "Mission Control" — an AI agent operations dashboard. It connects to an existing API backend. This is a monitoring/ops dashboard, not a CRUD app.

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS (dark mode only)
- React Router (6 pages)
- Recharts for charts/graphs
- D3-force for knowledge graph visualization
- Tanstack Query for data fetching with auto-refresh
- No authentication needed (internal tool)

## API Connection
All data comes from a single API server. Use an environment variable `VITE_API_URL` (default: `http://localhost:3333`) as the base URL. All endpoints are under `/api/v3/`. Enable CORS — the frontend and API run on different ports.

## Design System (STRICT — follow precisely)

**Theme:** Dark mode only. Premium JARVIS/Bloomberg terminal aesthetic — information-dense but clean. Light feel with whitespace, no noise.

**Colors:**
- Background: `#0a0a0f` (near-black with slight blue)
- Card background: `rgba(255, 255, 255, 0.03)` with `backdrop-blur-xl`
- Card border: `rgba(255, 255, 255, 0.06)`
- Primary text: `rgba(255, 255, 255, 0.9)`
- Secondary text: `rgba(255, 255, 255, 0.5)`
- Accent green: `#10b981` (healthy/success)
- Accent red: `#ef4444` (error/critical)
- Accent amber: `#f59e0b` (warning)
- Accent blue: `#3b82f6` (info/links)
- Accent purple: `#8b5cf6` (AI/agent)

**Cards:**
- Background: `bg-white/[0.03] backdrop-blur-xl`
- Border: `border border-white/[0.06]`
- Border radius: `rounded-2xl` (16px) on cards, `rounded-3xl` (20px) on hero cards
- Padding: `p-6` standard, `p-8` for hero sections
- Subtle hover: `hover:bg-white/[0.05] transition-all duration-300`

**Typography:**
- Font: Inter (import from Google Fonts)
- Body: 13-14px
- Labels/metadata: 10-11px uppercase tracking-wider, `text-white/40`
- Numbers/stats: `font-mono text-2xl font-light`
- Section headers: 14px font-medium, no uppercase

**Animations:**
- Stagger card entrance: 0.05s delay per item, fade-up with `opacity-0 → 1, translateY(8px → 0)`
- Skeleton loading states on all cards while data loads (pulsing `bg-white/[0.05]` blocks)
- Smooth number transitions using `transition-all`
- No bouncy/spring animations — everything should feel calm and precise

**Layout:**
- Max width: 1400px centered
- Sidebar navigation (left, 64px collapsed / 240px expanded)
- Navigation icons + labels, active state with subtle `bg-white/[0.05]` pill
- Mobile: bottom tab bar (5 icons), no sidebar
- Responsive breakpoints: `<640px` (mobile), `640-1024px` (tablet), `>1024px` (desktop)

**Status Indicators:**
- Health dots: 8px circles, `bg-emerald-500` (ok), `bg-red-500` (error), `bg-amber-500` (warning), with subtle glow `shadow-[0_0_8px_rgba(16,185,129,0.3)]`
- Use relative timestamps ("3m ago", "2h ago") with tooltips showing absolute time

## Pages

### 1. HOME `/` (default)
Auto-refresh every 15 seconds.

**Top row — two Device Cards side by side:**
Each device card shows: hostname, CPU% (circular progress ring), temperature in °F, RAM% (bar), disk% (bar), uptime.
- `GET /api/v3/device/macbook` → Intel MacBook card
- `GET /api/v3/device/pi` → Raspberry Pi card (has 3 disk entries: root, docker, media)

Response shape for devices:
```json
{
  "hostname": "string",
  "cpu": { "model": "string", "cores": 4, "usagePercent": 12.5, "loadAvg": { "1m": 0.5, "5m": 0.4, "15m": 0.3 } },
  "temperature": { "celsius": 52, "fahrenheit": 125.6 },
  "ram": { "totalGB": 16, "usedGB": 8.2, "availableGB": 7.8, "usagePercent": 51 },
  "disk": { "totalGB": 399, "usedGB": 200, "availableGB": 199, "usagePercent": 50 },
  "uptime": "5 days, 3:22",
  "status": "online"
}
```
Pi also has `drives` array: `[{ name, mount, totalGB, usedGB, availableGB, usagePercent }]`

**Second row — Cron Health:**
- `GET /api/v3/cron-status` → list of cron jobs
- Show as a horizontal row of compact cards, each with: job name, health dot, "last: 3h ago", next run time
- Response: `{ jobs: [{ name, schedule, lastRun, status, note, consecutiveErrors, nextRun }] }`

**Third row — System Overview + Quick Stats:**
- `GET /api/v3/system-overview` → aggregated stats
- Cards: active sessions, sub-agent count, last backup time, gateway health status
- Response: `{ health: { status, channels }, cronJobs: { total, healthy, failing }, activeTaskCount, subAgentCount, lastBackup, timestamp }`

**Fourth row — Activity Feed:**
- `GET /api/v3/activity?limit=20` → recent events
- Scrollable list, each item: timestamp, event type badge, summary text
- Response: `{ events: [{ timestamp, type, summary, source, details }] }`
- Type badges color-coded: message=blue, tool_call=purple, cron_run=green, error=red

### 2. OPS `/ops`
Three tabs: **Tasks** | **Goals** | **Overnight**

**Tasks tab:**
- `GET /api/v3/active-tasks` → `{ tasks: [{ title, status, started, lastUpdate, blockedBy, plan: [] }] }`
- Show each task as an expandable card with status badge, timeline, and plan steps

**Goals tab:**
- `GET /api/v3/goals` → `{ role, projects: [{ name, description, tasks: [] }], antiGoals: [], overnightTasks: [] }`
- Display as categorized lists with checkboxes (read-only)

**Overnight tab:**
- `GET /api/v3/overnight-log?date=YYYY-MM-DD` → `{ date, sections: [{ title, content }] }`
- Date picker to browse past nights
- `GET /api/v3/suggested-tasks` → `{ tasks: [{ id, title, category, reasoning, effort, priority, status }] }`
- Each suggested task has Approve / Reject buttons:
  - `POST /api/v3/suggested-tasks/:id/approve`
  - `POST /api/v3/suggested-tasks/:id/reject`

### 3. AGENT `/agent`
Three tabs: **Status** | **Models** | **Sessions**

**Status tab:**
- `GET /api/v3/agent` → `{ name, model, uptime, identity, capabilities: [] }`
- Hero card with agent name, current model, uptime
- Capabilities shown as subtle tags/pills

**Models tab:**
- `GET /api/v3/agent/models` → `{ models: [{ alias, fullName, bestFor, autoTriggers: [] }] }`
- Grid of model cards, each showing alias, use case, trigger keywords

**Sessions tab:**
- `GET /api/v3/agent/sessions` → `{ active: [{ key, kind, startedAt, messageCount }], recent: [...] }`
- `GET /api/v3/agent/cron-jobs` → `{ jobs: [{ id, name, schedule, enabled, lastRun, lastStatus, nextRun }] }`
- Two sections: active sessions list + cron jobs table

### 4. PROJECTS `/projects`
Two tabs: **BeerPair** | **Ocean One**

**BeerPair tab:**
- `GET /api/v3/projects/beerpair` → `{ status, credits: { used, total }, appStatus, marketingAssets: [], testResults: { total, passed, failed }, recentTests: [] }`
- Status card with credits gauge, app store status, marketing asset list
- Recent test results timeline

**Ocean One tab:**
- `GET /api/v3/projects/ocean-one` → `{ status, seoFindings: [], contentGaps: [], expansionNotes: [] }`
- Findings and gaps as categorized lists

### 5. KNOWLEDGE `/knowledge`
Three tabs: **Graph** | **Search** | **Timeline**

**Graph tab:**
- `GET /api/v3/knowledge/graph` → `{ nodes: [{ id, label, type, path }], edges: [{ source, target }] }`
- Interactive force-directed graph using D3-force rendered on a canvas/SVG
- Node colors by type: person=blue, project=purple, infrastructure=green, company=amber
- Click a node → side panel shows entity detail from `GET /api/v3/knowledge/entity?path=<path>`
- Zoom, pan, drag nodes

**Search tab:**
- `GET /api/v3/knowledge/search?q=term` → `{ results: [{ path, snippet, score, lastModified }] }`
- Search input with results list, snippet preview, relevance score bar

**Timeline tab:**
- `GET /api/v3/knowledge/timeline` → `{ days: [{ date, wordCount, fileCount, sections: [] }] }`
- GitHub-style heatmap grid (365 days), color intensity = word count
- Click a day → show that day's sections below

### 6. RESEARCH `/research`
Single scrollable page with three sections:

- `GET /api/v3/research/openclaw` → `{ entries: [{ date, finding, source, actionable }] }`
- `GET /api/v3/research/competitive` → `{ analyses: [{ date, competitor, findings }] }`
- `GET /api/v3/research/marketing` → `{ ideas: [{ title, platform, status, content }] }`

Each section is a list of expandable cards.

## Navigation
Sidebar (desktop) / bottom bar (mobile) with these items:
1. 🏠 Home
2. ⚙️ Ops
3. 🤖 Agent
4. 📦 Projects
5. 🧠 Knowledge
6. 🔬 Research

## Important Implementation Notes
- All API calls should use Tanstack Query with appropriate cache/stale times (15s for home, 60s for others)
- Handle API errors gracefully — show "Offline" or "Unavailable" states, never crash
- Empty states: show subtle illustration + "No data yet" text
- All timestamps from the API are ISO 8601 — display as relative ("3m ago") with absolute tooltip
- The API may return partial data or null fields — handle gracefully with fallbacks
- Device cards should show "Offline" with dimmed styling if the API returns `status: "offline"` or SSH fails
- Temperature should display in °F (the API provides both C and F)

## File Structure
```
src/
  components/
    layout/
      Sidebar.tsx
      BottomNav.tsx
      PageHeader.tsx
    shared/
      Card.tsx
      StatusDot.tsx
      SkeletonCard.tsx
      StatNumber.tsx
      RelativeTime.tsx
      TabGroup.tsx
    home/
      DeviceCard.tsx
      CronHealthRow.tsx
      ActivityFeed.tsx
      SystemOverview.tsx
    ops/
      TaskCard.tsx
      GoalsList.tsx
      OvernightLog.tsx
      SuggestedTasks.tsx
    agent/
      AgentHero.tsx
      ModelCard.tsx
      SessionList.tsx
      CronJobTable.tsx
    projects/
      BeerPairDashboard.tsx
      OceanOneDashboard.tsx
    knowledge/
      ForceGraph.tsx
      SearchPanel.tsx
      TimelineHeatmap.tsx
      EntityDetail.tsx
    research/
      ResearchSection.tsx
  pages/
    Home.tsx
    Ops.tsx
    Agent.tsx
    Projects.tsx
    Knowledge.tsx
    Research.tsx
  hooks/
    useApi.ts (Tanstack Query wrappers for each endpoint)
  lib/
    api.ts (fetch wrapper with base URL)
    formatters.ts (relative time, number formatting)
  App.tsx
  main.tsx
```

Build the complete app with all 6 pages, real API integration, loading states, error states, and responsive layout. Make it feel like a premium operations dashboard — calm, information-dense, and beautiful.
