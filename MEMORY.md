---
tags: [memory, hot-context, core]
updated: 2026-02-17
---
# MEMORY.md - Hot Context

*Last updated: 2026-02-17*

## 📋 Active Projects
- **BeerPair** — LIVE at beerpair.com. Native apps in progress (Despia). B2B GTM complete (17 assets). KB: `knowledge/projects/beerpair/`
- **Mission Control v3** — Combined API+frontend on :3333. Remaining: 3 UI + 4 API P2 items. KB: `knowledge/infrastructure/`
- **rogergimbel-site** — rogergimbel.dev, dark charcoal + amber/gold theme. KB: `knowledge/projects/rogergimbel-site/summary.md`
- **rodaco-site** — rodaco.co, dark mode corporate site. KB: `knowledge/projects/rodaco-site/summary.md`
- **Infrastructure Overhaul** — Steps 1-5 COMPLETE (Tailscale lockdown, host agent, Pi lockdown).

## 🧠 Roger's Preferences
- Dev tools: Claude Code, Lovable, Cursor, Replit, Bolt, Antigravity, Codex
- Stack: Vite+React, Supabase, Vercel, IONOS
- Don't push coding help unless asked. Don't push to GitHub without asking.
- Never send emails without asking Roger, Dale, or Stuart first
- Hates generic purple "vibe-coded crap" — prefers warm, confident, non-generic design

## 📝 Lessons Learned
- Docker Desktop Mac: `network_mode: host` broken — use IP-specific port bindings
- iCloud sync changes ownership (UID 501) — use one-directional sync
- UFW DOCKER-USER needs `conntrack ESTABLISHED,RELATED` as FIRST rule
- Always prefer container-to-container networking over published port loopback
- Wildcard DNS with public domains catches root domain — use explicit subdomain entries
- **SESSION CRASHES:** Checkpoint work to daily notes DURING the session, not after.
- **CURRENT.md is THE crash recovery file.** Update at every context threshold (50%+).
- **Cron job crash recovery:** Overnight builds must check `git diff --stat` first and read task files for `[x]` state.
- **active-tasks.md is DEPRECATED.** Use `memory/tasks/CURRENT.md` as single source of truth.

## 📋 Master Plan
- **`PLAN.md`** — All open work in one place. P0/P1/P2 prioritized.

## 🔗 Deep Reference
- `knowledge/INDEX.md` — master index
- `knowledge/infrastructure/` — MacBook, Pi, network, MC
- `knowledge/projects/` — BeerPair, MC v3, rogergimbel-site, rodaco-site
- `knowledge/people/` — Roger, Dale, Stuart profiles
- `TOOLS.md` — all operational reference (commands, IPs, build recipes, model routing)
