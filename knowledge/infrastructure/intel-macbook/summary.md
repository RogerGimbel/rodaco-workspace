# Intel MacBook 15" (2018)

## Current Status
- **Role**: Headless server running OpenClaw
- **Health**: Stable, ~5-10% idle CPU
- **OpenClaw**: 2026.2.15 (Claude Opus 4-6 default, Sonnet fallback)

## Specs
- 2.6 GHz 6-Core i7, 16GB DDR4, 399GB SSD
- LAN: 10.0.0.11 | Tailscale: 100.124.209.59 | SSH: `rogergimbel@10.0.0.11`

## Docker (2 containers)
- `moltbot-gateway` — OpenClaw (port bound to Tailscale only: 100.124.209.59:18789:18789)
- `moltbot-autoheal` — Container health monitor (willfarrell/autoheal)
- Image: locally built `moltbot:local` (NOT from registry — Watchtower won't work)
- Compose dir (host): `~/docker/openclaw/` (git tracked)
- Workspace: Docker volume `moltbot_workspace` (NOT a bind mount)
- **Docker Desktop for Mac limitation**: `network_mode: host` does NOT work (runs in Linux VM, not macOS host). Port binding to specific IP is the workaround.

## Secrets: SOPS/Age (Deployed 2026-02-14)
- Encrypted: `~/docker/openclaw/secrets.enc.yaml` (15 env vars + creds)
- Age key: `~/docker/openclaw/age-key.txt` (only plaintext secret)
- Decrypts to `/tmp/secrets/` at startup (NOT `/run` — uid 1000 can't write there)
- Details: see `details.md` in this folder

## Self-Healing (4 layers)
1. Docker healthcheck (30s interval, 2 retries)
2. `moltbot-autoheal` Docker container (willfarrell/autoheal — auto-restarts unhealthy containers) — Layer 1
3. `openclaw_healer.py` on bare metal (launchd: `com.openclaw.healer`) — Layer 2 (smart: zombies, CPU, session bloat, stuck QMD, disk)
4. Telegram watchdog cron (*/2 min — catches stuck undici fetch pool)
5. Uptime Kuma on Pi (120s interval, Telegram alerts)

## Host Runtime
- **Python**: /usr/bin/python3 — Python 3.9.6 (system)
- **Healer**: ~/docker/openclaw/healer/openclaw_healer.py (13KB, bare metal, launchd)
- **Host agent**: ~/docker/openclaw/host-agent/host_agent.py (v1.0.0, launchd: com.openclaw.host-agent)
  - Tailscale-only: 100.124.209.59:18790
  - 13 allowlisted commands (docker, compose, tailscale, system, openclaw-update)
  - Compose writes staged with approval, full audit log

## Backup
- **→ Pi**: tar+ssh daily 4 AM MT (7 DoW + 14 dated)
- **→ GitHub**: git push daily 4 AM MT
- Restore: `restore-procedure.md` in this folder

## Power Recovery
- Wake-on-LAN enabled, auto-login, sleep disabled
- Pi monitors every 10 min with WoL fallback

## History
- [2026-02-21] Ops hygiene: reclaimed Docker build cache (~15.64GB via `docker builder prune -af`) with no gateway health impact; cron cleanup removed Get-to-Know-Roger jobs and stabilized Daily Site Health Check + Daily AI Digest without changing schedules.
- [2026-02-16] Gateway port bound to Tailscale IP only (100.124.209.59:18789:18789) — no LAN/localhost access
- [2026-02-16] OpenClaw upgraded to 2026.2.15
- [2026-02-16] Infrastructure overhaul started: Tailscale-only access, host management agent, dashboard migration
- [2026-02-15] OpenClaw upgraded to 2026.2.14
- [2026-02-14] SOPS/age secrets deployed, /run→/tmp permission fix
- [2026-02-13] Telegram watchdog added, healthcheck tightened
- [2026-02-07] Split DNS configured, SMB remounted
- [2026-02-05] Security hardening, QMD→builtin embeddings
- [2026-01-31] Rebranded Moltbot→OpenClaw, removed legacy Supabase (freed 20GB)
