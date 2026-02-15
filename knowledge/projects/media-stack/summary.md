# Media Stack

## Current Status
- **Phase**: Stable/Maintenance
- **Priority**: Q1 2026 Secondary (monitoring only)

## Infrastructure
- **Host**: Raspberry Pi 5 (rgpi)
- **Storage**: 2TB Crucial X9 SSD at /mnt/media
- **Tailscale IP**: 100.83.169.87

## Services
- Jellyfin (streaming)
- Sonarr/Radarr (automation)
- Prowlarr (indexers)
- qBittorrent/SABnzbd (downloads)
- Gluetun (VPN - ProtonVPN WireGuard)
- Homepage (dashboard)
- Uptime Kuma (monitoring)

## Self-Healing
- 3-layer architecture (Autoheal, Media Stack Healer, manual)
- Webhook receiver at port 9876
- Verified working - auto-heals container failures

## Key URLs
- Family Portal: https://family.rogergimbel.dev
- Admin Dashboard: https://admin.rogergimbel.dev
- Jellyfin: https://jellyfin.rogergimbel.dev

## Documentation
- Operations Runbook: ~/.claude/plans/media-stack-operations.md
- Project Context: ~/media-stack/CLAUDE.md

## History
- [2026-01-15] Installed Pironman 5-MAX case for cooling
- [2026-01-29] Confirmed stable, monitoring only
- [2026-02-13] Full resilience hardening — UFW firewall, SMART monitoring, Docker data-root migrated to SanDisk USB, disabled unnecessary services
- [2026-02-14] Fixed Homepage dashboard (container→host loopback blocked by UFW, switched to Docker DNS)
