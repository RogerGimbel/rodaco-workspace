# Chat History Unification Plan

**Goal:** Merge ALL of Roger's LLM chat histories into one searchable knowledge base at `knowledge/chat-history/`

## Status

| Source | Status | Conversations | Notes |
|--------|--------|---------------|-------|
| Grok | ✅ DONE | 246 | Parsed from xAI data dump |
| Claude | ✅ DONE | 10 | Parsed from `claude-conversations.json` |
| ChatGPT | ❌ SKIPPED | — | Export broken — never sends email |
| Gemini | ❌ SKIPPED | — | No export available (Google won't let you) |
| Perplexity | ❌ SKIPPED | — | Skipped by Roger |

**Current total:** 256 conversations in unified format

## Completed Steps

1. ✅ Parsed Grok history (246 convos) into categorized markdown
2. ✅ Parsed Claude data dump (10 convos, plus memories + projects)
3. ✅ Built unified parser (`parse-chat-history.py`) with source tags
4. ✅ Merged into `knowledge/chat-history/` with INDEX.md
5. ✅ Categories: technical, personal, rodaco, beerpair, research, ocean-one, media-posts, tasks

## Next Steps

### Step 1: ChatGPT Import
- [ ] Roger exports ChatGPT data (Settings → Data Controls → Export Data)
- [ ] Copy `conversations.json` to workspace as `chatgpt-conversations.json`
- [ ] Add ChatGPT parser to `parse-chat-history.py` (different JSON structure)
- [ ] Re-run parser to merge all sources
- [ ] Verify categories and dedup

### Step 2: Gemini Import
- [ ] Roger exports via Google Takeout (select "Gemini Apps" only)
- [ ] Copy to workspace as `gemini-conversations.json`
- [ ] Add Gemini parser (likely different format — may be HTML or JSON)
- [ ] Re-run parser to merge
- [ ] Verify

### Step 3: Perplexity Import
- [ ] Roger exports Perplexity data (Settings → Account → Export Data)
- [ ] Copy to workspace
- [ ] Add Perplexity parser
- [ ] Re-run parser to merge
- [ ] Verify

### Step 4: Dedup & Cross-Reference ✅
- [x] Flagged cross-platform topics (3 categories overlap: technical, beerpair, personal)
- [x] No real dedup needed — conversations are distinct
- [x] Cross-reference report generated

### Step 5: Final Polish ✅
- [x] Removed old `knowledge/grok-history/`
- [x] Updated `knowledge/INDEX.md` with chat-history section
- [x] Added wikilinks to all category files for Obsidian graph
- [x] Summary stats page: `STATS.md`

## File Locations

- **Parser script:** `parse-chat-history.py` (workspace root)
- **Output:** `knowledge/chat-history/` (category .md files + INDEX.md)
- **Raw data files:** workspace root (`claude-conversations.json`, `chatgpt-conversations.json`, etc.)
- **This plan:** `knowledge/chat-history/PLAN.md`

## Data Export Instructions (for Roger)

**ChatGPT:** Settings → Data Controls → Export Data → wait for email → download zip → extract `conversations.json`

**Gemini:** takeout.google.com → Deselect all → Select "Gemini Apps" → Export → download → look for JSON/HTML files

**Perplexity:** Settings → Account → Export Data → download

---
*Last updated: 2026-02-12*
