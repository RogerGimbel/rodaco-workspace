# Intel MacBook OpenClaw Audit — 2026-02-13

## Context
- Host: Intel MacBook Pro 2018 (headless), Tailscale IP 100.124.209.59
- Container: moltbot-gateway (Docker, read_only: true)
- Docker Compose: ~/docker/openclaw/docker-compose.yml
- SSH from container to host: `ssh rogergimbel@100.124.209.59`

## Fix Status

### 🔴 CRITICAL
- [x] **1. Cron jobs using `clawdbot`** → Fixed: all 3 now use `openclaw`
- [x] **2. Bot token in healer plist** → Fixed: wrapper script sources `~/.config/openclaw/telegram.env`
- [x] **3. known_hosts read-only spam** → Fixed: mounted `:ro` + added ssh config with `StrictHostKeyChecking no`

### 🟠 HIGH
- [x] **4. 18.36GB build cache** → Pruned to 0B
- [x] **5. Bot token plaintext in openclaw.json** → Fixed: now uses `${TELEGRAM_BOT_TOKEN}`
- [x] **6. No log rotation** → Fixed: cron logs use `>` (overwrite), health.log rotated weekly
- [x] **7. Healer disk monitoring** → Added: `check_disk_usage()` alerts on host disk >80% or build cache >10GB

### 🟡 MEDIUM
- [x] **8. No Docker image prune** → Added: weekly cron (Sunday 3am) prunes images + build cache
- [x] **9. Old health.log errors** → Cleared
- [ ] **10. Healer CPU threshold** → Still at 90% but Telegram alerts already disabled; logging only
- [x] **11. No backup of Docker volumes** → DEFERRED (discuss strategy with Roger)
- [x] **12. Watchdog verbose logging** → Enabled; confirmed working (logs OK status)

## Applied Changes Summary
1. `crontab`: clawdbot→openclaw, added weekly Docker prune + health.log rotation, cron logs overwrite not append
2. `docker-compose.yml`: known_hosts `:ro`, added ssh config mount
3. `ssh-keys/config`: created with StrictHostKeyChecking no, UserKnownHostsFile /dev/null
4. `healer/run-healer.sh`: wrapper that sources telegram.env
5. `healer/openclaw_healer.py`: added check_disk_usage()
6. `com.openclaw.healer.plist`: removed hardcoded tokens, uses wrapper
7. `~/.config/openclaw/telegram.env`: secure token storage (chmod 600)
8. `openclaw.json`: botToken → ${TELEGRAM_BOT_TOKEN}
9. `telegram-watchdog.sh`: verbose logging enabled
10. Docker build cache: pruned 18.36GB → 0B
