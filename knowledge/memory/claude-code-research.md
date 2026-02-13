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
