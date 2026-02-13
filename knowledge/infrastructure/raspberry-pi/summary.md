# Raspberry Pi 5 (rgpi)

## Current Status
- **Role**: Media stack server
- **Health**: Stable

## Specs
- Quad-core Cortex-A76, 8GB RAM
- 2TB external storage (Crucial X9 SSD at /mnt/media)
- Pironman 5-MAX case with dual fans, OLED display, RGB LEDs
- TP-Link USB WiFi adapter (case blocks built-in WiFi)

## Network
- **Hostname**: rgpi
- **LAN IP**: 10.0.0.20 (static)
- **Tailscale IP**: 100.83.169.87
- **Location**: Living room, connected via Ethernet to Xfinity router

## Services Running (20+ containers)
- **Media**: Jellyfin, Jellyseerr
- **Automation**: Sonarr, Radarr, Lidarr, Prowlarr, Bazarr
- **Downloads**: qBittorrent, SABnzbd (via Gluetun VPN)
- **Processing**: Tdarr
- **Infrastructure**: Homepage, Portainer, Uptime Kuma, Netdata, Home Assistant
- **VPN**: Gluetun (ProtonVPN WireGuard)

## Access
```bash
ssh rogergimbel@rgpi           # LAN hostname
ssh rogergimbel@10.0.0.20      # LAN IP
ssh rogergimbel@100.83.169.87  # Tailscale
```

## Key URLs
- Admin Dashboard: https://admin.rogergimbel.dev (Cloudflare Access protected)
- Family Portal: https://family.rogergimbel.dev
- Jellyfin: https://jellyfin.rogergimbel.dev
- Requests: https://requests.rogergimbel.dev
- Presentations: https://presentations.rogergimbel.dev (board presentations, marketing materials)

## Presentations Hosting
Static file server for board presentations and marketing materials.
- **URL**: https://presentations.rogergimbel.dev
- **Local path**: /mnt/media/presentations/
- **Served by**: Caddy on port 8889
- **Tunnel route**: presentations.rogergimbel.dev → caddy:8889

To add new presentations:
```bash
ssh rogergimbel@rgpi
mkdir -p /mnt/media/presentations/new-project
# Copy files to that directory
# Update /mnt/media/presentations/index.html if needed
```

## Storage Architecture (Updated 2026-02-13)
| Drive | Mount | Size | Usage | Purpose |
|-------|-------|------|-------|---------|
| SD Card | `/` | 58GB | 56% | OS only |
| SanDisk USB | `/mnt/docker` | 229GB | 9% | Docker data-root |
| Crucial X9 SSD | `/mnt/media` | 1.8TB | 33% | Media + configs + compose |

- fstab: UUID-based with `nofail` for both USB drives
- Docker data-root migrated from SD card to SanDisk (2026-02-13)

## Hardening (Deployed 2026-02-13)
- **SSH:** PermitRootLogin no, PasswordAuthentication no
- **Firewall:** UFW enabled with Docker-aware DOCKER-USER chain rules
  - Allow: LAN (10.0.0.0/24), Tailscale (100.64.0.0/10), SSH, DNS, HTTP/S, Jellyfin discovery
  - Block: all other inbound (WAN protected even if router compromised)
  - Docker rules in `/etc/ufw/after.rules` (DOCKER-USER chain)
- **Hardware watchdog:** bcm2835, 15s timeout, load avg + memory triggers
- **Swappiness:** 10 (reduced from 60)
- **Core dumps:** disabled (`/etc/sysctl.d/50-coredump.conf`)
- **Journal:** capped at 100MB (`SystemMaxUse=100M`)
- **Docker:** live-restore enabled, data-root on SanDisk
- **Disabled services:** ModemManager, cloud-init, winbind, nfs-blkmap, rpi-connect, CUPS, rpcbind, InfluxDB (purged), Kodi
- **wlan1:** DOWN state (duplicate IP problem neutralized)
- **Pironman5:** fan balanced, dashboard removed, OLED enabled

## Self-Healing & Monitoring
| Component | What | Schedule |
|-----------|------|----------|
| Autoheal container | Restarts unhealthy Docker containers | Continuous |
| Healer service (systemd) | Webhook receiver for media stack self-healing | Continuous |
| Tailscale watchdog (systemd) | Auto-reconnect after ISP outages | Continuous |
| Storage alert | Checks all 3 drives, Telegram alerts at warn/crit thresholds | Daily noon |
| SMART check | Drive health (bad sectors, life %, errors), Telegram alerts | Weekly Sun 5 AM |
| MacBook recovery | Ping LAN→Tailscale→WoL chain, Telegram alerts | Every 10 min |
| Docker prune | Clean old images >7d | Weekly Sun 4 AM |
| Uptime Kuma | Monitors MacBook OpenClaw health endpoint | 120s interval |

## Backup (Updated 2026-02-13)
**Pi → MacBook** (daily 3 AM via `backup-to-macbook.sh`):
- Container configs (`/mnt/media/config/`) including system state snapshot
- docker-compose.yml + .env → `pi/infrastructure/`
- `/mnt/media/docs/` → `pi/docs/`
- Custom scripts → `pi/scripts/`
- Pre-flight: snapshots crontab, systemd units, fstab, daemon.json, container list, disk usage
- LAN first, Tailscale fallback, Telegram alert on failure
- MacBook path: `/Users/rogergimbel/Backups/pi/`

**MacBook → Pi** (daily 4 AM via OpenClaw cron):
- Workspace + config volumes → `/mnt/media/backups/openclaw/`
- 7 day-of-week + 14 dated snapshots, auto-pruned

## Pi Crontab
| Schedule | Script | Purpose |
|----------|--------|---------|
| `0 12 * * *` | `storage-alert.sh` | Drive monitoring + Telegram |
| `0 3 * * *` | `backup-to-macbook.sh` | Full config backup to MacBook |
| `*/10 * * * *` | `macbook-recovery.sh` | MacBook health + WoL recovery |
| `0 4 * * 0` | `docker image prune` | Weekly image cleanup |
| `0 5 * * 0` | `smart-check.sh` | Weekly SMART drive health |

## Related Documents
- **Full operations guide:** [[Media Stack Operations Guide|media-stack.md]] (same folder)
- **Split DNS plan:** `/mnt/media/docs/split-dns-plan.md`
- **Media stack operations:** `/mnt/media/docs/media-stack-operations.md`
- **USB migration plan:** `usb-storage-migration-plan.md` (same folder)

## History
- [2026-02-13] Full resilience hardening: UFW firewall, SMART monitoring, journal cap, Docker prune, MacBook WoL recovery, expanded backup scope
- [2026-02-13] Docker data-root migrated from SD card to SanDisk USB
- [2026-02-13] Disabled unnecessary services, swappiness tuned, core dumps disabled
- [2026-02-07] Split DNS deployed (dnsmasq + Caddy + Cloudflare DNS-01)
- [2026-02-02] Added presentations hosting (presentations.rogergimbel.dev) via Caddy port 8889
- [2026-01-15] Installed Pironman 5-MAX case, relocated to living room, Ethernet
- [2026-01-29] Confirmed stable operation
