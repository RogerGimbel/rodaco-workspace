# Mission Control v3 — API-First Dashboard

## Architecture
- **API layer:** Node.js endpoints on existing Mission Control server (port 3333)
- **Frontend:** Separate Vite + React app (Roger builds in Lovable/Cursor)
- **Data source:** Workspace filesystem (markdown + JSON files)
- **No Convex.** No external DB. Files are the database.

## Design Aesthetic (for Roger's frontend)
- Dark mode only
- Glass cards: bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]
- Inter font, 10-14px body text
- Border radius 16-20px on cards
- Stagger animations (0.05s per item)
- Skeleton loading states
- Mobile-first (320px minimum)
- Premium JARVIS/Bloomberg vibe — light feel, whitespace, no noise

## Pages (6 total)

### 1. HOME `/`
System health, cron status, project status cards, quick stats.
Auto-refresh 15s.

### 2. OPS `/ops`
Tabs: Tasks | Goals | Overnight Results
- Active tasks from active-tasks.md
- GOALS.md backlog
- Overnight build logs and findings
- Suggested improvements (approve/reject)

### 3. AGENT `/agent`
Tabs: Status | Config | Sessions
- My identity, model, uptime
- Model arsenal with routing rules
- Active/recent sub-agent sessions
- Cron job list with health status

### 4. PROJECTS `/projects`
Tabs: BeerPair | Ocean One Marine
- BeerPair: test results, credit usage, app store status, marketing assets
- Ocean One: review findings, SEO analysis, expansion notes

### 5. KNOWLEDGE `/knowledge`
Tabs: Graph | Search | Timeline
- **Graph:** Obsidian-style force-directed canvas with wikilink connections (KEEP FROM v2)
- **Search:** Semantic search across all knowledge + memory files
- **Timeline:** Memory heatmap + daily note viewer (KEEP FROM v2)

### 6. RESEARCH `/research`
- OpenClaw research findings
- Competitive analysis logs
- Marketing ideas backlog
- New skills/integrations discovered

---

## API Endpoints

### System & Health
```
GET /api/v3/health
Returns: { status, uptime, memoryUsage, containerHealth, diskUsage }
Source: process.uptime(), os module, docker health

GET /api/v3/cron-status
Returns: { jobs: { name, schedule, lastRun, status, note, consecutiveErrors } }
Source: memory/cron-status.json + OpenClaw cron API

GET /api/v3/system-overview
Returns: { health, cronJobs, activeTaskCount, subAgentCount, lastBackup }
Source: aggregates multiple sources
```

### Tasks & Goals
```
GET /api/v3/active-tasks
Returns: { tasks: [{ title, status, started, plan, nextStep }] }
Source: memory/active-tasks.md (parsed)

GET /api/v3/goals
Returns: { role, projects: [...], antiGoals: [...], overnightTasks: [...] }
Source: GOALS.md (parsed)

GET /api/v3/overnight-log?date=YYYY-MM-DD
Returns: { date, task, findings, issues, nextActions }
Source: memory/YYYY-MM-DD.md (parsed for overnight build section)

GET /api/v3/suggested-tasks
Returns: { tasks: [{ id, title, category, reasoning, effort, priority, status }] }
Source: memory/suggested-tasks.json

POST /api/v3/suggested-tasks/:id/approve
POST /api/v3/suggested-tasks/:id/reject
```

### Agent
```
GET /api/v3/agent
Returns: { name, model, uptime, identity, capabilities }
Source: IDENTITY.md, SOUL.md (parsed)

GET /api/v3/agent/models
Returns: { models: [{ alias, provider, bestFor, cost }] }
Source: IDENTITY.md model arsenal section

GET /api/v3/agent/sessions
Returns: { active: [...], recent: [...] }
Source: OpenClaw sessions API

GET /api/v3/agent/cron-jobs
Returns: { jobs: [{ id, name, schedule, enabled, lastRun, lastStatus }] }
Source: OpenClaw cron API
```

### Projects
```
GET /api/v3/projects/beerpair
Returns: { status, credits, testResults: [...], appStoreStatus, marketingAssets }
Source: knowledge/projects/beerpair/summary.md, test-guide.md, test logs

GET /api/v3/projects/beerpair/test-results
Returns: { tests: [{ date, image, preference, resultCount, issues, notes }] }
Source: memory/*.md (parsed for BeerPair test sections)

GET /api/v3/projects/ocean-one
Returns: { status, seoFindings, contentGaps, expansionNotes }
Source: knowledge/chat-history/ocean-one.md, review logs
```

### Knowledge
```
GET /api/v3/knowledge/graph
Returns: { nodes: [{ id, label, type, path }], edges: [{ source, target }] }
Source: knowledge/ tree + wikilink parsing (EXISTING v2 logic)

GET /api/v3/knowledge/search?q=term
Returns: { results: [{ path, snippet, score }] }
Source: memory_search / file grep

GET /api/v3/knowledge/entity/:path
Returns: { content, metadata, lastModified }
Source: specific knowledge file

GET /api/v3/knowledge/tree
Returns: { tree: recursive directory structure }
Source: knowledge/ filesystem

GET /api/v3/knowledge/timeline
Returns: { days: [{ date, wordCount, sections }] }
Source: memory/*.md listing (EXISTING v2 logic)
```

### Research
```
GET /api/v3/research/openclaw
Returns: { entries: [{ date, finding, source, actionable }] }
Source: memory/openclaw-research.md

GET /api/v3/research/competitive
Returns: { analyses: [{ date, competitor, findings }] }
Source: memory/*.md competitive analysis sections

GET /api/v3/research/marketing
Returns: { ideas: [{ title, platform, status, content }] }
Source: marketing ideas from overnight builds
```

---

## Migration from v2
- All v3 routes under `/api/v3/` — no conflict with existing v2
- Existing v2 pages remain at `/` until v3 frontend is ready
- Knowledge graph canvas logic reused (copy from v2 components)
- Memory timeline heatmap logic reused (copy from v2 components)

## File Sources Summary
| File | Used By |
|------|---------|
| memory/cron-status.json | cron-status, system-overview |
| memory/active-tasks.md | active-tasks |
| GOALS.md | goals |
| IDENTITY.md | agent |
| SOUL.md | agent |
| memory/*.md | overnight-log, test-results, timeline |
| knowledge/**/*.md | graph, search, entity, tree |
| knowledge/projects/beerpair/* | projects/beerpair |

*Created: 2026-02-13*
