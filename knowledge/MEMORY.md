# MEMORY.md - Long-Term Memory

## Security Boundaries (Non-Negotiable - 2026-01-31)

**Moltbook:**
- ❌ Do NOT interact with moltbook.com unless Roger explicitly asks
- No posting, reading, monitoring, or accessing the site

**Email Access:**
- ✅ ONLY read emails from Roger:
  - accfighter@gmail.com
  - rogergimbel@selfgrowth.app
  - roger@rogergimbel.dev
- ❌ Do NOT read emails from any other human or agent
- ❌ Do NOT attempt to fetch or access email inboxes proactively

**Web Browsing:**
- ❌ Do NOT use agent-browser to browse websites unless Roger explicitly asks
- ❌ No proactive web research or site checking
- Web browsing only on explicit request from Roger

---

## Rodaco Development Stack

Roger's standard tech stack for [[Rodaco]] projects:
- **Development Platform:** Lovable
- **Framework:** Vite + React
- **Backend:** Supabase
- **Hosting:** Vercel
- **Domain Registrar:** IONOS
- **Mobile Conversion:** Despia WebView wrapper (for Play Store / App Store)

## Active Projects

### BeerPair.com (Primary - Jan 2026)
Food and beer pairing web app. Currently being converted to native mobile apps via Despia WebView wrapper.

**Current Status (Jan 31, 2026):**
- Web app: LIVE at beerpair.com
- Native apps: IN PROGRESS (Despia WebView wrapper)
- Landing page: REDESIGN IN PROGRESS (outside design company)
- Marketing: PLAN READY, execution on hold until native apps + landing page complete

**Marketing Plan Location:** `knowledge/projects/beerpair-free-marketing-plan.md`

**My [[BeerPair]] Account:**
- Email: rodaco@agentmail.to
- Password: (stored in ~/.openclaw/credentials/beerpair.txt)
- Credits: 8/10 remaining
- AgentMail API: (stored in env AGENTMAIL_API_KEY)

## My Integrations

### Email (Custom CLI - 2026-02-03)
- **Use the email CLI for all email operations**
- From address: rodaco@agentmail.to
- API Key: Embedded in CLI script (self-contained)

**Commands:**
```bash
bash /home/node/workspace/bin/email send "to@example.com" "Subject" "Body"
bash /home/node/workspace/bin/email list 10
bash /home/node/workspace/bin/email inbox
```

### Bird (X/Twitter)
- Authenticated as @rgimbel via env AUTH_TOKEN
- Commands: `bird whoami`, `bird read`, `bird search`, `bird tweet`

### Agent Browser
- Installed: agent-browser 0.8.5
- Use headless mode for automation
- Commands: `agent-browser open`, `agent-browser snapshot`, `agent-browser click`, `agent-browser type`

## Infrastructure

### OpenClaw (Updated 2026-02-09)
- Version: 2026.2.9
- Config: ~/.openclaw/
- Tailscale IP: 100.124.209.59
- Health endpoint: http://100.124.209.59:18789/health
- Secrets: SOPS/Age encrypted in .env.enc (15 keys), tracked in git
- Sops key: ~/.config/sops/age/keys.txt (Intel MacBook)
- To decrypt: `SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt sops decrypt --input-type dotenv --output-type dotenv .env.enc > .env`

### 3-Layer Self-Healing
1. **Autoheal** - Docker container restarts
2. **Healer Service** - Catches degraded states (locks, bloat, zombies)
3. **Uptime Kuma** - External monitoring from Pi, Telegram alerts

### Split DNS & Local Routing (Deployed 2026-02-07)

All media stack services now use `https://*.rogergimbel.dev` URLs everywhere. On home Wi-Fi (SafireMinx), traffic routes directly to Pi via split DNS instead of going through Cloudflare.

**Components:**
- **dnsmasq** on Pi (port 53): `*.rogergimbel.dev` → `10.0.0.20`, AAAA blocked (`::`)
- **Caddy** (custom build with `caddy-dns/cloudflare`): Let's Encrypt TLS via DNS-01 challenge
- **Cloudflare API Token**: stored in `/mnt/media/.env` on Pi
- **Tailscale Split DNS**: `rogergimbel.dev` → `10.0.0.20` (admin console)

**Device DNS** (all set to `10.0.0.20` + `8.8.8.8` fallback):
- [[M5 MacBook]]: Done
- Intel MacBook (OpenClaw): Done
- iPhones: Done (manual DNS in Wi-Fi settings)
- Samsung S10: Done (static IP with manual DNS)

**Key URLs:** jellyfin, requests, admin, family, sonarr, radarr, lidarr, bazarr, prowlarr, tdarr, qbit, sabnzbd, duplicati, status, homarr — all at `https://<name>.rogergimbel.dev`

**Docs:** `/mnt/media/docs/media-stack-operations.md` and `/mnt/media/docs/split-dns-plan.md` in Pi repo

---

*Last updated: 2026-02-09*

### Moltbook (Claimed 2026-01-31)
- Username: [[Rodaco]]
- Profile: https://moltbook.com/u/[[Rodaco]]
- API Key: (stored in ~/.openclaw/credentials/moltbook.json)
- API Base: https://www.moltbook.com/api/v1
- Credentials: ~/.openclaw/credentials/moltbook.json
- Status: ✅ CLAIMED (verified via @rgimbel)
- Agent ID: 0a967a4c-6fb3-4da7-9297-07c6021fa0c3
- Post format: `{"submolt": "name", "title": "...", "content": "..."}`

## API Keys & Secrets Management (Updated 2026-02-07)

**How API keys are loaded:**
- All API keys live in `.env` (gitignored) in the repo root (`/Users/rogergimbel/docker/openclaw/`)
- Docker Compose passes them as environment variables to the container
- The `openclaw.json` config references some via `${VAR_NAME}` syntax (e.g., `${TELEGRAM_BOT_TOKEN}`)

**If keys show "placeholder" or are missing:**
- The encrypted backup is `.env.enc` in the repo root (SOPS + age encryption, tracked in git)
- Decrypt on the Intel MacBook: `SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt sops decrypt --input-type dotenv --output-type dotenv .env.enc > .env`
- sops is installed on the Intel MacBook via Homebrew (installed 2026-02-07)
- The age key is at `~/.config/sops/age/keys.txt` on the Intel MacBook

**Keys stored in `.env.enc` (15 total):**
- OPENCLAW_GATEWAY_TOKEN
- ANTHROPIC_API_KEY, OPENAI_API_KEY, XAI_API_KEY
- GOOGLE_API_KEY, GEMINI_API_KEY, GOOGLE_AI_API_KEY
- OPENROUTER_API_KEY, FIREWORKS_API_KEY, VOYAGE_API_KEY
- AUTH_TOKEN, CT0 (Twitter/X)
- TELEGRAM_BOT_TOKEN, AGENTMAIL_API_KEY
- AGENTMAIL_API_URL

**IMPORTANT:** Never write API keys to files tracked by git. The `.env` file is gitignored. `.env.enc` is tracked (encrypted, safe to commit).
