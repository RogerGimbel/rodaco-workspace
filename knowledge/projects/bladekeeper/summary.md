# BladeKeeper

## Current (2026-02-19)
- **Live:** Lovable preview (Supabase `zocftrkoaokqvklugztj`, repo `projects/bladekeeper.app`), waiting for Roger to publish from Lovable UI (commit `4cb6ff4`).
- **Data:** 34 blades (31 imported + 3 test), 32 photos in Supabase Storage (`user-uploads/<blade_id>/<timestamp>.jpg`).
- **Core UX:** Auth + forgot/reset password, dashboard with blade stats, My Blades with sort controls, collections (create/edit/delete/share), blade CRUD with extended attributes, photo upload, profile/settings (change password, theme picker), admin/moderator roles.
- **Visuals:** Warm amber palette, modern card grid, subtle borders (`border-border/40`), premium collector aesthetic. Features page live at `/features` with auth-aware CTAs and “On the horizon” roadmap.

## Product Vision
- **Phase 1:** Best-in-class knife collection manager with Snap & Identify (photo → AI populates maker/model/steel/serial), Ask AI per blade, rich attributes across all weapon types.
- **Phase 2:** Knife marketplace (escrow, provenance, verification via AI) built on the collector community.
- **Phase 3 (maybe):** Parallel verticals (coins/watches/firearms) using the typed attribute system; BladeKeeper stays knife-first.

## Recent Work (Feb 19, 2026)
- Forgot/reset password flow and settings change-password guard.
- Dashboard blade stats (collection value, avg value/length, top makers/steels).
- My Blades sort controls (newest/oldest/A-Z/Z-A/value high/low).
- UI overhaul to warm amber + subtle borders; global card border fix.
- Features page shipped cleanly after cache-poison revert (lesson: never `git add -A` on this repo; avoid `vite.config.ts.timestamp-*`).

## Next
- Mobile polish and galleries (bigger photos, swipe), blade detail enhancements and empty states.
- Collection card previews, advanced search/filter, prep for Snap & Identify + Ask AI.
- Public blade/collection sharing UI.

## Tech
- Vite + React + TypeScript + shadcn/Tailwind; Supabase auth/storage/Postgres; Grok 4.1 Vision planned for AI; Vercel via Lovable.

## History
- 2025: Replit prototype (31 blades, “Ask Grok”).
- 2025–12: Lovable rebuild started (OAuth, multi-tenant).
- 2026-02-18: Data import (31 blades, 32 photos), duplicates cleaned.
- 2026-02-19: Stats + sort + auth recovery + UI overhaul + features page; awaiting Lovable publish.
