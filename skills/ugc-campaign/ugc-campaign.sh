#!/usr/bin/env bash
# UGC Campaign Generator — Full Pipeline
# Generates a complete UGC video campaign from a product photo + brand description
#
# Pipeline: Creative Brief → Character Generation → Video Scenes → Stitch
#
# Usage: ugc-campaign.sh --brand "description" [--product photo.png] [--scenes 4] [--aspect 9:16] [--output /tmp/ugc]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PRODUCT_IMAGE=""
BRAND=""
NUM_SCENES=4
ASPECT="9:16"
OUTPUT_DIR="/tmp/ugc-campaign-$(date +%Y%m%d-%H%M%S)"
PLATFORM="TikTok and Instagram Reels"
SKIP_STITCH=false
CHARACTER_PROMPT=""
BRIEF_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --product) PRODUCT_IMAGE="$2"; shift 2 ;;
    --brand) BRAND="$2"; shift 2 ;;
    --scenes) NUM_SCENES="$2"; shift 2 ;;
    --aspect) ASPECT="$2"; shift 2 ;;
    --output) OUTPUT_DIR="$2"; shift 2 ;;
    --platform) PLATFORM="$2"; shift 2 ;;
    --skip-stitch) SKIP_STITCH=true; shift ;;
    --character) CHARACTER_PROMPT="$2"; shift 2 ;;
    --brief) BRIEF_FILE="$2"; shift 2 ;;
    --landscape) ASPECT="16:9"; shift ;;
    --portrait) ASPECT="9:16"; shift ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$BRAND" ]]; then
  echo "🎬 UGC Campaign Generator"
  echo ""
  echo "Usage: ugc-campaign.sh --brand \"description\" [options]"
  echo ""
  echo "Options:"
  echo "  --product FILE     Product photo (analyzed for creative direction)"
  echo "  --brand TEXT       Brand/product description (required)"
  echo "  --scenes N         Number of scenes (default: 4)"
  echo "  --aspect RATIO     Aspect ratio: 9:16 or 16:9 (default: 9:16)"
  echo "  --output DIR       Output directory"
  echo "  --platform TEXT    Target platform (default: TikTok and Instagram Reels)"
  echo "  --character TEXT   Override character description (skip auto-generation)"
  echo "  --brief FILE       Use existing brief JSON (skip brief generation)"
  echo "  --skip-stitch      Skip final video stitching"
  echo "  --portrait         Shorthand for --aspect 9:16"
  echo "  --landscape        Shorthand for --aspect 16:9"
  exit 0
fi

mkdir -p "$OUTPUT_DIR"/{characters,scenes,briefs}

JQ="/home/node/workspace/jq"

echo "╔══════════════════════════════════════════════╗"
echo "║   🎬 UGC Campaign Generator                 ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Brand:    $BRAND"
echo "Scenes:   $NUM_SCENES"
echo "Aspect:   $ASPECT"
echo "Platform: $PLATFORM"
echo "Output:   $OUTPUT_DIR"
echo ""

# ═══════════════════════════════════════════════
# STEP 1: Creative Brief
# ═══════════════════════════════════════════════
if [[ -n "$BRIEF_FILE" ]] && [[ -f "$BRIEF_FILE" ]]; then
  echo "━━━ Step 1: Using existing brief ━━━"
  cp "$BRIEF_FILE" "$OUTPUT_DIR/briefs/brief.json"
else
  echo "━━━ Step 1: Generating Creative Brief ━━━"
  BRIEF_ARGS=(--brand "$BRAND" --scenes "$NUM_SCENES" --output "$OUTPUT_DIR/briefs/brief.json" --platform "$PLATFORM")
  [[ -n "$PRODUCT_IMAGE" ]] && BRIEF_ARGS+=(--product "$PRODUCT_IMAGE")
  bash "$SCRIPT_DIR/creative-brief.sh" "${BRIEF_ARGS[@]}"
fi

BRIEF="$OUTPUT_DIR/briefs/brief.json"
echo ""

# ═══════════════════════════════════════════════
# STEP 2: Character Generation
# ═══════════════════════════════════════════════
echo "━━━ Step 2: Generating Character ━━━"
if [[ -n "$CHARACTER_PROMPT" ]]; then
  CHAR_DESC="$CHARACTER_PROMPT"
else
  CHAR_DESC=$(cat "$BRIEF" | $JQ -r '.character_description // "A friendly, relatable person in their 30s with a warm smile"')
fi

bash "$SCRIPT_DIR/generate-character.sh" \
  --prompt "$CHAR_DESC" \
  --output "$OUTPUT_DIR/characters"
echo ""

# ═══════════════════════════════════════════════
# STEP 3: Generate Video Scenes
# ═══════════════════════════════════════════════
echo "━━━ Step 3: Generating Video Scenes ━━━"

# Get scene count from brief
SCENE_COUNT=$(cat "$BRIEF" | $JQ -r '.scenes | length')
echo "Generating $SCENE_COUNT scenes..."
echo ""

for i in $(seq 0 $((SCENE_COUNT - 1))); do
  SCENE_NUM=$((i + 1))
  SCENE_TITLE=$(cat "$BRIEF" | $JQ -r ".scenes[$i].title // \"Scene $SCENE_NUM\"")
  VIDEO_PROMPT=$(cat "$BRIEF" | $JQ -r ".scenes[$i].video_prompt // .scenes[$i].action")

  echo "Scene $SCENE_NUM/$SCENE_COUNT: $SCENE_TITLE"

  # Build reference args — use character portrait + product image
  REF_ARGS=()
  [[ -f "$OUTPUT_DIR/characters/character-portrait.png" ]] && REF_ARGS+=(--reference "$OUTPUT_DIR/characters/character-portrait.png")
  [[ -n "$PRODUCT_IMAGE" ]] && [[ -f "$PRODUCT_IMAGE" ]] && REF_ARGS+=(--reference "$PRODUCT_IMAGE")

  bash "$SCRIPT_DIR/generate-video.sh" \
    --prompt "$VIDEO_PROMPT" \
    "${REF_ARGS[@]}" \
    --aspect "$ASPECT" \
    --output "$OUTPUT_DIR/scenes/scene-$(printf '%02d' $SCENE_NUM).mp4" || {
      echo "⚠️  Scene $SCENE_NUM failed, continuing..."
    }
  echo ""
done

# ═══════════════════════════════════════════════
# STEP 4: Stitch (optional)
# ═══════════════════════════════════════════════
if [[ "$SKIP_STITCH" != "true" ]]; then
  SCENE_FILES=($(ls "$OUTPUT_DIR"/scenes/scene-*.mp4 2>/dev/null))
  if [[ ${#SCENE_FILES[@]} -gt 1 ]]; then
    echo "━━━ Step 4: Stitching Final Video ━━━"
    bash "$SCRIPT_DIR/stitch-videos.sh" \
      --input "$OUTPUT_DIR/scenes" \
      --output "$OUTPUT_DIR/final-campaign.mp4" || {
        echo "⚠️  Stitching failed (ffmpeg may not be available). Individual scenes in $OUTPUT_DIR/scenes/"
      }
  else
    echo "━━━ Step 4: Skipping stitch (${#SCENE_FILES[@]} scenes) ━━━"
  fi
else
  echo "━━━ Step 4: Stitch skipped (--skip-stitch) ━━━"
fi

# ═══════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ✅ Campaign Complete!                      ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Output directory: $OUTPUT_DIR"
echo ""
echo "Files:"
echo "  📋 Brief:      $OUTPUT_DIR/briefs/brief.json"
echo "  🎨 Characters: $OUTPUT_DIR/characters/"
ls "$OUTPUT_DIR/characters/"*.png 2>/dev/null | while read f; do echo "     - $(basename $f)"; done
echo "  🎬 Scenes:"
ls "$OUTPUT_DIR/scenes/"*.mp4 2>/dev/null | while read f; do
  SIZE=$(stat -f%z "$f" 2>/dev/null || stat -c%s "$f" 2>/dev/null || echo "?")
  echo "     - $(basename $f) ($SIZE bytes)"
done
[[ -f "$OUTPUT_DIR/final-campaign.mp4" ]] && echo "  🎥 Final:      $OUTPUT_DIR/final-campaign.mp4"
echo ""
echo "Next steps:"
echo "  1. Review scenes in $OUTPUT_DIR/scenes/"
echo "  2. Add captions/music if needed"
echo "  3. Upload to TikTok/Reels/Meta Ads Manager"
