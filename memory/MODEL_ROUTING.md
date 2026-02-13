# Model Routing Rules (Roger's directive 2026-02-05)

## CRITICAL — Always follow these rules

| Task | Model | How |
|------|-------|-----|
| **Default (everything)** | Claude Opus 4.6 | Stay on current model |
| **Web/X search** | Grok 4.1 | `sessions_spawn` with model `grok` |
| **Image generation** | Nano Banana Pro | Read skill, use Gemini 3 Pro Image |

## Rules
- No Brave API key needed — Grok handles all web search
- Never say "I can't search the web" — spawn a Grok sub-agent
- Never say "I can't generate images" — use nano-banana-pro skill
- Always return to Opus 4.6 after completing search/image tasks
