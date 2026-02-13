# Intel MacBook 15" (2018)

## Current Status
- **Role**: Headless server
- **Health**: Stable
- **CPU**: ~5-10% idle (optimized)

## Specs
- 2.6 GHz 6-Core Intel i7
- 16GB DDR4 RAM
- 399GB SSD
- Intel UHD Graphics 630

## Services Running
- **[[Rodaco]] OpenClaw Gateway** (Docker, port 18789)
- **Tdarr Node** (transcoding, connects to Pi's Tdarr server)
- **Time Machine Server** (backups)
- **Pi Config Backups** (receives daily backups from Pi at 3 AM)

## Docker Containers
Only 2 containers running (lean setup):
- `moltbot-gateway` - OpenClaw AI assistant
- `moltbot-autoheal` - Container health monitor

Note: Container/volume/network names use legacy "moltbot-" prefix intentionally to preserve existing data volumes.

Docker disk usage: ~2.3GB
Config directory: ~/docker/openclaw/ (git tracked)

## CPU Optimization (Headless Server)
Unnecessary apps removed/quit for headless operation:
- Logitech Options+ (was using 19% CPU constantly)
- Comet.app, Perplexity.app, Telegram.app (quit)

Apps to keep quit (don't relaunch):
- Telegram - OpenClaw handles messaging via API
- Any GUI apps - not needed on headless server

To remove Logitech files completely (requires sudo via Screen Sharing):
```bash
sudo rm -rf "/Library/Application Support/Logitech.localized"
sudo rm -rf "/Library/Application Support/Logi"
sudo rm -rf "/Applications/logioptionsplus.app"
```

## Tdarr Node Details
- **Web UI**: http://rgpi:8265 (on Pi, shows this MacBook as "MacBookNode")
- **Config**: ~/docker/tdarr-node/configs/Tdarr_Node_Config.json
- **Startup**: ~/docker/tdarr-node/start-node.command
- **Logs**: ~/docker/tdarr-node/logs/Tdarr_Node_Log.txt
- **SMB Mount**: ~/mnt/media (shares media with Pi for transcoding)

### Start Tdarr Node
```bash
ssh rogergimbel@10.0.0.11 'open ~/docker/tdarr-node/start-node.command'
```

### Check Tdarr Node Status
```bash
ssh rogergimbel@10.0.0.11 'ps aux | grep Tdarr'
```

### Remount SMB Share (if disconnected)
```bash
ssh rogergimbel@10.0.0.11 'mkdir -p ~/mnt/media && mount -t smbfs "//rogergimbel:744747==@rgpi/media" ~/mnt/media'
```
**Note**: Samba password is `744747==` (reset 2026-02-07). Not stored in macOS Keychain — must be provided in mount command.

## Network
- **Hostname**: rogers-macbook-pro.local
- **LAN IP**: 10.0.0.11
- Auto-login enabled
- Remote Login (SSH) enabled
- Screen Sharing enabled

## Access
```bash
ssh rogergimbel@10.0.0.11                    # LAN IP (preferred)
ssh rogergimbel@rogers-macbook-pro.local     # mDNS (may be unreliable)
```

## OpenClaw Details
- **Version**: 2026.2.3-1
- Container: moltbot-gateway
- Gateway: 0.0.0.0:18789 (LAN, protected by 64-char token)
- Channel: Telegram (@roger_gimbel_bot)
- Browser: agent-browser 0.8.5 (Chromium headless)

### Memory Backend
- **Provider**: builtin (OpenAI embeddings)
- **Model**: text-embedding-3-small
- **Storage**: ~/.openclaw/memory/main.sqlite
- **Features**: vector + FTS (full-text search)
- **Note**: QMD removed (2026-02-05) - local LLMs too slow on Intel hardware, OpenAI embeddings faster and simpler

### Model Configuration (Feb 2026)
| Priority | Model ID | Context | Use Case |
|----------|----------|---------|----------|
| Primary | anthropic/claude-opus-4-6 | 200K | **Default** - best quality |
| Fallback 1 | anthropic/claude-sonnet-4-5 | 195K | Reliable, general tasks |
| Fallback 2 | google/gemini-2.5-flash-lite | 1M | Ultra-cheap budget fallback |

**Note**: Haiku removed from fallbacks (2026-02-05) - smaller models more susceptible to prompt injection per security audit.

**Model Aliases** (use `/model <alias>` to switch):
| Alias | Model | Route | Use Case | Cost |
|-------|-------|-------|----------|------|
| `/model sonnet` | Claude Sonnet 4-5 | Direct | **Default** - reliable general tasks | Mid |
| `/model grok` | Grok 4.1 Fast | OpenRouter | Web/X search (use explicitly) | Cheap |
| `/model grok-reason` | Grok 4.1 Fast + Reasoning | OpenRouter | Deep research, complex analysis | Cheap |
| `/model grok-code` | Grok Code Fast 1 | OpenRouter | Fast agentic coding (256K ctx) | Cheap |
| `/model haiku` | Claude Haiku 4-5 | Direct | Simple tasks, fallback | Cheap |
| `/model opus` | Claude Opus 4-5 | Direct | Complex coding (Anthropic) | Premium |
| `/model codex` | GPT-5.1-Codex-Max | Direct | Complex coding (OpenAI) | Premium |
| `/model image` | Gemini 3 Pro Image | Direct | Image generation | Per-image |
| `/model auto` | OpenRouter Auto | OpenRouter | Smart routing via preset | Varies |

**Why Sonnet is default (not Grok):**
- xAI has intermittent 503 capacity errors that cause failures
- Sonnet is 100% reliable - no capacity issues
- Use `/model grok` explicitly when you need web/X search

**Auto-Selection Behavior:**
OpenClaw proactively switches models based on task:
- Image generation → `/model image` (auto-switch)
- Web/X search → suggests `/model grok`
- Complex coding → suggests `/model opus` or `/model codex`

API keys configured: Anthropic, OpenAI, xAI, Google/Gemini, OpenRouter, Fireworks, Voyage

## OpenClaw Capabilities
- Telegram messaging (Roger, Dale, Stuart)
- Memory search (OpenAI embeddings)
- Shell command execution
- **Web browsing** via agent-browser (renders JavaScript)
- **Email** via agentmail.to (rodaco@agentmail.to)
- **Image generation** via nano-banana-pro skill (Gemini 3 Pro Image) - working with paid Gemini API
- Knowledge graph access
- Proactive morning briefs (7 AM)
- Overnight builds (2 AM)

## Marketing Skills (34 ready)
- **Copywriting & Editing** - marketing copy, headlines, rewrites
- **SEO** - audits, schema markup, programmatic SEO
- **CRO** - page, form, popup, signup flow, onboarding, paywall optimization
- **Campaigns** - email sequences, paid ads, A/B testing, launch planning
- **Strategy** - pricing, referral programs, competitor analysis, free tool strategy
- **Social** - content creation, Late API (13 platforms), Octolens (brand monitoring)
- **Psychology** - 70+ mental models for marketing
- **X/Twitter** - bird CLI (@rgimbel) for reading timeline, mentions, search

## Self-Healing Architecture

4 layers of protection to keep OpenClaw running:

| Layer | Component | What it catches | Detection time |
|-------|-----------|----------------|----------------|
| 1 | **Docker healthcheck** | HTTP server crash/hang | ~1 min (30s interval, 2 retries) |
| 2 | **Autoheal container** | Unhealthy Docker status → auto-restart | ~30s after unhealthy |
| 3 | **Telegram watchdog cron** | Stuck Node.js undici fetch pool (Telegram dead but HTTP healthy) | ~2-5 min |
| 4 | **Uptime Kuma** (on Pi) | Full host/network outage, alerting | ~5 min |

### Telegram Watchdog (`~/docker/openclaw/telegram-watchdog.sh`)
- **Cron**: `*/2 * * * *` (every 2 minutes)
- **How it works**: Checks `docker logs --since 3m` for `TypeError: fetch failed` pattern
- **Threshold**: 5+ errors in 3 minutes triggers a `docker restart`
- **Cooldown**: 5 minutes between restarts (prevents restart loops)
- **Only acts when container is "healthy"** — if Docker already knows it's unhealthy, autoheal handles it
- **Log**: `~/docker/openclaw/telegram-watchdog.log`

**Why this exists**: Node.js 22+ built-in fetch (undici) connection pool can get permanently stuck after a network blip. The HTTP server stays up (healthcheck passes), but all outbound Telegram API calls fail with `TypeError: fetch failed`. `curl` from inside the container works fine — only the running Node process's internal HTTP client is broken. A container restart clears the stuck state.

### Docker Healthcheck
```yaml
healthcheck:
  test: curl -sf http://127.0.0.1:18789/ -o /dev/null --max-time 5
  interval: 30s
  timeout: 15s
  retries: 2
  start_period: 90s
```

### Host Crontab (`crontab -l`) — Updated 2026-02-13
| Schedule | Script | Purpose |
|----------|--------|---------|
| `*/2 * * * *` | `telegram-watchdog.sh` | Detect stuck Telegram fetch |
| `*/5 * * * *` | `health-check.sh` | Basic container-up check |
| `0 3 * * 0` | Docker image prune | Weekly cleanup of old images |
| `0 0 * * 0` | Log rotation | Keep health.log under 1000 lines |

Morning brief, overnight build, weekly synthesis, daily backup all migrated to OpenClaw internal cron.

### OpenClaw Internal Cron Jobs
| Schedule | Job | Purpose |
|----------|-----|---------|
| `0 7 * * *` ET | Morning brief | Daily Telegram briefing |
| `0 2 * * *` ET | Overnight build | Auto-pick backlog task |
| `0 4 * * *` MT | Daily backup | Pi tar+ssh + GitHub push (600s timeout) |
| `0 9 * * 0` MT | Weekly synthesis | Rewrite knowledge summaries + MEMORY.md |
| Various | Get-to-know-you | Mon/Wed/Fri questions to Roger |
| `0 12 * * *` MT | TestFlight check | OpenClaw iOS app |

### Healer Service (Updated 2026-02-13)
- **Path:** `~/docker/openclaw/healer/openclaw_healer.py`
- **LaunchAgent:** `com.openclaw.healer`
- **Monitors:** container health, zombies, CPU, disk, session file bloat, stuck QMD
- **Telegram alerts:** via `~/.config/openclaw/telegram.env` (working, verified)
- **Alert deduplication:** 5-min cooldown on container-not-found and unhealthy alerts, auto-clears on recovery
- **Cooldown:** 5 min between restarts

### Backup Strategy (Deployed 2026-02-13)
| Target | Method | Schedule | Retention |
|--------|--------|----------|-----------|
| Pi SSD | tar+ssh+gzip (workspace + config) | 4 AM MT daily | 7 day-of-week + 14 dated |
| GitHub | git push (`RogerGimbel/rodaco-workspace`) | 4 AM MT daily | Full history |
| Restore docs | `knowledge/infrastructure/intel-macbook/restore-procedure.md` | — | — |

Excludes: QMD index (2.9GB, rebuildable), antfarm memory (220MB), node_modules, .git-credentials

### Power Recovery (Configured 2026-02-13)
- `pmset restartpowerfailure 1` — auto-restart after power loss
- `pmset womp 1` — Wake-on-LAN enabled (MAC: 0a:2c:1f:c5:42:79)
- Docker Desktop auto-starts on login
- Pi monitors MacBook every 10 min (`macbook-recovery.sh`) with WoL fallback
- Sleep disabled (`sleep 0`)

## History
- [2026-02-13] Added Telegram watchdog cron (telegram-watchdog.sh) — detects stuck Node.js undici fetch pool via log monitoring, auto-restarts container. Fixes issue where Telegram shows "connecting" indefinitely while HTTP healthcheck still passes.
- [2026-02-13] Tightened Docker healthcheck: interval 60s→30s, retries 3→2. Fixed stale crontab path (~/docker/moltbot/ → ~/docker/openclaw/).
- [2026-02-07] Fixed gateway crash loop: .env was missing, installed sops, decrypted .env.enc, renamed CLAWDBOT_GATEWAY_TOKEN to OPENCLAW_GATEWAY_TOKEN
- [2026-02-07] Re-encrypted .env.enc with updated OPENCLAW_* var names, whitelisted .env.enc in .gitignore for git tracking
- [2026-02-07] Moved Voyage API key from container plaintext .env to Docker Compose environment (now 15 keys in .env.enc)
- [2026-02-07] Remounted SMB share after Pi reboot (reset Samba password on Pi)
- [2026-02-05] Security hardening: 64-char gateway token, removed Haiku from fallbacks, renamed CLAWDBOT_* env vars to OPENCLAW_*
- [2026-02-05] Removed QMD memory backend - switched to builtin OpenAI embeddings (faster, simpler)
- [2026-02-05] Upgraded OpenClaw v2026.2.2-3 → v2026.2.3-1
- [2026-02-03] Switched primary model to Grok 4.1 Fast (xAI direct), Sonnet as fallback
- [2026-02-02] SOPS + Age encryption enabled for all 15 API keys (secrets encrypted at rest)
- [2026-02-02] Telegram security hardening: explicit user allowlist, group auto-leave, injection detection
- [2026-02-02] Updated SOUL.md to allow Dale and Stuart to authorize email sends
- [2026-02-02] Updated SOUL.md model routing for OpenClaw 2026.2.1 (auto-switching rules, provider health, task-specific routing)
- [2026-02-02] Added progress message instructions to SOUL.md for better UX on long tasks
- [2026-02-02] Configured ack reaction (👀) and faster backgrounding for better Telegram UX
- [2026-02-02] Set agents.defaults.timeoutSeconds=900 (15 min) to prevent task timeouts
- [2026-02-02] Upgraded OpenClaw v2026.1.30 → v2026.2.1 (rebuilt Docker image)
- [2026-02-01] Switched default to Sonnet (reliable) - Grok has intermittent xAI 503 capacity errors
- [2026-02-01] Fixed model ID format: use dot (grok-4.1-fast) not hyphen in OpenRouter model IDs
- [2026-02-01] Added grok-reason alias for deep research tasks
- [2026-02-01] Image generation working: switched to paid Gemini API key (AIzaSyDaO0Jf...)
- [2026-02-01] Fixed nano-banana-pro: added Python + exec tmpfs
- [2026-02-01] Grok routes through OpenRouter (fixes xAI 503 capacity errors)
- [2026-02-01] Installed uv in Dockerfile, enabled nano-banana-pro skill for image generation
- [2026-02-01] Added model routing rules to SOUL.md (auto-detection hints for images, coding, search)
- [2026-02-01] Added model aliases: grok-code, codex, image for coding and image generation toggles
- [2026-02-01] Created OpenRouter preset "grok-claude-auto" with 8 models (BYOK)
- [2026-02-01] Added OpenRouter (400+ models, smart auto-routing) and Fireworks API keys
- [2026-02-01] Model upgrade: Grok 4.1 Fast as primary (2M ctx, web search), Gemini 2.5 Flash-Lite as budget fallback
- [2026-02-01] Fixed Gemini API auth (added GEMINI_API_KEY to .env)
- [2026-02-01] Tuned Uptime Kuma: 120s interval, 96s timeout, 2 retries - prevents false alerts during heavy AI work
- [2026-02-01] Fixed docker-compose.yml YAML syntax (merged environment/healthcheck lines)
- [2026-02-01] Initialized git repo at ~/docker/openclaw for config tracking
- [2026-01-31] Fixed model ID format: use hyphens (4-5) not dots (4.5) in anthropic model names
- [2026-01-31] Model cost optimization: Haiku default, Sonnet/Grok/Gemini fallbacks, added xAI & Google AI keys
- [2026-01-31] CPU optimization: quit Logitech/Comet/Perplexity/Telegram, reduced idle CPU from ~30% to ~5%
- [2026-01-31] Full OpenClaw audit: fixed health-check.sh, cleaned up 9 backup files, documented legacy naming
- [2026-01-31] Renamed ~/docker/moltbot → ~/docker/openclaw, updated healer service
- [2026-01-31] Removed legacy Supabase dev stack (10 containers), freed 20.71GB, CPU dropped from ~150% to ~5%
- [2026-01-31] GitHub CLI installed, rodaco_openclaw repo cloned to ~/rodaco_openclaw
- [2026-01-31] Rebranded from Moltbot/clawdbot to OpenClaw 2026.1.30
- [2026-01-31] 3-layer self-healing implemented (Autoheal + Healer + Uptime Kuma)

### Uptime Kuma Monitoring (on Pi)
Tuned to prevent false alerts during heavy AI work:
| Setting | Value |
|---------|-------|
| Heartbeat Interval | 120s |
| Request Timeout | 96s |
| Retries | 2 |
| Retry Interval | 300s |

URL: http://100.124.209.59:18789/ (Tailscale IP)
- [2026-01-30] X/Twitter bird integration configured (@rgimbel)
- [2026-01-30] Marketing skills installed (marketing-skills, octolens, late-api, bird)
- [2026-01-30] Browser automation added (agent-browser + Chromium)
- [2026-01-29] Moltbot setup completed
- [2026-01-29] Knowledge graph system added
