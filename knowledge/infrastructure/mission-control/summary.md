# Mission Control Dashboard

## Overview
Internal ops dashboard for [[Rodaco]]/OpenClaw monitoring. Multi-page React SPA with dark+light mode support.

## Architecture (v3 — Feb 2026)
- **Combined server:** Express serves API + built frontend from `mission-control/public/` on port 3333
- **API Backend:** Node.js, 40+ endpoints in `mission-control/src/routes/api-v3.js`
- **Frontend source:** `rodaco-mc/` — Vite + React + TypeScript + shadcn/ui + Tailwind
- **Data source:** Workspace filesystem (markdown + JSON), OpenClaw session JSONL files, SSH to devices
- **Build pipeline:** `cd rodaco-mc && npm run build` → copy `dist/*` to `mission-control/public/`
- **Process:** 4-layer resilience:
  1. **Supervisor** (`mission-control/supervisor.sh`) — auto-restarts on crash, circuit breaker after 10 failures/5min
  2. **Cron watchdog** (every 2 min) — checks `/api/v3/health`, auto-restarts if down
  3. **Daily health check** (6 AM ET) — deep CLI check: content sanity, response time, production URLs
  4. **Weekly browser audit** (Sun 3 AM ET) — full screenshot, mobile viewport, click-through
  - Heartbeat (~30 min) — backup check via `mission-control/start.sh`
- **Start command:** `bash mission-control/start.sh`
- **Logs:** `/tmp/mission-control.log`

## Access
- **Production:** http://100.124.209.59:3333 (combined API + frontend)
- **Public URL:** https://mission.rogergimbel.dev (via Caddy on Pi → MacBook:3333)
- **Vite dev:** http://100.124.209.59:3334/ — may be stale, use :3333 for production
- **Lovable:** ⚠️ DEAD — rodaco-mc.lovable.app returns 404

## Pages (6)
1. **Home** — System overview, device cards (MacBook/Pi), health score, cost analytics, cron jobs, recent wins
2. **Ops** — Active tasks, goals, overnight build log/history, suggested tasks
3. **Agent** — Agent status hero, role cards, model arsenal, sessions, personality/traits
4. **Projects** — [[BeerPair]] + Ocean One dashboards with velocity/momentum
5. **Knowledge** — D3 force graph, timeline heatmap, entity detail, growth stats
6. **Research** — Marketing ideas kanban, competitive analysis, OpenClaw research

## Key Files
- API routes: `mission-control/src/routes/api-v3.js`
- Session parser: `mission-control/src/lib/session-parser.js`
- Server: `mission-control/src/server.js`
- Frontend hooks: `rodaco-mc/src/hooks/useApi.ts`
- Frontend pages: `rodaco-mc/src/pages/`
- Frontend components: `rodaco-mc/src/components/`
- CSS/theming: `rodaco-mc/src/index.css`

## Known Issues (as of 2026-02-16)
- **Frontend:** 14 remaining items in `memory/tasks/mc-v3-ui-fixes.md` (badge contrast, emoji, layout)
- **API:** 10 items in `memory/tasks/mc-v3-api-fixes.md` (pricing, costs, session counts, perf metrics)
- **Overnight builds** work through both task files nightly at 2 AM ET

## Design
- Theme-aware (light + dark mode via Tailwind `dark:` classes)
- Glass cards with backdrop-blur, semantic color tokens
- ⚠️ NEVER use hardcoded `text-white/`, `bg-white/`, `border-white/` — use `text-foreground/`, `bg-muted/`, `border-border`
- Inter font, responsive layout

## History
- **2026-02-13:** v3 started — API-first architecture, Lovable React frontend
- **2026-02-15:** 35+ endpoints, cron watchdog, overnight build metrics
- **2026-02-16 (early):** Overnight build added wins, tools/top, velocity, growth endpoints. All 6 pages live.
- **2026-02-16 (session):** Full 6-page visual audit. Major contrast overhaul (~150 text-white refs fixed). API device endpoints enhanced with fetchedAt/sshSuccess. Combined frontend+API serving on :3333. Two task files created for ongoing overnight builds. Screenshots in `mc-screenshots/`.
