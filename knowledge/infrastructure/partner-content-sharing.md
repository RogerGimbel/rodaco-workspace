# Partner Content Sharing — Access Patterns

*Created: 2026-02-18*
*Status: Option 1 (unlisted URLs) chosen for now. Revisit if needs change.*

## Problem
`presentations.rogergimbel.dev` runs on Pi via Caddy, resolves to Tailscale IP (100.83.169.87). Only accessible from Tailscale network. Dale and Stuart can't reach it without installing Tailscale, which is unacceptable.

Production sites (rodaco.co, rogergimbel.dev) go through IONOS (185.158.133.1) and are publicly accessible.

Need: Share proprietary business content (presentations, demos, UGC campaigns) with partners without making it fully public or requiring VPN/Tailscale.

## Options Evaluated

### Option 1: Unlisted URLs ✅ CHOSEN
- Host at `rogergimbel.dev/p/<random-slug>/<project>/`
- Not linked from any public page, not indexed by search engines
- Anyone with the link can access — share URL directly with partners
- Pattern: "security through obscurity" (like Google Docs "anyone with link")
- **Pros:** Simplest, zero infrastructure, zero auth, reusable pattern, 5 min deploy
- **Cons:** Not truly secure — if link leaks, content is accessible. No access logging.
- **Best for:** UGC demos, presentations, partner previews, non-sensitive business content

### Option 2: JavaScript Password Gate
- Static HTML with JS password prompt → reveals content or redirects to hidden path
- No server-side auth needed, works on any static host
- Content can be base64/encrypted in the HTML
- **Pros:** Actual access control, still static hosting, no infrastructure changes
- **Cons:** Client-side only — determined attacker can view source. Password sharing logistics.
- **Best for:** Moderately sensitive content (financials, strategy docs)

### Option 3: Vercel Password Protection
- Built-in on Vercel Pro ($20/mo) — server-side password for specific paths
- Real auth, not bypassable via view-source
- **Pros:** Actual security, professional, built into existing hosting
- **Cons:** Costs $20/mo, Vercel Pro plan, only works for Vercel-hosted sites
- **Best for:** Client-facing deliverables, truly sensitive business content

### Option 4: Cloudflare Access (NOT chosen)
- Roger explicitly doesn't want to deal with Cloudflare tunnel/access configuration
- Too complex for the use case
- **Noted for future:** Could revisit if we need SSO or team-based access control

## Current Pattern
```
rogergimbel.dev/p/<random-slug>/<project>/
```
- `p/` prefix = "private" unlisted content
- Random slug prevents guessing
- Add `<meta name="robots" content="noindex, nofollow">` to prevent indexing
- Never link from public pages

## Future Considerations
- If partner count grows beyond 3, consider Option 2 (password gate)
- If client-facing content, consider Option 3 (Vercel Pro)
- Could add a simple analytics pixel to track if links are accessed by unknown parties
