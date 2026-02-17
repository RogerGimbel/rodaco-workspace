# Rodaco Corporate Site

## Current Status
- **Phase**: Active — locally managed, iterating on improvements
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

## Current Design (as of 2026-02-17)
- Hero: dramatic full-width whale breaching from ocean (surreal, digital art style)
- "RODACO" in large bold white sans-serif, centered over the image
- Warm sunset sky (pink/orange) behind ocean blues
- Minimal text — no nav visible, no CTA, no value proposition copy

## Improvement Ideas (flagged 2026-02-17)
- Add navigation header
- Add clear value proposition / tagline beneath hero
- Add CTA button(s)
- Clarify what Rodaco is/does for new visitors
- Consider whether whale imagery aligns with brand positioning

## History
- 2026-02-17: Cloned locally, built, server set up on port 3334, first screenshot taken
