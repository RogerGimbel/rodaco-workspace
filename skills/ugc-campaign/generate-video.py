#!/usr/bin/env python3
"""Generate a video using Veo 3.1 with optional reference images for character consistency.

Usage:
  python3 generate-video.py --prompt "description" [--reference img.png] [--aspect 9:16] [--output file.mp4]
"""
import argparse
import os
import sys
import time

def main():
    parser = argparse.ArgumentParser(description="Generate video with Veo 3.1")
    parser.add_argument("--prompt", required=True, help="Video prompt")
    parser.add_argument("--reference", action="append", default=[], help="Reference image path (can repeat up to 3)")
    parser.add_argument("--aspect", default="9:16", help="Aspect ratio (9:16 or 16:9)")
    parser.add_argument("--output", default=f"/tmp/ugc-scene-{int(time.time())}.mp4", help="Output file")
    parser.add_argument("--model", default="veo-3.1-generate-preview", help="Model name")
    parser.add_argument("--timeout", type=int, default=300, help="Timeout in seconds")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY or GOOGLE_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("Installing google-genai...", file=sys.stderr)
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "google-genai"])
        from google import genai
        from google.genai import types

    client = genai.Client(api_key=api_key)

    print(f"🎬 Generating video with Veo 3.1...")
    print(f"   Prompt: {args.prompt[:80]}...")
    print(f"   Aspect: {args.aspect}")
    print(f"   References: {len(args.reference)}")
    print(f"   Output: {args.output}")

    # Build config
    config_kwargs = {"aspect_ratio": args.aspect}

    # Build reference images if provided
    if args.reference:
        ref_images = []
        for ref_path in args.reference:
            if not os.path.exists(ref_path):
                print(f"ERROR: Reference image not found: {ref_path}", file=sys.stderr)
                sys.exit(1)
            with open(ref_path, "rb") as f:
                image_bytes = f.read()
            mime = "image/jpeg" if ref_path.lower().endswith((".jpg", ".jpeg")) else "image/png"
            ref_image = types.VideoGenerationReferenceImage(
                image=types.Image(image_bytes=image_bytes, mime_type=mime),
                reference_type="asset"
            )
            ref_images.append(ref_image)
        config_kwargs["reference_images"] = ref_images

    config = types.GenerateVideosConfig(**config_kwargs)

    # Submit
    operation = client.models.generate_videos(
        model=args.model,
        prompt=args.prompt,
        config=config,
    )

    # Poll
    elapsed = 0
    poll_interval = 10
    while not operation.done:
        if elapsed >= args.timeout:
            print(f"ERROR: Timeout after {args.timeout}s", file=sys.stderr)
            sys.exit(1)
        time.sleep(poll_interval)
        elapsed += poll_interval
        print(f"   ... waiting ({elapsed}s elapsed)")
        operation = client.operations.get(operation)

    # Check for errors
    if not operation.response or not operation.response.generated_videos:
        print("ERROR: No videos in response", file=sys.stderr)
        print(f"Response: {operation.response}", file=sys.stderr)
        sys.exit(1)

    # Download
    video = operation.response.generated_videos[0]
    print("   Downloading video...")
    client.files.download(file=video.video)
    video.video.save(args.output)

    size = os.path.getsize(args.output)
    print(f"✅ Video saved: {args.output} ({size:,} bytes)")

if __name__ == "__main__":
    main()
