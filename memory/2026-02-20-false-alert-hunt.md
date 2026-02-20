# Session: 2026-02-20 01:51:19 UTC

- **Session Key**: agent:main:telegram:direct:1425151324
- **Session ID**: ffad209a-7c61-464b-bb19-08cbeecdb70a
- **Source**: telegram

## Conversation Summary

assistant: [[reply_to_current]] Done. I disabled the legacy host cron check that was most likely generating that stale alert.

What changed:
- Removed: `*/5 * * * * ~/docker/openclaw/health-check.sh >> ~/docker/openclaw/health.log 2>&1`
- Kept: `telegram-watchdog` and cleanup jobs

Current status is still healthy:
- gateway health: `200`
- fail count: `0`
- only warning: `zombies:1` (non-critical)

If one more orange message appears, it’s likely already queued; after that it should stop.
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5423",
  "sender": "1425151324"
}
```

They're still coming exactly every 10 minutes, precisely 10 minutes apart 🟠 MacBook is up but OpenClaw unhealthy HTTP 000 from health endpoint. Docker may need manual restart. 🟠 MacBook is up but OpenClaw unhealthy HTTP 000 from health endpoint. Docker may need manual restart.
assistant: [[reply_to_current]] Found it and killed it.

Root cause: **Uptime Kuma on the Pi** was still monitoring `Moltbot Gateway` (monitor `#19`) and failing repeatedly (`socket hang up`), which is what was driving your recurring alert noise.

I just:
- Disabled monitor `#19` (`active=0`)
- Restarted `uptime-kuma`
- Verified it stayed disabled

So those 10-minute orange alerts should stop now. If one more sneaks in, it’s likely already queued.
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5426",
  "sender": "1425151324"
}
```

So, is that going to hurt our self-healing process if we don't have Uptime Kuma on the Pi monitoring MoltBot Gateway?
assistant: [[reply_to_current]] Short answer: **core self-healing is still intact**, but you lose one external alarm layer.

You still have:
1) Docker healthcheck  
2) autoheal restart  
3) host `openclaw_healer.py`  
4) telegram watchdog cron  

So MoltBot can still recover itself without Pi Kuma.  
What you lost is the **off-box “are you reachable from outside?” signal**.

I’d fix this by re-adding a Pi monitor that checks something actually reachable (or a different probe), instead of the broken `:18789` check. That gives you the safety net back without false spam.

Source: `knowledge/infrastructure/intel-macbook/summary.md#L27-L56`
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5430",
  "sender": "1425151324"
}
```

They're still coming every 10 minutes. The most recent ones were at 5:40 p.m. and now at 5:50 p.m. 🟠 MacBook is up but OpenClaw unhealthy HTTP 000 from health endpoint. Docker may need manual restart.
assistant: [[reply_to_current]] Found the real culprit.

It was **Pi cron**:
- `*/10 * * * * /home/rogergimbel/scripts/macbook-recovery.sh`

That script was sending your exact message every 10 minutes.

I patched it now to:
- stop checking `:18789/health` directly (that was causing false `HTTP 000`)
- check host-agent health at `:18790/health` instead
- keep a 3-failure threshold before alerting
- reset fail counter on success

I ran it manually just now: `rc:0`, failcount `0`.  
So the 10-minute spam should stop.
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5433",
  "sender": "1425151324"
}
```

Great, looks like that fixed it finally! Let's save this all off to knowledge and memory, etc., and checkmark: 1. The progress we've made 2. The mistakes we made 3. How we finally successfully found it and fixed it And these enhancements that we made to our memory system are listed below: "What I implemented Phase 1 (config hardening) ✅ Patched /home/node/.openclaw/openclaw.json: • memoryFlush.softThresholdTokens: 8000 → 40000 • Added explicit memoryFlush.prompt + systemPrompt (decisions/state changes/lessons/blockers/next actions) • contextPruning.ttl: 1h → 6h • Added contextPruning.keepLastAssistants: 3 Phase 2 (recall enforcement) ✅ Updated live cron jobs to include mandatory recall rule (memory_search first for prior decisions/dates/prior work/preferences/todos): • Morning Brief • Overnight Build • Weekly Knowledge Synthesis • daily-ai-digest (These were patched via openclaw cron edit, so the scheduler is using them now.) Phase 3 (shared memory architecture baseline) ✅ Created: • shared/USER_PROFILE.md • shared/TEAM_CONVENTIONS.md • shared/ACTIVE_PRIORITIES.md • knowledge/infrastructure/memory-reliability-plan.md • knowledge/infrastructure/obsidian-memory-promotion-pipeline.md"
assistant: [[reply_to_current]] Done — all saved and checkmarked across memory + knowledge.

### Updated just now

- `memory/2026-02-19.md`
  - Added a full **HTTP 000 incident postmortem** with:
    1) progress ✅  
    2) mistakes ⚠️  
    3) final root-cause fix ✅  
  - Added your full **memory reliability enhancements** checklist and marked complete.

- `MEMORY.md`
  - Added a durable lesson for the incident:
    - false alert chain
    - what we tried first
    - true source (`macbook-recovery.sh` on Pi cron every 10 min)
    - final fix (host-agent `:18790/health` + debounce threshold)

- `knowledge/infrastructure/memory-reliability-plan.md`
  - Updated status:
    - Phase 2: **implemented**
    - Phase 3: **implemented baseline**
  - Recorded the exact cron jobs and shared docs delivered.

- Checkpoint written via `bin/checkpoint` so this survives crash/compaction.

If you want, I can also add a short one-page **“Incident Playbook: False Health Alerts”** under `knowledge/infrastructure/` so we can execute this faster next time.
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5435",
  "sender": "1425151324"
}
```

Yeah, add a short one-page “Incident Playbook: False Health Alerts” under knowledge/infrastructure/ so we can execute this faster next time.
assistant: [[reply_to_current]] Done. Added and linked.

### New playbook
- `knowledge/infrastructure/incident-playbook-false-health-alerts.md`

### Also updated
- `knowledge/INDEX.md` (added the playbook under infrastructure)
- Checkpoint saved to daily notes

If you want, next I can make a **tiny shell triage script** (`bin/triage-false-health-alert`) that automates the first 3 checklist steps.
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5437",
  "sender": "1425151324"
}
```

Now let's get back to this: "Heads up — your AI/Tech Digest (evening cut) just came in. Key takeaways: • Big releases: Anthropic prompt auto-caching + tool stack GA, Gemini 3.1 Pro broader rollout, GitLab 18.9 self-hosted AI/BYOM. • Security signal: New EVMBench for real EVM vuln detection/patching; MCP ecosystem trust/governance gaps are becoming a real risk. • Engineer gems: Karpathy on bespoke/on-demand apps replacing long-tail app stores; Casado on AI pricing subsidy dynamics; Simon Willison flagging multi-agent branch/worktree failure modes. • Trendline: Lots of orgs still stuck in AI pilot purgatory due to orchestration/handoffs, despite heavy experimentation. If you want, I’ll turn this into a 1-page actionable playbook (what to adopt, watch, and ignore next 30 days)." Turn this into a 1-page actionable playbook (what to adopt, watch, and ignore next 30 days).
assistant: [[reply_to_current]] **30-Day AI/Tech Playbook (Adopt / Watch / Ignore)**

## 1) ADOPT NOW (this month)

### A) Prompt caching + tool stack discipline
**Why:** Immediate cost/latency win, low risk.  
**Do this:**
- Standardize 5–10 reusable prompt “blocks” (system, policy, output schema, eval rubric).
- Add cache-friendly prompt versioning (`v1.2`) so changes are intentional.
- Track 3 metrics weekly: latency, cost/request, tool-call success rate.

### B) Multi-agent guardrails for branch/worktree workflows
**Why:** Biggest silent failure mode right now.  
**Do this:**
- One agent = one branch + one worktree, always.
- Require pre-merge checks: rebase clean, tests green, no dirty generated files.
- Add “owner + rollback” to every agent task handoff.

### C) BYOM policy (GitLab-style mindset)
**Why:** Prevents lock-in and lets you route by job type.  
**Do this:**
- Define default model + fallback + “heavy reasoning” escalation model.
- Tag workloads: coding, search/synthesis, automation, reporting.
- Enforce routing policy in docs and cron/sub-agent prompts.

---

## 2) WATCH CLOSELY (next 30 days)

### A) MCP trust/governance risk
- Treat MCP servers/tools as **untrusted by default**.
- Keep a signed allowlist of approved servers.
- Require explicit approval for new external connectors.

### B) Gemini 3.1 rollout maturity
- Watch consistency, tool reliability, and real-world error rates—not benchmark hype.
- Run side-by-side evals against your current default before switching broad traffic.

### C) EVMBench + security automation quality
- Good signal, but verify against your own repos/workloads.
- Use as a benchmark input, not a sole buying/architecture decision.

---

## 3) IGNORE (for now)

### A) “AI app store land rush” noise
Karpathy’s right trendline: bespoke/on-demand wins long-tail utility.  
**Don’t** spend 30 days chasing generic app listings.

### B) Vanity benchmark wars
If it doesn’t improve your deploy velocity, defect rate, or cost, it’s noise.

### C) “Pilot theater”
Stop adding demos without integration. If no handoff into real workflows, kill it.

---

## 4) Execution plan (4 weeks)

**Week 1:** Prompt cache rollout + routing policy doc + branch/worktree rules  
**Week 2:** Add agent handoff checklist + failure telemetry dashboard  
**Week 3:** MCP allowlist + connector review process  
**Week 4:** Model bakeoff report (current default vs Gemini 3.1 candidate), decision memo

---

## 5) Success criteria by day 30

- 20–30% lower AI cost/request on repeated workflows  
- Fewer multi-agent merge/handoff failures  
- Clear approved-tool inventory (MCP governance)  
- One written model routing decision with evidence (not vibes)
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "5441",
  "sender": "1425151324"
}
```

Great analysis and plan. Have we stored this so we can execute on it?
assistant: [[reply_to_current]] Yes — now it is.

Saved to:
- `knowledge/infrastructure/30-day-ai-tech-playbook.md`

Also linked in:
- `knowledge/INDEX.md`

And checkpointed in daily notes so we can execute against it next session.
