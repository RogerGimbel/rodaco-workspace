# Note Capture Guide (Internal — for Rodaco)

## When to Capture
- Roger says "note this", "brainstorm", "thinking out loud", "record this", "remember this idea"
- Roger is clearly ideating — stream of consciousness, "what if", exploring possibilities
- Roger shares an opinion, preference, or lesson learned worth preserving
- Roger dictates via Typeless (longer, conversational transcriptions)

## When NOT to Capture
- Direct task requests ("push this to GitHub") — that's a task, not a note
- Casual chat / jokes — unless there's a real insight buried in it
- Information Roger is giving me to act on immediately

## Capture Format
File: `notes/YYYY-MM-DD-HHMMSS-<short-slug>.md`

```markdown
# <Descriptive Title>

**Date:** YYYY-MM-DD HH:MM ET
**Tags:** #tag1 #tag2 #tag3
**Context:** <what triggered this — conversation topic, project, etc.>

## Raw Transcript
> Roger's exact words, preserved faithfully.
> Multiple paragraphs if needed.
> Don't clean up speech patterns — they carry meaning.

## Extracted Ideas
- Bullet point 1 — clear, actionable insight
- Bullet point 2 — connection or implication
- Bullet point 3 — question raised

## Connections
- Related: <path to relevant knowledge/notes file>
- Builds on: <link to earlier note if applicable>
- Action potential: <what could be done with this idea>
```

## After Capture
1. Confirm to Roger: brief summary of what was captured
2. Update `notes/INDEX.md` — add to Recent Notes and relevant theme section
3. Don't over-process — raw capture is more valuable than polished summaries

## Retrieval
- "What have I said about X?" → `memory_search` across notes/
- "Review my notes" → read INDEX.md, summarize recent
- "Any patterns?" → scan recent notes for recurring themes

## Synthesis (Heartbeat Task — every 3-5 days)
1. Review notes since last synthesis
2. Extract durable insights → MEMORY.md or knowledge/ entities
3. Spot patterns across notes
4. Surface connections Roger might not see
5. Update INDEX.md themes
6. Log synthesis in INDEX.md
