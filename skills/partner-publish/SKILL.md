---
name: partner-publish
description: Publish unlisted content to rogergimbel.dev or rodaco.co for partner sharing. Handles slug generation, noindex meta, build, git push, and URL delivery. Use when sharing demos, presentations, or previews with Dale/Stuart without making them public.
---

# Partner Publish

Publish unlisted content to production sites for partner access. Content lives at a random URL — not linked from any public page, not indexed by search engines.

## URL Pattern

```
https://<site>/p/<random-slug>/<project>/
```

- `p/` = private unlisted content directory
- Random slug (14+ chars) prevents URL guessing
- `<project>` = descriptive name (e.g. `beerpair-ugc`)

## Supported Sites

| Site | Repo | Local Path | Local Dev |
|------|------|------------|-----------|
| rogergimbel.dev | RogerGimbel/rogergimbel-app-artist | /home/node/workspace/rogergimbel-site | http://100.124.209.59:3335 |
| rodaco.co | RogerGimbel/rodaco.co | /home/node/workspace/rodaco-site | http://100.124.209.59:3334 |

## Steps

### 1. Generate slug
```bash
node -e "console.log(require('crypto').randomBytes(10).toString('base64url'))"
```

### 2. Create content directory
```bash
mkdir -p <site-path>/public/p/<slug>/<project>/
```

### 3. Build the index.html
Every page MUST include:
```html
<meta name="robots" content="noindex, nofollow">
```
Keep it self-contained — inline CSS, no external dependencies. Videos use `<video>` tags with controls. Images use relative paths.

### 4. Copy assets
Place all media (images, videos, etc.) alongside index.html or in subdirectories. Use relative paths only.

### 5. Test locally
Verify at `http://100.124.209.59:<port>/p/<slug>/<project>/` before pushing.

### 6. Build the site (CRITICAL)
```bash
cd <site-path> && NODE_ENV=development npm run build
```
**Why:** Vite copies `public/` into `dist/` during build. Without rebuilding, the new content won't be in the served directory.

### 7. Git push
```bash
cd <site-path> && git add -A && git commit -m "Add partner content: <project>" && git push origin main
```
Lovable auto-syncs from GitHub → deploys to production.

### 8. Deliver URL
Send the full production URL to partners:
```
https://<site>/p/<slug>/<project>/
```

## Mistakes to Avoid

1. **Forgetting to rebuild** — Files in `public/` are NOT served until `npm run build` copies them to `dist/`. This is the #1 gotcha.
2. **Missing noindex meta** — Every unlisted page MUST have `<meta name="robots" content="noindex, nofollow">` or search engines will index it.
3. **Linking from public pages** — NEVER reference `/p/` URLs from any public-facing page, nav, or sitemap.
4. **Using absolute URLs for assets** — Use relative paths (`scenes/video.mp4` not `/p/slug/project/scenes/video.mp4`) so the content is portable.
5. **Forgetting git push** — Local build only updates the dev server. Production requires push → Lovable sync.
6. **Large video files in git** — Git repos have size limits. For large media (>50MB total), consider hosting videos externally and embedding. Current pattern works fine for <50MB.

## Optional: Password Gate

For content that needs more than obscurity, use the password gate template:

### Setup
1. Choose a password and generate its SHA-256 hash:
```bash
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
```
2. Copy `skills/partner-publish/assets/password-gate.html` as your page's `index.html`
3. Replace `%%PASSWORD_HASH%%` with the generated hash
4. Replace the `<!-- REPLACE THIS -->` section with your actual content
5. Share the password with partners via Telegram/email (separate from the URL)

### How It Works
- Client-side SHA-256 comparison (no server needed)
- Session-persistent (unlocks once per browser session via sessionStorage)
- NOT cryptographically secure — determined attacker can view-source and extract content
- Appropriate for: financials, strategy docs, anything beyond casual sharing
- NOT appropriate for: truly sensitive credentials or secrets

## Security Model

This is "security through obscurity" — same as Google Docs "anyone with the link." Appropriate for:
- ✅ Demo presentations, UGC campaigns, partner previews
- ✅ Non-sensitive business content
- ❌ NOT for financials, credentials, or truly confidential docs

If stronger access control is needed, see `knowledge/infrastructure/partner-content-sharing.md` for password gate and Vercel Pro options.

## Example: BeerPair UGC Campaign

```
rogergimbel.dev/p/N2wybL11rCwnAQ/beerpair-ugc/
├── index.html          (showcase page with noindex)
├── characters/         (reference images)
│   ├── character-portrait.png
│   ├── character-action.png
│   └── character-candid.png
└── scenes/             (generated videos)
    ├── scene-01.mp4
    ├── scene-02.mp4
    ├── scene-03.mp4
    └── scene-04.mp4
```
