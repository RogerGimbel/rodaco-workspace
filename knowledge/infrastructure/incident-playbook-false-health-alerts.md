# Incident Playbook: False Health Alerts

Updated: 2026-02-19
Owner: Roger + Rodaco

## Purpose
Fast triage when health alerts fire but systems appear up.

## Trigger Pattern
Suspect false alert when:
- Message repeats on exact cadence (e.g., every 10 minutes)
- Live health checks show gateway/API healthy
- Alert wording is old/legacy

## 5-Minute Triage Checklist
1. **Confirm real health first**
   - Run: `bash /home/node/workspace/bin/health-check`
   - If gateway is 200 and fail_count is 0, treat as likely false alert.

2. **Match cadence to scheduler**
   - If alert is every N minutes, inspect crons/jobs with same interval.
   - Check host cron and Pi cron for matching schedules.

3. **Find source script/job**
   - Look for exact alert phrase in watchdog/recovery scripts.
   - Prioritize external monitors (Pi/Uptime Kuma/legacy shell scripts).

4. **Patch source, not symptoms**
   - Replace brittle remote checks with authoritative endpoint.
   - Prefer host-agent health probe (`:18790/health`) for external checks.
   - Add debounce (consecutive fail threshold + cooldown) before alerting.

5. **Validate and close**
   - Run source script manually.
   - Verify no alert on healthy state.
   - Watch one full cadence cycle.

## Known Good Patterns
- Internal health checks inside container: use localhost service checks.
- External cross-machine checks: use host-agent `http://<tailscale-ip>:18790/health`.
- Alerting rules:
  - No “manual restart” wording on single transient misses.
  - Require sustained failures (e.g., 3 consecutive failures).

## Anti-Patterns (Avoid)
- Chasing every monitor without cadence matching.
- Treating one `HTTP 000` as outage.
- Checking host external IP from inside container and assuming port-mapping failure.
- Fixing multiple likely causes without proving source.

## Post-Incident Memory Updates (Required)
- `memory/YYYY-MM-DD.md`: timeline, attempts, root cause, fix.
- `MEMORY.md`: durable lesson if pattern is reusable.
- Update relevant runbook/playbook docs.

## Incident Reference (2026-02-19)
- Symptom: “MacBook is up but OpenClaw unhealthy HTTP 000…” every 10 min.
- Root cause: Pi cron `macbook-recovery.sh` running every 10 minutes.
- Final fix: switched probe to host-agent `:18790/health` + fail threshold/debounce.
