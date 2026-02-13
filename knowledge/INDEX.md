# Knowledge Graph Index

## Structure
```
knowledge/
├── people/           # Humans I work with
│   ├── roger-gimbel/summary.md
│   ├── dale-abbott/summary.md
│   └── stuart-seligman/summary.md
├── companies/
│   └── rodaco/summary.md
├── projects/
│   ├── beerpair/summary.md        # + marketing docs, images, sitemap
│   ├── media-stack/summary.md
│   ├── rodaco-app/summary.md
│   ├── obsidian-openclaw-setup.md
│   └── bookmark-backlog.md
├── infrastructure/
│   ├── intel-macbook/summary.md   # + restore-procedure.md
│   ├── raspberry-pi/summary.md    # + media-stack.md, backup plans
│   ├── m5-macbook/summary.md
│   ├── mission-control/summary.md
│   └── network-overview.md
├── chat-history/                   # Parsed conversation summaries (256 convos)
├── tools/
│   ├── IMAGE_GENERATION.md
│   └── video-gen-research.md
├── prompts/
│   └── humanize-ai-text.md
└── openclaw.json                   # Config snapshot (no secrets)
```

## Canonical Locations (DO NOT DUPLICATE)
- **Long-term memory:** `/MEMORY.md` (root)
- **Daily notes:** `/memory/YYYY-MM-DD.md`
- **Active tasks:** `/memory/active-tasks.md`
- **Soul/identity:** `/SOUL.md`, `/IDENTITY.md`, `/USER.md` (root)
- **Agent instructions:** `/AGENTS.md` (root)
- **Heartbeat config:** `/HEARTBEAT.md` (root)
- **Entity summaries:** `knowledge/{type}/{name}/summary.md`

## Sub-Agent Context
When spawning sub-agents, include relevant KB paths:
```
"Audit BeerPair SEO. Load: knowledge/projects/beerpair/summary.md"
"Check Pi health. Load: knowledge/infrastructure/raspberry-pi/summary.md"
```

*Last updated: 2026-02-13*
