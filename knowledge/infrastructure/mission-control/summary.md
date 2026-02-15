# Mission Control Dashboard

## Overview
Internal ops dashboard for [[Rodaco]]/OpenClaw monitoring. Dark-themed, multi-page React SPA.

## Architecture (v3 — Feb 2026)
- **API Backend:** Node.js, 35 endpoints in `mission-control/src/routes/api-v3.js` (~1400 lines)
- **Frontend:** Vite + React + TypeScript (built in Lovable)
- **Data source:** Workspace filesystem (markdown + JSON files) — no external DB
- **Process:** 3-layer resilience:
  1. **Supervisor** (`mission-control/supervisor.sh`) — auto-restarts on crash, circuit breaker after 10 failures/5min
  2. **Cron watchdog** (every 5 min, job `ac4f86b8`) — checks `/api/v3/health`, auto-restarts if down, alerts Roger if restart fails
  3. **Heartbeat** (~30 min) — backup check via `mission-control/start.sh`
- **Start command:** `bash mission-control/start.sh`
- **Logs:** `/tmp/mission-control.log`
- **Known failure mode:** Overnight build kills server for file edits, forgets to restart. Watchdog now catches this within 5 min.

## Access
- **API Backend:** http://100.124.209.59:3333 (MacBook, port 3333)
- **API Public URL:** https://mission.rogergimbel.dev (via Caddy on Pi → MacBook:3333)
- **Frontend (Lovable):** https://rodaco-mc.lovable.app
- **Frontend env var:** `VITE_API_URL=https://mission.rogergimbel.dev`

## Pages (6)
1. **Home** — System overview, active tasks, suggested tasks, quick stats
2. **Projects** — [[BeerPair]], Ocean One Marine with enriched details
3. **Ops** — Cron jobs, system health, provider usage
4. **Agent** — Sessions, memory timeline
5. **Knowledge** — Knowledge graph visualization (D3-force)
6. **Research** — OpenClaw research, competitive analysis, marketing ideas

## Key Files
- API routes: `mission-control/src/routes/api-v3.js`
- Server: `mission-control/src/server.js`
- Spec: `knowledge/projects/mission-control-v3/spec.md`
- API Reference: `knowledge/projects/mission-control-v3/api-reference.md`
- Lovable Prompt: `knowledge/projects/mission-control-v3/lovable-prompt.md`

## Design
- Dark mode only, JARVIS/Bloomberg aesthetic
- Glass cards: bg-white/[0.03] backdrop-blur-xl
- Inter font, mobile-first (320px minimum)
- Skeleton loading states, stagger animations

## History
- **2026-02-11:** v2 shipped — modular routes, Knowledge Graph tab, Memory Timeline, Ops Dashboard
- **2026-02-12:** Mobile-first redesign (3 breakpoints)
- **2026-02-13:** v3 started — API-first architecture, Lovable React frontend
- **2026-02-14:** 35 API endpoints complete, frontend Home + Projects pages working, comprehensive Lovable prompt generated for remaining pages
- **2026-02-15:** Added cron watchdog (every 5 min) for auto-recovery. Overnight build added 5 metrics endpoints (costs, performance, session-health, health-score, overnight-history), fixed 2 bugs, created 30 Lovable frontend prompts
