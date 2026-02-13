# Full Resilience Audit — 2026-02-13

## Context
Comprehensive audit of all hardening, backup, and self-healing across both machines.
Goal: maximum self-healing, minimum manual intervention.

---

## ✅ WORKING WELL (No Action Needed)

### Intel MacBook (OpenClaw Host)
- [x] Container healthy, autoheal running
- [x] Healer service active (zombies, CPU, disk, session files, stuck QMD)
- [x] Telegram watchdog every 2 min (detects undici fetch pool stalls)
- [x] Health check every 5 min (restarts container if down)
- [x] Weekly Docker prune (Sunday 3am — images + build cache)
- [x] Health.log rotation weekly
- [x] Build cache: 0B (was 18.36GB, pruned yesterday)
- [x] Bot token secured via env var (not in config files)
- [x] SSH config read-only with StrictHostKeyChecking disabled
- [x] Backup to Pi: daily 4 AM MT, verified with gzip -t
- [x] Backup to GitHub: daily 4 AM MT, clean .gitignore
- [x] Git repo: 692KB (was 61MB), secrets scrubbed
- [x] Restore procedure documented
- [x] Disk: 7% used (372GB total) — plenty of room

### Raspberry Pi (Media Stack)
- [x] All 28 containers running, 0 unhealthy
- [x] 3-drive monitoring: SD (56%), SanDisk (9%), SSD (33%)
- [x] Storage alert script checks all 3 drives with warn/crit thresholds
- [x] Backup to MacBook: daily 3 AM (rsync with LAN→Tailscale fallback + Telegram alerts)
- [x] Healer service active (webhook receiver for self-healing)
- [x] Tailscale watchdog active (auto-reconnect after ISP outages)
- [x] Docker data-root on SanDisk USB (not SD card)
- [x] fstab: both drives have `nofail`
- [x] Swappiness: 10 (reduced from 60)
- [x] Hardware watchdog enabled (bcm2835, 15s timeout, load + memory triggers)
- [x] wlan1: DOWN state (duplicate IP problem neutralized)
- [x] Unnecessary services disabled (ModemManager, cloud-init, winbind, nfs-blkmap, rpi-connect)
- [x] SSH hardened: PermitRootLogin no, PasswordAuthentication no
- [x] Docker live-restore: enabled (containers survive daemon restarts)
- [x] UDP buffers: 7340032 (QUIC fix for Caddy/Cloudflared)
- [x] Core dumps disabled
- [x] Pironman5: fan balanced, dashboard removed, InfluxDB purged
- [x] Split DNS working (dnsmasq + Caddy + Cloudflare DNS-01)
- [x] Duplicati running (encrypted backups present)

---

## 🔴 CRITICAL FIXES

### 1. ✅ Duplicate cron jobs — morning brief and overnight build
**Fixed:** Commented out morning brief, overnight build, AND weekly synthesis from host crontab. All three now run via OpenClaw internal cron. Host crontab down to 4 active entries (health-check, watchdog, docker prune, log rotation).

### 2. ✅ No Docker prune cron on Pi
**Fixed:** Added `0 4 * * 0` weekly Docker image prune to Pi crontab.

---

## 🟠 HIGH PRIORITY

### 3. ✅ Journal size capped on Pi
**Fixed:** Set `SystemMaxUse=100M` in journald.conf, restarted journald. Currently 8MB.

### 4. ✅ SMART monitoring on Pi
**Fixed:** Installed smartmontools. Created `scripts/smart-check.sh` — checks both drives for health status, reallocated sectors, pending sectors, uncorrectable errors, and life percentage. Sends Telegram alert if any issues. Runs weekly (Sunday 5 AM). Tested clean.

### 5+6. ✅ UFW firewall + Docker port protection on Pi
**Fixed:** Installed UFW and enabled with Docker-aware rules:
- UFW rules: allow SSH, LAN (10.0.0.0/24), Tailscale (100.64.0.0/10), DNS (53), HTTP/S (80/443), Jellyfin discovery (7359/udp)
- Docker DOCKER-USER chain rules in `/etc/ufw/after.rules`: allow LAN + Tailscale + Docker bridge networks, allow DNS/HTTP/HTTPS/Jellyfin, DROP everything else with logging
- Effect: services accessible from LAN and Tailscale, blocked from WAN even if router is compromised
- All 28 containers verified running, 0 unhealthy after enabling

---

## 🟡 MEDIUM PRIORITY

### 7. ✅ Weekly synthesis migrated to OpenClaw cron
**Fixed:** Created OpenClaw cron job `fe7d0fce` (Sunday 9 AM MT, isolated, 600s timeout). Removed from host crontab. Enhanced prompt to also review memory/*.md and update MEMORY.md.

### 8. ✅ Healer alert spam (no deduplication)
**Problem:** Healer sent "not found" alert every 30s during outages (7+ alerts for one event).
**Fixed:** Added 5-min dedup for container-not-found and unhealthy alerts. Clears when container recovers. Restarted healer service.

### 9. ✅ Pi backup-to-macbook only backs up /mnt/media/config
**Problem:** Missing docker-compose.yml, scripts, docs, systemd units, crontab.
**Fixed:** Rewrote backup script to:
- Pre-snapshot system state (crontab, systemd units, fstab, docker-containers, daemon.json) → `config/_system-state/`
- Backup container configs → `pi/config/`
- Backup docker-compose.yml + .env → `pi/infrastructure/`
- Backup docs → `pi/docs/`
- Backup custom scripts → `pi/scripts/`
- MacBook backup path changed: `/Users/rogergimbel/Backups/pi/` (was `pi-config/`)

### 10. ✅ No self-healing for MacBook itself
**Fixed:** Created `scripts/macbook-recovery.sh` on Pi:
- Runs every 10 min via Pi crontab
- Checks LAN → Tailscale → WoL fallback chain
- 3 WoL attempts with 2-min waits between
- Telegram alerts at each stage (down, recovered, failed)
- Verified working (exit 0 when MacBook healthy)
- **Roger TODO:** Run `sudo pmset -a restartpowerfailure 1` on MacBook (enables auto-restart after power loss)

---

## 🟢 LOW PRIORITY (Nice-to-Have)

### 11. Duplicate image files in workspace
- beerpair images exist in 3 dirs (beerpair-deploy/, knowledge/, mission-control/)
- Not in git anymore but still in tar backups (wastes ~20MB per backup)
- [ ] Pick canonical location, symlink or remove dupes

### 12. Mission Control not monitored by Uptime Kuma
- MC runs on port 3333, supervised by supervisor.sh
- Not monitored externally — if it dies between heartbeats, nobody knows
- [ ] Add to Uptime Kuma on Pi: http://100.124.209.59:3333

### 13. No alerting for OpenClaw version updates
- Currently manually checking for updates
- [ ] Could add a weekly cron that checks npm for openclaw updates

---

## Summary Counts
- ✅ Items 1-10: ALL COMPLETE
- 🟢 Low: 3 remaining (image dupes, MC monitoring, version alerts)

### Roger TODO
- Run `sudo pmset -a restartpowerfailure 1` on MacBook (enables auto-restart after power loss)

*Created: 2026-02-13 ~15:10 MT*
*Completed: 2026-02-13 ~16:15 MT*
