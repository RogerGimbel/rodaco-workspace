# Video Generation Skill

## Provider
**Primary:** xAI Grok (`grok-imagine-video`)
**Fallback:** Google Veo 3.1 via Gemini API (not yet scripted)

## Triggers
- "generate video", "make a video", "video of...", "create a video"

## Usage
```bash
bash skills/video-gen/video-gen.sh "<prompt>" [output_path] [--pro]
```
- Default output: `/tmp/video-TIMESTAMP.mp4`
- `--pro` flag reserved for future pro model

## Workflow
1. Submit prompt to xAI `/v1/videos/generations`
2. Get `request_id` back (async)
3. Poll `/v1/videos/{request_id}` every 10s (timeout 5 min)
4. Download MP4 from returned URL
5. Deliver file to user

## Prompt Tips
- Be descriptive: camera angles, lighting, motion
- Specify style: "cinematic", "slow motion", "timelapse"
- Keep prompts concise but vivid
- Duration is ~8s, plan accordingly

## Cost
Video generation is expensive. Don't run speculatively. Confirm prompt with user first.

## Environment
Requires `$XAI_API_KEY` in env.
