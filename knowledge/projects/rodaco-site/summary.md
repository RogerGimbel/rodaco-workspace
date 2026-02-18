# Rodaco Corporate Site

## Current Status
- **Phase**: Active — building out full corporate site from placeholder
- **Live URL**: https://rodaco.co (Lovable-published)
- **Local dev**: http://100.124.209.59:3334

## Repos
- **GitHub**: `RogerGimbel/rodaco.co`
- **Local clone**: `/home/node/workspace/rodaco-site`
- **Remote auth**: PAT embedded in git remote URL

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Static site (no backend/auth)
- Built with Lovable, now locally managed

## Dev Workflow
1. Edit source in `/home/node/workspace/rodaco-site/src/`
2. Build: `NODE_ENV=development npm run build --cache /home/node/workspace/.npm-cache`
3. Server auto-serves built `dist/` on port 3334
4. Screenshot: `bash bin/remote-screenshot http://100.124.209.59:3334 rodaco-site.png`
5. Iterate → commit → push → Lovable auto-syncs via GitHub two-way sync

## Infrastructure
- Static server: `server.cjs` (CommonJS, ESM-safe) on port 3334
- Watchdog: `bin/sites-watchdog` cron (every 2 min) auto-restarts if down
- Docker port 3334 exposed on Intel Mac (`100.124.209.59`)
- npm cache: always use `--cache /home/node/workspace/.npm-cache`
- Install: always `NODE_ENV=development npm install --legacy-peer-deps`

## About Rodaco (The Company)

### Overview
[[Rodaco]] is a forward-looking AI innovation company founded ~early 2025 by three partners who collectively bring 35+ years of full-stack web development experience dating back to the mid-90s. The company was formed when they recognized the "vibe coding" revolution — where AI agents build and manage code, and ideas + architectural understanding matter more than manual coding.

### Focus Areas
- AI development & AI agents
- SaaS (recognizing SaaS is evolving — agents build interfaces on the fly)
- B2C and B2B opportunities
- Innovation and entrepreneurship in the AI-transformed software landscape

### Philosophy
- Future-first: traditional software pipelines are rapidly changing
- "Bitstream in, bitstream out" — everything becomes AI-mediated
- The old model of users clicking around websites is dying
- Agents are compiling, building languages, generating software stacks on the fly
- What matters now: ideas, architectural understanding, knowing how to prompt AI to build what you want
- Not a stodgy corporate presence — innovative, entrepreneurial

### Team
1. **[[Roger Gimbel]]** (Denver, CO) — Technical lead. 35+ years full-stack. Background in Java applets → JavaScript → C#/.NET. Deep SQL database expertise (SQL Server, Informix, Oracle, DB2). Extensive B2B consulting. Runs the infrastructure (OpenClaw on Intel MacBook). Full access/control.
2. **[[Dale Abbott]]** (Florida) — Technical partner. Strong technical background similar to Roger. Database expertise. Pays the bills (token costs). Access via Telegram (chat ID 8372298367). Research + simple tasks only (no infrastructure changes).
3. **[[Stuart Seligman]]** (New Jersey) — Marketing research. Somewhat technical. Access via Telegram (chat ID 7655601668). Research + simple tasks only (no infrastructure changes).

### Access Model
- Only Roger can make changes (runs on his hardware)
- Dale and Stuart access via Telegram for research and simple tasks
- All three in shared Telegram chat

### Domains
- **rodaco.co** — Primary corporate site (this project)
- **rodaco.ai** — Legacy prototype AI chatbot (vector/semantic search, long-term memory). Built ~6 months ago as experiment. Site up but non-functional. NOT the main presence.

### Products & Projects
- **[[BeerPair]]** — FLAGSHIP. Live at beerpair.com. Web app fully functional and polished. Native apps in progress (Play Store + App Store). Should be featured on corporate site.
- **Knife collection manager** — app for managing knife collections, not yet polished
- **Self-help site** — partially finished
- **Physical therapy guidance app** — "nagging app" prototyped for Roger's dad's PT regimen
- **Supplement tracker** — for people on carnivore diets
- **Mission Control v3** — Internal ops dashboard (not client-facing)
- Most projects started before vibe coding matured; not ready to showcase yet

### Target Audience
1. Potential clients wanting AI-powered products built
2. Potential partners
3. Potential investors

### Content Strategy
- Feature [[BeerPair]] as flagship product showcase
- Simple "who we are and what we believe" section (not a manifesto, just clear and honest)
- No case studies or deep showcases yet — other projects not polished enough
- Will add more product showcases as projects mature

## Current Design (as of 2026-02-17)
- Placeholder: video background with "RODACO" centered, entire page clicks to rodaco.ai
- No navigation, no content sections, no value proposition
- Needs full buildout: about, services, team, contact, etc.

## Design Brief (2026-02-17)
- NOT a regular stodgy corporate presence
- Future-looking, innovative, entrepreneurial feel
- Should reflect the AI-first, agent-driven philosophy
- Creative and imaginative — break conventions
- Audiences: clients, partners, investors
- Feature [[BeerPair]] prominently
- Simple belief/identity section

## Dev→Deploy Pattern (Validated 2026-02-17)
1. Edit locally in `/home/node/workspace/rodaco-site/src/`
2. Build: `cd rodaco-site && NODE_ENV=development npm run build`
3. Test on http://100.124.209.59:3334
4. `git commit && git push origin main`
5. Lovable auto-syncs via GitHub two-way sync
6. Roger deploys to production from Lovable UI

## History
- 2025-early: Company founded
- 2026-02-17: Cloned locally, built, server set up on port 3334, first screenshot taken
- 2026-02-17: Full corporate site buildout initiated — Roger provided comprehensive brief
- 2026-02-17: v1 deployed — 8 sections, dark mode, particle animation. Commit ef98123 pushed to GitHub. Lovable sync confirmed. Pattern validated end-to-end.
