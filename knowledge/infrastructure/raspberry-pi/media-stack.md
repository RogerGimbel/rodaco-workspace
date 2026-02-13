# Media Stack Operations Guide

**Location:** Raspberry Pi 5 (rgpi)
**Purpose:** Complete reference for diagnosing and managing the home media stack

---

## Access Points

### SSH Access
```bash
ssh rogergimbel@rgpi           # LAN (hostname)
ssh rogergimbel@10.0.0.20      # LAN (static IP)
ssh rogergimbel@100.83.169.87  # Tailscale
```

### Service URLs (Split DNS — deployed 2026-02-07)

All services use `https://*.rogergimbel.dev`. On home Wi-Fi (SafireMinx), traffic routes directly to Pi via dnsmasq split DNS. Off-network, same URLs work via Cloudflare tunnel.

| Service | URL | Internal Port |
|---------|-----|---------------|
| Homepage Dashboard | https://admin.rogergimbel.dev | 3000 |
| Family Landing Page | https://family.rogergimbel.dev | 8888 (Caddy) |
| Jellyfin | https://jellyfin.rogergimbel.dev | 8096 |
| Jellyseerr | https://requests.rogergimbel.dev | 5055 |
| Sonarr | https://sonarr.rogergimbel.dev | 8989 |
| Radarr | https://radarr.rogergimbel.dev | 7878 |
| Lidarr | https://lidarr.rogergimbel.dev | 8686 |
| Prowlarr | https://prowlarr.rogergimbel.dev | 9696 |
| Bazarr | https://bazarr.rogergimbel.dev | 6767 |
| Tdarr | https://tdarr.rogergimbel.dev | 8265 |
| qBittorrent | https://qbit.rogergimbel.dev | 8090 (via Gluetun) |
| SABnzbd | https://sabnzbd.rogergimbel.dev | 8183 (via Gluetun) |
| Duplicati | https://duplicati.rogergimbel.dev | 8200 |
| Uptime Kuma | https://status.rogergimbel.dev | 3001 |
| Homarr | https://homarr.rogergimbel.dev | 7575 |
| Portainer | http://100.83.169.87:9000 | 9000 (Tailscale only) |
| Netdata | http://100.83.169.87:19999 | 19999 (Tailscale only) |
| Pironman Dashboard | REMOVED (2026-02-13) | — |

---

## Storage Architecture (Updated 2026-02-13)

```
SD Card (/dev/mmcblk0p2)  58GB  → /           (OS, configs)     ~56% used
SanDisk USB (/dev/sda1)   229GB → /mnt/docker (Docker data-root) ~9% used
2TB SSD (/dev/sdb1)       1.8TB → /mnt/media  (media, configs)  ~33% used
```

- Docker `data-root`: `/mnt/docker` (set in `/etc/docker/daemon.json`)
- SanDisk fstab: `UUID=67971806-e4c4-4004-af9b-143a3b0dd0a6 /mnt/docker ext4 defaults,noatime,nofail 0 2`
- udev rule prevents double-mount: `/etc/udev/rules.d/99-ignore-sandisk.rules`

### Disabled Services (2026-02-13)
- CUPS, rpcbind, InfluxDB (purged), Kodi (LightDM autostart disabled)
- Core dumps disabled: `/etc/sysctl.d/50-coredump.conf`

### Pironman5 Config
- Fan mode: 3 (Balanced — temp-based auto control)
- Dashboard: removed (pm_dashboard uninstalled)
- OLED: enabled, 10s sleep timeout
- RGB: breathing blue (#0a1aff), 50% brightness
- Known issue: vibration switch may toggle fans instead of just waking OLED

---

## Network Info

```
Pi Hostname:     rgpi
Pi LAN IP:       10.0.0.20
Pi Tailscale:    100.83.169.87
MacBook LAN IP:  10.0.0.11
Docker Network:  media_network (172.20.0.0/16)
```

---

## Credentials

### Service Logins
| Service | Username | Password |
|---------|----------|----------|
| Portainer | admin | Admin744747equals |
| qBittorrent | admin | adminadmin |

### API Keys (for automation)
| Service | API Key |
|---------|---------|
| Sonarr | 4740bde9c5a64209a214ddd02604ff3f |
| Radarr | f5f70d332fe84de2b7d5cd77f8ee3c5f |
| Prowlarr | bf3829176be748dc92783ce0a16810e0 |
| Lidarr | 3ec68052e93b46d891fd363e55ea825c |
| Bazarr | ff9e3bf10d4b7457148ec0302943d549 |
| Jellyseerr | MTc2NzAxODYwNTAyNWMyNDQ2OGNlLTA4MGUtNDkxZC1hNjYyLWQ5NTMxMjhlYzkyZg== |
| SABnzbd | 220ad9173b254ef89f7517a8187ac77f |
| Jellyfin | 85bdebe6be124a048436d469d282edfa |
| Portainer | ptr_VBmUMcMrZMRTVlsQGEIGm15vMLX9pj/rjTsRv5NsO7w= |

---

## Container Dependencies (CRITICAL)

```
                ┌─────────────┐
                │   Gluetun   │ (VPN gateway)
                │  (healthy)  │
                └──────┬──────┘
                       │ network_mode: service:gluetun
          ┌────────────┼────────────┐
          ▼            ▼
    ┌──────────┐ ┌──────────┐
    │qBittorrent│ │ SABnzbd  │
    └──────────┘ └──────────┘

Independent: Jellyfin, Sonarr, Radarr, Lidarr, Prowlarr, Bazarr, Tdarr, etc.
```

**CRITICAL:** If Gluetun is recreated, qBittorrent and SABnzbd MUST also be recreated.

---

## Quick Diagnostic Commands

### Health Check
```bash
# All container statuses
ssh rogergimbel@rgpi 'docker ps -a --format "table {{.Names}}\t{{.Status}}"'

# Unhealthy containers only
ssh rogergimbel@rgpi 'docker ps --filter "health=unhealthy" --format "{{.Names}}"'

# VPN status (should show non-local IP)
ssh rogergimbel@rgpi 'docker exec gluetun wget -qO- ifconfig.me'

# Disk space
ssh rogergimbel@rgpi 'df -h /mnt/media'

# Memory/CPU usage
ssh rogergimbel@rgpi 'docker stats --no-stream'
```

### Service-Specific Checks
```bash
# Jellyfin API health
ssh rogergimbel@rgpi 'curl -s "http://localhost:8096/health"'

# Sonarr health
ssh rogergimbel@rgpi 'curl -s "http://localhost:8989/api/v3/health" -H "X-Api-Key: 4740bde9c5a64209a214ddd02604ff3f"'

# Radarr health
ssh rogergimbel@rgpi 'curl -s "http://localhost:7878/api/v3/health" -H "X-Api-Key: f5f70d332fe84de2b7d5cd77f8ee3c5f"'

# Tdarr nodes status
ssh rogergimbel@rgpi 'curl -s "http://localhost:8266/api/v2/get-nodes" | jq "keys"'

# Homepage status
ssh rogergimbel@rgpi 'curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000"'
```

---

## Common Fixes

### VPN Not Working (Gluetun)
```bash
# Check VPN IP
ssh rogergimbel@rgpi 'docker exec gluetun wget -qO- ifconfig.me'

# If showing local IP or timeout, recreate:
ssh rogergimbel@rgpi 'docker stop gluetun && docker rm gluetun'
ssh rogergimbel@rgpi 'cd /mnt/media && docker compose up -d gluetun'

# CRITICAL: Must recreate dependent containers
ssh rogergimbel@rgpi 'docker stop qbittorrent sabnzbd; docker rm qbittorrent sabnzbd'
ssh rogergimbel@rgpi 'cd /mnt/media && docker compose up -d qbittorrent sabnzbd'
```

### Container Won't Start
```bash
# Check logs
ssh rogergimbel@rgpi 'docker logs <container_name> 2>&1 | tail -30'

# Recreate container
ssh rogergimbel@rgpi 'docker stop <container_name>; docker rm <container_name>'
ssh rogergimbel@rgpi 'cd /mnt/media && docker compose up -d <container_name>'
```

### Tdarr Node Disconnected (MacBook)
```bash
# Check if node running on MacBook
ssh rogergimbel@10.0.0.11 'ps aux | grep Tdarr'

# Start node on MacBook
ssh rogergimbel@10.0.0.11 'open ~/docker/tdarr-node/start-node.command'
```

### SMB Mount Lost (MacBook)
```bash
# Remount media share on MacBook
ssh rogergimbel@10.0.0.11 'mkdir -p ~/mnt/media'
ssh rogergimbel@10.0.0.11 'mount -t smbfs "//rogergimbel@rgpi/media" ~/mnt/media'
```

---

## File Locations

### Pi (rgpi)
```
Docker Compose:     /mnt/media/docker-compose.yml
Environment:        /mnt/media/.env
Config Directory:   /mnt/media/config/
Media Directory:    /mnt/media/data/media/
Homepage Config:    /mnt/media/config/homepage/services.yaml
Caddy Dockerfile:   /mnt/media/config/caddy/Dockerfile
Caddyfile:          /mnt/media/config/caddy/Caddyfile
dnsmasq Dockerfile: /mnt/media/config/dnsmasq/Dockerfile
dnsmasq Config:     /mnt/media/config/dnsmasq/dnsmasq.conf
```

### MacBook (Intel)
```
Tdarr Node:         ~/docker/tdarr-node/
Tdarr Config:       ~/docker/tdarr-node/configs/Tdarr_Node_Config.json
SMB Mount:          ~/mnt/media/
Pi Backups:         ~/Backups/pi-config/
```

---

## Self-Healing Architecture

The media stack has automatic self-healing:

1. **Autoheal Container** - Restarts unhealthy containers automatically
2. **Media Stack Healer** - Python service that receives Uptime Kuma webhooks and applies smart fixes
   - Port: 9876
   - Logs: /home/rogergimbel/healer.log
   - Status: `sudo systemctl status healer.service`

---

## Cloudflare Access

Protected URLs require email verification:
- **URL:** https://admin.rogergimbel.dev
- **Allowed emails:** accfighter@gmail.com, roger@rogergimbel.dev, rogergimbel@selfgrowth.app
- **Manage at:** https://one.dash.cloudflare.com/
