# Mission Control Dashboard

## Overview
Internal ops dashboard for [[Rodaco]]/OpenClaw monitoring. Dark-themed, 7-tab SPA.

## Access
- **URL:** http://100.124.209.59:3333
- **Also:** https://mission.rogergimbel.dev (via Caddy on Pi)

## Architecture
- **Server:** Node.js, modular routes in `mission-control/src/`
- **Frontend:** Vanilla JS SPA, lazy-loaded `components/` per tab
- **Process:** Supervised via `mission-control/supervisor.sh` (auto-restart, circuit breaker 10 failures/5min)
- **Started by:** heartbeat via `mission-control/start.sh`
- **Logs:** `/tmp/mission-control.log`

## Tabs
1. **📡 Activity** — Real-time event feed (exec, messages, files, errors, tools)
2. **🧠 Knowledge** — Entity graph with canvas visualization + sidebar
3. **📝 Memory** — Daily notes heatmap + content viewer
4. **🖥️ Ops** — System health cards (load, RAM, disk, uptime, cron jobs)
5. **📅 Calendar** — Week view with cron job scheduling
6. **📊 Usage** — Token usage, costs, provider status, daily charts
7. **🔍 Search** — Semantic search across memory + knowledge files

## Responsive Design (Feb 12, 2026)
Mobile-first CSS with 3 breakpoints:

| Breakpoint | Target | Key Features |
|---|---|---|
| Base (< 640px) | Phone | Bottom nav (5 + More), compact header, stacked events, calendar list, 44px touch targets, 12px padding |
| 640px+ | Tablet | Top tabs (scroll), 2-col layouts, 7-col calendar, 16px padding |
| 1024px+ | Desktop | Full sidebar+main layouts, 24px padding |

## Key Files
- `mission-control/src/server.js` — Express server
- `mission-control/public/style.css` — Mobile-first stylesheet
- `mission-control/public/index.html` — SPA shell (top tabs + bottom nav)
- `mission-control/public/app.js` — Tab switching, status polling
- `mission-control/public/components/` — Per-tab JS modules

## History
- 2026-02-11: v2 shipped — modular rewrite, knowledge graph, memory timeline, ops dashboard
- 2026-02-12: Mobile-first redesign — bottom nav, responsive breakpoints, touch-friendly
