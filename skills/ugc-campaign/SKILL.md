# UGC Campaign Generator

Generate full UGC (User-Generated Content) video campaigns from a single product photo. Creates a consistent AI "creator" character and generates multiple scenes featuring that character with your product — ready for TikTok, Reels, and Meta ads.

## How It Works

1. **Creative Brief** — Opus/Sonnet analyzes your product photo + brand info and writes scene scripts
2. **Character Lock** — Nano Banana Pro generates a consistent character (multiple angles)
3. **Video Scenes** — Veo 3.1 generates each scene using reference images for character consistency
4. **Assembly** — ffmpeg stitches scenes + adds captions/overlays (optional)

## Quick Start

### Generate a full campaign:
```bash
bash {baseDir}/ugc-campaign.sh \
  --product "/path/to/product-photo.png" \
  --brand "BeerPair - AI-powered beer and food pairing app" \
  --scenes 4 \
  --aspect "9:16" \
  --output "/tmp/ugc-campaign"
```

### Generate just the character (for iteration):
```bash
bash {baseDir}/generate-character.sh \
  --prompt "Friendly craft beer enthusiast, mid-30s male, casual flannel shirt, warm smile, at a brewery" \
  --output "/tmp/ugc-character"
```

### Generate a single video scene with reference images:
```bash
bash {baseDir}/generate-video.sh \
  --prompt "Scene description here" \
  --reference "/path/to/character.png" \
  --reference "/path/to/product.png" \
  --aspect "9:16" \
  --output "/tmp/scene-1.mp4"
```

## Requirements
- `GEMINI_API_KEY` — for Nano Banana Pro (image gen) + Veo 3.1 (video gen)
- `uv` — Python package runner (for Nano Banana Pro)
- `ffmpeg` — for video stitching (optional, on M5 MacBook via SSH)
- `jq` or workspace jq binary — for JSON parsing

## Templates
Scene prompt templates live in `{baseDir}/templates/`. Each is a JSON file with:
```json
{
  "name": "product-discovery",
  "description": "Character discovers the product naturally",
  "prompt_template": "A {character_description} is {setting}. They {discovery_action}. {camera_direction}. {audio_direction}.",
  "settings": ["craft beer aisle", "restaurant", "home kitchen"],
  "camera_directions": ["Medium shot, eye-level", "Close-up tracking shot"],
  "audio_directions": ["Upbeat indie music playing softly", "Natural ambient sounds"]
}
```

## Architecture
- `ugc-campaign.sh` — Main orchestrator (calls sub-scripts in sequence)
- `generate-character.sh` — Nano Banana Pro character generation
- `generate-video.sh` — Veo 3.1 video generation with reference images
- `creative-brief.sh` — Uses Opus/Sonnet to write scene scripts from product + brand
- `stitch-videos.sh` — ffmpeg assembly (runs on M5 MacBook via SSH)
- `templates/` — Reusable scene prompt templates

## Cost Estimate
- Character generation (Nano Banana): ~$0.05-0.10
- Per video scene (Veo 3.1): ~$0.25-0.50
- Full 4-scene campaign: ~$1.50-3.00
- Full 8-scene campaign: ~$3.00-5.00
