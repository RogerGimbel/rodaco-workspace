---
tags: [memory, hot-context, core]
updated: 2026-02-17
---
# MEMORY.md - Hot Context

*Last updated: 2026-02-17*

## 📋 Active Projects
- **BeerPair** — LIVE at beerpair.com. Native apps in progress (Despia). B2B GTM complete (17 assets). KB: `knowledge/projects/beerpair/`
- **Mission Control v3** — Combined API+frontend on :3333. Remaining P2 items in `memory/tasks/overnight-queue.md`. KB: `knowledge/infrastructure/`
- **rogergimbel.dev** — DEPLOYED. Dark charcoal + amber/gold theme, career timeline hero. KB: `knowledge/projects/rogergimbel-site/summary.md`
- **rodaco.co** — DEPLOYED. Dark mode + blue/purple gradient, 8 sections. KB: `knowledge/projects/rodaco-site/summary.md`
- **UGC Campaign Skill** — PRODUCTION READY. Nano Banana Pro + Veo 3.1 pipeline. Full 4-scene campaign in ~3 min for ~$1.50. Presentation: `presentations.rogergimbel.dev/beerpair/ugc/`. KB: `knowledge/projects/ugc-campaign/summary.md`
- **Infrastructure Overhaul** — Steps 1-5 COMPLETE (Tailscale lockdown, host agent, Pi lockdown).

## ⚙️ Model & API Status
- **Primary:** Opus 4.6 (1M context) | **Fallback:** Sonnet 4.6 (1M context)
- **Anthropic API:** Regular API key (not Claude Code OAuth), Tier 4, $460 balance, auto-reload enabled
- **All cron jobs + workflow agents:** Sonnet 4.6 (zero 4.5 references remain)
- **Beta header:** `anthropic-beta: context-1m-2025-08-07` (enables 1M context)

## 🔄 Automation Stack
- **Overnight Build v2** (2 AM ET): Queue-based multi-project feature dev from `memory/tasks/overnight-queue.md`
- **Three-tier monitoring:**
  - Tier 1: Watchdog every 2 min (MC + sites) — up/down + auto-restart
  - Tier 2: Daily CLI health check 6 AM ET — content, SSL, response time, production URLs
  - Tier 3: Weekly browser audit Sun 3 AM ET — screenshots, mobile, click-through
- **Morning Brief** (7 AM ET): Includes overnight build + health check results
- 11 cron jobs total, all on Sonnet 4.6

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
- **Anthropic tier advancement:** $400 cumulative credit purchases → Tier 4 (auto). 1M context requires Tier 4.
- **Config.patch merges, doesn't delete:** Can't remove stale entries (e.g. old sonnet-4-5 alias) via patch.
- **Veo 3.1 reference images:** REST predictLongRunning does NOT support them. Must use Python SDK (`google-genai` package, `uv run --with google-genai`).
- **UGC pipeline economics:** Full 4-scene campaign ~$1.50, ~3 min. Character consistency via reference images is the key insight.

## 📋 Master Plan
- **`PLAN.md`** — All open work in one place. P0/P1/P2 prioritized.

## 🔗 Deep Reference
- `knowledge/INDEX.md` — master index
- `knowledge/infrastructure/` — MacBook, Pi, network, MC
- `knowledge/projects/` — BeerPair, MC v3, rogergimbel-site, rodaco-site
- `knowledge/people/` — Roger, Dale, Stuart profiles
- `TOOLS.md` — all operational reference (commands, IPs, build recipes, model routing)
- `memory/tasks/overnight-queue.md` — overnight build task queue
- `memory/tasks/site-health-plan.md` — monitoring architecture doc
