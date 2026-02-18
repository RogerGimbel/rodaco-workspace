# CURRENT TASK

*Updated 2026-02-17 21:45 ET*

## TL;DR
UGC Campaign skill complete. Full 4-scene BeerPair pipeline ran successfully (~3 min, ~$1.50). All checkpointed.

## Status: IDLE

## Task: UGC Campaign Skill — Full Pipeline Test

### Completed Steps
- [x] Built skill structure: `skills/ugc-campaign/`
- [x] `creative-brief.sh` — tested, works (Gemini Flash, ~10s)
- [x] `generate-character.sh` — tested, works (Nano Banana Pro, ~30s, 3 shots)
- [x] `generate-video.py` — tested, works (Veo 3.1 Python SDK, ~25s, 4.8MB)
- [x] Fixed REST API issue: must use Python SDK for reference images (not predictLongRunning)
- [x] Fixed JSON escaping: creative-brief uses Python for payload construction
- [x] Fixed "argument list too long": video gen uses @file for curl payload → then switched to Python SDK entirely
- [x] Sent test images + video to Roger via Telegram

### Completed
- [x] Run full 4-scene pipeline ✅ (~3 min, ~$1.50, all 4 scenes generated)
- [x] Character consistency confirmed across all scenes ✅
- [x] Sent all videos + character to Roger via Telegram ✅
- [ ] Test stitch (ffmpeg on M5) — future task
- [ ] Iterate on character/scenes based on Roger's feedback — future task

### Key Files
- `skills/ugc-campaign/` — the skill
- `/tmp/ugc-test-brief.json` — test creative brief
- `/tmp/ugc-test-character/` — test character images (3 shots)
- `/tmp/ugc-test-scene-1.mp4` — test video scene

### Technical Notes
- Veo 3.1 model: `veo-3.1-generate-preview`
- Reference images: use Python SDK `types.VideoGenerationReferenceImage(image=types.Image(image_bytes=..., mime_type=...), reference_type="asset")`
- REST predictLongRunning does NOT support referenceImages
- Nano Banana Pro script: `/usr/local/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py`
- No ffmpeg in container — stitch via M5 MacBook SSH
- `uv run --with google-genai` for Python SDK dependency

### Recovery
- If crash: re-read this file, test artifacts in /tmp/, skill code in skills/ugc-campaign/
- Character images can be regenerated quickly (~30s)
- Brief can be regenerated (~10s)
