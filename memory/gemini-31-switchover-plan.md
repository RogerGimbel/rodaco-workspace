# Gemini 3.1 Pro Preview — Daily Driver Switchover Plan

**Status:** WAITING — model confirmed in API, 503 on launch day (2026-02-19)
**Trigger:** Cron job `gemini-3.1-availability-check` (every 30 min) will Telegram-notify Roger when live
**Cron ID:** `61f6cfa2-598c-4cee-ba0f-5a8c8bc74350`

---

## Why We Want This

- **Benchmarks:** 94.1% GPQA Diamond, 77.1% ARC-AGI-2 — top of the leaderboard as of launch day
- **Pricing:** $2/$12 per 1M (input/output) under 200K ctx — comparable to Sonnet 4.6, way cheaper than Opus
- **Context:** 1M tokens (same as Sonnet/Opus)
- **Multimodal:** text, image, video, audio, code — full stack
- **Special variant:** `gemini-3.1-pro-preview-customtools` — tuned for agentic/bash workflows
- Our existing `GEMINI_API_KEY` is already authorized — zero setup needed

---

## Switchover Plan (execute when Roger gives the go-ahead)

### Phase 1: Verify & Benchmark (Day 1)
1. Run `node /home/node/workspace/bin/check-gemini-31` — confirm clean response
2. Run a few representative prompts: code task, web search sub-agent, long-context file analysis
3. Compare quality vs Sonnet 4.6 on same prompt
4. Check latency (note response time)

### Phase 2: OpenClaw Config Update
Switch Roger's main session model in `openclaw.json`:
```json
// Change:
"primary": "anthropic/claude-sonnet-4-6"
// To:
"primary": "google/gemini-3.1-pro-preview"
```
Run: `openclaw gateway config.patch` with the model change, then `gateway restart`

Also consider:
- `gemini-3.1-pro-preview-customtools` for tool-heavy cron jobs
- Keep Sonnet 4.6 as fallback in case Gemini rate-limits

### Phase 3: Update Routing Docs
- Update `MEMORY.md` — change primary model entry
- Update `memory/MODEL_ROUTING.md` — new default model
- Update `TOOLS.md` model routing policy table
- Update `IDENTITY.md` model arsenal table
- Update all cron jobs if we want to switch those too (11 jobs on Sonnet — probably leave them for now)

### Phase 4: 48-Hour Trial
- Watch for any breakage (tool use, memory_search, sub-agent spawning)
- Check Anthropic API costs drop off
- Check Google AI Studio usage dashboard for sanity
- If anything feels off, `/model sonnet` to revert immediately

---

## Rollback
```
/model sonnet
```
That's it. OpenClaw per-session model override is instant. No config change needed for emergency rollback.

---

## Notes
- `gemini-3.1-pro-preview-customtools` may be better for cron/agentic jobs — test both
- Gemini models don't have an equivalent of Anthropic's "thinking" mode yet — for deep reasoning tasks, may still want Sonnet or Opus
- Google rate limits on preview models can be tighter than GA — monitor if we hit 429s
- OpenRouter also has `google/gemini-3.1-pro-preview` as fallback if direct API gets flaky

---

*Created: 2026-02-19*
*Trigger: Roger requested daily driver testing after seeing launch benchmarks*
