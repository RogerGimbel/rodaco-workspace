# BladeKeeper

## Current State
- **Replit version (original):** LIVE at https://knife-collector-28gfhftcmc.replit.app/
  - 31 knives cataloged, rich metadata, high-quality photos
  - Single user (Roger), no OAuth, open access
  - "Ask Grok" AI Q&A feature (Grok 2/3 era)
  - Made for Roger's daughter
  - Repo: `projects/BladeKeeper` (326MB)
- **Lovable version (in progress):** NOT YET LIVE
  - Has OAuth, multi-tenant architecture
  - Missing: "My Blades" collection UI, photo upload, AI identification, Resend email
  - Supabase project: `zocftrkoaokqvklugztj`
  - Repo: `projects/bladekeeper.app` (25MB)
- **Other repos:** `BladeBase` (293MB, unknown purpose)

## Product Vision (Updated 2026-02-18)

### Phase 1: Better Knife App
- AI-powered edged weapon collection manager
- **Snap & Identify:** Photo → AI identifies manufacturer, model, steel, blade type, serial number → auto-populates attributes
- **All weapon types:** folders, lock blades, hatchets, machetes, samurai swords, Japanese cutlery
- **Share:** "Dad, look at this cool knife I found"
- **Ask AI:** Context-aware Q&A about specific blades (steel quality, maker history, value, care)
- **[[BeerPair]] pattern:** Same "point-and-X" AI UX applied to edged weapons

### Phase 2: Knife Marketplace
- Buy/sell/trade within the knife collector community built in Phase 1
- Escrow, authentication verification, provenance tracking via AI
- Transaction fees = revenue model
- More defensible than generic marketplace — AI can verify what's being sold

### Phase 3: Expand Verticals (Maybe)
- Fork the platform for other collection types (coins, watches, firearms)
- Each vertical gets its own brand, AI training, community
- BladeKeeper stays BladeKeeper — siblings, not a rename
- Only pursue if knife market proves the model

### Architecture Principle
- Flexible typed attribute system under the hood (not hardcoded knife columns)
- Keeps generalization option open without sacrificing vertical focus
- User-facing product is 100% knives until Phase 3

### Dev Strategy
- **Roger is moving away from Lovable** — prefers working with [[Rodaco]] (me) directly
- **Likes the deploy pattern:** Lovable → GitHub → Vercel + Supabase
- **Open to being weaned** from that pattern — could go pure GitHub → Vercel + Supabase (skip Lovable entirely)
- Lovable still useful as scaffolding tool but not the primary dev workflow anymore

## Tech Stack
- Frontend: Vite + React + Shadcn (Lovable)
- Backend: Supabase (Postgres + Auth + Edge Functions)
- AI: Grok 4.1 Vision for identification, general Q&A
- Deploy: Vercel (via Lovable)
- Photos: Supabase Storage

## Visual Identity
- Warm amber palette with modern card grid layout
- Subtle card borders (40% opacity in dark mode — no chunky white borders)
- Rust-colored leather/suede photography backgrounds
- Steel-type color badges
- Premium, cohesive collector aesthetic

## Current State (2026-02-19)
- **31 knives imported** into Lovable/Supabase version ✅
- **32 photos uploaded** to Supabase Storage (path: `user-uploads/<blade_id>/<timestamp>.jpg`) ✅
- **Extended attributes** populated (grind, tang, guard, origin, historical notes) ✅
- **Roger's user_id:** `d86e224a-f86e-4e63-ba12-48a1a055894d`
- **Roger's email:** accfighter@gmail.com
- **Supabase project:** `zocftrkoaokqvklugztj`
- **34 total blades** in DB (31 imported + 3 from earlier testing)
- **Collections:** fully functional (create/edit/delete/share) ✅
- **BladeBase repo:** dead weight, ignore

## What Works
- Auth (Supabase, OAuth) + forgot/reset password flow
- Multi-tenant blade storage with RLS
- Blade CRUD (add/edit/view)
- Photo upload to Supabase Storage
- Dashboard with blade stats (collection value, top makers, top steels)
- Type-specific attribute schema (9 blade types)
- Profile, settings (account info, change password, theme picker), notifications pages
- Admin/moderator roles
- Collections (create/edit/delete/add-remove blades/share via link)
- Sort controls on My Blades (newest, oldest, A-Z, Z-A, value high/low)
- Dynamic dropdown options
- Dark mode with subtle card borders (global 40% opacity treatment)
- Warm amber palette, modern card grid layout

## What's Broken / Incomplete
1. **No AI features** — no Snap & Identify, no Ask AI per blade
2. **No public sharing UI** — share infrastructure exists in DB, collection sharing works but blade-level sharing UI missing
3. **No marketplace** — Phase 2
4. **Image display** — uses RPC `get_blade_images`. Works but could improve (lazy loading, galleries)
5. **Mobile UX** — untested, likely needs polish

## Next Up (from overnight queue)
- Modernize blade card design (hover effects, animations)
- Blade detail page enhancements (bigger photos, swipe gallery)
- Mobile UX improvements
- Empty states and onboarding for new users
- Collection card previews (mosaic, cover image)
- Advanced search/filter (steel, manufacturer, blade type, price range)
- AI features prep (Snap & Identify, Ask AI per blade)

## Supabase Schema (Key Tables)
- `blades` — core blade data, user_id for multi-tenant
- `blade_extended_attributes` — type-specific attributes per blade
- `blade_images` — photos linked to blades, storage_path + is_primary
- `collections` — named collections per user (name, description, is_public)
- `collection_blades` — join table (collection_id → blade_id)
- `collection_shares` — share links with share_key
- `blade_shares` — individual blade sharing
- `profiles` — user profiles with avatars
- `notifications` — in-app notifications
- `dropdown_options` — dynamic field values
- `blade_field_visibility` — per-field privacy controls
- `extended_attribute_visibility` — extended attr privacy

## Frontend Structure
- 127 components, 17 pages
- Key pages: Dashboard, My Blades (Collections.tsx), Collections (same!), Add/Edit/View Blade, SharedBlade, SharedCollection, Auth, Profile, Settings, Admin, Moderator
- Stack: Vite + React + TypeScript + Tailwind + Shadcn + Tanstack Query
- Image fetching via RPC `get_blade_images` and `get_user_blades`

## History
- [2025-05] BladeKeeper Supabase project created
- [2025-~06] Replit version built — 31 knives cataloged with "Ask Grok"
- [2025-~12] Lovable rebuild started — OAuth + multi-tenant
- [2026-02-18] Migration plan created — finish Lovable version, import Replit data
- [2026-02-18] 31 knives + 32 photos imported successfully
- [2026-02-18] Duplicates cleaned (28 removed), photos re-uploaded with correct path pattern
- [2026-02-18] App audit complete — Collections fix identified as next task
- [2026-02-19] Overnight: forgot/reset password, blade stats dashboard, sort controls (commits 76fccbc, 499d439)
- [2026-02-19] Morning: UI overhaul (warm amber palette, modern card grid) + global card border fix (commits 7e83a01, 03ff4a0)
- [2026-02-19] All pushed to GitHub, awaiting Lovable sync + Roger publish
- [2026-02-19] Morning: UI overhaul (warm amber palette `7e83a01`) + global card border fix `03ff4a0`
- [2026-02-19] Features/Learn More page shipped `4cb6ff4` — public marketing page at `/features` with breadcrumbs, auth-aware CTAs, 5 feature sections + coming soon
- [2026-02-19] All commits pushed. App awaiting Roger to publish from Lovable UI.
- [2026-02-19] API key rotated on host Mac. Model switched to Sonnet 4.6 as daily driver.
