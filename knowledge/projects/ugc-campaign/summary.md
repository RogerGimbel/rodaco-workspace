# UGC Campaign Generator

## Overview
AI-powered UGC video campaign generator. Creates consistent "creator" characters and generates multiple video scenes featuring them with a product — ready for TikTok, Reels, and Meta ads.

## Location
`skills/ugc-campaign/`

## Stack
- **Image Gen:** Nano Banana Pro (Gemini 3 Pro Image) via `uv run`
- **Video Gen:** Veo 3.1 via Google GenAI Python SDK (`google-genai` package)
- **Creative Direction:** Gemini 2.5 Flash (fast, cheap, good at structured JSON output)
- **Video Stitching:** ffmpeg on M5 MacBook via SSH (no ffmpeg in container)
- **Orchestration:** Bash scripts calling Python where needed

## Architecture
```
ugc-campaign.sh (orchestrator)
  ├── creative-brief.sh → Gemini Flash → brief.json
  ├── generate-character.sh → Nano Banana Pro → 3 character images
  ├── generate-video.sh → generate-video.py → Veo 3.1 → scene-NN.mp4
  └── stitch-videos.sh → M5 ffmpeg → final-campaign.mp4
```

## Key Technical Decisions
- **Python SDK for Veo 3.1:** REST `predictLongRunning` does NOT support reference images. Must use `client.models.generate_videos()` with `types.GenerateVideosConfig(reference_images=[...])`
- **Reference type "asset":** For character/product consistency across scenes
- **3 character shots:** Portrait (front), candid (3/4 angle), action (using phone) — gives Veo 3.1 better character reference
- **Gemini Flash for briefs:** Fast (~10s), cheap, returns structured JSON with `responseMimeType: application/json`
- **uv for Python deps:** `uv run --with google-genai` avoids polluting system Python

## Performance (tested 2026-02-17)
- Creative brief: ~10s
- Character generation (3 images): ~30s
- Single video scene with reference: ~25s
- Full 4-scene campaign estimate: ~3-5 min
- Cost estimate: ~$2-3 for 4 scenes

## Use Cases
- **BeerPair launch:** Craft beer enthusiast character, 4 scenes (discovery → app → pairing → satisfaction)
- **Any product/brand:** Takes product photo + description, generates everything

## Full Pipeline Command
```bash
bash skills/ugc-campaign/ugc-campaign.sh \
  --brand "BeerPair - AI-powered beer and food pairing app..." \
  --scenes 4 --aspect "9:16" --skip-stitch \
  --output /tmp/ugc-beerpair-campaign
```

## Presentation Page
- **URL:** https://presentations.rogergimbel.dev/beerpair/ugc/
- **Hosted:** Pi Caddy server → `/mnt/media/presentations/beerpair/ugc/`
- **Contents:** index.html (dark theme, orange accent) + characters/*.png + scenes/*.mp4
- **Back link** to main BeerPair marketing plan

## History
- 2026-02-17: Created. All components tested individually.
- 2026-02-17: Full 4-scene BeerPair pipeline SUCCESS. ~3 min, ~$1.50. Character consistency confirmed.
- 2026-02-17: Presentation page deployed. Videos + link shared with Dale + Stuart via Telegram.
