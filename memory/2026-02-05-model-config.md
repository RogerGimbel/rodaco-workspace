# Model Configuration - Updated 2026-02-05

## CRITICAL: Model Routing Rules (Roger's directive)

**Default model: Claude Opus 4.6** — use for EVERYTHING except:

1. **Web/X search** → Spawn sub-agent on **Grok 4.1** (`grok`)
   - Use `sessions_spawn` with model `grok` for any web search task
   - Never use web_search (Brave API) — we don't have a key and don't need one
   - Never say "I can't search the web" — just spawn Grok

2. **Image generation** → Use **nano-banana-pro skill** (Gemini 3 Pro Image)
   - Read skill at /usr/local/lib/node_modules/openclaw/skills/nano-banana-pro/SKILL.md
   - Never say "I can't generate images"

## What NOT to do
- ❌ Don't try web_search tool (no Brave API key)
- ❌ Don't suggest "I can't browse/search"
- ❌ Don't stay on Opus when you need search — spawn Grok
- ❌ Don't forget to come back to Opus after search
