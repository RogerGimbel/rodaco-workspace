# Intel MacBook — Detailed Reference

## Model Configuration (Feb 2026)
| Priority | Model | Context | Use Case |
|----------|-------|---------|----------|
| Primary | anthropic/claude-opus-4-6 | 200K | Default |
| Fallback 1 | anthropic/claude-sonnet-4-5 | 195K | Reliable general |
| Fallback 2 | google/gemini-2.5-flash-lite | 1M | Budget |

Aliases: sonnet, grok, grok-reason, grok-code, haiku, opus, codex, image, auto

## Secrets: Adding a New Secret
1. Decrypt: `SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt /usr/local/bin/sops decrypt ~/docker/openclaw/secrets.enc.yaml > /tmp/secrets-edit.yaml`
2. Edit `/tmp/secrets-edit.yaml`
3. Re-encrypt: `SOPS_AGE_KEY_FILE=... /usr/local/bin/sops encrypt --age <PUBLIC_KEY> /tmp/secrets-edit.yaml > ~/docker/openclaw/secrets.enc.yaml`
4. Delete plaintext: `rm /tmp/secrets-edit.yaml`
5. Update `decrypt-secrets.sh` if file-based
6. Rebuild container

## Container Filesystem Permissions
- `/run` — root tmpfs (755), node user CANNOT write
- `/tmp` — world-writable tmpfs (1777), USE THIS
- `/home/node/.config` — tmpfs (755), uid=1000
- `/opt/secrets` — root-created, read-only bind mounts

## Tdarr Node
- Web UI: http://rgpi:8265
- Config: ~/docker/tdarr-node/configs/Tdarr_Node_Config.json
- SMB mount: `mount -t smbfs "//rogergimbel:744747==@rgpi/media" ~/mnt/media`

## Telegram Watchdog
- Script: `~/docker/openclaw/telegram-watchdog.sh`
- Cron: `*/2 * * * *`
- Threshold: 5+ `TypeError: fetch failed` in 3 min → restart
- Cooldown: 5 min
- Why: Node.js undici connection pool gets permanently stuck after network blips

## Healer Service
- Path: `~/docker/openclaw/healer/openclaw_healer.py`
- LaunchAgent: `com.openclaw.healer`
- Monitors: container health, zombies (>3), CPU (>90%), disk, session bloat, stuck QMD
- Alert dedup: 5-min cooldown

## Host Crontab
| Schedule | Script | Purpose |
|----------|--------|---------|
| `*/2 * * * *` | telegram-watchdog.sh | Stuck Telegram fetch |
| `*/5 * * * *` | health-check.sh | Container-up check |
| `0 3 * * 0` | Docker image prune | Weekly cleanup |
| `0 0 * * 0` | Log rotation | Keep logs under 1000 lines |

## OpenClaw Internal Cron
| Schedule | Job | Purpose |
|----------|-----|---------|
| 7 AM ET daily | Morning brief | Telegram briefing |
| 2 AM ET daily | Overnight build | Auto-pick backlog task |
| 4 AM MT daily | Daily backup | Pi tar+ssh + GitHub push |
| 9 AM MT Sunday | Weekly synthesis | Knowledge + MEMORY.md review |
| Various | Get-to-know-you | Mon/Wed/Fri questions |
| Noon MT daily | TestFlight check | OpenClaw iOS app |

## CPU Optimization
Removed: Logitech Options+ (19% CPU), Comet, Perplexity, Telegram GUI.
Keep all GUI apps quit — headless server.
