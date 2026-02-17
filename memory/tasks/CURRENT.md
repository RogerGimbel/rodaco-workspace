# CURRENT TASK

*Updated 2026-02-17 10:30 ET*

## TL;DR
Both new sites fully set up locally. All three repos push-capable. Ready to iterate on site improvements.

## Status: IDLE

## ✅ COMPLETED: New Sites Local Setup

### Sites
| Site | Port | GitHub | Local Path |
|------|------|--------|-----------|
| Mission Control v3 | 3333 | RogerGimbel/rodaco-workspace | /home/node/workspace/mission-control |
| Rodaco corporate | 3334 | RogerGimbel/rodaco.co | /home/node/workspace/rodaco-site |
| Roger personal | 3335 | RogerGimbel/rogergimbel-app-artist | /home/node/workspace/rogergimbel-site |

### What Was Done
- Cloned both Lovable sites locally
- npm install + build for both (NODE_ENV=development, --legacy-peer-deps, --cache /home/node/workspace/.npm-cache)
- server.cjs (static file server, CommonJS) created for each
- Docker compose updated: ports 3334 + 3335 added, container recreated
- PAT embedded in git remote for both sites (push-capable)
- sites-watchdog cron (ID: a8c93721) running every 2 min to keep servers alive
- First screenshots taken of both sites
- Knowledge files created: knowledge/projects/rogergimbel-site/ and knowledge/projects/rodaco-site/

### Infrastructure Notes
- npm cache is tmpfs (200MB) — ALWAYS use --cache /home/node/workspace/.npm-cache
- NODE_ENV=production skips devDeps (vite!) — ALWAYS use NODE_ENV=development
- server.js must be server.cjs (ESM package.json type:module)
- Chrome screenshot needs --virtual-time-budget=5000 for React to render
- Port 3334 was never used by MC (MC consolidated to 3333 only)
- healer.py only monitors container health, not ports

### Next Steps (When Ready)
- Iterate on rogergimbel-site improvements (see knowledge/projects/rogergimbel-site/summary.md)
- Iterate on rodaco-site improvements (see knowledge/projects/rodaco-site/summary.md)
- Remaining MC v3 items: 3 UI fixes (#9 emoji, #12 scroll fade, #14 skeleton) + 4 API P2 enhancements (overnight build tonight)
