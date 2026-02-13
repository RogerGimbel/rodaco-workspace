# Home Network Overview

## Network Info
- **ISP**: Xfinity/Comcast
- **Router**: xFi Gateway (CGM4981COM)
- **Limitation**: Router does NOT support DHCP reservations (use static IPs on devices)

## Device IPs

| Device | Hostname | LAN IP | Tailscale IP | Notes |
|--------|----------|--------|--------------|-------|
| [[Raspberry Pi]] 5 | rgpi | 10.0.0.20 | 100.83.169.87 | Media stack server |
| [[Intel MacBook]] | rogers-macbook-pro.local | 10.0.0.11 | 100.124.209.59 | Tdarr node, OpenClaw |
| [[M5 MacBook]] | - | DHCP | - | Primary dev machine |

## SSH Access Quick Reference

```bash
# Raspberry Pi
ssh rogergimbel@rgpi
ssh rogergimbel@10.0.0.20
ssh rogergimbel@100.83.169.87  # Tailscale

# Intel MacBook
ssh rogergimbel@10.0.0.11
```

## Service URLs (Split DNS - deployed 2026-02-07)

All services use `https://*.rogergimbel.dev` URLs. On home Wi-Fi (SafireMinx), traffic routes directly to the Pi via split DNS (dnsmasq). Off-network, same URLs route through Cloudflare tunnel.

| URL | Service | Access |
|-----|---------|--------|
| https://jellyfin.rogergimbel.dev | Jellyfin media server | Public |
| https://requests.rogergimbel.dev | Jellyseerr (media requests) | Public |
| https://family.rogergimbel.dev | Family landing page | Public |
| https://admin.rogergimbel.dev | Homepage dashboard | Cloudflare Access (protected) |
| https://sonarr.rogergimbel.dev | Sonarr (TV automation) | On-network or tunnel |
| https://radarr.rogergimbel.dev | Radarr (movie automation) | On-network or tunnel |
| https://status.rogergimbel.dev | Uptime Kuma | On-network or tunnel |
| https://homarr.rogergimbel.dev | Homarr dashboard | On-network or tunnel |

## Split DNS Infrastructure

| Component | Purpose |
|-----------|---------|
| **dnsmasq** (Pi, port 53) | `*.rogergimbel.dev` → `10.0.0.20`, IPv6 blocked (`::`) |
| **Caddy** (custom build) | TLS via Let's Encrypt DNS-01 (Cloudflare API) |
| **Tailscale Split DNS** | Routes `rogergimbel.dev` → `10.0.0.20` for Tailscale devices |

**Device DNS**: All devices configured with DNS `10.0.0.20` + `8.8.8.8` fallback (M5 Mac, Intel Mac, iPhones, Samsung S10).

## Cloudflare Access (Zero Trust)
Protected admin URL requires email verification.
- **Allowed emails**: accfighter@gmail.com, roger@rogergimbel.dev, rogergimbel@selfgrowth.app
- **Manage at**: https://one.dash.cloudflare.com/

## Docker Networks
- **Pi (media_network)**: 172.20.0.0/16
- **Intel MacBook (moltbot_internal)**: 172.30.0.0/24
