# Intel MacBook 15" (2018)

## Current Status
- **Role**: Headless server running OpenClaw
- **Health**: Stable, ~5-10% idle CPU
- **OpenClaw**: 2026.2.14 (Claude Opus 4-6 default, Sonnet fallback)

## Specs
- 2.6 GHz 6-Core i7, 16GB DDR4, 399GB SSD
- LAN: 10.0.0.11 | Tailscale: 100.124.209.59 | SSH: `rogergimbel@10.0.0.11`

## Docker (2 containers)
- `moltbot-gateway` — OpenClaw (port 18789, 64-char token)
- `moltbot-autoheal` — Container health monitor
- Compose dir (host): `~/docker/openclaw/` (git tracked)
- Workspace: Docker volume `moltbot_workspace` (NOT a bind mount)

## Secrets: SOPS/Age (Deployed 2026-02-14)
- Encrypted: `~/docker/openclaw/secrets.enc.yaml` (15 env vars + creds)
- Age key: `~/docker/openclaw/age-key.txt` (only plaintext secret)
- Decrypts to `/tmp/secrets/` at startup (NOT `/run` — uid 1000 can't write there)
- Details: see `details.md` in this folder

## Self-Healing (4 layers)
1. Docker healthcheck (30s interval, 2 retries)
2. Autoheal container (auto-restarts unhealthy)
3. Telegram watchdog cron (*/2 min — catches stuck undici fetch pool)
4. Uptime Kuma on Pi (120s interval, Telegram alerts)

## Backup
- **→ Pi**: tar+ssh daily 4 AM MT (7 DoW + 14 dated)
- **→ GitHub**: git push daily 4 AM MT
- Restore: `restore-procedure.md` in this folder

## Power Recovery
- Wake-on-LAN enabled, auto-login, sleep disabled
- Pi monitors every 10 min with WoL fallback

## History
- [2026-02-15] OpenClaw upgraded to 2026.2.14
- [2026-02-14] SOPS/age secrets deployed, /run→/tmp permission fix
- [2026-02-13] Telegram watchdog added, healthcheck tightened
- [2026-02-07] Split DNS configured, SMB remounted
- [2026-02-05] Security hardening, QMD→builtin embeddings
- [2026-01-31] Rebranded Moltbot→OpenClaw, removed legacy Supabase (freed 20GB)
