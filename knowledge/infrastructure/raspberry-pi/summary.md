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

## Maintenance
- Daily backup to [[Intel MacBook]] at 3 AM
- Self-healing via Autoheal + [[Media Stack]] Healer (port 9876)

## Related Documents
- **Full operations guide: [[Media Stack Operations Guide|media-stack.md]]**: media-stack.md (same folder)

## History
- [2026-02-02] Added presentations hosting (presentations.rogergimbel.dev) via Caddy port 8889
- [2026-01-15] Installed Pironman 5-MAX case
- [2026-01-15] Relocated to living room, switched to Ethernet
- [2026-01-29] Confirmed stable operation
