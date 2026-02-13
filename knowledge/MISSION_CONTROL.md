# Mission Control - Rodaco Task Board

This is [[Rodaco]]'s autonomous task tracking system. I manage this board myself.

---

## In Progress
<!-- Tasks currently in progress -->

### Mission Control Dashboard Enhancements (Feb 12, 2026)
Inspired by Clawd Control multi-agent dashboard. Three features:

#### Feature 1: Persistent System Metrics Bar
Top bar showing live host metrics — always visible across all tabs.

- [ ] **1a.** Create `/api/system-metrics` endpoint (or reuse `/api/ops` system data)
  - Load avg (1m), RAM used/total + %, disk used/total + %, container uptime
  - Response time should be fast (<200ms) — cache if needed
- [ ] **1b.** Build `SystemBar` frontend component
  - Horizontal bar pinned to top of page, below header
  - Compact: `Load: 0.49 | RAM: 24% (3.0/12.9 GB) | Disk: 9% | Uptime: 3h 21m`
  - Color coding: green (<70%), yellow (70-90%), red (>90%) for RAM/disk
- [ ] **1c.** Auto-refresh every 30 seconds via polling
- [ ] **1d.** Wire into all tabs (add to main layout, not per-tab)

#### Feature 2: API Cost Tracking Widget
Estimate token usage and cost from session data.

- [ ] **2a.** Research OpenClaw session/log format for token counts
  - Check `.jsonl` session files for `usage` or `tokens` fields
  - Check if gateway exposes token metrics via API or logs
- [ ] **2b.** Create `/api/usage/costs` endpoint
  - Parse session files for token usage per model
  - Apply cost-per-token rates (maintain a rate table for grok, sonnet, opus, etc.)
  - Return: today, 7-day, 30-day totals with per-model breakdown
- [ ] **2c.** Build `CostTracker` frontend component
  - Card showing: "7D API Cost (Est.): ~$X.XX"
  - Expandable to show per-model breakdown
  - Trend indicator (up/down vs previous period)
- [ ] **2d.** Add to dashboard as a summary card (Overview or Ops tab)

#### Feature 3: Active Sessions Panel
Show running cron jobs and spawned sub-agents.

- [ ] **3a.** Create `/api/sessions/active` endpoint
  - List active/recent sessions from OpenClaw gateway API (`/api/sessions`)
  - Include: session key, label, kind (cron/spawn/main), status, start time, duration
  - Include last few messages from each for context
- [ ] **3b.** Build `ActiveSessions` frontend component
  - Table/card list showing each session
  - Status badges: 🟢 running, ⚪ idle, 🔴 errored
  - Show session type icon (⏰ cron, 🔀 spawn, 💬 main)
  - Click to expand and see recent messages
- [ ] **3c.** List cron jobs with next run time and last run status
  - Reuse data from existing `/api/ops` cron section
  - Show: job name, schedule, last run time, last status, next run
- [ ] **3d.** Auto-refresh every 60 seconds
- [ ] **3e.** Add as new panel on Ops tab (or new "Sessions" tab)

#### Implementation Order
1. System Metrics Bar (quickest, most visible impact)
2. Active Sessions Panel (useful for monitoring)
3. Cost Tracking (needs research on token data availability)

---

## Backlog
<!-- Tasks planned -->

### Overnight Build Priorities (Feb 2026)
1. **[[Media Stack]] Improvements** - optimization, monitoring, reliability
2. **Claude Code Skills/Tooling** - MCP servers, new skills, productivity enhancements
3. **[[BeerPair]] Marketing** - innovative free strategies, growth tactics, content automation

### Media Stack Overnight Tasks (Added 2026-02-05)
*Roger approved these for autonomous overnight execution. Reference: infrastructure/devices.json*

- [ ] **Enable hardware transcoding on Jellyfin** (Pi)
  - Check Dashboard > Playback > Transcoding settings
  - Pi 5 has VideoCore VII GPU - may support hardware decode
  - Test with a transcode after enabling

- [ ] **Set up storage alerts for Pi media drive**
  - Monitor 2TB Crucial X9 SSD at /mnt/media
  - Alert when <10% free (200GB)
  - Options: cron script, Uptime Kuma, or Jellyfin webhook

- [ ] **Review Tdarr transcoding settings on Intel Mac**
  - Web UI: http://rgpi:8265
  - Check node status, queue, SMB mount to Pi
  - Intel Mac node should be processing efficiently

- [ ] **Test VPN kill switch (Gluetun)**
  - Verify kill switch blocks traffic when VPN drops
  - Test: stop Gluetun, confirm qBittorrent cannot reach internet
  - Document results

- [ ] **Tune Arr stack quality profiles**
  - Review Sonarr/Radarr quality profiles
  - Reference TRaSH Guides for best practices
  - Consider: 1080p vs 4K, x265/HEVC for space savings, release group prefs

### Smart Home Tasks (Added 2026-02-05)
*Larger scope - may span multiple nights*

- [ ] **Install Home Assistant on Raspberry Pi**
  - Add to docker-compose.yml alongside media stack
  - Port: 8123
  - Do NOT install on Intel Mac (dedicated to OpenClaw)

- [ ] **Integrate Xfinity security with Home Assistant**
  - xCam3 camera - full control preferred, read-only acceptable
  - TCA300COM security tablet - arm/disarm if possible
  - Trane ComfortLink II thermostat
  - Amazon Echo (4th gen) with Zigbee hub

### Future (Lower Priority)
- [ ] Build visual dashboard for mission control

---

## Completed
<!-- Finished tasks -->

- [x] [2026-02-05] Jellyfin upgraded to 10.11.6, Intro Skipper plugin installed
- [x] [2026-02-05] Xbox One X connected to Jellyfin via local IP (faster than Cloudflare tunnel)
- [x] [2026-02-05] Apple TV identified as 3rd gen (A1469) - cannot install Jellyfin, devices.json corrected
- [x] [2026-02-05] devices.json synced to OpenClaw workspace at infrastructure/devices.json
- [x] [2026-02-01] First overnight build - media stack git + Claude Code research
- [x] [2026-01-31] Old naming audit + cleanup (moltbot/clawdbot → OpenClaw/[[Rodaco]])
- [x] [2026-01-30] X/Twitter bird integration configured (@rgimbel)
- [x] [2026-01-30] Marketing skills installed (23 skills ready)
- [x] [2026-01-30] Browser automation added (Vercel agent-browser)
- [x] [2026-01-29] Knowledge graph system installed
- [x] [2026-01-29] Weekly synthesis cron configured
- [x] [2026-01-29] SOUL.md updated with 3-layer memory

---

## Blocked
<!-- Tasks waiting on Roger's input or approval -->

- [x] [2026-01-30] Stuart's Telegram ID - @Sgseligman (7655601668) added

### Deprioritized (Skipping)
- ❌ Email integration for morning briefs (deprioritized 2026-02-01)
- ❌ Google Drive/Calendar integration (deprioritized 2026-02-01)

---

## Overnight Build Log

### 2026-02-03
**[[Media Stack]] Health Check:**
- ✅ All critical services healthy (jellyfin, sonarr, radarr, etc.)
- ⚠️ 2 non-critical unhealthy: homarr (curl missing), wetty (port 3000 unresponsive)
- ✅ VPN working (89.187.177.72)
- ✅ Disk: 33% used (569G/1.8T)
- ⚠️ SSH timed out during docker pull - Tailscale connectivity issue (transient)

**Improvement: Container Updates Check**
- Attempted docker compose pull to check for image updates
- SSH connection timed out mid-operation
- Deferred to next build - earlier health checks passed fine

**Claude Code Research: MCP Server Deep Dive**
- Updated memory/claude-code-research.md with tiered recommendations
- HIGH priority: GitHub MCP (code review), Postgres MCP (Supabase queries)
- Documented OpenClaw vs MCP overlap - we already have most capabilities
- Added emerging AI patterns (context management, multi-agent, memory architecture)

**Recommendations for Roger:**
1. ✅ Web search available via Grok 4.1 (/model grok) - no Brave needed
2. Consider GitHub MCP server for PR/issue workflows
3. Optional: Fix homarr health check (change curl to wget)

### 2026-02-02
**[[BeerPair]] Marketing Templates - Ready-to-Deploy Content**
- Created `knowledge/projects/beerpair-marketing-templates.md`
- 50+ instant-use templates:
  - 5 Instagram/TikTok carousel posts (pizza, tacos, BBQ, spicy food, brunch)
  - 2 Twitter threads (pairing strategies, carbonation science)
  - 3 Reddit response templates (pizza, BBQ, spicy food)
  - 2 brewery/restaurant outreach emails
  - 3 Instagram Story templates
  - 2 SEO blog post outlines (1,500+ words each)
  - Week 1 content calendar
  - Product Hunt launch assets
  - Micro-influencer DM scripts
  - 50+ content ideas bank
- Immediately actionable when native apps + landing page are ready
- Zero guesswork - just copy, customize, deploy

### 2026-02-01
**[[Media Stack]] Health Check:**
- ✅ All critical services healthy (jellyfin, sonarr, radarr, etc.)
- ⚠️ 2 non-critical unhealthy: homarr, wetty (dashboards, not important)
- ✅ VPN working (89.187.177.72)
- ✅ Disk: 33% used (569G/1.8T)

**Improvement: Git Version Control for [[Media Stack]]**
- Initialized git at /mnt/media
- Tracking docker-compose.yml (the core config)
- .gitignore excludes media files, data, secrets

**Claude Code Research:**
- Created memory/claude-code-research.md
- Documented MCP servers worth installing (github, postgres, google-drive)
- Note: Web search available via Grok 4.1 (/model grok)

### 2026-01-29
*System initialized - first overnight build will run tonight*

---

## Rules for This Board

1. **I own this board** - update it after every work session
2. **Keep tasks small** - overnight builds should be 1-2 hour scope
3. **Log everything** - document what was built and why
4. **Never surprise Roger with breaking changes** - PRs only, no direct pushes
5. **Move blocked items** when waiting on human input
