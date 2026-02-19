# Supabase Projects

**CLI:** `/home/node/workspace/bin/supabase` (v2.75.0)
**Auth:** Token in `/tmp/secrets/supabase-token` (also in `/tmp/secrets/env.sh`)
**Org:** Vercel-linked (`vercel_icfg_wZf7wK8i4vLy9mJy0gsN00cs`)
**Region:** All East US (North Virginia)

## Projects

| Project | Ref ID | Local Path | Has Supabase Dir | Status |
|---------|--------|-----------|-----------------|--------|
| BeerPair | `fvznutxpassjsygkigbk` | ⛔ NOT CLONED (off-limits during app store approval) | unknown | ✅ Production — DO NOT TOUCH |
| BladeKeeper | `zocftrkoaokqvklugztj` | `projects/bladekeeper.app` | ✅ (migrations, functions, seed) | Partial |
| PhysioPal | `gonlzayxhvhxcxvehrfs` | `projects/physiopal` | ✅ (migrations, functions) | Partial |
| SelfGrowth | `hhlwcreuazlhhiqyptsd` | `projects/selfgrowth.app` | ✅ (migrations, functions) | Stalled |
| rodaco-ai | `ppaocwfbfzyhzkjktwgd` | `projects/rodaco.ai` + `projects/natural-db` (fork of supabase-community/natural-db) | ✅ (migrations, functions) | Outdated, domain available |

## Non-Supabase Projects (also cloned)

| Project | Local Path | Backend | Status |
|---------|-----------|---------|--------|
| SupplementLog | `projects/SupplementLog` | None (local storage) | Partial |
| SparkFitness | `projects/sparkyfitness` | None (no supabase dir) | Unknown |
| BladeKeeper (Replit) | `projects/BladeKeeper` | Unknown (326MB, likely Replit version) | Partial |
| BladeBase | `projects/BladeBase` | Unknown (293MB) | Unknown |
| natural-db | `projects/natural-db` | Fork of supabase-community/natural-db — basis for rodaco.ai chatbot | Outdated |

## Workflow (Local Dev → Production)

```bash
# Setup (once per project)
export SUPABASE_ACCESS_TOKEN=$(cat /tmp/secrets/supabase-token)
cd <project-dir>
/home/node/workspace/bin/supabase link --project-ref <ref-id>
/home/node/workspace/bin/supabase db pull    # gets current schema

# Modify
# Edit supabase/migrations/ for schema/RLS changes
# Edit supabase/functions/ for Edge Functions

# Deploy backend
/home/node/workspace/bin/supabase db push              # schema + RLS
/home/node/workspace/bin/supabase functions deploy      # Edge Functions

# Deploy frontend (existing pattern)
git push → Lovable → Vercel
```

## Notes
- All projects linked through Vercel integration
- Supplement Tracker has NO Supabase backend (local storage only)
- Auth config (OAuth providers, redirect URLs) is dashboard-only
- Token is a personal access token — rotate periodically
