# /save — Memory Sweep + Git Commit

## What It Does
Flushes your current context to persistent memory files, extracts durable facts to the knowledge graph, and commits everything to git in one shot.

## When to Use
- After completing a major feature or task
- After important conversations with new decisions/preferences
- Before a restart or long idle period
- When the user says **"save"**, **"/save"**, or **"save \<summary\>"**
- Proactively during heartbeats if significant uncommitted work exists

## Invocation
| Trigger | Summary |
|---|---|
| `/save` | Auto-generated: `checkpoint: YYYY-MM-DD HH:MM` |
| `/save refactored auth flow` | Uses provided summary |
| `save` or `save it` | Same as `/save` |

## Steps

### 1. Flush Context to Daily Memory
- Open (or create) `memory/YYYY-MM-DD.md` for today
- Append a timestamped section summarizing what happened this session:
  - Decisions made, tasks completed, problems solved
  - Any user preferences or corrections discovered
- Keep entries concise — bullet points, not prose

### 2. Extract Durable Facts to Knowledge Graph
- Review the session for **new entities or significant updates** to existing ones
- For each, update or create `knowledge/<category>/<entity>/summary.md`
- Update `knowledge/INDEX.md` if new entries were added
- Skip this step if nothing knowledge-worthy happened

### 3. Update MEMORY.md (Long-Term Memory)
- If the session revealed **permanent lessons, preferences, or corrections**, add them to `MEMORY.md`
- Remove anything in MEMORY.md that's now outdated
- Skip if nothing long-term changed

### 4. Run the Save Script
```bash
bash /home/node/workspace/bin/save "<summary>"
```
This handles `git add -A`, commit, and push. It never fails.

### 5. Report Back
Tell the user what was saved:
- Files changed count (from script output)
- What was written to memory/knowledge (brief)
- The commit summary used
