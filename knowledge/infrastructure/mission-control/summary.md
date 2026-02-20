# Mission Control (Rodaco Ops Dashboard)

## Current (v3, Feb 2026)
- **Serve:** Combined API + built frontend on :3333 (Express + static dist from `rodaco-mc`). Relative API base (no dead tunnel).
- **Frontend:** Vite/React/TS/shadcn/Tailwind; pages: Home, Ops, Agent, Projects, Knowledge, Research. Sites panel now live (MC/rodaco-site/rogergimbel-site status + latency).
- **Backend:** ~40 endpoints in `mission-control/src/routes/api-v3.js`; device telemetry uses `memory_pressure` for macOS RAM (accurate); model name reads from OpenClaw config (no stale Grok label).
- **Resilience:** Supervisor script, 2-min watchdog, 6 AM deep health check, weekly browser audit (Sun 3 AM), heartbeat fallback.

## Access
- Prod: http://100.124.209.59:3333 (Caddy at https://mission.rogergimbel.dev)
- Dev build: `cd rodaco-mc && npm run build` → copy dist → `mission-control/public/`

## Known Workstreams
- UI polish backlog in `memory/tasks/mc-v3-ui-fixes.md`
- API polish backlog in `memory/tasks/mc-v3-api-fixes.md`

## Key Files
- API routes: `mission-control/src/routes/api-v3.js`
- Server: `mission-control/src/server.js`
- Frontend: `rodaco-mc/src/*`, API client `rodaco-mc/src/lib/api.ts`

## History
- 2026-02-13: v3 architecture started (combined server).
- 2026-02-16: Full 6 pages live, contrast/a11y pass, device endpoints enhanced.
- 2026-02-19: Sites panel enabled; RAM reporting fixed; model name sourced from config; API base set to relative URL.
