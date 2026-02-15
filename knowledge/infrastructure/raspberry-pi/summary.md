# Raspberry Pi 5 (rgpi)

## Current Status
- **Role**: Media stack server + infrastructure monitoring
- **Health**: Stable (hardened Feb 2026)

## Specs
- Quad-core Cortex-A76, 8GB RAM, Pironman 5-MAX case
- LAN: 10.0.0.20 | Tailscale: 100.83.169.87
- SSH: `rogergimbel@rgpi` or `rogergimbel@100.83.169.87`

## Storage
| Drive | Mount | Size | Usage | Purpose |
|-------|-------|------|-------|---------|
| SD Card | `/` | 58GB | 56% | OS only |
| SanDisk USB | `/mnt/docker` | 229GB | 9% | Docker data-root |
| Crucial X9 SSD | `/mnt/media` | 1.8TB | 33% | Media + configs |

## Services (20+ containers)
- **Media**: Jellyfin, Jellyseerr, Tdarr
- **Automation**: Sonarr, Radarr, Lidarr, Prowlarr, Bazarr
- **Downloads**: qBittorrent, SABnzbd (via Gluetun VPN)
- **Infra**: Homepage, Portainer, Uptime Kuma, Netdata, Home Assistant, Caddy, Cloudflared

## Key URLs
- Admin: https://admin.rogergimbel.dev (Homepage, NOT Homarr)
- Jellyfin: https://jellyfin.rogergimbel.dev
- Requests: https://requests.rogergimbel.dev
- Presentations: https://presentations.rogergimbel.dev

## Hardening (Feb 2026)
- UFW + DOCKER-USER chain (LAN + Tailscale allowed, WAN blocked)
- ⚠️ DOCKER-USER MUST have `conntrack ESTABLISHED,RELATED` as FIRST rule
- SSH key-only, no root login | Hardware watchdog (15s) | Docker live-restore
- Disabled: ModemManager, cloud-init, CUPS, InfluxDB, Kodi

## Self-Healing & Monitoring
- Autoheal, Tailscale watchdog, Gluetun watchdog, network watchdog
- Storage alert (daily), SMART check (weekly), MacBook recovery (*/10 min)
- Docker prune + log rotation (weekly Sunday)

## Backup
- **→ MacBook**: daily 3 AM (configs, compose, scripts, system state via rsync)
- **← MacBook**: daily 4 AM (OpenClaw workspace tar+ssh)

## History
- [2026-02-14] Fixed Homepage dashboard (use Docker DNS, not host IP loopback)
- [2026-02-13] Full hardening: UFW, SMART, Docker migration to SanDisk, disabled services
- [2026-02-07] Split DNS deployed (dnsmasq + Caddy DNS-01)
- [2026-02-02] Presentations hosting added
- [2026-01-15] Pironman 5-MAX case installed
