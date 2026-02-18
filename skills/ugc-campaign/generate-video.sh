#!/usr/bin/env bash
# Generate a video using Veo 3.1 with optional reference images for character consistency
# Wrapper around generate-video.py (Python SDK required for reference image support)
# Usage: generate-video.sh --prompt "description" [--reference img.png] [--aspect 9:16] [--output file.mp4]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Pass all args through to Python script
exec uv run --with google-genai python3 "$SCRIPT_DIR/generate-video.py" "$@"
