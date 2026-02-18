#!/usr/bin/env bash
# Generate a consistent UGC character using Nano Banana Pro (Gemini 3 Pro Image)
# Creates multiple views of the same character for use as Veo 3.1 reference images
# Usage: generate-character.sh --prompt "character description" [--output /tmp/ugc-character]
set -euo pipefail

PROMPT=""
OUTPUT_DIR="/tmp/ugc-character-$(date +%s)"
NANO_BANANA_SCRIPT="/usr/local/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prompt) PROMPT="$2"; shift 2 ;;
    --output) OUTPUT_DIR="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$PROMPT" ]]; then
  echo "ERROR: --prompt is required"
  echo "Usage: generate-character.sh --prompt \"Friendly mid-30s male, casual flannel shirt\" [--output dir]"
  exit 1
fi

if [[ -z "${GEMINI_API_KEY:-}" ]]; then
  echo "ERROR: GEMINI_API_KEY not set"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

echo "🎨 Generating UGC character with Nano Banana Pro..."
echo "   Prompt: ${PROMPT:0:80}..."
echo "   Output: $OUTPUT_DIR"

# Generate main portrait (front-facing, waist-up)
echo ""
echo "1/3 — Main portrait (front-facing)..."
uv run "$NANO_BANANA_SCRIPT" \
  --prompt "Professional UGC creator photo. ${PROMPT}. Front-facing, waist-up portrait, natural lighting, looking at camera with authentic warm expression. Photorealistic, high quality, shot on iPhone 15 Pro. Plain neutral background." \
  --filename "$OUTPUT_DIR/character-portrait.png" \
  --resolution 1K

# Generate candid shot (slightly angled, more natural)
echo ""
echo "2/3 — Candid angle..."
uv run "$NANO_BANANA_SCRIPT" \
  --prompt "Candid UGC photo. ${PROMPT}. Three-quarter angle view, natural pose like mid-conversation, warm authentic smile. Photorealistic, high quality, natural indoor lighting. Slightly blurred lifestyle background." \
  --filename "$OUTPUT_DIR/character-candid.png" \
  --resolution 1K

# Generate action shot (using a phone/product)
echo ""
echo "3/3 — Action shot (using phone)..."
uv run "$NANO_BANANA_SCRIPT" \
  --prompt "UGC creator photo. ${PROMPT}. Looking at smartphone screen with interested expression, holding phone naturally at chest level. Photorealistic, high quality, natural lighting. Casual lifestyle setting." \
  --filename "$OUTPUT_DIR/character-action.png" \
  --resolution 1K

echo ""
echo "✅ Character generated in $OUTPUT_DIR:"
ls -la "$OUTPUT_DIR/"
echo ""
echo "Use these as --reference images in generate-video.sh for character consistency."
