# Supabase Workflow & Local Dev Pattern Brainstorm

**Date:** 2026-02-18 13:15 ET
**Tags:** #supabase #lovable #replit #vercel #workflow #devops #edge-functions #postgres
**Context:** Roger concerned about how to maintain Supabase integration when cloning repos locally for modification

## Raw Transcript
> Many of the apps I've built with Lovable and Replit have Supabase backends, and I don't know where Replit deploys to. I know Lovable deploys to Vercel, and Vercel has this tight integration with Supabase. My concern is the workflow for modifications:
> 1. If we clone those GitHub repos to work on them locally and then push them back up, I'm not sure how we would handle changes to Supabase functions or Edge Functions.
> 2. Most of my apps are built on Supabase OAuth and database backends (the only one without a backend is a supplement log).
> 3. All my other apps use Supabase and Postgres, even the Replit ones, but I'm not sure if they use Supabase through Vercel or what the specific deployment path is.
> The problem in the back of my head is that if we clone them locally, we need a way to maintain that Supabase connection. A lot of the changes we want to make involve: (a) Changing Edge Functions in Supabase (b) Modifying database tables and relationships (c) Updating RLS policies
> I'm not sure how that's possible with our current pattern of cloning a repository, changing the app, and having it sync with Lovable, Vercel, and Supabase. We've proved the pattern for changing the UI (pushing to GitHub and redeploying with Lovable works perfectly fine), but the extended pattern for Supabase and Postgres is still an unknown to me.

## Extracted Ideas
- UI-only workflow is proven: clone → modify → push → Lovable publishes via Vercel
- Backend workflow is the gap: Edge Functions, DB schema, RLS policies
- Most apps use Supabase (OAuth + Postgres) except Supplement Tracker
- Replit deployment path unclear — need to investigate
- Roger wants full local dev capability including backend changes

## Open Questions
1. Where does Replit deploy? (Replit hosting? Vercel? Custom?)
2. Are Edge Functions stored in the repo or only in Supabase dashboard?
3. Do Lovable projects include `supabase/` directory with migrations?
4. What's the Supabase project ID for each app?
5. Can we use Supabase CLI locally to push migrations + functions?
