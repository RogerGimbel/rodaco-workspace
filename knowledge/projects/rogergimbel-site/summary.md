# Roger Gimbel Personal Site

## Current Status
- **Phase**: Active — locally managed, iterating on improvements
- **Live URL**: https://rogergimbel.dev (Lovable-published)
- **Local dev**: http://100.124.209.59:3335

## Repos
- **GitHub**: `RogerGimbel/rogergimbel-app-artist`
- **Local clone**: `/home/node/workspace/rogergimbel-site`
- **Remote auth**: PAT embedded in git remote URL

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- Static site (no backend/auth)
- Built with Lovable, now locally managed

## Dev Workflow
1. Edit source in `/home/node/workspace/rogergimbel-site/src/`
2. Build: `NODE_ENV=development npm run build --cache /home/node/workspace/.npm-cache`
3. Server auto-serves built `dist/` on port 3335
4. Screenshot: `bash bin/remote-screenshot http://100.124.209.59:3335 rogergimbel-site.png`
5. Iterate → commit → push → Lovable auto-syncs via GitHub two-way sync

## Infrastructure
- Static server: `server.cjs` (CommonJS, ESM-safe) on port 3335
- Watchdog: `bin/sites-watchdog` cron (every 2 min) auto-restarts if down
- Docker port 3335 exposed on Intel Mac (`100.124.209.59`)
- npm cache: always use `--cache /home/node/workspace/.npm-cache` (tmpfs /home/node/.npm is only 200MB)
- Install: always `NODE_ENV=development npm install --legacy-peer-deps` (avoids skipping devDeps)
- Screenshot: uses `--virtual-time-budget=5000` for React to fully render

## Current Design (as of 2026-02-17, v2)
- Always-dark theme: charcoal base (#1a1a2e) + warm amber/gold accents (HSL 43 90% 55%)
- Hero: left-aligned name, gold divider, tagline "I've been building the future since before it had a name", animated career timeline (1994→2026)
- Noise texture + warm amber glow background effects
- Sections: Hero → What I Do (3 pillars) → Built For (8 clients) → BeerPair → Rodaco → Contact → Footer
- Nav: "RG" amber mark + 4 links (What I Do, Built For, Rodaco, Contact)
- No blue gradients, no purple — warm workshop aesthetic

## Roger's Client History (for "Built For" section)
- **Herman Miles Trucking** — GPS tracking web app for trucking fleet
- **IBM** — Part of team that developed SPIN, internal web app for managing software product introduction cycle
- **Hilton Hotels** — Lead dev, revolutionary online solicitation management system
- **El Paso Energy** — Gas pipeline excess capacity auction web app
- **EC-cubed** — Complete B2B and B2C marketplace web app
- **General Electric** — Consultant to dev team for internal business process automation
- **Bastek** (co-founded) — Online automated loan processing system for auto dealers
- **Securite Insurance & Financial Services** — Lead dev on three products:
  - ELOS: electronic loan operating system for servicing auto loan portfolios
  - Online smartphone dropshipping web app (pre-iPhone era)
  - Loan Market Direct: selling security interests in existing auto loans

## Revamp Design Direction (approved 2026-02-17)
- **Color:** Dark charcoal base + warm amber/gold accents (from Gimbel crest --crest-or). NO blue gradients, NO purple.
- **Hero:** Career timeline that scrolls through tech eras (1994→2026), ending with "Bitstream in → Bitstream out"
- **Sections:** "I Build Things" / "I Fix Things" / "I See What's Coming" (not generic "services")
- **BeerPair callout:** Personal angle — proof the future works
- **Rodaco connection:** Co-founder mention + link
- **"Built For"** not "Trusted By" — client names with one-line descriptions of what was built
- **Contact:** Dead simple — email, LinkedIn, GitHub, Twitter. No form.
- **Vibe:** Warm workshop, not sterile tech. Grain texture, amber glow. The person behind Rodaco.

## History
- 2026-02-17: Cloned locally, built, server set up on port 3335, first screenshot taken
- 2026-02-17: Revamp planned — full client history captured, design direction approved
- 2026-02-17: v2 deployed — dark charcoal + amber/gold, career timeline, 8 clients, 7 sections. Commit 38a5f00 pushed. Lovable sync + production deploy confirmed.
