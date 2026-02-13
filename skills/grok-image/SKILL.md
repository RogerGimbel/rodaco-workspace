# Grok Image Generation Skill

## Provider
xAI Grok image models

## Models
- `grok-imagine-image` — fast, default
- `grok-imagine-image-pro` — higher quality (use `--pro`)
- `grok-2-image-1212` — also available

**Alternative:** Nano Banana (Gemini) still exists for different style.

## Triggers
- "grok image", "generate image with grok", "xai image"

## Usage
```bash
bash skills/grok-image/grok-image.sh "<prompt>" [output_path] [--pro]
```
- Default output: `/tmp/grok-image-TIMESTAMP.png`
- `--pro` uses `grok-imagine-image-pro`

## Prompt Tips
- Be specific about style, composition, lighting
- Works well with artistic and photorealistic styles
- Sync response (~10-15s)

## Environment
Requires `$XAI_API_KEY` in env.
