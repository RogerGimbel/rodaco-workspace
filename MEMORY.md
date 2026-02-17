---
tags: [memory, hot-context, core]
updated: 2026-02-16
---
# MEMORY.md - Hot Context (< 5KB target)

*Last updated: 2026-02-16*

## 🔒 Security Boundaries (Non-Negotiable)
- Email: ONLY Roger's inboxes (accfighter@gmail.com, rogergimbel@selfgrowth.app, roger@rogergimbel.dev)
- Web browsing: ONLY on Roger's explicit request
- Auth users: Roger (1425151324), Dale (8372298367), Stuart (7655601668)

## 🧰 My Tools (Quick Reference)
- **Email:** `bash bin/email send/list/inbox` — rodaco@agentmail.to
- **X/Twitter:** `bird whoami/read/search/tweet` — @rgimbel
- **Agent Browser:** `agent-browser 0.10.0` — open/snapshot/click/screenshot --headless
- **GitHub:** `workspace/bin/gh` v2.86.0 — authenticated as RogerGimbel
- **Image gen:** `skills/grok-image/grok-image.sh` (xAI) or Nano Banana Pro (Gemini)
- **Video gen:** `skills/video-gen/video-gen.sh` (xAI grok-imagine-video)
- **Save:** `/save` → memory flush + fact extract + git commit
- **Summarize:** SSH to M5 MacBook (`ssh rogergimbel@100.71.128.20 /opt/homebrew/bin/summarize`)

## 📋 Active Projects
- **BeerPair** — LIVE at beerpair.com. Native apps in progress (Despia). B2B GTM complete (17 assets).
- **Mission Control v3** — Combined API+frontend on :3333. Source: `rodaco-mc/` (frontend), `mission-control/` (API). Build pipeline: edit src → `npm run build` → copy dist to `mission-control/public/`. Lovable DEAD. 6 pages: Home, Ops, Agent, Projects, Knowledge, Research. Overnight builds work through `memory/tasks/mc-v3-ui-fixes.md` (14 items) and `memory/tasks/mc-v3-api-fixes.md` (10 items).
- **Infrastructure Overhaul** — Steps 1-5 COMPLETE (Tailscale lockdown, host agent, Pi lockdown). See `memory/active-tasks.md`.

## 🏗️ Key Infrastructure
- **Intel MacBook:** 100.124.209.59, container `moltbot-gateway`, workspace is Docker volume (NOT bind mount)
- **Raspberry Pi:** 100.83.169.87, media stack, exit node
- **MC (combined):** `http://100.124.209.59:3333/` — Express serves frontend from `mission-control/public/` + API at `/api/v3/`
- **MC Vite dev:** `http://100.124.209.59:3334/` — host ~/rodaco-mc/, may be stale (use :3333 for production)
- **Host Agent:** 100.124.209.59:18790 (13 commands, Tailscale-only)
- **Secrets:** SOPS/age → `/tmp/secrets/` at container start. Encrypted: `~/docker/openclaw/secrets.enc.yaml`
- **Docker compose:** `/Users/rogergimbel/docker/openclaw/` on host
- **Backups:** MacBook→Pi 4AM MT, MacBook→GitHub 4AM MT, Pi→MacBook 3AM

## 🧠 Roger's Preferences
- Dev tools: Claude Code, Lovable, Cursor, Replit, Bolt, Antigravity, Codex
- Stack: Vite+React, Supabase, Vercel, IONOS
- Don't push coding help unless asked. Don't push to GitHub without asking.
- Never send emails without asking Roger, Dale, or Stuart first

## 🔀 Model Routing Policy (2026-02-16)
- **Roger's DMs (main session):** Always Opus 4.6
- **Heartbeats:** Sonnet 4.5 (`agents.defaults.heartbeat.model`)
- **Cron jobs (internal):** Sonnet 4.5 — backups, wikilink sync, morning brief, get-to-know, weekly synthesis, monthly review, MC watchdog, overnight build
- **Cron jobs (external):** Opus — TestFlight check (does web search)
- **Antfarm workflow agents (all 19):** Sonnet 4.5 (per-agent `model` in config)
- **Rule:** If external data touches context → top-tier model only. Input trust level determines model, not task complexity.
- **Exception agents (Opus, have web access):** security-audit/scanner, security-audit/tester, feature-dev/tester

## 📋 Queued Projects (see memory/tasks/CURRENT.md)
1. Persistent process awareness — `bin/system-state` + boot integration
2. Remote screenshots for overnight builds — M5 MacBook headless Chrome
3. Smarter context management — checkpoint discipline + tiered loading

## 📝 Lessons Learned
- Docker Desktop Mac: `network_mode: host` broken — use IP-specific port bindings
- iCloud sync changes ownership (UID 501) — use one-directional sync
- UFW DOCKER-USER needs `conntrack ESTABLISHED,RELATED` as FIRST rule
- Container uid 1000: use `/tmp` not `/run` for writable temp files
- Locally-built images can't use Watchtower — use app-level self-update
- Always prefer container-to-container networking over published port loopback
- Wildcard DNS with public domains catches root domain — use explicit subdomain entries
- **SESSION CRASHES:** Checkpoint work to daily notes DURING the session, not after. Every significant unit of work → immediate write to `memory/YYYY-MM-DD.md`.
- **Agent-browser screenshots:** ALWAYS save to default /tmp path, then copy to workspace. Writing directly to workspace Docker volume causes OOM SIGKILL (swap full). Snapshots (text) always work.
- **MC build deploy:** `cd rodaco-mc && npm run build` then `rm -rf mission-control/public/assets && cp -r rodaco-mc/dist/* mission-control/public/`
- **Light mode theming:** Never use `text-white/`, `bg-white/`, `border-white/` — use `text-foreground/`, `bg-muted/`, `border-border` for theme-aware colors.
- **CURRENT.md is THE crash recovery file.** Update it at every context threshold (50%+). Must include: current step, files in flight, build/deploy state, server status.
- **Cron job crash recovery:** Overnight builds must check `git diff --stat` first and read task files for `[x]` state before starting work.
- **active-tasks.md is DEPRECATED.** Use `memory/tasks/CURRENT.md` as the single source of truth.

## 📋 Master Plan
- **`PLAN.md`** — All open work in one place. P0/P1/P2 prioritized. Check before asking "what should I do?"

## 🔗 Deep Reference (in knowledge/)
For full details on any topic above, check:
- `knowledge/INDEX.md` — master index
- `knowledge/infrastructure/` — MacBook, Pi, network, MC details
- `knowledge/projects/` — BeerPair, MC v3, Ocean One
- `knowledge/people/` — Roger, Dale, Stuart profiles
- `memory/active-tasks.md` — current task tracker with build steps
