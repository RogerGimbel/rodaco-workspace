# Mission Control v3 — API Reference (Live)

**Base URL:** `https://mission.rogergimbel.dev`
**All endpoints:** `GET /api/v3/{path}`
**CORS:** `*` (all origins allowed)
**Updated:** 2026-02-14

## Pages → Endpoints Mapping

### HOME `/`
- `/api/v3/health` — server uptime, memory, disk, load averages
- `/api/v3/system-overview` — health status, cron summary, active task count, last backup, task summaries
- `/api/v3/cron-status` — 9 cron jobs with live status, schedule, last/next run, errors
- `/api/v3/device/macbook` — CPU, RAM, disk, uptime (temperature: null on Intel Mac)
- `/api/v3/device/pi` — CPU, temp (°F), RAM, 3 storage drives, uptime
- `/api/v3/usage` — token usage by model and by day, total cost

### OPS `/ops`
- `/api/v3/active-tasks` — tasks with checklist items, sections, nextStep auto-derived
- `/api/v3/goals` — role, projects, antiGoals, overnightTasks
- `/api/v3/overnight-log` — full daily log parsed into sections
- `/api/v3/suggested-tasks` — AI-suggested tasks with approve/reject (POST)
- `/api/v3/activity` — recent tool calls, messages, model switches from session logs

### AGENT `/agent`
- `/api/v3/agent` — identity, model, personality, traits, C-suite roles
- `/api/v3/agent/models` — 7 model aliases with best-for descriptions
- `/api/v3/agent/sessions` — active + recent sessions
- `/api/v3/agent/cron-jobs` — 9 live cron jobs with full state
- `/api/v3/usage` — (shared with home)
- `/api/v3/usage/providers` — 5 API providers: configured status (no keys exposed)

### PROJECTS `/projects`
- `/api/v3/projects/beerpair` — full project: description, techStack, team, currentWork, history, marketingAssets (24), testResults, credits
- `/api/v3/projects/ocean-one` — description, services, location, conversations, seoFindings

### KNOWLEDGE `/knowledge`
- `/api/v3/knowledge/graph` — nodes + edges for force-directed graph
- `/api/v3/knowledge/search?q=term` — search across knowledge + memory
- `/api/v3/knowledge/entity?path=NAME` — single entity content + metadata
- `/api/v3/knowledge/tree` — recursive directory structure
- `/api/v3/knowledge/timeline` — daily notes: date, wordCount, sections

### RESEARCH `/research`
- `/api/v3/research/openclaw` — platform research entries
- `/api/v3/research/competitive` — competitor analyses
- `/api/v3/research/marketing` — marketing ideas backlog by project/category

### METRICS (NEW - 2026-02-15)
- `/api/v3/metrics/costs` — cost breakdown: today, week, month, by provider, trend
- `/api/v3/metrics/performance` — API performance: avg/p95 response times, errors, tool performance
- `/api/v3/metrics/session-health` — session health: file size, locks, zombies, heap usage, warnings

### SYSTEM (NEW - 2026-02-15)
- `/api/v3/system/health-score` — overall system health score + component scores + alerts
- `/api/v3/overnight-history` — historical overnight builds with duration, tasks, costs
