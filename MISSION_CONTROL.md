# MISSION_CONTROL.md — Active Implementation Plans

*Last updated: 2026-02-13*

---

## 1. `/save` Command — Memory Sweep + Git Commit
**Priority:** High | **Effort:** Small (1-2 hours) | **Source:** Community best practices review (Feb 12)

### What
A single command that: flushes memory to daily notes, updates MEMORY.md if needed, extracts facts to knowledge graph, then git commits + pushes the workspace.

### Steps
- [x] **1.1** Create skill at `skills/save/SKILL.md`
- [x] **1.2** Write `bin/save` script that:
  - Runs memory flush (summarize recent context → `memory/YYYY-MM-DD.md`)
  - Runs fact extraction (scan recent convo → update `knowledge/*/summary.md`)
  - Updates `MEMORY.md` with any durable lessons/preferences
  - `git add -A && git commit -m "save: <timestamp> - <brief summary>"` 
  - `git push` (if remote configured)
- [x] **1.3** Make it callable via `/save` or `save` in conversation
- [x] **1.4** Add optional summary argument: `/save "finished BeerPair B2B sprint"`
- [x] **1.5** Test: run it, verify commit appears (first commit: 9,734 files)
- [x] **1.6** Add to SOUL.md: "After major features/conversations, run /save"
- [x] **1.7** Document in TOOLS.md

### Notes
- Git remote needs to be configured first (Roger to set up private repo + auth)
- Should work even without remote (local commits still valuable)
- Keep commit messages descriptive but short

---

## 2. Video Generation Skill + API Expansion
**Priority:** Medium | **Effort:** Medium (3-5 hours) | **Source:** Community best practices review (Feb 12)

### What
Add video generation capability and expand our creative API toolkit. Research best options, build skills.

### Steps
- [x] **2.1** Research available video gen APIs:
  - Runway ML (Gen-3 Alpha)
  - Pika Labs
  - Kling AI
  - Luma Dream Machine
  - Minimax (Hailuo)
  - Evaluate: cost, quality, API availability, ease of integration
- [x] **2.2** Picked xAI Grok (primary) + Google Veo 3.1 (fallback) — already have API keys for both
- [x] **2.3** Already had API keys ($XAI_API_KEY, $GOOGLE_API_KEY)
- [x] **2.4** Built skill at `skills/video-gen/SKILL.md`:
  - Prompt → API call → poll for completion → download → send to chat
  - Support: text-to-video, image-to-video (if available)
  - Include prompt engineering tips in SKILL.md
- [x] **2.5** Script at `skills/video-gen/video-gen.sh` + `skills/grok-image/grok-image.sh`
- [x] **2.6** Tested: video 2.1MB MP4 ✅, image 336KB PNG ✅, sent to Roger via Telegram
- [x] **2.7** Documented in knowledge/tools/video-gen-research.md
- [ ] **2.8** Audit other API gaps — consider:
  - Music gen (Suno, Udio)
  - Voice cloning (ElevenLabs — already have TTS, expand?)
  - Document/PDF generation
  - Diagram generation (Mermaid → SVG?)

### Notes
- Video gen is slow (30s-5min) — needs status messages + async handling
- File sizes can be large — may need to compress before Telegram send
- Budget: discuss with Roger what monthly spend is acceptable

---

## 3. Grok Data Export to Knowledge Vault
**Priority:** Medium | **Effort:** Medium (2-4 hours) | **Source:** Community best practices review (Feb 12)

### What
Export Roger's Grok (xAI) conversation history and ingest it into our knowledge graph. Captures insights, decisions, and context from before Rodaco existed.

### Steps
- [ ] **3.1** Research Grok data export:
  - Check xAI account settings for data export feature
  - Check if there's an API endpoint for conversation history
  - If no official export: discuss manual copy-paste of key conversations
- [ ] **3.2** Roger to trigger export / provide data file
- [ ] **3.3** Build ingestion script `bin/ingest-grok-export`:
  - Parse export format (likely JSON or markdown)
  - Extract key topics: decisions, preferences, project context, people mentioned
  - Deduplicate against existing knowledge graph entries
- [ ] **3.4** Create `knowledge/imports/grok-history/` directory structure
- [ ] **3.5** Run extraction:
  - People mentioned → check/update `knowledge/people/`
  - Projects discussed → check/update `knowledge/projects/`
  - Preferences/opinions → update `MEMORY.md`
  - Technical decisions → relevant `knowledge/` entries
- [ ] **3.6** Generate summary: `knowledge/imports/grok-history/summary.md`
  - What was imported, key themes, date range covered
- [ ] **3.7** Update INDEX.md with any new entities
- [ ] **3.8** Also consider exporting from:
  - ChatGPT (OpenAI has data export)
  - Claude.ai conversations
  - Any other AI tools Roger has used extensively

### Notes
- Privacy: some conversations may be personal — Roger should review before bulk import
- Don't import everything — focus on durable facts, decisions, preferences
- This is a one-time task but the ingestion script could be reused for future exports

---

## 4. "Get to Know You" Cron — Deepening Understanding
**Priority:** High | **Effort:** Small (1-2 hours) | **Source:** Community best practices review (Feb 12)

### What
Scheduled cron job that periodically asks Roger thoughtful personal/professional questions. Answers get stored in the knowledge graph, building a progressively deeper model of who he is.

### Steps
- [x] **4.1** Designed 110 questions across 10 categories:
  - **Work style:** How do you prefer to receive bad news? When are you most productive? What makes you procrastinate?
  - **Values:** What's a hill you'd die on? What do you admire in other people? What's your biggest pet peeve?
  - **Preferences:** Morning or night? Music while working? How do you unwind?
  - **History:** What's a project you're most proud of? Biggest professional lesson? What led you to start Rodaco?
  - **Goals:** Where do you see Rodaco in 2 years? What skill do you wish you had? What would you do with unlimited time?
  - **Communication:** Do you prefer detailed updates or headlines? How much do you want me to push back? When should I stay quiet?
  - **Relationships:** How do you prefer to work with Dale vs Stuart? What should I know about your communication style with each?
  - **Meta:** What am I doing well? What annoys you about me? What do you wish I did differently?
- [x] **4.2** Stored at `knowledge/people/roger-gimbel/questions.json`:
  ```json
  {
    "questions": [
      {"id": 1, "category": "work_style", "text": "...", "asked": null, "answered": null},
      ...
    ]
  }
  ```
- [x] **4.3** Created 3 cron jobs:
  - Schedule: 2-3 times per week, random-ish times during waking hours (9 AM - 9 PM MT)
  - Pick unasked question from a random category
  - Send via Telegram: casual, not robotic — "Hey, random question for you: ..."
  - Mark question as asked with timestamp
- [x] **4.4** Built answer processing (`record-answer.sh`):
  - When Roger replies, extract the durable fact
  - Store in `knowledge/people/roger-gimbel/summary.md` under appropriate section
  - Update `MEMORY.md` if it's a major preference/value
  - Mark question as answered in questions.json
- [x] **4.5** "Never ask" rules in SKILL.md:
  - Don't ask during late night (11 PM - 8 AM MT)
  - Don't ask if Roger seems busy/stressed (recent messages indicate urgency)
  - Don't ask more than once per day
  - If Roger says "not now" or ignores, back off for a few days
- [x] **4.6** Create review mechanism:
  - Monthly: generate "What I've learned about Roger" summary
  - Identify gaps in understanding (categories with few answers)
  - Weight future questions toward gap areas
  - Script: `bin/monthly-review.sh`, output: `knowledge/people/roger-gimbel/reviews/`
  - Cron: 1st of each month at 2 PM MT
  - Gap categories auto-weighted 2x in questions.json
- [x] **4.7** Tested: ask.sh picks random question, record-answer.sh stores response
- [ ] **4.8** Consider extending to Dale and Stuart (lighter version, business-focused questions only)

### Notes
- The key is making it feel natural, not like a survey
- Questions should be conversation starters, not interrogations
- Over 6-12 months this becomes incredibly powerful context
- Roger can also volunteer info anytime — "remember that I hate X" still works

---

## Status
1. ✅ **`/save` command** — COMPLETE (Feb 12). Skill at `skills/save/`, script at `bin/save`
2. ✅ **Video gen skill** — COMPLETE (Feb 12). Skill at `skills/video-gen/`, research at `knowledge/tools/video-gen-research.md`. Needs Runway ML API key from Roger.
3. 🔴 **Grok data export** — BLOCKED on Roger providing data
4. ✅ **Get-to-know-you cron** — COMPLETE (Feb 12). 110 questions at `knowledge/people/roger-gimbel/questions.json`, cron jobs firing Mon/Wed/Fri

---

*Review this file during heartbeats. Pick up the next unchecked item when there's time.*
