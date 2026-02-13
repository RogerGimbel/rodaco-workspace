#!/usr/bin/env bash
# Image generation via xAI Grok
# Usage: grok-image.sh "<prompt>" [output_path] [--pro]
set -euo pipefail

PROMPT="${1:?Usage: grok-image.sh <prompt> [output_path] [--pro]}"
OUTPUT=""
MODEL="grok-imagine-image"

shift
for arg in "$@"; do
  case "$arg" in
    --pro) MODEL="grok-imagine-image-pro" ;;
    *) OUTPUT="$arg" ;;
  esac
done

OUTPUT="${OUTPUT:-/tmp/grok-image-$(date +%s).png}"

if [[ -z "${XAI_API_KEY:-}" ]]; then
  echo "ERROR: XAI_API_KEY not set"; exit 0
fi

json_build() { python3 -c "import json,sys; print(json.dumps({'model':sys.argv[1],'prompt':sys.argv[2],'n':1}))" "$1" "$2"; }
json_get() { python3 -c "import json,sys; d=json.load(sys.stdin); print(d$1 if d$1 else '')" 2>/dev/null; }

echo "Generating image with $MODEL..."
RESPONSE=$(curl -s -X POST "https://api.x.ai/v1/images/generations" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(json_build "$MODEL" "$PROMPT")")

IMAGE_URL=$(echo "$RESPONSE" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('data',[{}])[0].get('url',''))" 2>/dev/null || echo "")
if [[ -z "$IMAGE_URL" ]]; then
  echo "ERROR: No image URL returned"
  echo "$RESPONSE"
  exit 0
fi

curl -s -o "$OUTPUT" "$IMAGE_URL"
if [[ -f "$OUTPUT" && -s "$OUTPUT" ]]; then
  echo "SUCCESS: $OUTPUT"
else
  echo "ERROR: Download failed"
fi
exit 0
