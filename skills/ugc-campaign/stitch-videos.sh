#!/usr/bin/env bash
# Stitch multiple video clips into a single campaign video
# Runs ffmpeg on M5 MacBook via SSH (container doesn't have ffmpeg)
# Usage: stitch-videos.sh --input /tmp/ugc-campaign --output /tmp/final-campaign.mp4 [--captions captions.srt]
set -euo pipefail

INPUT_DIR=""
OUTPUT="/tmp/ugc-final-$(date +%s).mp4"
CAPTIONS=""
M5_HOST="rogergimbel@100.71.128.20"
TRANSITION="fade"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --input) INPUT_DIR="$2"; shift 2 ;;
    --output) OUTPUT="$2"; shift 2 ;;
    --captions) CAPTIONS="$2"; shift 2 ;;
    --transition) TRANSITION="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$INPUT_DIR" ]]; then
  echo "ERROR: --input directory required (directory containing scene-*.mp4 files)"
  exit 1
fi

# Find all scene videos, sorted
VIDEOS=($(ls "$INPUT_DIR"/scene-*.mp4 2>/dev/null | sort))
if [[ ${#VIDEOS[@]} -eq 0 ]]; then
  echo "ERROR: No scene-*.mp4 files found in $INPUT_DIR"
  exit 1
fi

echo "🎬 Stitching ${#VIDEOS[@]} video scenes..."
echo "   Input: $INPUT_DIR"
echo "   Output: $OUTPUT"

# Create a temporary directory on M5 for processing
REMOTE_DIR="/tmp/ugc-stitch-$$"
ssh "$M5_HOST" "mkdir -p $REMOTE_DIR"

# Copy videos to M5
for v in "${VIDEOS[@]}"; do
  echo "   Uploading $(basename $v)..."
  scp -q "$v" "$M5_HOST:$REMOTE_DIR/"
done

# Copy captions if provided
if [[ -n "$CAPTIONS" ]] && [[ -f "$CAPTIONS" ]]; then
  scp -q "$CAPTIONS" "$M5_HOST:$REMOTE_DIR/captions.srt"
fi

# Build ffmpeg concat file on M5
ssh "$M5_HOST" "cd $REMOTE_DIR && ls scene-*.mp4 | sort | while read f; do echo \"file '\$f'\"; done > concat.txt"

# Run ffmpeg on M5
echo "   Running ffmpeg on M5 MacBook..."
if [[ -n "$CAPTIONS" ]] && [[ -f "$CAPTIONS" ]]; then
  ssh "$M5_HOST" "cd $REMOTE_DIR && /opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i concat.txt -vf subtitles=captions.srt -c:v libx264 -c:a aac -shortest final.mp4 2>/dev/null"
else
  ssh "$M5_HOST" "cd $REMOTE_DIR && /opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i concat.txt -c copy final.mp4 2>/dev/null"
fi

# Copy result back
echo "   Downloading stitched video..."
scp -q "$M5_HOST:$REMOTE_DIR/final.mp4" "$OUTPUT"

# Cleanup remote
ssh "$M5_HOST" "rm -rf $REMOTE_DIR"

SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT" 2>/dev/null || echo "?")
echo "✅ Final video: $OUTPUT ($SIZE bytes)"
echo "   Scenes: ${#VIDEOS[@]}"
