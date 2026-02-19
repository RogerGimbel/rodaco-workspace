# Replit → Lovable Migration Plan

**Date:** 2026-02-18 13:45 ET
**Tags:** #bladekeeper #supplement-log #replit #lovable #migration #strategy
**Context:** Roger wants to consolidate all apps onto the Lovable/Vercel/Supabase stack and ditch Replit

## Raw Transcript
> I want to move everything I currently have in Replit to Lovable, which includes:
> 1. The supplement log
> 2. This Blade Keeper app
> I want to ditch Replit and continue with our Lovable pattern. Eventually, we will probably all ditch Lovable too, but for now, this pattern works well.
>
> Also, you might have missed a feature: if you click into the details of each of these knives, there is actually an "Ask Grok" button. Back in the days of Grok 2 or 3, you could actually ask Grok about the details of the knife shown (steel type, knife maker, manufacturer). Pretty cool for the time.
>
> Currently it has my whole collection in there and it is not a multi-tenant app with OAuth setup. That is fine for now, but we need to consider the future.
>
> My daughter loves it and I love it. I would like to move it to Lovable but we need to be careful about how we do it.

## Extracted Ideas

### BladeKeeper Features (Replit version)
- 31 knives cataloged with rich metadata (brand, model, steel, blade length, blade type, handle material)
- High-quality photography on rust/amber leather backgrounds
- Card grid layout with steel type color badges
- **"Ask Grok" button** on knife detail pages — AI-powered Q&A about steel types, makers, manufacturers
- Built ~1 year ago with Grok 2/3 integration
- Made for Roger's daughter who loves his knife collection
- Not multi-tenant, no OAuth — single user, open access
- Live at: https://knife-collector-28gfhftcmc.replit.app/

### Migration Requirements
- Move BladeKeeper data (31 knives + photos) to Supabase
- Move SupplementLog to Lovable (currently no backend — local storage)
- Preserve all existing functionality
- Consider future multi-tenancy (other collectors could use it)
- Upgrade "Ask Grok" to current Grok 4.1 capabilities
- Be careful — Roger's real collection data is in the Replit version

### Strategic Note
- Roger expects to eventually outgrow Lovable too — build with portability in mind
- Pattern: Replit → Lovable → eventually self-hosted or custom deploy
- All apps should follow the same stack: Vite+React+Shadcn+Supabase+Vercel

## Connections
- Related: knowledge/infrastructure/supabase-projects.md (BladeKeeper Supabase project already exists)
- Related: projects/bladekeeper.app (Lovable version already started)
- Related: projects/BladeKeeper (Replit version, 326MB)
- Related: projects/SupplementLog (98MB, Replit)
- Action potential: Diff bladekeeper.app vs BladeKeeper to see what the Lovable version is missing
- Action potential: Export knife data from Replit backend → import to Supabase
