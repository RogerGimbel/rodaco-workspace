# Active Tasks

## Mission Control v3 — IN PROGRESS (2026-02-14)
**Status:** ~90% done — API complete, frontend needs visual walkthrough
**Started:** 2026-02-13

### What's Done
- [x] Full API layer built: 35 endpoints in `mission-control/src/routes/api-v3.js` (1400+ lines)
- [x] Frontend: Lovable React app at https://rodaco-mc.lovable.app (6 pages)
- [x] API base URL: https://mission.rogergimbel.dev → port 3333 on MacBook
- [x] Security fix: removed API key prefix leakage from `/usage/providers`
- [x] Enriched `/projects/beerpair` — 24 assets, tech stack, team, history, test results
- [x] Enriched `/projects/ocean-one` — description, services, conversations
- [x] Fixed `/active-tasks` — parses checkboxes, subsections, auto-derives nextStep
- [x] Fixed `/system-overview` — real activeTaskCount + task summaries
- [x] Created seed data: suggested-tasks.json, openclaw-research.md, competitive-research.md, marketing-ideas.md
- [x] Fixed all 3 research endpoint parsers
- [x] Home page and Projects page working in frontend
- [x] Comprehensive Lovable prompt generated with all 25 endpoint response shapes
- [x] API reference saved to `knowledge/projects/mission-control-v3/api-reference.md`

### What's Left
- [ ] Roger pastes comprehensive Lovable prompt (all 6 pages, all endpoint shapes) into Lovable
- [ ] Visual walkthrough of all 6 pages (Ops, Agent, Knowledge, Research especially)
- [ ] Feed Lovable any remaining layout/display issues found during walkthrough
- [ ] Consider adding auto-refresh polling (spec says 15s for home page)
- [ ] Usage token counts may need investigation (input ~1K vs output ~98K seems off)

### Key Files
- API: `mission-control/src/routes/api-v3.js`
- Server: `mission-control/src/server.js`
- Spec: `knowledge/projects/mission-control-v3/spec.md`
- API Reference: `knowledge/projects/mission-control-v3/api-reference.md`
- Lovable Prompt: `knowledge/projects/mission-control-v3/lovable-prompt.md`
- Frontend: https://rodaco-mc.lovable.app (Lovable project)
- API URL in frontend: `https://mission.rogergimbel.dev`
- Restart: `pkill -f supervisor; sleep 2; bash mission-control/start.sh`

---

## BeerPair Native Apps
**Status:** In progress (Despia WebView wrapper)
**Started:** 2026-02-12

---

## Pi Media Stack — Fixes Applied (2026-02-14)
**Status:** RESOLVED
- Fixed Homepage dashboard (`admin.rogergimbel.dev`) qBit/SABnzbd API errors
- Root cause: UFW firewall hardening (Feb 13) blocked container→host loopback traffic
- Homepage was using host IP `10.0.0.20:8090/8183` instead of Docker DNS
- Fix: Changed Homepage config to use `gluetun:8081` (qBit) and `gluetun:8080` (SABnzbd)
- File changed: `/mnt/media/config/homepage/services.yaml`
