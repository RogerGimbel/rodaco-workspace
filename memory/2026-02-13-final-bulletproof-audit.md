# Final Bulletproof Audit — 2026-02-13

## Failure Scenarios: What's Covered

### Intel MacBook
| Scenario | Detection | Auto-Recovery | Manual? |
|----------|-----------|---------------|---------|
| Container crash | Docker healthcheck (30s) | Autoheal restarts | No |
| Container unhealthy | Healthcheck + healer | Autoheal/healer restarts | No |
| Stuck Telegram fetch | Watchdog (2 min) | Auto-restart | No |
| Zombie processes | Healer (30s loop) | Auto-restart | No |
| Session file bloat | Healer | Archive + restart | No |
| Stuck QMD process | Healer | Kill process | No |
| High CPU (>90%) | Healer | Alert only | Monitor |
| Disk full | Healer + weekly prune | Alert + prune | No |
| Docker hangs | Health-check.sh (5 min) | Restart container | No |
| Power loss | Pi WoL (10 min) | WoL recovery | No |
| Full machine crash | Pi WoL (10 min) | WoL → reboot → Docker auto-start | No |
| Network outage | Pi monitoring | Recovers when network returns | No |
| Log files grow | Weekly rotation (all 3 logs) | Auto-truncate to 1000 lines | No |

### Raspberry Pi
| Scenario | Detection | Auto-Recovery | Manual? |
|----------|-----------|---------------|---------|
| Container crash | Docker healthcheck | Autoheal restarts | No |
| Gluetun VPN restart | Gluetun watchdog (2 min) | Auto-restart qBit+SABnzbd | No |
| Internet outage | Tailscale watchdog | Auto-reconnect | No |
| SD card filling | Storage alert (daily) | Alert (journal capped at 100M) | Monitor |
| USB drive failure | Storage alert + SMART (weekly) | Alert (early warning) | Yes |
| SSD failure | Storage alert + SMART (weekly) | Alert (early warning) | Yes |
| Thermal throttle | Pironman5 fans (balanced) | Auto-cool | No |
| Docker image bloat | Weekly prune (Sun 4 AM) | Auto-cleanup | No |
| Log files grow | Weekly rotation (Sun 1 AM) | Auto-truncate | No |
| Stale containers | Already cleaned (portainer, netdata, wetty) | — | — |
| Power loss | Hardware watchdog (15s) + fstab nofail | Auto-reboot, drives remount | No |

### Cross-Machine
| Scenario | Detection | Auto-Recovery |
|----------|-----------|---------------|
| MacBook down | Pi macbook-recovery.sh (10 min) | WoL (3 attempts) + Telegram |
| Pi down | Uptime Kuma on Pi (self-monitor) | N/A (Pi IS the monitor) |
| Both down | Nothing | Manual (power restore → both auto-boot) |

## Fixes Applied This Pass
- [x] Cleaned 108MB pironman5 dashboard logs
- [x] Removed 3 stale exited containers (portainer, netdata, wetty)
- [x] Added log rotation for MacBook healer + watchdog logs (weekly, 1000 lines)
- [x] Created gluetun dependency watchdog (auto-restarts qBit+SABnzbd)
- [x] Added Pi log rotation script (weekly, 500 lines + pironman cleanup)

## Roger TODO
- [ ] `sudo pmset -a restartpowerfailure 1` — didn't take without sudo. Run it again WITH sudo.
  Verify: `pmset -g | grep restartpowerfailure` should show `1`

## Remaining "Yes Manual" Items (Unavoidable)
1. **USB drive physical failure** — SMART monitoring gives early warning, backup to MacBook protects data, but replacement requires physical access
2. **Both machines lose power simultaneously** — both auto-reboot, but if router is also down, they can't reach each other until network recovers

## What's NOT Self-Healing (Accepted Risks)
- Pi monitors MacBook, but nothing external monitors Pi (Uptime Kuma runs ON the Pi)
- If Pi dies completely, MacBook has no visibility into it until backup cron fails at 4 AM
- MacBook battery degradation (77%, AC attached) — eventually needs replacement for true UPS behavior

*Created: 2026-02-13 ~17:00 MT*
*Status: COMPLETE*
