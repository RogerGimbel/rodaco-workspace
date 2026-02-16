# Mission Control v3 — Local Frontend Setup

**Goal:** Self-host the Lovable React frontend locally so Rodaco can browse it with the browser agent, see live API data, and iterate on it without Lovable or public URLs.

**GitHub Repo:** https://github.com/RogerGimbel/rodaco-mc.git
**API Backend:** Already running at http://localhost:3333 (v3, `src/server.js`, PID 664)
**Frontend Stack:** Vite + React + TypeScript + Tailwind + Tanstack Query + Recharts + D3-force

---

## Task List

### Phase 1: Clone & Build
- [ ] **1.1** Clone `https://github.com/RogerGimbel/rodaco-mc.git` into `/home/node/workspace/rodaco-mc`
- [ ] **1.2** Install dependencies (`npm install`)
- [ ] **1.3** Set `VITE_API_URL=http://localhost:3333` in `.env` (so frontend hits the local API)
- [ ] **1.4** Run `npm run build` — verify it compiles clean
- [ ] **1.5** Run `npm run dev` on a port (e.g. 5173) — verify dev server starts

### Phase 2: Verify API Connection
- [ ] **2.1** Browse frontend with browser agent, confirm it loads
- [ ] **2.2** Check browser console for CORS or API errors
- [ ] **2.3** Verify Home page shows device cards with live data
- [ ] **2.4** Verify Ops, Agent, Projects, Knowledge, Research pages all load data
- [ ] **2.5** Fix any API mismatches (endpoint paths, response shapes)

### Phase 3: Apply Pending Improvements
- [ ] **3.1** Apply the 4 new endpoint integrations from overnight build (wins, tools/top, projects/velocity, knowledge/growth) — see `lovable-prompts/2026-02-16-overnight-build.md`
- [ ] **3.2** Fix known issues: backup alert, overnight history parser, loading states
- [ ] **3.3** Enhancements: live status dots, copy buttons, dark mode polish

### Phase 4: Production Setup
- [ ] **4.1** Decide serving strategy: Vite dev server vs built static files served by API server on 3333
- [ ] **4.2** If static: copy `dist/` into `mission-control/public/` so the API server serves everything on 3333
- [ ] **4.3** If separate: set up persistent process for frontend (supervisor or start script)
- [ ] **4.4** Update `start.sh` / supervisor to handle the new setup
- [ ] **4.5** Update knowledge docs with new architecture

---

## Key Context
- The old `public/` in `mission-control/` has a basic HTML dashboard (v1/v2) — the Lovable React app replaces it
- All 23 original Lovable prompts already applied in the Lovable-hosted version
- 4 NEW endpoints from overnight build (2026-02-16) still need frontend integration
- Frontend expects `VITE_API_URL` env var — defaults to `http://localhost:3333`
- API has CORS enabled (allows all origins)
- Browser agent: `agent-browser open URL --headless && sleep 2 && agent-browser snapshot`

## Current Status
**Phase 2 COMPLETE, Phase 3-4 PENDING**

### What's Done (recovered from crashed session + re-browsed):
- Cloned to `/home/node/workspace/rodaco-mc/` and host `~/rodaco-mc/`
- Built and running on host port 3334 (`http://100.124.209.59:3334/`)
- VITE_API_URL set to `http://100.124.209.59:3333`
- All 6 pages load with live API data
- Full browse audit completed — see `memory/2026-02-16-mc-browse.md`
- Screenshots in `mc-screenshots/01-home.png` through `06-research.png`
- Iteration will be done locally with Opus 4.6 (not Lovable prompts)
