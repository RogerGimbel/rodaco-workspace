# BeerPair App Testing Guide

## Auth
- Email: rodaco@agentmail.to
- Password: stored in ~/.openclaw/credentials/beerpair.txt
- Credits: track remaining (started with 10 free)

## Entry Points
1. **Camera/Upload scan** — "choose photo" (upload a generated image)
2. **Text search** — search for a specific beer or food dish by name

## Preference Options (after scan/search)
- Non-alcoholic
- Craft beer
- Surprise me
Each generates **12 pairings**

## Per-Pairing Card Features
Each of the 12 pairing cards has:
1. **Brewery details** — look up the brewery
2. **Flavor radar graph** — shows flavor profiles for both the beer and the food
3. **Find Near Me** — Mapbox + Foursquare integration, finds locations likely to serve that beer

## Sharing
- **Share full list** — button at top shares all 12 pairings
- **Share individual** — via text, Instagram, other platforms
- **Shared links** include OG image → authenticated users land directly on the specific card or full list

## Saving / Activities
- **Favorite** individual pairings (heart/star)
- **Bookmark** the full set of 12
- **Access saved items** → click avatar → "Activities"

## History
- Every pairing generated is saved to scan/search page
- Click past entries to **regenerate with different preferences**

## Testing Strategy

### Image Generation for Tests
- Use Grok image gen or Nano Banana Pro
- Focus on **exotic/interesting** dishes: fusion cuisine, entrees, unusual combos
- **Avoid** generics: pizza, hamburgers, basic stuff
- Also test with beer images (craft beer bottles, tap handles, etc.)

### Test Paths to Rotate Through
1. **Happy path** — upload food image → select preference → review 12 pairings
2. **Preference variations** — same food, try all 3 preferences (non-alc, craft, surprise me)
3. **Text search** — search for a specific dish or beer by name
4. **Card deep dives** — brewery details, flavor graph, Find Near Me
5. **Sharing flow** — share full list, share individual pairing
6. **Save/favorite flow** — favorite cards, bookmark sets, check Activities page
7. **History/regeneration** — go back to scan history, regenerate with different prefs
8. **Edge cases** — blurry images, non-food images, obscure dishes, very specific beer names

### What to Log
- Pairing quality (relevant? interesting? accurate?)
- Any errors or unexpected behavior
- UX friction (confusing buttons, slow loads, unclear flows)
- Feature gaps or improvement ideas
- Credit usage tracking

---
*Created: 2026-02-13 from Roger's walkthrough*
