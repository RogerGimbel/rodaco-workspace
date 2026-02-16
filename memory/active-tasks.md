# Active Tasks

## 🏗️ Rodaco Infrastructure Overhaul
**Started:** 2026-02-16
**Goal:** Serve all dashboards/UIs on Tailscale only, enable self-management, eliminate need for Claude Code SSH for routine ops.

### Architecture Summary
- Tailscale = auth layer (no login screens, no public URLs)
- Watchtower = auto-updates
- Host management agent = controlled host access from inside container
- All services (OpenClaw, MC dashboard, Pi stack) on tailnet only

### Build Order

- [x] **Step 1: Tailscale-only gateway access** ✅ 2026-02-16
  - Docker Desktop for Mac doesn't support network_mode: host (Linux VM limitation)
  - Solution: bound port to Tailscale IP only: "100.124.209.59:18789:18789"
  - Gateway accessible via Tailscale (200), NOT from localhost (connection refused)
  - native tailscale.mode: "serve" not usable from inside Docker container
  - NOTE: gateway.bind stays "lan" — security comes from Docker port binding to Tailscale IP

- [x] **Step 2: Auto-updates** ✅ 2026-02-16
  - Watchtower NOT needed — image is locally built (moltbot:local), not from registry
  - OpenClaw has built-in `gateway update.run` / `openclaw update` for npm/git updates
  - Rodaco can self-update via gateway tool — no external tools needed
  - Docker image rebuilds (rare) still need Claude Code

- [x] **Step 3: Host management agent** ✅ 2026-02-16
  - Python 3 script at ~/docker/openclaw/host-agent/host_agent.py (v1.0.0)
  - Launchd: com.openclaw.host-agent (PID 80161, KeepAlive)
  - Listens on 100.124.209.59:18790 (Tailscale only)
  - 13 commands: docker-ps/restart/logs, compose-read/write/apply/discard/pull/up, tailscale-status, system-info, openclaw-update, host-agent-version
  - Compose writes staged with approval flow
  - Audit log at ~/docker/openclaw/host-agent/audit.log
  - Verified working from inside container ✅

- [x] **Step 4: Mission Control dashboard — Tailscale lockdown** ✅ 2026-02-16
  - Port 3333 already bound to Tailscale IP (done in Step 1 compose change)
  - mission.rogergimbel.dev only resolves via split DNS (Pi) — not publicly routable
  - No Cloudflare tunnel exposes port 3333
  - Lovable frontend (rodaco-mc.lovable.app) is public but useless without API access
  - VITE_API_URL stays as https://mission.rogergimbel.dev (TLS via Caddy, split DNS private)
  - **Future (Option A):** Export Lovable frontend, self-host on tailnet for fully private setup
  - Control plane features (future): restart gateway, trigger tasks, change config, run commands

- [x] **Step 5: Pi stack lockdown to tailnet-only** ✅ 2026-02-16
  - All 26 port bindings changed from 0.0.0.0 → 100.83.169.87 (Tailscale IP)
  - dnsmasq updated: *.rogergimbel.dev → 100.83.169.87 (was 10.0.0.20 LAN)
  - Cloudflare tunnel (cloudflared) stopped and removed — no more public access
  - Smoke test passed: Jellyfin, Sonarr, Radarr, Jellyseerr, Uptime Kuma all responding via Tailscale
  - Backup at docker-compose.yml.pre-tailscale-lockdown
  - NOTE: hassio_observer still on 0.0.0.0:4357 (managed by HA supervisor, not our compose)
  - TODO: Clean up Caddy :8888/:8890 blocks (tunnel ingress no longer needed)

### Key Decisions (Reference)
- Docker Socket Proxy (Tecnativa) pattern if agent needs Docker access — NOT raw socket
- Watchtower handles updates, not socket access from inside container
- Host management agent: allowlist-only, parameterized, audit-logged, Tailscale-bound
- Compose writes approved with Telegram confirmation
- OpenClaw native: `gateway.tailscale.mode: "serve"` + `gateway.auth.allowTailscale: true`
- Read-only dashboard first → control plane later

### Roger's Devices (all Tailscale, always on)
- iPhone (always with him)
- M5 MacBook (travels, primary mgmt workstation w/ Claude Code)
- Intel MacBook (home, runs OpenClaw, 100.124.209.59)
- Samsung S10 (home)
- Raspberry Pi (exit node, 100.83.169.87)
