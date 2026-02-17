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

## Current Design (as of 2026-02-17)
- Hero: soft blue gradient, serif "Roger Gimbel", subtitle "Technology Architect"
- Tagline: "Working Towards Bitstream In -> Bitstream Out On Edge Devices"
- Navy/gold shield logo, dark/light mode toggle, "About" + "Contact" nav
- Very minimal — essentially hero section only visible at 1440x900

## Improvement Ideas (flagged 2026-02-17)
- Replace `->` with `→` in tagline
- Improve tagline contrast (light gray on light blue is borderline WCAG)
- Add a clear CTA in hero
- More content sections needed below fold
- Consider adding portfolio/projects section

## History
- 2026-02-17: Cloned locally, built, server set up on port 3335, first screenshot taken
