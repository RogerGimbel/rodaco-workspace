# Active Tasks

## 🌐 Agent Browser → MC v3 Dashboard — ON HOLD (2026-02-15)

**Goal:** Get agent-browser to browse the Lovable-hosted Mission Control v3 frontend with live API data populated, so we can visually audit/walk through the app programmatically.

**Status:** ON HOLD — root cause identified, multiple fix options documented

### Root Cause Analysis
- The Lovable frontend is at `https://rodaco-mc.lovable.app` with `VITE_API_URL=https://mission.rogergimbel.dev`
- The headless Chromium in the container runs on the **public internet** (outbound IP `98.43.88.216`), NOT on Tailscale
- `mission.rogergimbel.dev` goes through Cloudflare → Caddy on Pi → MacBook:3333
- Cloudflare blocks HeadlessChrome (User-Agent: `HeadlessChrome/145.0.0.0`) — likely Bot Fight Mode
- Browser also **can't reach localhost** (different network namespace from shell)
- Mixed content (HTTPS page → HTTP localhost) is blocked even with `--disable-web-security`
- Self-signed HTTPS proxy on localhost also fails because browser can't reach localhost at all

### What We Already Tried
1. ❌ Direct browsing — all API calls return status 0
2. ❌ HTTP proxy on localhost:3334 (force IPv4) — browser can't reach localhost
3. ❌ HTTPS proxy on localhost:3335 (self-signed cert) — browser can't reach localhost
4. ❌ `--ignore-https-errors` + `--disable-web-security` + `--allow-running-insecure-content` — still can't reach localhost
5. ❌ fetch/XHR monkey-patch to redirect API calls — destination unreachable regardless
6. ✅ Confirmed: browser CAN reach public internet (httpbin.org works)
7. ✅ Confirmed: curl through Cloudflare IPs works (not a Caddy/origin issue)

### Caching Fix (DONE ✅)
- Fixed uncached `execSync` call in `/api/v3/agent/cron-jobs` (line 980 of `api-v3.js`)
- Now uses `cachedExec()` with 60s TTL like all other CLI calls
- All `openclaw` CLI invocations now go through the cache

### Options to Pursue (Pick One)

**Option A: Whitelist HeadlessChrome in Cloudflare**
- Add a Cloudflare WAF rule to skip bot checks for `mission.rogergimbel.dev`
- Fastest fix if Roger has Cloudflare dashboard access
- Risk: slightly reduces bot protection on that subdomain

**Option B: DNS-only subdomain (bypass Cloudflare proxy)**
- Create `mc-direct.rogergimbel.dev` pointing to Pi's public IP with Cloudflare proxy OFF (grey cloud)
- Browser hits origin directly, no bot checks
- Need to set up TLS on Caddy for this subdomain

**Option C: Chrome Relay (use Roger's real browser)**
- Use `browser` tool with `profile="chrome"` — connects to Roger's actual Chrome via relay extension
- Works immediately since Roger's Chrome is on Tailscale
- Downside: requires Roger to have Chrome open with the relay tab attached

**Option D: Serve Lovable frontend locally (back burner)**
- Clone the Lovable GitHub repo, run `VITE_API_URL=http://localhost:3333 npm run dev`
- Both frontend and API on localhost, no network issues
- Downside: changes dev patterns, need to keep local copy in sync with Lovable

### How to Resume
1. Read this task
2. Pick an option with Roger
3. For Option A: Roger goes to Cloudflare dashboard → WAF → create rule
4. For Option B: Roger creates DNS record, we configure Caddy
5. For Option C: Roger opens Chrome, clicks relay button, we browse
6. For Option D: Get Lovable GitHub repo URL, clone, run locally

## 🔐 SOPS/age Secrets Hardening — ✅ COMPLETE (2026-02-14)
Deployed. All secrets encrypted at rest via SOPS/age, decrypted to `/tmp/secrets/` (tmpfs) at startup.

---

## 🖥️ Mission Control v3 — Round 2 Lovable Prompts IN PROGRESS

**Goal:** Fix visual bugs and enhance MC v3 frontend via Lovable prompts
**Status:** FEEDING PROMPTS TO ROGER ONE AT A TIME
**Progress tracker:** `mission-control/lovable-prompts/audit-round2-progress.md`
**Full prompts:** `mission-control/lovable-prompts/2026-02-15-round2-audit.md`

### How to resume
1. Read `mission-control/lovable-prompts/audit-round4-progress.md` for current position (LATEST)
2. Read `mission-control/lovable-prompts/2026-02-15-round3-audit.md` for the actual prompt text
3. Send the next unchecked prompt to Roger
4. After Roger confirms done, check the box and send the next one

### Queue (12 Lovable prompts)
- [ ] Fix 2 — Home page second row layout / cron jobs overflow
- [ ] Fix 8 — Pi disk color thresholds (ROOT red at 55%)
- [ ] Fix 1 — Backup alert display
- [ ] Fix 3 — Active tasks count showing completed as active
- [ ] Fix 4 — Hide "cost: unknown" on model cards
- [ ] Fix 7 — Overnight history "unknown" fields
- [ ] Enhancement 14 — Rodaco status hero card
- [ ] Enhancement 9 — Usage/Activity sections on Home
- [ ] Enhancement 11 — Research Kanban card polish
- [ ] Fix 5-6 — Sessions + session health warnings
- [ ] Enhancement 10 — Knowledge graph verification
- [ ] Enhancement 12-13 — Animations + MacBook card

---

## 🌙 Mission Control v3 — Overnight Build (2026-02-16) — ✅ COMPLETE

**Goal:** Full API audit + backend improvements + Lovable prompts  
**Status:** ✅ Complete at 2:23 AM  
**Duration:** 23 minutes

### What Was Done

#### Backend Enhancements
✅ Enhanced overnight-history parser (flexible patterns, auto-extracts highlights)  
✅ Created 4 new creative endpoints:
- `/api/v3/wins` - Recent achievements
- `/api/v3/tools/top` - Tool usage stats + error rates
- `/api/v3/projects/velocity` - Project momentum (📈📉→)
- `/api/v3/knowledge/growth` - Knowledge base expansion

✅ All endpoints tested and working  
✅ No breaking changes to existing API

#### Documentation Created
✅ Comprehensive Lovable prompts (`lovable-prompts/2026-02-16-overnight-build.md`)  
✅ Full API audit report (`audit/2026-02-16-api-audit.md`)  
✅ Memory entry (`memory/2026-02-16.md`)

### Files Changed
- `mission-control/src/routes/api-v3.js` (+200 lines)
- 3 new documentation files

**Status:** Ready for Roger to apply Lovable prompts
