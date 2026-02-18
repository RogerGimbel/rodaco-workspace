# CURRENT TASK

*Updated 2026-02-18 02:02 ET*

## TL;DR
Overnight Build v2 — Feb 18. Finishing MC UI fixes + API enhancements. Pricing map update for -4-6 models, scroll affordance, skeleton loaders, model usage breakdown.

## Status: IDLE

## Task: Overnight Build — MC UI/API Round 3

### Steps
- [x] Step 0: Crash recovery (no crashes, MC healthy)
- [x] Step 1: Read queue — P1: UI fixes #12, #14; API fixes #7, #8; pricing update
- [x] Step 2: Fix model pricing exact match for claude-opus-4-6 / claude-sonnet-4-6
- [x] Step 3: UI Fix #12 — scroll affordance (Home page bottom fade)
- [x] Step 4: UI Fix #14 — Ops skeleton loaders (verified already working; no fix needed)
- [x] Step 5: API Fix #7 — Model usage breakdown endpoint + Home page display
- [x] Step 6: API Fix #8 — Session categorization (TodaySummary updated to use active array length)
- [x] Step 7: Build + deploy frontend (MC 8.86s, rodaco-site 6.28s, rogergimbel-site 5.67s)
- [x] Step 8: Restart API server
- [x] Step 9: Screenshot + verify (Top Model visible, bottom fade confirmed)
- [x] Step 10: Memory checkpoint + mark queue items done

### Key Files
- `mission-control/src/routes/api-v3.js` — API (MODEL_PRICING at line 295)
- `mission-control/src/lib/session-parser.js` — SESSION_MODEL_PRICING at line 7
- `rodaco-mc/src/pages/Home.tsx` — Home page (scroll affordance)
- `rodaco-mc/src/pages/Ops.tsx` — Ops page (skeleton loaders)
- `rodaco-mc/src/components/home/` — Home components

### Recovery
- If crash: re-read this file, pick up at last unchecked step
- Build: `cd /home/node/workspace/rodaco-mc && npm run build`
- Deploy: `rm -rf /home/node/workspace/mission-control/public/assets && cp -r /home/node/workspace/rodaco-mc/dist/* /home/node/workspace/mission-control/public/`
- API restart: `bash /home/node/workspace/mission-control/start.sh`
