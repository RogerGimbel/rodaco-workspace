# Image Generation Instructions

## IMPORTANT: YOU CAN GENERATE IMAGES

The nano-banana-pro skill IS installed and working.

## Two-Step Process

### Step 1: Generate the image

```bash
uv run /usr/local/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py --prompt "DETAILED DESCRIPTION" --filename "/home/node/workspace/IMAGE_NAME.png" --resolution 1K
```

### Step 2: Send the image to the user

After the image is generated, send it using:

```bash
openclaw message send --channel telegram --target CHAT_ID --media /home/node/workspace/IMAGE_NAME.png --message "Here's your image!"
```

**Note:** The CHAT_ID is the current conversation's chat ID. You can get it from the message context.

## Complete Example

User in Telegram asks: "Create an image of a beer snifter full of amber beer"

You run:
```bash
uv run /usr/local/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py --prompt "a beer snifter glass filled with golden amber beer, foam head, photorealistic, warm pub lighting" --filename "/home/node/workspace/beer-snifter.png" --resolution 1K
```

Then send it:
```bash
openclaw message send --channel telegram --target 1425151324 --media /home/node/workspace/beer-snifter.png --message "Here's your beer snifter!"
```

## Tips
- Use descriptive prompts
- Include style hints (photorealistic, illustration, etc.)
- Use unique filenames

## NEVER SAY:
- "I can't generate images"
- "nano-banana-pro isn't installed"
