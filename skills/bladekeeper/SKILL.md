---
name: bladekeeper
description: Manage, edit, and enhance the BladeKeeper knife collection app. Use when working on BladeKeeper features, bug fixes, data imports, or Supabase schema changes.
---

# BladeKeeper App Skill

## Quick Reference
- **KB:** `knowledge/projects/bladekeeper/summary.md` (read first — has full schema, status, what works/broken)
- **Source:** `projects/bladekeeper.app/src/`
- **Supabase project:** `zocftrkoaokqvklugztj`
- **Live URL:** bladekeeper.app
- **Stack:** Vite + React + TypeScript + Tailwind + Shadcn + Tanstack Query + Supabase

## Before Any Work
1. Read `knowledge/projects/bladekeeper/summary.md` for current state
2. Read `memory/tasks/CURRENT.md` if resuming work
3. Check `projects/bladekeeper.app/src/App.tsx` for routing

## Supabase Access
- URL: `https://zocftrkoaokqvklugztj.supabase.co`
- Secret key: stored in `/tmp/secrets/` or ask Roger
- Use secret key (not anon) for admin operations (bypasses RLS)
- Roger's user_id: `d86e224a-f86e-4e63-ba12-48a1a055894d`

## Storage Convention
Photos go to: `blade-images/user-uploads/<blade_id>/<timestamp>_<index>.jpg`
⚠️ NOT `<user_id>/<blade_id>/` — the app's `get_blade_images` RPC expects `user-uploads/` prefix.

## Frontend Patterns
- Pages in `src/pages/`, components in `src/components/`
- Data fetching via Tanstack Query hooks in `src/hooks/`
- Supabase client at `src/integrations/supabase/client.ts`
- RPC functions preferred over direct table queries (avoids RLS recursion)
- Key RPCs: `get_user_blades`, `get_blade_images`, `add_or_update_blade`
- Blade types defined as Postgres enum + `src/types/blade.ts`
- Extended attributes schema: `src/utils/bladeAttributeSchema.ts`

## Deploy Pattern
1. **Always `git pull origin main` first** — Lovable may have pushed fixes
2. Edit source in `projects/bladekeeper.app/src/`
3. Push to GitHub: `RogerGimbel/bladekeeper.app`
4. Lovable syncs from GitHub → Roger publishes to Vercel
5. ⚠️ Don't push without Roger's approval (overnight builds are pre-approved)

## Known Gotchas
- Collections page FIXED — `/collections` → `CollectionsPage.tsx`, `/my-blades` → `Collections.tsx`
- `useCollectionData` hook fetches ALL user blades — not collection-specific
- Supabase new API keys: `sb_secret_*` replaces old `service_role` key
- Base64 photo blobs in Replit backup are ~500KB each — don't load full backup into memory

## Testing Accounts
- **Roger's account:** accfighter@gmail.com / 0FatDogs
- **Agent account:** Create with rodaco@agentmail.to (can sign up fresh)
- **Browser testing:** Use agent-browser to browse bladekeeper.app
- **Test images:** Generate knife images with Grok Imagine or Nano Banana Pro for upload testing

## Overnight Build Policy
- BladeKeeper is in the overnight build rotation (see `memory/tasks/overnight-queue.md`)
- **Risk tolerance: HIGH** — this is a fun MVP, be adventurous and creative
- App is ~1 year old — lots of modern UI/UX patterns can be applied
- Roger wants to be surprised with enhancements in the morning
- Push to GitHub after changes — Roger publishes from Lovable
- Enhancement ideas list in the overnight queue file
- Always run `tsc --noEmit` before committing
