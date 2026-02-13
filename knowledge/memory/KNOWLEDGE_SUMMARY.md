# Rodaco Knowledge Summary

## Current Status
- **Phase**: MVP Development
- **Team Size**: 3 people

## Team
| Name | Role | Telegram |
|------|------|----------|
| Roger Gimbel | Developer | @roger_gimbel |
| Dale Abbott | Finance/Ideas | @DMA5400 |
| Stuart Seligman | Ideas/Marketing | @Sgseligman |

## Focus
- Web and mobile app development
- Primary product: Rodaco App (MVP in progress)

## Tech Stack
- Frontend: React/Next.js
- Backend: Supabase
- Mobile: WebView wrapper (Despia)
- Hosting: Vercel, Cloudflare

## Communication
- Primary: Telegram group
- AI Assistant: OpenClaw (@roger_gimbel_bot)

## History
- [2026-01-31] Migrated naming from Moltbot/Clawdbot to OpenClaw/Rodaco
- [2026-01-29] OpenClaw integration complete for team collaboration

---

# Intel MacBook Pro 15" (2018)

## Current Status
- **Role**: Headless server
- **Health**: Stable

## Services Running
- **OpenClaw Gateway** (Docker, port 18789)
- **Tdarr Node** (transcoding, port 8267)
- **Time Machine Server** (backups)
- **Pi Config Backups** (receives daily backups from Pi)

## Network
- **Hostname**: rogers-macbook-pro.local
- **LAN IP**: 10.0.0.11
- **Tailscale IP**: 100.124.209.59

## OpenClaw Details
- **Version**: 2026.2.3-1
- Container: moltbot-gateway
- Gateway: 0.0.0.0:18789 (LAN, 64-char token auth)
- Channel: Telegram (@roger_gimbel_bot)
- Memory: builtin OpenAI embeddings (text-embedding-3-small)

## History
- [2026-02-07] Fixed gateway crash loop: decrypted .env.enc, renamed CLAWDBOT_* to OPENCLAW_* vars
- [2026-02-07] Moved Voyage API key to Docker Compose env (15 keys in encrypted .env.enc, tracked in git)
- [2026-02-07] Reset Samba password on Pi, remounted SMB share for Tdarr node
- [2026-02-07] Recreated Pi's duplicati container (OCI runtime error after reboot)
- [2026-02-07] Installed sops on Intel MacBook for secrets management
- [2026-02-05] Removed QMD, switched to builtin OpenAI embeddings (faster)
- [2026-02-05] Security hardening: 64-char token, removed Haiku from fallbacks
- [2026-02-05] Upgraded OpenClaw to 2026.2.3-1
- [2026-01-31] Naming cleanup complete
- [2026-01-31] 3-layer self-healing implemented
- [2026-01-29] OpenClaw setup completed

---

# MacBook Pro 14" M5

## Current Status
- **Role**: Primary development machine
- **Health**: Active daily use

## Specs
- Apple M5 chip
- 32GB unified memory
- 1TB SSD

## History
- [2026-01-29] Set up 3-layer context system

---

# Raspberry Pi 5 (rgpi)

## Current Status
- **Role**: Media stack server
- **Health**: Stable

## Network
- **Hostname**: rgpi
- **LAN IP**: 10.0.0.20
- **Tailscale IP**: 100.83.169.87

## History
- [2026-01-29] Confirmed stable operation

---

# Dale Abbott

## Current
- **Role**: Finance/Ideas at Rodaco
- **Telegram**: @DMA5400 (ID: 8372298367)
- **Access Level**: BUSINESS ONLY on OpenClaw

## History
- [2026-01-29] Added to OpenClaw with BUSINESS ONLY access

---

# Roger Gimbel

## Current
- **Role**: Developer at Rodaco (3-person company)
- **Telegram**: @roger_gimbel (ID: 1425151324)
- **Access Level**: FULL ADMIN on OpenClaw

## History
- [2026-01-31] Fixed workspace permissions
- [2026-01-29] Set up OpenClaw on Intel MacBook

---

# Stuart Seligman

## Current
- **Role**: Ideas/Marketing at Rodaco
- **Telegram**: @Sgseligman (ID: 7655601668)
- **Access Level**: BUSINESS ONLY on OpenClaw

## History
- [2026-01-30] Connected to OpenClaw via Telegram
- [2026-01-29] Added to Rodaco plan

---

# BeerPair

## Current Status
- **Phase**: Maintenance Mode
- **Priority**: Bug fixes only

## History
- [2026-01-29] Confirmed maintenance mode status

---

# Media Stack

## Current Status
- **Phase**: Stable/Maintenance

## Infrastructure
- **Host**: Raspberry Pi 5 (rgpi)
- **Tailscale IP**: 100.83.169.87

## History
- [2026-01-29] Confirmed stable, monitoring only

---

# Rodaco App

## Current Status
- **Phase**: MVP Development
- **Priority**: Q1 2026 Primary Objective

## History
- [2026-01-29] Listed as Q1 primary objective

--- Knowledge graph combined for search indexing ---
