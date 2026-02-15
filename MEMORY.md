# MEMORY.md - Long-Term Memory

## Security Boundaries (Non-Negotiable - 2026-01-31)

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

Roger's standard tech stack for Rodaco projects:
- **Development Platform:** Lovable
- **Framework:** Vite + React
- **Backend:** Supabase
- **Hosting:** Vercel
- **Domain Registrar:** IONOS
- **Mobile Conversion:** Despia WebView wrapper (for Play Store / App Store)

## Active Projects

### BeerPair.com (Primary - Updated 2026-02-12)
Food and beer pairing web app. B2B venue strategy now fully developed.

**Current Status (Feb 12, 2026):**
- Web app: LIVE at beerpair.com
- Native apps: IN PROGRESS (Despia WebView wrapper)
- Landing page: REDESIGN IN PROGRESS (outside design company)
- Marketing: B2C + B2B + Integrated strategy COMPLETE

**B2B GTM Sprint (Feb 12):** Built 17 assets with Roger & Stuart:
- Pricing (4 tiers $49-$3K), sales funnel, ROI calculator, positioning narrative
- Homepage copy, explainer video script, outbound scripts, pitch deck
- Sell sheet, brand voice guide, sales playbook, distributor messaging
- Chain-account kit, onboarding emails (9-email), customer success playbook, brand identity system
- Target: breweries ($3K-$10K/mo ad spend), restaurants ($1.5K-$7K/mo)

**Marketing Presentation (3-tab HTML):**
- **Live:** https://presentations.rogergimbel.dev/beerpair/
- Also at: http://100.124.209.59:3333/beerpair-marketing-plan.html
- Tabs: Consumer (B2C), Venue (B2B), Integrated Strategy
- 10 Nano Banana images across all tabs
- Pi path: `/mnt/media/presentations/beerpair/`
- Workspace: `beerpair-deploy/index.html`

**Marketing Plan Location:** `knowledge/projects/beerpair-free-marketing-plan.md`

**My BeerPair Account:**
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

### Installed Skills (workspace/skills/) — Updated 2026-02-12
- **bird** — X/Twitter CLI (@rgimbel)
- **email** — Custom CLI (rodaco@agentmail.to)
- **late-api** — Social media scheduling API
- **marketing-skills** — 34 marketing sub-skills (copywriting, SEO, CRO, etc.)
- **memory-search** — Semantic memory search
- **octolens** — Brand mention monitoring
- **github** — `gh` CLI v2.86.0 at workspace/bin/gh (authenticated as RogerGimbel, token in ~/.config/gh/hosts.yml)
- **nano-pdf** — PDF editing/reading, v0.2.1 at workspace/pylib (wrapper at workspace/bin/nano-pdf)
- **canvas** — Display HTML on connected nodes (needs paired iOS/Mac node)
- **healthcheck** — Host security hardening & audits
- **summarize** — v0.11.1 on M5 MacBook (`ssh rogergimbel@100.71.128.20 /opt/homebrew/bin/summarize`). YouTube, podcasts, URLs, local files. `--slides` for visual summaries.
- **save** — `/save` command: memory flush + fact extraction + git commit (Feb 12)
- **video-gen** — Grok video generation (`grok-imagine-video`), 8-sec MP4s (Feb 12)
- **grok-image** — Grok image generation (`grok-imagine-image`, `--pro` for pro) (Feb 12)
- **get-to-know-you** — Periodic questions to deepen understanding of Roger (Feb 12)

### xAI Media Generation (Confirmed 2026-02-12)
- **Image:** `POST /v1/images/generations` — models: `grok-imagine-image`, `grok-imagine-image-pro`
  - Sync, returns URL. Script: `skills/grok-image/grok-image.sh`
- **Video:** `POST /v1/videos/generations` — model: `grok-imagine-video`
  - Async (request_id → poll `/v1/videos/{id}`), ~20s for 8-sec MP4
  - Script: `skills/video-gen/video-gen.sh`
- **Fallback:** Google Veo 3.1 (`veo-3.1-generate-preview`) via Gemini API
- All use `$XAI_API_KEY` from env

### /save Command (Built 2026-02-12)
- Trigger: `/save`, `save`, or `save <summary>`
- Skill: `skills/save/SKILL.md`
- Script: `bin/save`
- Workflow: flush memory → extract facts → update MEMORY.md → git commit + push

### Get-to-Know-You System (Built 2026-02-12)
- 110 questions across 10 categories in `knowledge/people/roger-gimbel/questions.json`
- Scripts: `skills/get-to-know-you/ask.sh` + `record-answer.sh`
- Cron: Mon 10AM MT, Wed 2PM MT, Fri 11AM MT
- First question fires Fri Feb 13

### Roger's Dev Workflow (2026-02-09)
- Roger does all coding with: Claude Code, Lovable, Cursor, Replit, Bolt, Antigravity, Codex
- Has existing GitHub workflow that works well — don't push coding assistance unless asked
- gh CLI available for light tasks (PR status, issues) when he's ready

### Obsidian (Completed 2026-02-11)
- **Sync method:** iCloud
- **Vault name:** Rodaco
- **Synced across:** Intel MacBook, M5 MacBook, iPhone
- Workspace files visible in Obsidian (MEMORY.md, daily notes, knowledge graph)
- Wikilinks in knowledge files render in both Mission Control graph AND Obsidian native graph
- **LESSON:** iCloud sync changed file ownership to UID 501, breaking container writes. Fixed via Alpine container with real root. Need one-directional sync to prevent recurrence.
- **LESSON:** iCloud created recursive folder duplication (memory/memory/memory/..., knowledge/knowledge/...) — 3000+ junk files. Cleaned up via Alpine container.

### Mission Control v2 (Shipped 2026-02-11, Mobile Redesign 2026-02-12)
- Refactored monolithic server.js into modular src/routes/ + src/lib/
- New tabs: Knowledge Graph (canvas), Memory Timeline (heatmap), Ops Dashboard
- Frontend split into lazy-loaded components/ per tab
- Server path: mission-control/src/server.js
- Supervisor updated to use src/server.js
- Knowledge graph: 387 entities, needs wikilinks for connections
- **Mobile-first redesign (Feb 12):** 3 breakpoints (<640px, 640-1024px, >1024px)
  - Mobile: bottom nav (5 icons + More overflow), compact header, collapsed system bar, stacked events, calendar day list, 44px touch targets
  - Tablet: top tabs, 2-col layouts, 7-col calendar
  - Desktop: unchanged
  - Files: style.css (full rewrite), index.html, app.js, components/activity.js

### Cron Jobs (Updated 2026-02-13)

**OpenClaw Internal Cron:**
- Morning brief — 7 AM ET daily
- Overnight build — 2 AM ET daily
- Daily backup (Pi + GitHub) — 4 AM MT daily (600s timeout, Telegram on failure)
- Weekly knowledge synthesis — 9 AM MT Sunday (job `fe7d0fce`)
- Get-to-know-you — Mon 10AM, Wed 2PM, Fri 11AM MT
- OpenClaw iOS TestFlight check — noon MT daily

**MacBook Host Crontab (4 entries):**
- Health check (*/5 min), Telegram watchdog (*/2 min), Docker prune (Sun 3 AM), log rotation (Sun midnight)
- Morning brief, overnight build, weekly synthesis all REMOVED (migrated to OpenClaw cron)

**Pi Crontab (9 entries):**
- Storage alert (noon), backup to MacBook (3 AM), MacBook recovery (*/10 min)
- Gluetun watchdog (*/2 min), network watchdog (*/5 min)
- Docker prune (Sun 4 AM), SMART check (Sun 5 AM), log rotation (Sun 1 AM)

## Infrastructure

### Mission Control Dashboard
- **API:** http://100.124.209.59:3333 (backend, port 3333)
- **Frontend:** https://rodaco-mc.lovable.app (Lovable-hosted Vite+React app)
  - Routes: / (Home), /ops (Ops), /knowledge (Knowledge Graph), /memory (Memory Timeline), /projects (Projects), /research (Research)
- Server: `/home/node/workspace/mission-control/server.js`
- **Supervised** via `mission-control/supervisor.sh` (auto-restart on crash, circuit breaker 10/5min)
- Started by heartbeat via `mission-control/start.sh` (checks if already running)
- Logs: `/tmp/mission-control.log`

### OpenClaw Directory Structure (CANONICAL — DO NOT FORGET)

**Host machine:** Intel MacBook Pro 2018 (`rogers-macbook-pro`)
**Host user:** `rogergimbel`
**Docker Compose dir:** `/Users/rogergimbel/docker/openclaw/`

| Container Path | Host Location | Type |
|---|---|---|
| `/home/node/workspace` | Docker volume `moltbot_workspace` | Named volume |
| `/home/node/.openclaw` | Docker volume `moltbot_config` | Named volume |
| `/var/log/moltbot` | Docker volume `moltbot_logs` | Named volume |
| `/home/node/.cache` | Docker volume `moltbot_qmd_cache` | Named volume |
| `/home/node/.ssh/id_ed25519` | `/Users/rogergimbel/docker/openclaw/ssh-keys/moltbot_key` | Bind mount (ro) |

**⚠️ The workspace is a Docker volume, NOT a bind mount!**
- There is NO `/Users/rogergimbel/docker/openclaw/workspace/` on the host
- To copy files in: `docker cp <file> moltbot-gateway:/home/node/workspace/`
- To copy files out: `docker cp moltbot-gateway:/home/node/workspace/<file> <dest>`
- Container name: `moltbot-gateway`

### Secrets Management (Deployed 2026-02-14)
- **Method:** SOPS/age encryption → decrypt to tmpfs at container startup
- **Encrypted file:** `~/docker/openclaw/secrets.enc.yaml` (git-safe)
- **Age key:** `~/docker/openclaw/age-key.txt` (ONLY plaintext secret on host)
- **Entrypoint:** `decrypt-secrets.sh` runs before OpenClaw, exports env vars + writes credential files
- **Decrypted to:** `/tmp/secrets/` (NOT `/run/secrets/` — `/run` is root-owned, node user can't mkdir there)
- **LESSON:** Container runs as uid 1000. `/run` = root tmpfs (755). `/tmp` = world-writable tmpfs (1777). Always use `/tmp` for user-writable temp files.
- **Contains:** 15 env vars + GitHub PAT + BeerPair password + Xfinity creds
- **No more `.env` needed** for secrets (still exists as backup, can be deleted)
- **Dockerfile:** Added sops v3.9.4 + age v1.2.1 binaries
- **Bind mounts:** `/opt/secrets/secrets.enc.yaml:ro` + `/opt/secrets/age-key:ro`
- **Git safety:** `age-key.txt` and `*.bak` added to `.gitignore`
- **To add a new secret:** decrypt `secrets.enc.yaml` → edit → re-encrypt → rebuild container

### Development Pattern: Agent Browser → Lovable Prompts (Established 2026-02-15)
- **Pattern:** Browse live web apps with agent-browser, identify issues/improvements, write detailed Lovable prompts for Roger to paste
- **Works for:** Any Lovable-built frontend with an API backend we control
- **Steps:** (1) Visit every page, screenshot, check console errors (2) Audit API responses (3) Fix backend issues directly (4) Write copy-paste Lovable prompts with exact API response shapes (5) Feed prompts one at a time
- **Key:** Include API response shapes in prompts so Lovable knows what data is available
- **First use:** MC v3 — 23 prompts, full redesign pass in one session

### Mission Control v3 (Updated 2026-02-15)
- 3-layer resilience: supervisor (auto-restart on crash) → cron watchdog every 5 min (`ac4f86b8`) → heartbeat backup
- Watchdog auto-restarts if down, alerts Roger if restart fails
- Common failure: overnight build kills server, forgets to restart
- Start command: `bash mission-control/start.sh`
- **Feb 15 overnight:** Added 5 metrics endpoints (costs, performance, session-health, health-score, overnight-history) + 30 Lovable frontend prompts

### OpenClaw (Updated 2026-02-15)
- Running **2026.2.14** (upgraded from 2026.2.13)
- Notable: cron skipped-job fix, memory autoCapture now opt-in, 15+ security fixes (path traversal, SSRF, etc.)
- New: `openclaw message poll` for Telegram polls
- Memory recall default changed to `searchMode=search` (faster)

### OpenClaw (Archived 2026-02-09)
- Version: 2026.2.9
- Config: ~/.openclaw/
- Tailscale IP: 100.124.209.59
- Health endpoint: http://100.124.209.59:18789/health
- Secrets: SOPS/Age encrypted in .env.enc (15 keys), tracked in git
- Sops key: ~/.config/sops/age/keys.txt (Intel MacBook)
- To decrypt: `SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt sops decrypt --input-type dotenv --output-type dotenv .env.enc > .env`

### Mission Control Dashboard (v3 — Updated 2026-02-14)
- **API Backend:** http://100.124.209.59:3333 (35 endpoints in `api-v3.js`)
- **API Public URL:** https://mission.rogergimbel.dev (Caddy on Pi → MacBook:3333)
- **Frontend:** https://rodaco-mc.lovable.app (Vite + React, built in Lovable)
- **Frontend env var:** `VITE_API_URL=https://mission.rogergimbel.dev`
- Server: `mission-control/src/server.js`
- API routes: `mission-control/src/routes/api-v3.js` (~1400 lines)
- Spec: `knowledge/projects/mission-control-v3/spec.md`
- API Reference: `knowledge/projects/mission-control-v3/api-reference.md`
- **Supervised** via `mission-control/supervisor.sh` (auto-restart on crash, circuit breaker 10/5min)
- Started by heartbeat via `mission-control/start.sh`
- Logs: `/tmp/mission-control.log`
- **Status (Feb 14):** API complete, Home + Projects pages working, remaining 4 pages need Lovable prompt pasted

### Pi Storage Architecture (Updated 2026-02-13)
- **SD Card (/):** 58GB, ~56% used — OS only
- **SanDisk USB (/mnt/docker):** 229GB, ~9% used — Docker data-root
- **2TB SSD (/mnt/media):** 1.8TB, ~33% used — media + configs
- Docker data-root migrated from SD card to SanDisk (Feb 13)
- fstab: UUID-based with `nofail`, udev rule prevents double-mount
- Disabled services: CUPS, rpcbind, InfluxDB (purged), Kodi
- Core dumps disabled (`/etc/sysctl.d/50-coredump.conf`)
- Pironman5: fan mode Balanced (3), dashboard removed, OLED enabled
- Known Pironman bug: vibration switch toggles fans instead of waking OLED

### Self-Healing Architecture (Updated 2026-02-13)

**MacBook (4 layers):**
1. **Docker healthcheck** — HTTP server crash/hang (~1 min detection)
2. **Autoheal container** — auto-restarts unhealthy containers (~30s)
3. **Healer service** — zombies, CPU, disk, session bloat, stuck QMD (30s loop, 5-min alert dedup)
4. **Telegram watchdog** — stuck undici fetch pool (every 2 min)

**Pi (6 components):**
1. **Autoheal** — unhealthy container restarts
2. **Healer service** — media stack webhook receiver
3. **Tailscale watchdog** — auto-reconnect after ISP outages
4. **Storage alert** — 3-drive monitoring with Telegram alerts (daily)
5. **SMART check** — drive health monitoring (weekly)
6. **MacBook recovery** — ping + WoL chain every 10 min

**Cross-machine:**
- Pi monitors MacBook health → WoL recovery if down (3 attempts, 2-min waits)
- MacBook `restartpowerfailure` NOT SUPPORTED (2018 Intel, desktop-only feature)
- Power failure chain: battery → boots on AC return → Pi WoL if needed
- Uptime Kuma on Pi → Telegram alerts for MacBook outages

### Backup Strategy (Deployed 2026-02-13)
| Direction | What | When | Method |
|-----------|------|------|--------|
| MacBook → Pi | Workspace + config volumes | 4 AM MT daily | tar+ssh+gzip, 7 DoW + 14 dated |
| MacBook → GitHub | Workspace (text only) | 4 AM MT daily | git push (private repo) |
| Pi → MacBook | Configs, compose, scripts, docs, system state | 3 AM daily | rsync (LAN→Tailscale fallback) |

Restore procedure: `knowledge/infrastructure/intel-macbook/restore-procedure.md`

### Pi Hardening (Deployed 2026-02-13, Fixed 2026-02-13 late)
- UFW firewall with Docker-aware DOCKER-USER chain (LAN + Tailscale allowed, WAN blocked)
- **CRITICAL:** DOCKER-USER chain MUST have `conntrack --ctstate ESTABLISHED,RELATED -j RETURN` as FIRST rule — without it, containers can't receive response packets from the internet (broke Cloudflare Tunnel, all outbound container traffic)
- Persisted in `/etc/ufw/after.rules`
- Journal capped at 100MB
- SMART monitoring on both USB drives (weekly, Telegram alerts)
- SSH: key-only, no root login
- Hardware watchdog (15s timeout)
- Docker live-restore enabled
- **Cloudflared MUST be on `media_network`** (not host) — it needs Docker DNS to resolve container names in tunnel ingress config
- **LESSON (Feb 14):** UFW DOCKER-USER rules block container→host loopback. Homepage dashboard used host IP `10.0.0.20:8090/8183` to reach qBit/SABnzbd — broke after firewall hardening. Fix: use Docker DNS (`gluetun:8081`, `gluetun:8080`) instead. Always prefer container-to-container networking over published port loopback.
- **Homepage dashboard** (`admin.rogergimbel.dev`) is served by the `homepage` container (port 3000), NOT Homarr (port 7575). Caddy routes: `admin.rogergimbel.dev → homepage:3000`, `homarr.rogergimbel.dev → homarr:7575`

### Split DNS & Local Routing (Deployed 2026-02-07)

All media stack services now use `https://*.rogergimbel.dev` URLs everywhere. On home Wi-Fi (SafireMinx), traffic routes directly to Pi via split DNS instead of going through Cloudflare.

**Components:**
- **dnsmasq** on Pi (port 53): `*.rogergimbel.dev` → `10.0.0.20`, AAAA blocked (`::`)
- **Caddy** (custom build with `caddy-dns/cloudflare`): Let's Encrypt TLS via DNS-01 challenge
- **Cloudflare API Token**: stored in `/mnt/media/.env` on Pi
- **Tailscale Split DNS**: `rogergimbel.dev` → `10.0.0.20` (admin console)

**Device DNS** (all set to `10.0.0.20` + `8.8.8.8` fallback):
- M5 MacBook: Done
- Intel MacBook (OpenClaw): Done
- iPhones: Done (manual DNS in Wi-Fi settings)
- Samsung S10: Done (static IP with manual DNS)

**Key URLs:** jellyfin, requests, admin, family, sonarr, radarr, lidarr, bazarr, prowlarr, tdarr, qbit, sabnzbd, duplicati, status, homarr — all at `https://<name>.rogergimbel.dev`

**Docs:** `/mnt/media/docs/media-stack-operations.md` and `/mnt/media/docs/split-dns-plan.md` in Pi repo

---

*Last updated: 2026-02-15*

### Moltbook — DISCONTINUED (2026-02-13)
- No longer using. All references removed from HEARTBEAT.md and active workflows.
- Credentials may still exist in ~/.openclaw/credentials/moltbook.json (unused).

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

### Web Search (Updated 2026-02-11)
- **Provider:** Grok (xAI) — configured in `tools.web.search.provider: "grok"`
- Uses XAI_API_KEY from env — no Brave API key needed
- Brave is deprecated/unnecessary for our setup
- Added in OpenClaw 2026.2.9 (#12419)

