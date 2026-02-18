#!/usr/bin/env bash
# Generate a creative brief + scene scripts from a product photo and brand description
# Uses Gemini Flash to analyze product and generate scene scripts
# Usage: creative-brief.sh --product photo.png --brand "Brand description" [--scenes 4] [--output brief.json]
set -euo pipefail

PRODUCT_IMAGE=""
BRAND=""
NUM_SCENES=4
OUTPUT="/tmp/ugc-brief-$(date +%s).json"
PLATFORM="TikTok and Instagram Reels"
BASE_URL="https://generativelanguage.googleapis.com/v1beta"
JQ="/home/node/workspace/jq"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --product) PRODUCT_IMAGE="$2"; shift 2 ;;
    --brand) BRAND="$2"; shift 2 ;;
    --scenes) NUM_SCENES="$2"; shift 2 ;;
    --output) OUTPUT="$2"; shift 2 ;;
    --platform) PLATFORM="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$BRAND" ]]; then
  echo "ERROR: --brand is required"
  exit 1
fi

if [[ -z "${GEMINI_API_KEY:-}" ]]; then
  echo "ERROR: GEMINI_API_KEY not set"
  exit 1
fi

echo "📋 Generating creative brief..."
echo "   Brand: $BRAND"
echo "   Product image: ${PRODUCT_IMAGE:-none}"
echo "   Scenes: $NUM_SCENES"
echo "   Platform: $PLATFORM"

# Use Python for proper JSON construction (avoids shell escaping hell)
python3 -c "
import json, sys, base64, urllib.request, os

brand = sys.argv[1]
num_scenes = int(sys.argv[2])
platform = sys.argv[3]
product_image = sys.argv[4] if len(sys.argv) > 4 else ''
output = sys.argv[5]
api_key = os.environ['GEMINI_API_KEY']

system_prompt = '''You are a UGC (User-Generated Content) creative director for social media advertising. You create viral, authentic-feeling content strategies.

Given a product/brand, generate a complete UGC campaign brief as valid JSON with this exact structure:
{
  \"brand\": \"brand name\",
  \"product_summary\": \"one-line product description\",
  \"target_audience\": \"who this is for\",
  \"character_description\": \"detailed physical description of the UGC creator character - age, gender, ethnicity, hair, clothing style, vibe. Be SPECIFIC so we can generate a consistent character with AI image generation.\",
  \"character_setting\": \"the world this character lives in\",
  \"campaign_hook\": \"the core emotional hook / story arc\",
  \"scenes\": [
    {
      \"scene_number\": 1,
      \"title\": \"short title\",
      \"setting\": \"where this takes place\",
      \"action\": \"what the character does\",
      \"dialogue\": \"what they say (if any) - keep it natural, not scripted\",
      \"camera\": \"camera angle and movement\",
      \"audio\": \"music/sound direction\",
      \"video_prompt\": \"the complete Veo 3.1 prompt for this scene - extremely detailed, cinematic, include full character appearance description for consistency\"
    }
  ],
  \"cta\": \"call to action for the final frame\",
  \"platform_notes\": \"platform-specific tips\"
}

Generate exactly ''' + str(num_scenes) + ''' scenes. Each scene should be 6-8 seconds of video content.
The scenes should tell a mini-story arc: hook -> problem -> discovery -> result.
Make it feel AUTHENTIC - like a real person made this, not a brand. No corporate speak.
The video_prompt field should be extremely detailed for Veo 3.1 - describe the character appearance in EVERY scene prompt for consistency.'''

user_text = f'Brand/Product: {brand}\n\nGenerate the creative brief. Platform: {platform}. Return ONLY valid JSON, no markdown.'

parts = []
if product_image and os.path.exists(product_image):
    with open(product_image, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode()
    mime = 'image/jpeg' if product_image.endswith(('.jpg','.jpeg')) else 'image/png'
    parts.append({'inlineData': {'mimeType': mime, 'data': b64}})
parts.append({'text': system_prompt + '\n\n' + user_text})

payload = json.dumps({
    'contents': [{'parts': parts}],
    'generationConfig': {
        'responseMimeType': 'application/json',
        'temperature': 0.8
    }
}).encode()

url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}'
req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read())
except urllib.error.HTTPError as e:
    print(f'ERROR: HTTP {e.code}', file=sys.stderr)
    print(e.read().decode(), file=sys.stderr)
    sys.exit(1)

text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
if not text:
    print('ERROR: No content in response', file=sys.stderr)
    print(json.dumps(result, indent=2), file=sys.stderr)
    sys.exit(1)

# Validate and pretty-print
try:
    brief = json.loads(text)
    with open(output, 'w') as f:
        json.dump(brief, f, indent=2)
    print(f'Brand: {brief.get(\"brand\", \"?\")}')
    print(f'Audience: {brief.get(\"target_audience\", \"?\")}')
    print(f'Hook: {brief.get(\"campaign_hook\", \"?\")}')
    print(f'Character: {brief.get(\"character_description\", \"?\")[:100]}...')
    print(f'Scenes: {len(brief.get(\"scenes\", []))}')
except json.JSONDecodeError:
    with open(output, 'w') as f:
        f.write(text)
    print('WARNING: Response was not valid JSON, saved raw', file=sys.stderr)
" "$BRAND" "$NUM_SCENES" "$PLATFORM" "${PRODUCT_IMAGE:-}" "$OUTPUT"

echo ""
echo "✅ Creative brief saved: $OUTPUT"
