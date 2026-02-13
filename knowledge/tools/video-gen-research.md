# Video & Image Generation Research

## Status: CONFIRMED WORKING (Feb 2025)

### Primary: xAI Grok

**Image Generation (sync)**
- `POST https://api.x.ai/v1/images/generations`
- Models: `grok-imagine-image` (fast), `grok-imagine-image-pro` (quality), `grok-2-image-1212`
- Body: `{"model": "...", "prompt": "...", "n": 1}`
- Response: `{"data": [{"url": "https://imgen.x.ai/..."}]}`
- ~10-15s, returns image URL directly
- Auth: `Authorization: Bearer $XAI_API_KEY`

**Video Generation (async)**
- Submit: `POST https://api.x.ai/v1/videos/generations`
- Model: `grok-imagine-video`
- Body: `{"model": "grok-imagine-video", "prompt": "...", "n": 1}`
- Returns: `{"request_id": "..."}`
- Poll: `GET https://api.x.ai/v1/videos/{request_id}`
- Completed: `{"video": {"url": "https://vidgen.x.ai/...mp4", "duration": 8}}`
- Takes 30-120s typically
- Auth: `Authorization: Bearer $XAI_API_KEY`

### Fallback: Google Veo 3.1
- Available via Gemini API
- Not yet scripted
- Documented as alternative if xAI has issues

### Scripts
- Image: `skills/grok-image/grok-image.sh`
- Video: `skills/video-gen/video-gen.sh`
