# Knowledge Index

Quick-reference map of domain knowledge. Load relevant KBs when working on a topic — don't search everything.

## People
| Entity | Path | Topics |
|--------|------|--------|
| [[Roger Gimbel]] | `people/roger-gimbel/summary.md` | technical lead, coding, architecture, admin |
| [[Dale Abbott]] | `people/dale-abbott/summary.md` | business, finance, Ocean One Marine, strategy |
| [[Stuart Seligman]] | `people/stuart-seligman/summary.md` | marketing, growth, ideas, B2B |

## Projects
| Entity | Path | Topics |
|--------|------|--------|
| [[BeerPair]] | `projects/beerpair/summary.md` | beer pairing app, native apps, Despia, marketing |
| [[Rodaco App]] | `projects/rodaco-app/summary.md` | SaaS platform, MVP, product development |
| [[Media Stack]] | `projects/media-stack/summary.md` | Jellyfin, Sonarr, Radarr, Pi, Docker, media automation |

## Infrastructure
| Entity | Path | Topics |
|--------|------|--------|
| [[Intel MacBook 15" (2018)]] | `infrastructure/intel-macbook/summary.md` | OpenClaw host, Docker, Tailscale, self-healing |
| [[M5 MacBook]] | `infrastructure/m5-macbook/summary.md` | Roger's dev machine, daily driver |
| [[Raspberry Pi 5 (rgpi)]] | `infrastructure/raspberry-pi/summary.md` | media stack, Docker, split DNS, Caddy, dnsmasq |
| USB Storage Migration | `infrastructure/raspberry-pi/usb-storage-migration-plan.md` | SanDisk 256GB, Docker on USB 2, media on USB 3 |
| [[Mission Control]] | `infrastructure/mission-control/summary.md` | ops dashboard, monitoring, mobile-first SPA |

## Companies
| Entity | Path | Topics |
|--------|------|--------|
| [[Rodaco]] | `companies/rodaco/summary.md` | company strategy, team, products, goals |

## Chat History
| Entity | Path | Topics |
|--------|------|--------|
| [[Chat History Index]] | `chat-history/INDEX.md` | 256 conversations across Grok + Claude |
| [[Technical Chats]] | `chat-history/technical.md` | coding, Claude Code, Docker, APIs, debugging |
| [[BeerPair Chats]] | `chat-history/beerpair.md` | beer pairing app discussions |
| [[Rodaco Chats]] | `chat-history/rodaco.md` | business strategy, Lovable, SelfGrowth |
| [[Research Chats]] | `chat-history/research.md` | AI models, tools, comparisons |
| [[Personal Chats]] | `chat-history/personal.md` | general Q&A, life, health, misc |

## Top-Level Knowledge
| File | Topics |
|------|--------|
| `MISSION_CONTROL.md` | active tasks, priorities, backlog |
| `PROACTIVITY.md` | overnight build rules, morning brief, autonomous work |
| `MORNING_BRIEF_TEMPLATE.md` | daily brief format |

## How to Use This Index

**For main sessions:** Use `memory_search` first, then pull specific KBs if needed.

**For sub-agents / cron jobs:** Include relevant KB paths in the task description:
```
"Check [[BeerPair]] deployment status. Context: knowledge/projects/beerpair/summary.md"
```

**When adding new entities:** Update this index so all agents can discover them.
