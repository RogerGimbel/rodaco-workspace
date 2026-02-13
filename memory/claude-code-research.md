# Claude Code Research

## Research Log

### 2026-02-01 - Initial Research (Overnight Build)

**Note:** Web search available via Grok 4.1 (/model grok). Research based on training knowledge and documented sources.

---

## MCP (Model Context Protocol) Servers

MCP is Anthropic's protocol for connecting Claude to external tools and data sources. Key servers to investigate:

### High Priority for Roger's Workflow

1. **filesystem** - Already using via OpenClaw, but native MCP version offers tighter integration
2. **github** - Direct GitHub integration for PRs, issues, code review
3. **postgres/sqlite** - Database access for Supabase projects
4. **google-drive** - File access for shared documents
5. **slack** - Team communication (if Rodaco uses Slack)
6. **brave-search** - Web search capability (we need this!)

### Worth Investigating

- **memory** - Persistent memory across conversations (OpenClaw handles this differently)
- **puppeteer** - Browser automation (we have agent-browser)
- **sequential-thinking** - Enhanced reasoning for complex tasks
- **fetch** - HTTP requests (we have web_fetch)

### MCP Resources

- Official list: https://github.com/modelcontextprotocol/servers
- Anthropic docs: https://docs.anthropic.com/en/docs/build-with-claude/mcp

---

## OpenClaw Skills to Install

### Already Installed
- weather
- gog (Google Workspace)
- bird (X/Twitter)
- openai-whisper-api
- marketing-skills (23 skills)
- skill-creator

### Potential Additions

1. **Linear** - If Rodaco uses Linear for project management
2. **Notion** - Documentation and wikis
3. **Stripe** - Payment monitoring for SaaS products
4. **Vercel** - Deployment management (we use Vercel for hosting)

---

## Productivity Patterns

### From OpenClaw Best Practices

1. **Memory-first approach** - Always check memory before starting tasks
2. **Spawn for complexity** - Use sub-agents for tasks >10 min
3. **Checkpoint often** - Context dies on restart, files don't
4. **Batch heartbeat checks** - Don't create too many cron jobs

### To Investigate Further

- How other agents structure their knowledge graphs
- Best practices for agent-to-agent communication
- Patterns for handling email/calendar workflows

---

## Action Items

- [x] Web search solved via Grok 4.1 (no Brave needed)
- [ ] Research github MCP server for code review workflow
- [ ] Look into Vercel MCP for deployment automation
- [ ] Test sequential-thinking MCP for complex reasoning tasks

---

### 2026-02-03 - MCP Server Deep Dive (Overnight Build)

**Focus: Practical MCP Servers for Roger's Stack**

Since web search is unavailable, documenting from training knowledge:

#### Tier 1: High-Impact for Rodaco Workflow

**1. @modelcontextprotocol/server-github**
- Enables: Create/list/search issues, create PRs, manage repos
- Why useful: Roger works with GitHub constantly - could review PRs, create issues, check repo status directly
- Setup: Requires GitHub Personal Access Token
- Priority: HIGH

**2. @modelcontextprotocol/server-postgres**  
- Enables: Read/query PostgreSQL databases
- Why useful: Supabase uses PostgreSQL - could query BeerPair data directly
- Setup: Database connection string
- Priority: HIGH (pairs with Supabase stack)

**3. @modelcontextprotocol/server-brave-search**
- Enables: Web search within Claude conversations
- Why useful: Would fix our web search gap
- Setup: Brave Search API key
- Priority: HIGH (we need this!)
- Note: Alternative to configuring Brave in OpenClaw directly

#### Tier 2: Nice to Have

**4. @modelcontextprotocol/server-google-drive**
- Enables: Search/read Google Drive files
- Why useful: Access shared documents without manual copy-paste
- Setup: Google OAuth credentials

**5. @modelcontextprotocol/server-slack**
- Enables: Channel access, message history, posting
- Why useful: If Rodaco uses Slack for team chat
- Setup: Slack Bot Token

**6. @modelcontextprotocol/server-notion**
- Enables: Search/read/create Notion pages
- Why useful: Documentation, wikis, knowledge bases
- Setup: Notion API key

#### Tier 3: Specialized

**7. @modelcontextprotocol/server-puppeteer**
- We already have agent-browser - likely redundant

**8. @modelcontextprotocol/server-memory**
- OpenClaw has its own memory system - may conflict

#### OpenClaw vs MCP

OpenClaw already provides many capabilities that MCP servers offer:
- File system access ✓
- Shell execution ✓
- Web fetching (basic) ✓
- Browser automation (agent-browser) ✓

MCP would add:
- Direct API integrations (GitHub, DBs)
- Web search (if configured)
- Third-party service access

**Recommendation for Roger:**
1. Priority 1: ✅ Web search solved via Grok 4.1 - no Brave needed
2. Priority 2: GitHub MCP server for code review workflows
3. Priority 3: Postgres MCP for direct Supabase queries

---

## Emerging Patterns in AI Assistants (From Training Knowledge)

### 1. Context Window Management
- Chunking long documents into digestible pieces
- Using embeddings for semantic search before full retrieval
- "Just-in-time" context loading rather than upfront

### 2. Multi-Agent Patterns
- Orchestrator + specialist agents
- Handoff protocols between agents
- Shared memory/context passing

### 3. Tool Composition
- Chaining tools for complex workflows
- Error recovery and retry logic
- Graceful degradation when tools fail

### 4. Memory Architecture
- Short-term (conversation)
- Working (current task)
- Long-term (persistent storage like MEMORY.md)
- Episodic (event logs like daily notes)

OpenClaw already implements most of these patterns well!

---

*Last updated: 2026-02-03 05:30 ET*

---

### 2026-02-04 - OpenClaw Skills Deep Dive (Overnight Build)

**Focus: Discovering Built-in OpenClaw Skills We're Not Using**

OpenClaw ships with 54 skills! Many aren't installed but are available. Key findings:

#### High-Priority Skills to Install

**1. github (needs `gh` CLI)**
- Use `gh pr`, `gh issue`, `gh run` for GitHub workflows
- Would enable PR reviews, issue management, CI monitoring
- Install: `brew install gh` or `apt install gh`
- Priority: HIGH - Roger works with GitHub constantly

**2. mcporter (needs `mcporter` CLI)**
- Direct access to MCP servers without config changes
- Can call tools: `mcporter call linear.list_issues team=ENG`
- Supports OAuth, config management, codegen
- Install: `npm i -g mcporter`
- Priority: HIGH - bridges MCP ecosystem

**3. clawhub (needs `clawhub` CLI)**  
- Skill marketplace for OpenClaw
- Search: `clawhub search "postgres"` 
- Install skills on the fly: `clawhub install my-skill`
- Install: `npm i -g clawhub`
- Priority: MEDIUM - useful for discovering new capabilities

**4. coding-agent (needs codex/claude/opencode/pi)**
- Orchestrate other coding agents from OpenClaw
- Background mode with PTY for long tasks
- Parallel PR reviews, batch issue fixing
- Already documented patterns for git worktrees
- Priority: MEDIUM - useful for complex coding tasks

#### Already Installed & Working
- agent-browser 0.8.6 ✅
- bird (X/Twitter) ✅
- weather ✅
- gog (Google Workspace) ✅
- marketing-skills (34 skills) ✅

#### Available But Not Needed Yet
- 1password - secrets management (if Roger uses 1Password)
- notion - if using Notion for docs
- slack - if Rodaco uses Slack
- trello - if using Trello boards
- obsidian - if using Obsidian for notes
- Home automation: openhue, sonoscli, camsnap

#### Key Pattern: PTY for Interactive CLIs

When running coding agents or interactive tools, ALWAYS use `pty:true`:
```bash
exec pty:true command:"codex exec 'Your prompt'"
```

Without PTY, interactive CLIs break or hang.

#### Recommendations for Roger

1. **Install gh CLI** - enables GitHub skill for PR/issue workflows
2. **Install mcporter** - direct MCP server access without config changes  
3. **Consider clawhub** - skill discovery and management

---

*Last updated: 2026-02-04 02:30 ET*

---

### 2026-02-05 - OpenClaw 2026.2.2 Changelog & healthcheck Skill (Overnight Build)

**Focus: What's new in OpenClaw and clarifying the healthcheck skill**

#### OpenClaw 2026.2.2 New Features

1. **Feishu/Lark plugin** - Chinese enterprise messaging support
2. **Web UI Agents dashboard** - Manage agent files, tools, skills, models, channels, cron jobs
3. **QMD memory backend** - Opt-in improved semantic search (we're already using this!)
4. **healthcheck skill** - Security hardening and risk configuration
5. **Subagent thinking level** - `agents.defaults.subagents.thinking` config option

#### Security Improvements in 2026.2.2

- SSRF guardrails on remote media fetches (block private/localhost, DNS pinning)
- TLS 1.3 minimum requirement for TLS listeners
- Matrix allowlist hardening (require full MXIDs)
- Slack access-group gating for slash commands
- Skill installer SSRF checks
- Windows exec allowlist hardening

#### healthcheck Skill Clarification

**Important:** The name is misleading! This is NOT for system health monitoring.

**What it actually does:**
- Security audits for host machines running OpenClaw
- Runs `openclaw security audit --deep`
- Checks: firewall, SSH, disk encryption, OS updates, backup status
- Recommends security hardening based on risk tolerance
- Requires state-of-the-art model (Opus 4.5, GPT 5.2+)

**When to use:**
- Hardening Roger's Intel MacBook server
- Hardening the Raspberry Pi
- After fresh installs or significant config changes
- Periodic security reviews

**Not for:** Container health checks, uptime monitoring, service availability

#### Skill Count Update

55 skills now available in OpenClaw:
- Many we're not using: apple-notes, bear-notes, notion, obsidian, 1password
- Home automation: camsnap, goplaces, local-places
- Specialized: blogwatcher, food-order, gifgrep, himalaya (email CLI)

#### Interesting Skill: himalaya

`himalaya` skill provides CLI email access (IMAP/SMTP) without browser or OAuth.
Could be useful if we want CLI-based email instead of `gog` (Google Workspace).

#### Action Items

- [ ] Consider running `openclaw security audit --deep` on MacBook
- [ ] Consider himalaya skill for lightweight email access
- [ ] Explore Web UI Agents dashboard when available

---

*Last updated: 2026-02-05 02:10 ET*

---

### 2026-02-06 - Workflow Automation Tools (Overnight Build)

**Focus: Lobster, OpenProse, and deterministic workflows**

#### Lobster: Deterministic Workflow Runtime

Lobster is OpenClaw's workflow shell for multi-step tool sequences. Key insight: moves orchestration from LLM (expensive, non-deterministic) to a typed runtime.

**What it solves:**
- One call instead of many (reduces token costs)
- Built-in approval checkpoints for side effects
- Resumable workflows with tokens (pause → approve → resume)
- JSON piping between CLI tools

**Install:** `npm i -g lobster`
**Enable:** `tools.alsoAllow: ["lobster"]`

**Example: Email triage**
```json
{
  "action": "run",
  "pipeline": "email.triage --limit 20",
  "timeoutMs": 30000
}
```

Returns JSON envelope with `status`, `output`, and optional `requiresApproval.resumeToken`.

**Workflow files (.lobster):**
```yaml
name: inbox-triage
steps:
  - id: collect
    command: inbox list --json
  - id: approve
    command: inbox apply --approve
    stdin: $collect.stdout
    approval: required
```

**Priority: HIGH** - This would massively improve Roger's automation workflows

#### OpenProse: Multi-Agent Orchestration

Markdown-first workflow format for orchestrating AI sessions.

**What it does:**
- Spawn multiple sub-agents with explicit control flow
- Parallel execution (research + synthesis patterns)
- Reusable `.prose` programs

**Enable:** `openclaw plugins enable open-prose`
**Command:** `/prose run file.prose`

**Example:**
```prose
parallel:
  findings = session: researcher
    prompt: "Research {topic}."
  draft = session: writer
    prompt: "Summarize {topic}."

session "Merge the findings + draft into a final answer."
context: { findings, draft }
```

**Priority: MEDIUM** - Good for complex research tasks

#### llm-task Plugin: Structured LLM Output

JSON-only LLM tasks with schema validation.

**Use case:** Add an LLM step to Lobster workflows without custom code.

**Enable:**
```json
{
  "plugins": {
    "entries": {
      "llm-task": { "enabled": true }
    }
  }
}
```

**Example in Lobster:**
```lobster
openclaw.invoke --tool llm-task --action json --args-json '{
  "prompt": "Classify this email intent",
  "input": { "subject": "Hello", "body": "Can you help?" },
  "schema": {
    "type": "object",
    "properties": {
      "intent": { "type": "string" }
    }
  }
}'
```

**Priority: MEDIUM** - Useful for classification/drafting workflows

#### ClawHub: Public Skill Registry

Not just a marketplace - also a backup/sync system for skills.

**Install:** `npm i -g clawhub`
**Site:** clawhub.ai

**Key commands:**
- `clawhub search "postgres"` - Find skills
- `clawhub install my-skill` - Install a skill
- `clawhub sync --all` - Backup all local skills to registry

**Priority: MEDIUM** - Useful for discovering community skills

#### Tools Not Installed on Gateway

| Tool | Install Command | Status |
|------|-----------------|--------|
| Lobster | `npm i -g lobster` | Not installed |
| ClawHub | `npm i -g clawhub` | Not installed |
| OpenProse | `openclaw plugins enable open-prose` | Plugin available |

#### Recommended Next Steps

1. **Ask Roger about Lobster** - If he does email triage, code review, or approval-based workflows, this would help
2. **Install ClawHub** - For skill discovery and backup
3. **Enable OpenProse** - If complex multi-agent research is needed

---

*Last updated: 2026-02-06 02:25 ET*

---

### 2026-02-08 - OpenClaw 2026.2.6 Changelog Analysis (Overnight Build)

**Focus: What's new since 2026.2.2 and how we're using it**

#### Current Version Status

| Component | Installed | Latest | Notes |
|-----------|-----------|--------|-------|
| OpenClaw | 2026.2.6 | 2026.2.6-3 | Minor patch available (daemon restart fix) |
| Memory | QMD backend | - | 20 files, 155 chunks indexed |
| Model | claude-opus-4-6 | - | Using latest Opus |

#### New in 2026.2.6 (What We Gained)

1. **Anthropic Opus 4.6 support** ✅ Using
   - Forward-compat fallbacks for model IDs
   - Updated pi-mono to 0.52.7

2. **xAI Grok provider** ✅ Using
   - Native support via `xai/grok-4-1-fast-*`
   - We use grok for web/X search

3. **Web UI token usage dashboard**
   - Shows token consumption across sessions
   - Access via http://127.0.0.1:18789/

4. **Native Voyage AI support**
   - Alternative to OpenAI embeddings for memory
   - May offer better semantic search quality

5. **sessions_history capping**
   - Prevents context overflow from long histories
   - Important for overnight builds that spawn subagents

#### 2026.2.3 Features (Reference)

- Cron announce delivery mode (we should use this)
- Per-channel responsePrefix overrides
- Telegram DM topic threadId injection
- One-shot cron job auto-delete after success

#### Security Improvements Across Recent Releases

| Version | Security Feature |
|---------|------------------|
| 2026.2.6 | Canvas/A2UI auth required |
| 2026.2.3 | Untrusted metadata blocked from system prompts |
| 2026.2.2 | SSRF guardrails, TLS 1.3 minimum, skill scanner |

#### Agent Patterns from Changelog

**1. Subagent Best Practice (2026.2.3)**
```
Subagents should use announce delivery mode
instead of direct messaging tool calls.
Avoids duplicate deliveries when summarizing.
```

**2. Cron Job Lifecycle**
```
One-shot jobs now auto-delete after success.
Use --keep-after-run if you need the job definition preserved.
```

**3. Context Overflow Prevention**
```
sessions_history payloads now capped.
Long-running sessions won't blow context limits.
```

#### Recommendations

1. **Apply minor update:** `openclaw update` → 2026.2.6-3
   - Fixes daemon restart after npm update
   - Safe to run anytime

2. **Consider Voyage AI:** If semantic search needs improvement
   - Configure in memory section of config

3. **Use announce delivery:** For cron jobs that report to Telegram
   - Cleaner than direct messaging from subagents

---

*Last updated: 2026-02-08 02:30 ET*

---

### 2026-02-09 - Context Management & Memory Patterns (Overnight Build)

**Focus: Advanced context management strategies for long-running sessions**

#### Session Checkpoint Patterns

Long-running sessions (like overnight builds) benefit from explicit checkpointing:

**1. Pre-Task Context Dump**
Before starting complex work, write current context to memory file:
```
Current focus: X
Dependencies: Y, Z
Blockers: None
```
If session crashes, next wake can resume from file.

**2. Incremental Progress Logging**
Don't wait until end to log. Write progress as you go:
```markdown
## Task: Media Stack Health Check
- [x] Container status check - all healthy
- [x] VPN verification - working
- [ ] Disk space check - in progress
```

**3. Context Pruning for Large Codebases**
When working with big repos:
- Load only relevant files (grep first, read second)
- Use `head -n 50` for initial file inspection
- Keep file contents out of working memory when possible

#### Memory File Organization

**Current Structure (Working Well):**
```
memory/
├── YYYY-MM-DD.md        # Daily raw logs
├── claude-code-research.md  # Research findings
├── heartbeat-state.json # Polling timestamps
└── (future) weekly-synthesis.md
```

**Best Practice: Three Layers**
1. **Daily logs** - Everything that happened
2. **Topic files** - Curated by subject (research, projects, people)
3. **MEMORY.md** - Synthesis of lessons/preferences

#### Tool Output Caching

Reduce redundant API/tool calls:
- Store results in memory file if likely to be reused
- Reference previous results: "Per earlier check, VPN is working"
- Don't re-fetch what hasn't changed

**Example: Heartbeat State**
```json
{
  "lastMediaCheck": 1739088000,
  "lastEmailCheck": 1739084400,
  "containerStatus": {
    "timestamp": 1739088000,
    "allHealthy": true
  }
}
```

#### Context Overflow Prevention

Signs of context getting full:
- Repeated tool calls for same info
- Forgetting earlier parts of conversation
- Degraded response quality

**Mitigation:**
1. Checkpoint to file immediately
2. Summarize conversation so far
3. Spawn subagent for complex subtasks

#### OpenClaw-Specific Patterns

**Sessions vs Subagents:**
- `sessions_send` - Inject message into existing session
- `sessions_spawn` - Create new isolated session for task

**When to spawn:**
- Task takes >10 minutes
- Task is independent (doesn't need conversation context)
- You want cleaner context isolation

**When to send:**
- Quick follow-up to existing work
- Need shared context from prior conversation

#### Research Note: Web Search Gap

Web search requires Brave API key (BRAVE_API_KEY).
**Workaround:** Use Grok model for web-aware queries:
- `/model grok` in Telegram
- Grok has real-time web/X search built in

This is more effective than Brave for current events anyway.

---

*Last updated: 2026-02-09 02:30 ET*

---

### 2026-02-11 - Subagent Patterns & OpenClaw 2026.2.9 (Overnight Build)

**Focus: When and how to use subagents effectively**

#### OpenClaw Version Update

Upgraded from 2026.2.6 → 2026.2.9 since last research.

#### sessions_spawn vs sessions_send

| Method | Use When | Context |
|--------|----------|---------|
| `sessions_spawn` | Task is independent, >10 min | Fresh context, isolated |
| `sessions_send` | Need prior conversation context | Shares session history |

**sessions_spawn Best Practices:**

1. **Set appropriate timeouts**
   - Default `runTimeoutSeconds: 180` may be too short for research
   - Overnight builds should use 600-900s
   
2. **Use for batch operations**
   - Parallel web research
   - Bulk file processing
   - Long API calls

3. **Results auto-announce**
   - No need to manually message back
   - Use `announce` delivery mode in cron for same behavior

4. **Clean isolation**
   - Subagent doesn't see your conversation history
   - Good for privacy-sensitive tasks

#### Cron Job Patterns

**Schedule Kinds:**
- `at`: One-shot at specific time (ISO timestamp)
- `every`: Recurring interval (everyMs + optional anchorMs)
- `cron`: Standard cron expression with optional timezone

**Lifecycle:**
- One-shot jobs auto-delete after success
- Use `--keep-after-run` if you need the definition preserved
- Failed jobs remain for retry/debugging

**Delivery Modes:**
- `none`: Silent execution
- `announce`: Summarize result to channel (recommended for isolated jobs)

**Best Practice:** Batch periodic checks in HEARTBEAT.md rather than creating many cron jobs. Reduces overhead and allows intelligent batching.

#### Context Overflow in Long Sessions

Signs:
- Tool calls repeating for same info
- Forgetting earlier conversation
- Response quality degrading

Prevention:
1. Checkpoint to memory files early and often
2. Summarize conversation when context gets heavy
3. Spawn subagents for independent subtasks
4. Use `sessions_history(limit=N)` to cap pulled history

#### Git Config Tracking Note

Large config directories (jellyfin, tdarr, etc.) take long to git add over SSH. Better approach:
1. Track critical files (.yml, .json configs)
2. Ignore data directories, caches, logs
3. Commit incrementally rather than all at once

---

*Last updated: 2026-02-11 02:30 ET*

---

### 2026-02-12 - Implementation Priority Matrix (Overnight Build)

**Focus: Moving from research to action**

After weeks of research, consolidating into actionable priorities:

#### Tier 1: Ready to Enable (No Setup Needed)

| Capability | Status | Notes |
|------------|--------|-------|
| Web search | ✅ DONE | Grok 4.1 built-in |
| Browser | ✅ DONE | agent-browser 0.8.5 |
| Memory search | ✅ DONE | QMD semantic search |
| Email | ✅ DONE | Custom CLI (rodaco@agentmail.to) |
| X/Twitter | ✅ DONE | bird CLI (@rgimbel) |
| Image gen | ✅ DONE | nano-banana-pro skill |

#### Tier 2: Needs Roger's Input

| Tool | Blocker | Benefit |
|------|---------|---------|
| GitHub skill | Need `gh auth login` | PR/issue automation |
| Lobster workflows | `npm i -g lobster` | Token-efficient automation |
| OpenProse | Plugin enable | Multi-agent research |

#### Tier 3: Not Needed (OpenClaw Already Covers)

- **Brave search** - Grok does this better
- **Puppeteer MCP** - agent-browser works
- **Memory MCP** - QMD backend sufficient
- **Fetch MCP** - web_fetch built-in

#### Key Insight: OpenClaw is Already Comprehensive

After 2 weeks of MCP research, conclusion: OpenClaw's built-in tools cover 90% of needs. The MCP ecosystem adds marginal value when you have:
- Built-in web search (Grok)
- Native browser automation
- Semantic memory search
- Multi-channel messaging
- Cron + subagent orchestration

**Focus should shift to:**
1. Better USE of existing tools
2. Workflow optimization (batch operations, smarter heartbeats)
3. Knowledge graph enrichment

---

*Last updated: 2026-02-12 02:30 ET*

---

### 2026-02-10 - Backup Verification & Monitoring Patterns (Overnight Build)

**Focus: Ensuring backups actually work, not just run**

#### The Backup Verification Problem

Running ≠ Working. Tonight's finding: Duplicati container healthy, but /backups empty.

**Common backup failure modes:**
1. Service running but no jobs configured
2. Jobs configured but destination unreachable
3. Backups running but silently failing
4. Old backups but nothing recent
5. Backups exist but never tested restore

#### Backup Monitoring Best Practices

**1. Check for recent backup artifacts, not just service health**
```bash
# Bad: Just checking if container is up
docker ps | grep duplicati

# Good: Checking for recent backup files
ls -la /backups/*.dblock 2>/dev/null | head -5
# or
find /backups -mtime -1 -type f | wc -l  # files modified in last 24h
```

**2. Log parsing for success/failure**
```bash
docker logs duplicati --tail 100 | grep -E '(Backup completed|Error|Failed|Success)'
```

**3. Last successful backup timestamp**
Store in heartbeat-state.json:
```json
{
  "lastSuccessfulBackup": {
    "duplicati": 1739088000,
    "status": "unknown"  // or "success", "failed", "no_jobs"
  }
}
```

#### Duplicati-Specific Notes

**Web UI required for job configuration:**
- Port 8200 (or via Caddy at https://duplicati.rogergimbel.dev)
- Jobs, schedules, and destinations configured via UI
- CLI tools exist but web is primary interface

**What to back up for media stack:**
- `/mnt/media/config/*` - All app configs (critical)
- `/mnt/media/docker-compose.yml` - Stack definition
- Exclude: `/mnt/media/media/*` - Actual media files (too large, replace from source)

**Backup destinations:**
- Local: Another drive/NAS (fast but same failure domain)
- Cloud: Backblaze B2, Wasabi, S3 (offsite, cheap)
- Both: 3-2-1 rule (3 copies, 2 media types, 1 offsite)

#### OpenClaw Pattern: Backup Status Check

Add to overnight build routine:
```bash
# Check for recent Duplicati activity
ssh rogergimbel@100.83.169.87 "
  # Check backup destination for recent files
  recent=\$(find /path/to/backups -mtime -1 -type f 2>/dev/null | wc -l)
  if [ \$recent -eq 0 ]; then
    echo 'WARNING: No backup activity in last 24 hours'
  else
    echo 'OK: \$recent backup files modified recently'
  fi
"
```

#### Action Items

- [ ] Verify Duplicati backup jobs exist (check web UI)
- [ ] If no jobs: Create backup job for /mnt/media/config/*
- [ ] Set up backup destination (local first, then consider B2)
- [ ] Add backup verification to overnight build routine

---

*Last updated: 2026-02-10 02:20 ET*

---

### 2026-02-13 - VPN Resilience & Overnight Build Patterns (Overnight Build)

**Focus: Handling network flakiness in automated overnight tasks**

#### VPN Issues at 2 AM

Tonight's gluetun behavior:
- Healthcheck failed (ICMP timeouts to 1.1.1.1, 8.8.8.8)
- Auto-restarted VPN connection
- Public IP fetch failing intermittently
- Internal status shows "running" but external connectivity broken

**Root causes to investigate:**
1. VPN provider server maintenance windows (often 1-4 AM)
2. MTU issues (gluetun reverting to 1320 due to ICMP blocks)
3. ISP maintenance affecting outbound connections

#### VPN Resilience Patterns

**1. Server Rotation**
Configure multiple VPN servers in gluetun. If one fails, try next:
```yaml
environment:
  - SERVER_CITIES=Los Angeles,Seattle,Denver
  # or
  - SERVER_HOSTNAMES=us101,us102,us103
```

**2. Graceful Degradation**
For tasks that don't require VPN:
- Check VPN status first
- If down, skip VPN-dependent tasks
- Continue with local/non-VPN work

**3. Retry Logic**
For critical VPN tasks:
```bash
for i in 1 2 3; do
  if docker exec gluetun wget -qO- --timeout=10 ifconfig.me; then
    break
  fi
  sleep 30
done
```

**4. Time-Based Avoidance**
Schedule VPN-dependent tasks outside 1-4 AM window when possible.

#### Overnight Build Optimization

Current flow:
1. Memory index refresh
2. Media stack health check
3. One improvement task
4. Research
5. Log everything

**Improvement ideas:**
- Add pre-flight VPN check before media stack tasks
- Queue VPN-dependent tasks for retry later if VPN down
- Store task results in JSON for structured parsing

#### Underutilized Built-in Skills

Tonight reviewed 54 built-in OpenClaw skills. Notable ones we're not actively using:

| Skill | Purpose | Usefulness for Us |
|-------|---------|-------------------|
| **session-logs** | Search conversation history via jq | HIGH - useful for context retrieval |
| **sherpa-onnx-tts** | Local TTS (no cloud) | MEDIUM - backup if TTS quota hits |
| **model-usage** | Track model costs via CodexBar | MEDIUM - macOS only |
| **oracle** | Bundle prompt+files for GPT-5.2 Pro | LOW - we prefer Claude/Grok |
| **clawhub** | Skill discovery/install CLI | MEDIUM - skill marketplace |
| **himalaya** | CLI email (IMAP/SMTP) | LOW - we have email skill |
| **coding-agent** | Orchestrate other AI coding tools | MEDIUM - if Roger uses Codex/Claude Code |

**Session-logs Quick Reference:**
```bash
# Search all sessions for a phrase
rg -l "phrase" ~/.openclaw/agents/<agentId>/sessions/*.jsonl

# Get cost for a session
jq -s '[.[] | .message.usage.cost.total // 0] | add' <session>.jsonl

# Tool usage breakdown
jq -r '.message.content[]? | select(.type == "toolCall") | .name' <session>.jsonl | sort | uniq -c | sort -rn
```

#### Network Resilience Patterns for Overnight Builds

Tonight's build hit network issues (~2:15 AM):
- SSH to Pi timing out
- Container outbound connectivity failing
- Likely Docker/host network issue

**Lesson:** Overnight builds need graceful degradation:

1. **Pre-flight network check** - verify connectivity before network-dependent tasks
2. **Fail fast** - don't hang waiting for timeouts
3. **Local-first** - do local tasks (memory, research, file ops) when network down
4. **Deferred queue** - note blocked tasks for morning heartbeat retry

```bash
# Quick network check before SSH tasks
timeout 5 ssh -o ConnectTimeout=3 host "echo OK" 2>/dev/null || {
  echo "Network unavailable, skipping SSH tasks"
  # Continue with local tasks
}
```

---

*Last updated: 2026-02-13 02:30 ET*
