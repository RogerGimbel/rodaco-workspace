# TOOLS.md - Operational Reference

Everything environment-specific: commands, paths, IPs, build recipes, workarounds.

## 🧰 Tool Commands

| Tool | Command | Notes |
|------|---------|-------|
| Email | `bash bin/email send/list/inbox` | rodaco@agentmail.to |
| X/Twitter | `bird whoami/read/search/tweet` | @rgimbel |
| Agent Browser | `agent-browser open/snapshot/click/screenshot --headless` | v0.10.0 |
| GitHub | `workspace/bin/gh` | v2.86.0, authenticated as RogerGimbel |
| Image Gen | `skills/grok-image/grok-image.sh` | xAI. Alt: Nano Banana Pro (Gemini) |
| Video Gen | `skills/video-gen/video-gen.sh` | xAI grok-imagine-video |
| Save | `/save` → `bash bin/save "<summary>"` | memory flush + fact extract + git commit |
| Summarize | `ssh rogergimbel@100.71.128.20 /opt/homebrew/bin/summarize` | Runs on M5 MacBook |
| jq | `/home/node/workspace/jq` | Static binary, use full path |

## 🏗️ Infrastructure

| Service | Address | Details |
|---------|---------|---------|
| Intel MacBook | 100.124.209.59 | Container `moltbot-gateway`, workspace is Docker volume (NOT bind mount) |
| M5 MacBook | 100.71.128.20 | Headless Chrome, summarize CLI |
| Raspberry Pi | 100.83.169.87 | Media stack, exit node |
| Mission Control | http://100.124.209.59:3333/ | Express: frontend from `mission-control/public/` + API at `/api/v3/` |
| rodaco-site | http://100.124.209.59:3334/ | Static server, `rodaco-site/server.cjs` |
| rogergimbel-site | http://100.124.209.59:3335/ | Static server, `rogergimbel-site/server.cjs` |
| Host Agent | 100.124.209.59:18790 | 13 commands, Tailscale-only |
| Sites Watchdog | Cron `a8c93721` every 2min | Auto-restarts 3334+3335 if down (isolated session) |

- **Secrets:** SOPS/age → `/tmp/secrets/` at container start. Encrypted: `~/docker/openclaw/secrets.enc.yaml`
- **Docker compose:** `/Users/rogergimbel/docker/openclaw/` on host
- **Backups:** MacBook→Pi 4AM MT, MacBook→GitHub 4AM MT, Pi→MacBook 3AM

## 🔀 Model Routing Policy

- **Roger's DMs (main session):** Always Opus 4.6
- **Heartbeats:** Sonnet 4.5
- **Cron jobs (internal):** Sonnet 4.5 — backups, wikilink sync, morning brief, get-to-know, weekly synthesis, monthly review, MC watchdog, overnight build
- **Cron jobs (external):** Opus — TestFlight check (does web search)
- **Antfarm workflow agents (all 19):** Sonnet 4.5
- **Rule:** If external data touches context → top-tier model only.
- **Exception agents (Opus, web access):** security-audit/scanner, security-audit/tester, feature-dev/tester

## 📦 Container Constraints

- No `sudo`/`apt-get` — container runs as non-root user `node`
- Container uid 1000: use `/tmp` not `/run` for writable temp files
- Parse JSON with node one-liners or `/home/node/workspace/jq`

## ⚠️ npm Install Gotchas (Lovable Sites)

- `/home/node/.npm` is 200MB tmpfs — ALWAYS use `--cache /home/node/workspace/.npm-cache`
- `NODE_ENV=production` skips devDeps (vite not installed!) — ALWAYS prefix with `NODE_ENV=development`
- `package.json` has `"type":"module"` — server files must be `.cjs` not `.js`
- Full safe install: `NODE_ENV=development npm install --legacy-peer-deps --cache /home/node/workspace/.npm-cache`

## 🔧 Build & Deploy Recipes

**MC build deploy:**
```bash
cd rodaco-mc && npm run build
rm -rf mission-control/public/assets && cp -r rodaco-mc/dist/* mission-control/public/
```

**Lovable sites (rodaco-site / rogergimbel-site):**
```bash
cd <site-dir> && NODE_ENV=development npm run build
# Test on local port, then:
git add . && git commit -m "msg" && git push origin main
# Lovable auto-syncs → Roger deploys from Lovable UI
```

**Remote screenshots (M5 MacBook headless Chrome):**
```bash
bash bin/remote-screenshot "http://100.124.209.59:<port>" "filename.png"
# For React SPAs, use --virtual-time-budget=10000 for full render
```

## 🐛 Tool-Specific Workarounds

- **Agent-browser screenshots:** ALWAYS save to default `/tmp` path, then copy to workspace. Writing directly to workspace Docker volume causes OOM SIGKILL (swap full). Snapshots (text) always work.
- **Light mode theming:** Never use `text-white/`, `bg-white/`, `border-white/` — use `text-foreground/`, `bg-muted/`, `border-border` for theme-aware colors.
- **Locally-built images** can't use Watchtower — use app-level self-update.

## 🐜 Antfarm Workflows

CLI (always use full path): `node ~/.openclaw/workspace/antfarm/dist/cli/cli.js`

- Install: `node ~/.openclaw/workspace/antfarm/dist/cli/cli.js workflow install <name>`
- Run: `node ~/.openclaw/workspace/antfarm/dist/cli/cli.js workflow run <workflow-id> "<task>"`
- Status: `node ~/.openclaw/workspace/antfarm/dist/cli/cli.js workflow status "<task title>"`
- Logs: `node ~/.openclaw/workspace/antfarm/dist/cli/cli.js logs`
