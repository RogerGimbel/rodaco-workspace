# OpenClaw Disaster Recovery Procedure

## What's Backed Up

| Source | Backup Location | Contents | Frequency |
|--------|----------------|----------|-----------|
| Workspace volume | Pi: `/mnt/media/backups/openclaw/workspace-snapshots/` | Memory, knowledge, skills, scripts, mission-control | Daily 4 AM MT |
| Workspace volume | GitHub: `RogerGimbel/rodaco-workspace` (private) | Same (minus binaries/images via .gitignore) | Daily 4 AM MT |
| Config volume | Pi: `/mnt/media/backups/openclaw/config-snapshots/` | openclaw.json, agent configs, credentials, cron state | Daily 4 AM MT |

## What's NOT Backed Up (Rebuildable)

| Item | Size | How to Rebuild |
|------|------|----------------|
| QMD embedding index | 2.9GB | Auto-rebuilds: `openclaw memory index` |
| node_modules | 152MB | `npm install` in workspace |
| pylib (Python libs) | 89MB | `pip install` per skill requirements |
| .venv | 114MB | Recreate virtualenv |
| antfarm | varies | `npm install` in antfarm dir |
| Session history | varies | Not recoverable (ephemeral by design) |

## Retention

- **Pi:** 7 day-of-week snapshots + 14 dated snapshots (auto-pruned)
- **GitHub:** Full git history (infinite)

---

## Scenario 1: MacBook Dies — Restore from Pi

### Prerequisites
- New machine with Docker installed
- SSH access to Pi (Tailscale: `100.83.169.87` or LAN: `10.0.0.20`)
- The `.env` file (decrypt from `.env.enc` using age key, or recreate from memory)
- SSH key for Pi access

### Steps

```bash
# 1. Get the docker-compose setup
# (If you have the git repo: git clone the openclaw docker repo)
# (If not: recreate docker-compose.yml from MEMORY.md docs)
mkdir -p ~/docker/openclaw && cd ~/docker/openclaw

# 2. Create Docker volumes
docker volume create moltbot_workspace
docker volume create moltbot_config

# 3. Restore workspace from Pi
ssh rogergimbel@100.83.169.87 "cat /mnt/media/backups/openclaw/workspace-snapshots/workspace-$(date +%A).tar.gz" | \
  docker run --rm -i -v moltbot_workspace:/data alpine sh -c "cd /data && tar xzf -"

# 4. Restore config from Pi
ssh rogergimbel@100.83.169.87 "cat /mnt/media/backups/openclaw/config-snapshots/config-$(date +%A).tar.gz" | \
  docker run --rm -i -v moltbot_config:/data alpine sh -c "cd /data && tar xzf -"

# 5. Recreate .env file
# Option A: Decrypt from .env.enc (need age key from secure storage)
# SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt sops decrypt --input-type dotenv --output-type dotenv .env.enc > .env
# Option B: Manually recreate from password manager / memory

# 6. Set up SSH keys for Pi access
mkdir -p ssh-keys
# Copy or regenerate moltbot_key

# 7. Start the container
docker compose up -d

# 8. Rebuild QMD index (will take a few minutes)
docker exec moltbot-gateway openclaw memory index

# 9. Reinstall node_modules
docker exec moltbot-gateway sh -c "cd /home/node/workspace && npm install"

# 10. Verify
docker exec moltbot-gateway openclaw status
```

## Scenario 2: Pi Dies — Restore Workspace from GitHub

```bash
# Inside the container (or via docker exec):
cd /home/node/workspace
git clone https://github.com/RogerGimbel/rodaco-workspace.git .

# Note: GitHub backup doesn't include:
# - Config volume (openclaw.json, credentials, cron state)
# - Binary files (images, PDFs, bin/gh)
# - .git-credentials (need to reconfigure)
```

## Scenario 3: Both Die

1. Get a new machine with Docker
2. Clone workspace from GitHub (Scenario 2)
3. Recreate config volume manually:
   - Decrypt `.env.enc` (need age key from secure backup)
   - Run `openclaw wizard` to regenerate base config
   - Restore credentials from password manager
4. Rebuild everything else per Scenario 1 steps 8-10

## Critical Files to Back Up Elsewhere

These should also exist outside both machines:
- **Age encryption key** (`~/.config/sops/age/keys.txt`) — store in password manager
- **GitHub PAT** — regenerable from github.com/settings/tokens
- **Telegram bot token** — regenerable from @BotFather
- **API keys** — regenerable from respective dashboards

---

*Last updated: 2026-02-13*
