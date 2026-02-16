---
tags: [task, mission-control, api, overnight-build]
created: 2026-02-16
status: active
---
# MC v3 API Fixes — Overnight Build Task

## Context
API audit completed 2026-02-16. The MC API runs inside the container at `mission-control/src/routes/api-v3.js`, served on port 3333. Session data parsed from `~/.openclaw/agents/main/sessions/*.jsonl`. Frontend hooks in `rodaco-mc/src/hooks/useApi.ts`.

## Safety — ALWAYS do this before/after editing API files
```bash
# STOP server before editing
SUPERVISOR_PID=$(cat /tmp/mission-control-supervisor.pid 2>/dev/null)
[ -n "$SUPERVISOR_PID" ] && kill $SUPERVISOR_PID 2>/dev/null
sleep 2; pkill -f 'node src/server.js' 2>/dev/null

# RESTART after editing
bash /home/node/workspace/mission-control/start.sh
```

## Tasks

### P0 — Data Quality (dashboard shows wrong/empty data)

- [ ] **1. Model pricing — all show "unknown"**
  - File: `mission-control/src/routes/api-v3.js` — `parseModelArsenal()` (line ~294)
  - Root cause: Reads from IDENTITY.md markdown table, column 4 (cost) doesn't exist in the table
  - Fix: Add a pricing lookup map with real per-token costs:
    ```js
    const MODEL_PRICING = {
      'grok': { input: 3.00, output: 15.00, unit: '1M tokens' },
      'grok-code': { input: 1.50, output: 10.00, unit: '1M tokens' },
      'sonnet': { input: 3.00, output: 15.00, unit: '1M tokens' },
      'opus': { input: 15.00, output: 75.00, unit: '1M tokens' },
      'codex': { input: 6.00, output: 24.00, unit: '1M tokens' },
      'image': { input: 1.25, output: 10.00, unit: '1M tokens' },
    };
    ```
  - Look up latest pricing: search web for "xai grok 4 api pricing", "anthropic claude opus 4 pricing", "openai gpt-5.1 codex pricing"
  - Return `cost` as object `{ input, output, unit }` instead of string "unknown"
  - Also update frontend `ModelCard.tsx` to display pricing info

- [ ] **2. Cost tracking — always $0.00**
  - File: `mission-control/src/lib/session-parser.js` — `parseSessionUsage()` (line ~end)
  - Root cause: Session JSONL has `cost.total: 0` for all messages — the provider (Anthropic) doesn't embed cost in the usage response
  - Fix: Calculate costs from token counts using the pricing map:
    ```js
    const calculatedCost = (u.input * pricing.input + u.output * pricing.output + u.cacheRead * pricing.cacheRead) / 1_000_000;
    ```
  - Need to map model IDs (e.g., `claude-opus-4-6`) to pricing tiers
  - Update `parseSessionUsage()` to calculate cost when `u.cost.total === 0`
  - This fixes: metrics/costs endpoint, usage endpoint, Home page cost analytics, all $0.00 displays

- [ ] **3. Sub-agent count — inflated (showing 1011)**
  - File: `mission-control/src/routes/api-v3.js` — system-overview endpoint (line ~529)
  - Root cause: Counting ALL session files including old/dead ones: `fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl')).length`
  - Fix: Only count sessions that are recent (last 24h) OR actively running. Filter by mtime:
    ```js
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const activeSessions = sessions.filter(f => fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs > cutoff);
    overview.subAgentCount = activeSessions.length;
    ```
  - Also consider: separate `totalSessions` (all-time) from `activeSessions` (recent)

### P1 — Missing/Broken Endpoints

- [ ] **4. Performance metrics — all zeros**
  - File: `mission-control/src/routes/api-v3.js` — `metrics/performance` endpoint
  - Root cause: No actual performance data collection happening — no response time tracking
  - Fix: Add middleware to track API response times:
    ```js
    const responseTimes = [];
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => responseTimes.push({ path: req.path, ms: Date.now() - start, timestamp: Date.now() }));
      next();
    });
    ```
  - Then calculate avg/p95 from the collected data
  - Also: parse session JSONL for tool call durations as "tool performance"

- [ ] **5. Cost trend — always null**
  - File: `mission-control/src/routes/api-v3.js` — `metrics/costs` endpoint (line ~1684)
  - Root cause: Depends on fix #2 (cost calculation). Once costs are non-zero, compare this week vs last week
  - Fix: After implementing cost calculation:
    ```js
    const thisWeek = byDay.filter(d => d.date >= weekAgo).reduce((s, d) => s + d.cost, 0);
    const lastWeek = byDay.filter(d => d.date >= twoWeeksAgo && d.date < weekAgo).reduce((s, d) => s + d.cost, 0);
    trend = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1) + '%' : null;
    ```

- [ ] **6. Usage by provider — incomplete**
  - File: `mission-control/src/routes/api-v3.js` — `usage/providers` endpoint
  - Root cause: Returns raw OpenAI billing API response but doesn't aggregate Anthropic/xAI usage from session data
  - Fix: Parse all session files, group by provider (extract from model ID: `claude-*` → anthropic, `grok-*` → xai, `gpt-*` → openai), aggregate token counts and calculated costs

### P2 — Enhancement Opportunities

- [ ] **7. Add model usage breakdown to Home page**
  - Currently: Home shows "Models Active: 1" with no breakdown
  - Fix: Parse session data to show which models were used today, with call counts and token usage per model
  - New endpoint or enhance existing: `usage` endpoint could include `modelBreakdown` array

- [ ] **8. Add real session count logic**
  - Currently: `agent/sessions` returns ALL session files (1000+)
  - Fix: Categorize sessions: `active` (modified in last hour), `recent` (last 24h), `total` (all-time)
  - Frontend should show active count prominently, not total

- [ ] **9. Gateway latency tracking**
  - Currently: Home page shows gateway latency but it's a single point-in-time measurement
  - Fix: Track gateway health check response times over time, store last N measurements
  - Add to `system/health-score` or new endpoint `metrics/gateway`

- [ ] **10. Stale lock file cleanup**
  - Currently: `metrics/session-health` warns about "3 lock files present"
  - Fix: Add auto-cleanup of lock files older than 5 minutes
  - Or expose a cleanup endpoint that the overnight build can call

## Verification
After each fix:
1. Restart API: `bash /home/node/workspace/mission-control/start.sh`
2. Test endpoint: `curl -s http://localhost:3333/api/v3/<endpoint>`
3. Browse frontend: `agent-browser open "http://100.124.209.59:3333/" --headless && sleep 4 && agent-browser snapshot`
4. Checkpoint: `bash bin/checkpoint "description"`

## Completion Criteria
- Models show real pricing (not "unknown")
- Costs calculated from token usage (not $0.00)
- Sub-agent count reflects active sessions (not all-time 1011)
- Performance metrics populated with real data
- All endpoints return valid JSON (no 404s for frontend-requested endpoints)
- Do NOT push to GitHub without Roger's approval
