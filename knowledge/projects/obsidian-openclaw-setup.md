# Obsidian + OpenClaw Integration Plan

**Created:** 2026-02-11
**Status:** COMPLETED
**Prerequisite:** Roger has paid Obsidian account

---

## Pattern A: Obsidian as Workspace Viewer (Mobile Access)

Sync the OpenClaw workspace to Obsidian so Roger can view/edit MEMORY.md, daily notes, knowledge graph, and cron configs from his phone.

### Steps

- [ ] **A1. Choose sync method**
  - **Option 1: Obsidian Sync** (paid, already have it) — cleanest, works across all devices
  - **Option 2: Syncthing** — free, peer-to-peer, but more setup
  - **Option 3: iCloud** — free on Apple devices, point Obsidian at iCloud folder
  - **Recommendation:** Obsidian Sync since Roger has a paid account

- [ ] **A2. Create Obsidian vault on M5 MacBook**
  - Create vault named "Rodaco" or "OpenClaw Workspace"
  - Enable Obsidian Sync for this vault

- [ ] **A3. Set up file sync from Intel MacBook → vault**
  - The workspace lives inside Docker at `/home/node/workspace`
  - Mounted on host as a Docker volume (`moltbot-workspace`)
  - Need to find the host path: `docker volume inspect moltbot-workspace`
  - Set up rsync or symlink from host volume path → Obsidian vault folder
  - **Sync script** (cron every 1-5 min on Intel MacBook):
    ```bash
    rsync -av --delete \
      /path/to/docker/volume/workspace/ \
      ~/ObsidianVaults/Rodaco/ \
      --exclude=node_modules --exclude=.git --exclude=antfarm/node_modules
    ```

- [ ] **A4. Configure .obsidian for good UX**
  - Set up folder structure visibility (star important folders)
  - Pin MEMORY.md, HEARTBEAT.md, MISSION_CONTROL.md
  - Add daily notes plugin pointing to `memory/` folder
  - Add templates for common patterns

- [ ] **A5. Install on iPhone**
  - Install Obsidian iOS app
  - Enable Obsidian Sync → vault appears automatically
  - Test viewing and editing MEMORY.md from phone

- [ ] **A6. Two-way sync consideration**
  - If Roger edits a file in Obsidian, it needs to propagate back to Docker
  - rsync both directions, or use Syncthing for true bidirectional
  - **Risk:** Conflicts if both sides edit simultaneously
  - **Safer:** One-way sync (Docker → Obsidian) for viewing, use Telegram for edits

### Time estimate: ~30 minutes

---

## Pattern B: OpenClaw as Obsidian's AI Brain (Agent Skills + CLI)

Use Obsidian 1.12's new CLI and official Agent Skills so OpenClaw can manage an Obsidian vault as a rich knowledge base.

### Steps

- [ ] **B1. Update Obsidian to 1.12+**
  - On M5 MacBook: Check current version, update if needed
  - Enable Early Access features in Settings → General
  - Enable CLI in Settings → General → Command line interface

- [ ] **B2. Install Obsidian Agent Skills**
  - From Obsidian: `/plugin marketplace add kepano/obsidian-skills`
  - Or manually: clone `kepano/obsidian-skills` into vault's `.claude/` folder
  - Skills included:
    - `obsidian-markdown` — Create/edit Obsidian-flavored markdown
    - `obsidian-bases` — Create/edit Bases (databases)
    - `json-canvas` — Create visual canvases
    - `obsidian-cli` — Full CLI interaction
    - `defuddle` — Clean web page extraction

- [ ] **B3. Install obsidian-openclaw plugin**
  - Via BRAT: Settings → BRAT → Add Beta Plugin → `AndyBold/obsidian-openclaw`
  - Configure:
    - Gateway URL: `http://100.124.209.59:18789` (Tailscale IP)
    - Gateway Token: (from .env)
  - Test connection from Obsidian
  - Features: Chat sidebar, file operations, two-way sync

- [ ] **B4. Consider Arrowhead for semantic search** (optional, advanced)
  - `brew install totocaster/tap/arrowhead`
  - Indexes vault with FTS + vector search
  - MCP interface for Claude Code / OpenClaw
  - Background daemon watches vault in real-time
  - **Benefit:** Semantic search across all notes (better than grep)
  - **Wait on this** until A+B basics are working

- [ ] **B5. Connect OpenClaw to Obsidian CLI**
  - From inside Docker, SSH to Intel MacBook → run Obsidian CLI commands
  - Or: Set up on M5 MacBook where Obsidian actually runs
  - **Challenge:** Obsidian runs on M5 (daily driver), not Intel MacBook
  - **Solution:** SSH from OpenClaw container → M5 MacBook via Tailscale
  - Need: M5 Tailscale IP, SSH key setup, Obsidian CLI path

- [ ] **B6. Create OpenClaw skill for Obsidian**
  - Wrap Obsidian CLI commands in an OpenClaw skill
  - Commands: create note, search, update, list, open
  - Store in `workspace/skills/obsidian/`

### Time estimate: ~1-2 hours

---

## Execution Order

### Phase 1 — Quick Win (Today)
1. **A1-A3:** Set up sync from Docker workspace → Obsidian vault
2. **A5:** Get it on Roger's iPhone

### Phase 2 — Obsidian Plugin (This Week)
3. **B1:** Update Obsidian to 1.12, enable CLI
4. **B3:** Install obsidian-openclaw plugin, connect to gateway
5. **A4:** Polish the vault UX

### Phase 3 — Agent Integration (Next Week)
6. **B2:** Install Agent Skills
7. **B5-B6:** Connect OpenClaw to Obsidian CLI, create skill
8. **B4:** Evaluate Arrowhead for semantic search

---

## Architecture Diagram

```
┌─────────────────┐     rsync/sync      ┌──────────────────┐
│  Intel MacBook   │ ──────────────────→ │   M5 MacBook     │
│  (Docker)        │                     │   (Obsidian)     │
│                  │                     │                  │
│  OpenClaw        │ ← Gateway API ───── │  obsidian-openclaw│
│  workspace/      │                     │  plugin          │
│  ├── MEMORY.md   │                     │                  │
│  ├── memory/     │     Obsidian Sync   │                  │
│  ├── knowledge/  │                     │  ┌──────────┐   │
│  └── skills/     │                     │  │ iPhone    │   │
│                  │                     │  │ Obsidian  │   │
└─────────────────┘                     └──┴──────────┴───┘
```

---

## Open Questions

1. **Docker volume host path** — Need to find where `moltbot-workspace` is on the Intel MacBook filesystem
2. **M5 SSH access** — Is M5 MacBook accessible via Tailscale SSH? Need to set up key auth
3. **Sync direction** — One-way (safe) or two-way (powerful but conflict-prone)?
4. **Which vault?** — New vault for OpenClaw, or add to existing vault?

---

*Plan created by Rodaco — 2026-02-11*
