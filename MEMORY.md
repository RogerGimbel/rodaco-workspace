---
tags: [memory, hot-context, core]
updated: 2026-02-17
---
# MEMORY.md - Hot Context

*Last updated: 2026-02-17*

## 📋 Active Projects
- **BladeKeeper** — LIVE at bladekeeper.app. Knife collection manager. 31 knives imported. Collections feature shipped. Strategy: vertical on knives → marketplace → expand. In overnight build rotation (P1, HIGH risk). KB: `knowledge/projects/bladekeeper/summary.md`. Skill: `skills/bladekeeper/SKILL.md`. **Core vision:** snap & identify (photo → AI auto-populates all attributes). 20 European collectors signed up on first launch = proven demand. Personal to Roger (built for his daughter). Replit original: https://knife-collector-28gfhftcmc.replit.app/
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
- **1M context:** Via `params.context1m: true` per model (replaced manual anthropic-beta header in 2026.2.17)
- **Opus thinkingDefault:** low | **Telegram reaction notifications:** all
- **OpenClaw version:** 2026.2.17

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
- **Docker port mappings:** Must be added to docker-compose.yml for each new service. Watchdog checking localhost won't catch missing port forwards — the server runs fine inside the container but external access fails silently.
- **MOBILE FIRST:** Always test mobile viewport (Playwright with isMobile:true) BEFORE pushing CSS changes. Subtle overlays/textures that look fine on desktop create visible boundaries on mobile. Never add background effects that don't cover the full page edge-to-edge.
- **Fix root cause, not symptoms:** When something looks broken, diagnose properly and fix once. Don't push 3 incremental commits hoping one works.
- **BladeKeeper image pattern:** Hooks pass raw storage paths. Components sign at render time via `getSignedBladeImageUrl()`. Don't sign in hooks (double-signing breaks URLs).
- **Lovable preview ≠ production:** Signed Supabase URLs break in Lovable's iframe preview. Always test on deployed site.
- **Lovable 2-way sync:** Always `git pull` before editing — Lovable may have pushed fixes to GitHub.
- **Project registry:** `knowledge/projects/REGISTRY.md` — single source of truth for all projects.
- **Fixes database:** `knowledge/fixes/INDEX.md` — searchable known issues and fixes to avoid wasting tokens.
- **SESSION CRASHES:** Checkpoint work to daily notes DURING the session, not after.
- **CURRENT.md is THE crash recovery file.** Update at every context threshold (50%+).
- **Cron job crash recovery:** Overnight builds must check `git diff --stat` first and read task files for `[x]` state.
- **active-tasks.md is DEPRECATED.** Use `memory/tasks/CURRENT.md` as single source of truth.
- **Anthropic tier advancement:** $400 cumulative credit purchases → Tier 4 (auto). 1M context requires Tier 4.
- **Config.patch merges, doesn't delete:** Can't remove stale entries (e.g. old sonnet-4-5 alias) via patch.
- **Veo 3.1 reference images:** REST predictLongRunning does NOT support them. Must use Python SDK (`google-genai` package, `uv run --with google-genai`).
- **UGC pipeline economics:** Full 4-scene campaign ~$1.50, ~3 min. Character consistency via reference images is the key insight.

## 🔗 Partner Content Sharing
- Pattern: `rogergimbel.dev/p/<random-slug>/<project>/` (unlisted URLs, no auth)
- Problem: Pi presentations site only reachable via Tailscale — partners can't access
- Decision doc: `knowledge/infrastructure/partner-content-sharing.md` (4 options evaluated)
- Revisit if needs change (password gate, Vercel Pro, Cloudflare Access)

## 📦 Roger's Project Queue (Stalled/Partial — Near-Term Opportunities)
- **PhysioPal** — Physio routine reminders, built for Roger's father (elderly/post-surgery market). Back-burner. Lives in Lovable. Humanitarian angle is real.
- **Supplement Tracker** — Carnivore diet electrolyte/vitamin tracking. No backend (local storage). Simplest to ship. Lives in Replit → migrate to Lovable.
- **selfgrowth.app** — Stalled client project (selfgrowth.com owner). Self-help content aggregator/event listings. Saturated niche, but domain + codebase exist. Might have new life with agentic AI.
- **rodaco.ai** — Was an AI chatbot with memory + vector search. Concept obsolete. Valuable .ai domain to repurpose as Rodaco AI showcase or demo site.
- **SparkFitness** — Forked repo, NOT a product. Reference material only for PhysioPal ideas.
- **Insight:** Roger estimates BeerPair (6 months solo) = 3 days with current AI tooling. His stalled projects are a queue of near-term completions.
- **Supabase workflow gap:** UI-only clone→push proven. Edge Functions + DB migrations + RLS local dev pattern still undocumented.

## 📡 Daily AI Digest (2026-02-18)
- Cron: 8 AM MT daily, isolated session on Sonnet 4.6
- Script: `bin/daily-ai-digest` — 4-tier X search (known voices, engineer discovery, product updates, trends)
- 20+ known handles + topic searches that surface company engineers organically
- Roger's #1 info source is X — engineers at AI companies post gems before execs announce
- Digest format: 🔥 Breaking, 💎 Engineer Gems, 🔮 Trends, 👀 Worth Watching

## 📝 Notes System (2026-02-18)
- `notes/` directory — Roger's brainstorms, ideas, thinking-out-loud
- Capture triggers: "note this", "brainstorm", "thinking out loud", stream-of-consciousness detection
- Format: timestamped markdown with raw transcript + extracted ideas + tags + connections
- `notes/INDEX.md` — living table of contents by theme
- `notes/CAPTURE_GUIDE.md` — internal capture protocol
- Synthesis every 3-5 days during heartbeats — extract insights, spot patterns
- Searchable via `memory_search` (semantic search covers notes/ automatically)
- Roger uses Typeless (speech-to-text) — expect conversational, unpolished input

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
