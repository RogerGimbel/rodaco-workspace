# Model Routing Rules (Roger directive, updated 2026-02-19)

## Default Policy
- **Use Codex GPT-5.3 (`openai-codex/gpt-5.3-codex`) for everything by default.**
- Do **not** switch to Sonnet/Opus/Grok unless Roger explicitly asks.

## Explicit Exception Policy (only when Roger requests)
- **Grok / Grok Imagine**: allowed when specifically requested.
- **Opus 4.6 fallback**: allowed for difficult tasks only when specifically requested.

## Operating Rules
- Assume Codex first, even for complex work.
- If Roger asks for a specific model, use it for that task and then return to Codex default behavior.
