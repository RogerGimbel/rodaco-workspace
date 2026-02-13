# Get to Know You — Skill

## What This Does
A gradual question system that learns about Roger over time. Asks casual, interesting questions 3x/week and stores answers in the knowledge graph.

## Question Selection Algorithm
1. Count how many questions have been asked per category
2. Find the least-asked categories (gaps)
3. Filter to unasked questions in those categories
4. Pick randomly from that filtered set
5. If all categories are equal, pick any random unasked question

## Answer Processing (Main Session)
When Roger replies to a question:
1. Run `bash skills/get-to-know-you/record-answer.sh <id> "<answer>"`
2. Extract key facts from the answer
3. Update `knowledge/people/roger-gimbel/summary.md` with new info
4. Update `MEMORY.md` if it's a significant preference or insight
5. Acknowledge naturally — don't make it feel like a form submission

## Rules
- **Max 1 question per day** — never double up
- **No late night** — don't ask between 10 PM and 8 AM Mountain Time
- **Back off if ignored** — if 2+ questions go unanswered, pause and mention it casually ("I noticed you've been busy, no pressure on those questions")
- **Never interrupt flow** — if Roger is in the middle of a technical discussion or problem, don't inject a question

## Manual Triggers
Roger can say:
- "ask me something" / "get to know me" / "ask me a question"
- This bypasses the schedule and picks the next question immediately

## File Locations
- Questions: `knowledge/people/roger-gimbel/questions.json`
- Ask script: `skills/get-to-know-you/ask.sh`
- Record script: `skills/get-to-know-you/record-answer.sh`
