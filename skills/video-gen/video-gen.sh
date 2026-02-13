#!/usr/bin/env bash
# Video generation via xAI Grok
# Usage: video-gen.sh "<prompt>" [output_path] [--pro]
set -euo pipefail

PROMPT="${1:?Usage: video-gen.sh <prompt> [output_path] [--pro]}"
OUTPUT=""
MODEL="grok-imagine-video"

shift
for arg in "$@"; do
  case "$arg" in
    --pro) ;;
    *) OUTPUT="$arg" ;;
  esac
done

OUTPUT="${OUTPUT:-/tmp/video-$(date +%s).mp4}"

if [[ -z "${XAI_API_KEY:-}" ]]; then
  echo "ERROR: XAI_API_KEY not set"; exit 0
fi

json_build() { python3 -c "import json,sys; print(json.dumps({'model':sys.argv[1],'prompt':sys.argv[2],'n':1}))" "$1" "$2"; }

echo "Submitting video generation request..."
RESPONSE=$(curl -s -X POST "https://api.x.ai/v1/videos/generations" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(json_build "$MODEL" "$PROMPT")")

REQUEST_ID=$(echo "$RESPONSE" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('request_id',''))" 2>/dev/null || echo "")
if [[ -z "$REQUEST_ID" ]]; then
  echo "ERROR: No request_id returned"
  echo "$RESPONSE"
  exit 0
fi

echo "Request ID: $REQUEST_ID"
echo "Polling for completion (timeout 5 min)..."

ELAPSED=0
POLL_INTERVAL=10
TIMEOUT=300

while (( ELAPSED < TIMEOUT )); do
  sleep "$POLL_INTERVAL"
  ELAPSED=$((ELAPSED + POLL_INTERVAL))

  STATUS_RESP=$(curl -s -X GET "https://api.x.ai/v1/videos/${REQUEST_ID}" \
    -H "Authorization: Bearer $XAI_API_KEY")

  PARSED=$(echo "$STATUS_RESP" | python3 -c "
import json,sys
d=json.load(sys.stdin)
url=''
err=''
if 'video' in d and d['video']:
    url=d['video'].get('url','')
if 'error' in d and d['error']:
    err=str(d['error'])
print(f'{url}|{err}')
" 2>/dev/null || echo "|")

  VIDEO_URL="${PARSED%%|*}"
  ERROR="${PARSED#*|}"

  if [[ -n "$VIDEO_URL" ]]; then
    echo "Video ready! Downloading..."
    curl -s -o "$OUTPUT" "$VIDEO_URL"
    if [[ -f "$OUTPUT" && -s "$OUTPUT" ]]; then
      echo "SUCCESS: $OUTPUT"
      exit 0
    else
      echo "ERROR: Download failed"
      exit 0
    fi
  fi

  if [[ -n "$ERROR" ]]; then
    echo "ERROR: $ERROR"
    exit 0
  fi

  echo "  Still processing... (${ELAPSED}s elapsed)"
done

echo "ERROR: Timed out after ${TIMEOUT}s"
exit 0
