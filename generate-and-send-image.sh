#!/bin/bash
# Usage: ./generate-and-send-image.sh "prompt" "filename" "chat_id"
# Example: ./generate-and-send-image.sh "a beer snifter" "beer.png" "1425151324"

PROMPT="$1"
FILENAME="$2"
CHAT_ID="$3"
FILEPATH="/home/node/workspace/$FILENAME"

# Generate the image
echo "Generating image..."
uv run /usr/local/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py --prompt "$PROMPT" --filename "$FILEPATH" --resolution 1K

# Check if generation succeeded
if [ -f "$FILEPATH" ]; then
    echo "Sending image to Telegram..."
    openclaw message send --channel telegram --target "$CHAT_ID" --media "$FILEPATH" --message "Here's your generated image!"
    echo "Done!"
else
    echo "Error: Image generation failed"
    exit 1
fi
