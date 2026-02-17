# CURRENT TASK

*Updated 2026-02-17 09:45 ET*

## TL;DR
Setting up two new Lovable sites locally for Roger to manage. rodaco-site build complete, server setup in progress.

## Status: ACTIVE

## Task: Clone + Set Up Two Lovable Sites Locally

### Context
Same pattern as rodaco-mc: clone GitHub repo → npm install → build → static server → remote screenshot via M5 Chrome → iterate → push to GitHub → Lovable auto-syncs.

### Repos
- **Roger personal site:** `RogerGimbel/rogergimbel-app-artist` → cloned to `/home/node/workspace/rogergimbel-site` (rogergimbel.dev)
- **Rodaco corporate site:** `RogerGimbel/rodaco.co` → cloned to `/home/node/workspace/rodaco-site` (rodaco.co)

### Port Assignments
| Site | Port |
|------|------|
| MC (existing) | 3333 |
| Rodaco corporate | 3334 |
| Roger personal | 3335 |

### Docker
- Added ports 3334 and 3335 to `~/docker/openclaw/docker-compose.yml` on Intel Mac
- Recreated container — now exposes 3333, 3334, 3335, 18789
- Backup saved as `docker-compose.yml.bak2`

### Steps Completed
- [x] Clone rogergimbel-site (port 3335)
- [x] npm install (NODE_ENV=development, --legacy-peer-deps, --cache /home/node/workspace/.npm-cache)
- [x] npm run build → dist/ built successfully
- [x] server.cjs created (static file server, ESM-safe)
- [x] supervisor.sh + start.sh created
- [x] Server running on port 3335 (process briny-dune, nohup node server.cjs)
- [x] Screenshot taken — site renders (hero: "Roger Gimbel / Technology Architect")
- [x] Clone rodaco-site (port 3334)
- [x] npm install + build complete
- [ ] Create server.cjs for rodaco-site (port 3334)
- [ ] Create supervisor.sh + start.sh for rodaco-site
- [ ] Start rodaco-site server
- [ ] Screenshot rodaco-site
- [ ] Wire both servers to survive container restarts (add to mission-control start.sh or separate launchd/cron on Mac host)
- [ ] Sort out rodaco.co PAT in git remote URL (currently no PAT embedded — needed for push)

### Key Notes
- npm cache is tmpfs at /home/node/.npm (200MB) — ALWAYS use `--cache /home/node/workspace/.npm-cache` to avoid ENOSPC
- NODE_ENV=production skips devDependencies (vite!) — ALWAYS use `NODE_ENV=development npm install`
- server.js must be named server.cjs (ESM package.json type:module conflict)
- `--virtual-time-budget=5000` needed in Chrome headless for React to fully render before screenshot
- rogergimbel-site server: running as nohup background process (not supervisor yet — supervisor SIGTERM issue)

### Pending After Sites Are Up
- Embed PAT in rodaco-site git remote for push capability
- Decide on persistent startup mechanism for both servers (Mac launchd vs Docker entrypoint)
- Roger wants to brainstorm/work on improvements to both sites
