# Bookmark Backlog — From X Bookmarks Digest 2026-02-11

## Priority System
- 🔴 **P1** — Directly improves our stack right now
- 🟡 **P2** — Valuable, worth exploring this week
- 🟢 **P3** — Interesting, explore when time allows

## Backlog

### 🔴 P1 — Immediate Value

| # | Item | Source | Why P1 | Status |
|---|------|--------|--------|--------|
| 1 | **Git safety hooks skill** — Prevents dangerous git commands in Claude Code/OpenClaw | [@mattpocockuk](https://x.com/mattpocockuk/status/2021232187152936962) | We run in Docker sandbox, this adds guardrails | ✅ Installed 2026-02-11 |
| 2 | **xAI free RAG API** — Upload CSVs/PDFs, auto-index and search | [@veggie_eric](https://x.com/veggie_eric/status/2021005716514013218) | Free, we already have XAI_API_KEY, could replace nano-pdf for search | ❌ Shelved — needs Management API Key, possibly Grok Business |
| 3 | **Supabase MCP connector** — Run SQL, migrations, Edge Functions, logs | [@dshukertjr](https://x.com/dshukertjr/status/2021192926739513836) | Roger uses Supabase for everything (BeerPair etc.) | ✅ Installed via CLI 2026-02-11 |
| 4 | **Vercel MCP server** — Debug apps in production via agents | [@vercel_dev](https://x.com/vercel_dev/status/2021312711154598350) | Roger hosts on Vercel, instant production debugging | ✅ Installed via CLI 2026-02-11 |

### 🟡 P2 — Explore This Week

| # | Item | Source | Why P2 | Status |
|---|------|--------|--------|--------|
| 5 | **Vercel `vc logs` for agents** — Query runtime logs from CLI | [@vercel_dev](https://x.com/vercel_dev/status/2021403583783239786) | Companion to Vercel MCP, agent-optimized logging | ⏭️ Skip (have MCP CLI) |
| 6 | **ClawRouter** — Free model fallback + routing for OpenClaw | [@bc1beat](https://x.com/bc1beat/status/2021225617962705391) | Could save API costs with free GPT fallback | ⏭️ Skip (have direct keys) |
| 7 | **Antfarm** — Multi-agent workflow framework on OpenClaw | [@ryancarson](https://x.com/ryancarson/status/2021262180537053419) | Relevant as Rodaco scales agent work | ✅ Installed 2026-02-11 |
| 8 | **3K curated OpenClaw skills repo** — Browse for useful skills | [@code_rams](https://x.com/code_rams/status/2021286687033151821) | Could find more gems like x-bookmarks | 📌 Bookmarked |
| 9 | **draw.io MCP server** — Diagramming via AI | [@drawio](https://x.com/drawio/status/2020918870375370825) | 3.5K likes, useful for architecture docs | 📌 Bookmarked |
| 10 | **Agent activity dashboard** — Monitor AI agent activity | [@tom_doerr](https://x.com/tom_doerr/status/2021243101084258604) | Compare against our Mission Control | ⏭️ Skip (repo 404) |

### 🟢 P3 — When Time Allows

| # | Item | Source | Why P3 | Status |
|---|------|--------|--------|--------|
| 11 | **Orchids AI app builder** — New competitor to Cursor/Lovable/Replit | [@dr_cintas](https://x.com/dr_cintas/status/2021312016745443360) | Competitive intel for Roger's dev workflow | 📌 Try when curious |
| 12 | **Vibe Companion** — Run Codex/Claude Code from phone | [@_StanGirard](https://x.com/_StanGirard/status/2021359921519001699) | Nice-to-have mobile coding | 📌 Try: `bunx the-vibe-companion` on M5 |
| 13 | **Humanize AI text prompt** — Make AI writing undetectable | [@godofprompt](https://x.com/godofprompt/status/2021144772090769873) | Useful for marketing copy | ✅ Saved to knowledge/prompts/ |
| 14 | **Vercel secret scanning** — API token leak detection | [@vercel_dev](https://x.com/vercel_dev/status/2021608579552452703) | Good security practice, quick check | ✅ Automatic (nothing to do) |

## How to Work This

1. I research each item (safety check, feasibility, install steps)
2. Present findings to Roger for approval
3. Install/configure approved items
4. Mark complete and move on

## Notes
- Items 1-4 can likely all be done today
- Item 2 (xAI RAG) is free and we already have the API key
- Items 3-4 (Supabase + Vercel MCP) depend on Roger's project configs
- Created from `bird bookmarks -n 20` on 2026-02-11
