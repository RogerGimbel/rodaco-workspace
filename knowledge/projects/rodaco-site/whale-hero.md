# Rodaco Whale Hero — Implementation Notes

**Status:** Mostly complete (may revisit particle scatter)
**Date:** 2026-02-18
**Commits:** bf5e70a → 4c07bd4

## What We Built
- AI-generated whale breach video via Veo 3.1 (`public/videos/whale-breach-v2.mp4`, 7.2MB)
- Scroll-reactive hero with whale video as dominant background (80% opacity, saturated blues)
- 120 glowing particles with connection lines overlay the whale
- Auto-breach at 3s + scroll trigger intended to scatter particles outward
- RODACO text stays whole (never splits — ROger DAle COmpany)
- Blue/purple ocean color theme via `saturate(1.4)` + blue color overlay with `mix-blend-mode: color`
- Scroll hint "Scroll to breach" at bottom

## Key Decisions
- No `hue-rotate` on video — it killed the natural ocean blues, made everything gray
- RODACO name must never be split — Dale loves the whale, both founders love the brand unity
- Particles scatter on breach, not the text — brand is unbreakable, environment reacts
- Video at high opacity from the start — no "hidden reveal" approach, whale IS the hero

## Known Issues
- Particle scatter animation not visually dramatic enough — may need revisiting
- First Veo 3.1 render (dark prompt) produced blank 161KB file — simple natural prompts work better
- Browser agent was down during development, had to use M5 MacBook remote screenshots

## Video Generation
- Tool: `skills/ugc-campaign/generate-video.sh` (Veo 3.1)
- Working prompt: "A humpback whale breaching out of the ocean in slow motion, viewed from the side. Deep blue ocean water splashing dramatically as the whale rises. Bright natural lighting, clear visibility, cinematic quality."
- Dark/stylized prompts produce empty output — keep it natural, use CSS for color grading

## Files
- `src/components/HeroSection.tsx` — 5-layer compositing hero
- `public/videos/whale-breach-v2.mp4` — the good video (7.2MB)
- `public/videos/rodaco-animate.mp4` — original from July 2025 (orphaned, 3.5MB)
