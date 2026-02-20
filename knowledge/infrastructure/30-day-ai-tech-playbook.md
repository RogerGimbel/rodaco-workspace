# 30-Day AI/Tech Playbook (Adopt • Watch • Ignore)

Created: 2026-02-19
Owner: Roger + Rodaco

## Adopt Now (this month)

### 1) Prompt caching + tool stack discipline
- Standardize 5–10 reusable prompt blocks (system, policy, schema, eval rubric)
- Version prompts (`v1.2`) for intentional cache breaks
- Track weekly: latency, cost/request, tool-call success rate

### 2) Multi-agent branch/worktree guardrails
- One agent = one branch + one worktree
- Pre-merge gate: rebase clean, tests green, no dirty generated files
- Every handoff includes owner + rollback

### 3) BYOM routing policy
- Define: default model, fallback, heavy-reasoning escalation model
- Tag workloads: coding, search/synthesis, automation, reporting
- Enforce routing policy in cron + sub-agent prompts

## Watch Closely (next 30 days)

### 1) MCP trust/governance
- Untrusted by default
- Signed allowlist of approved servers
- Explicit approval path for new external connectors

### 2) Gemini 3.1 rollout quality
- Measure consistency + tool reliability + real-world error rates
- Run side-by-side evals before broad switching

### 3) EVMBench and security automation signal
- Use as benchmark input, not single source of truth
- Validate on our repos/workloads

## Ignore (for now)

- AI app-store land rush noise
- Vanity benchmark battles without ops impact
- Pilot theater without production handoffs

## 4-Week Execution Plan

### Week 1
- Prompt cache rollout
- Routing policy doc
- Branch/worktree rule rollout

### Week 2
- Agent handoff checklist
- Failure telemetry dashboard

### Week 3
- MCP allowlist + connector review process

### Week 4
- Model bakeoff report (current default vs Gemini 3.1 candidate)
- Decision memo

## Success Criteria by Day 30
- 20–30% lower AI cost/request on repeated workflows
- Reduced multi-agent merge/handoff failures
- Approved-tool inventory for MCP governance
- Written model-routing decision backed by measured evidence
