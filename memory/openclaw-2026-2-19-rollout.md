# OpenClaw 2026.2.19 — Final Rollout (Roger)

Updated: 2026-02-19 ET
Owner: Roger + Rodaco

## 1) High-Signal Alert Policy (Watch-friendly, low-noise)

### Alert levels
- **P0 (Interrupt now)**
  - MC down > 2 consecutive checks (4+ min)
  - Both sites down (3334 + 3335) simultaneously
  - Morning Brief failed/missed by >2h
  - Daily backup failed
  - Gateway/channel auth failure (Telegram send failure)
- **P1 (Prompt but non-interrupting)**
  - Single site down > 6 min
  - Cron stale: overnight build >36h, morning brief >36h, backup >36h
  - Repeated MC restarts >3 within 30 min
  - Model cost anomaly spike (unexpected burst pattern)
- **P2 (Digest only, no immediate ping)**
  - One-off process restart that self-recovers
  - Elevated context warnings that were auto-compacted
  - Non-critical dependency/plugin warnings

### Suppression rules
- Suppress duplicate alerts for same incident for 30 min
- Send "resolved" notice once service recovers
- No P1/P2 alerts during 23:00–08:00 local unless escalation threshold reached

### Delivery mode
- P0: immediate Telegram message
- P1: bundled in next heartbeat window unless user is active in chat
- P2: morning brief rollup only

---

## 2) 10-Second Triage Flow (Wrist-first)

### IGNORE
- Self-healed within 1 check cycle
- No user impact, no repeated flaps

### WATCH
- Repeated but recovering flaps
- Single component degraded, others healthy
- Action: monitor next 2 cycles, no manual intervention yet

### INVESTIGATE NOW
- Any P0
- Any repeated restart pattern (>3/30 min)
- Any auth/token failure preventing delivery
- Action: run diagnostics + service restarts + root-cause note in daily log

---

## 3) Device Trust SOP (Gateway auth + device management)

### Monthly routine
1. `openclaw devices list`
2. Remove stale/unknown devices
3. Rotate operator token for active CLI device(s)
4. Verify `openclaw status` reachable/auth OK

### Lost/compromised device procedure (immediate)
1. `openclaw devices list`
2. `openclaw devices revoke --device <id> --role operator`
3. `openclaw devices remove --device <id>`
4. Rotate remaining trusted device operator token
5. Validate channel delivery still healthy

### Guardrails
- Keep `gateway.bind: loopback` unless explicit remote requirement
- Only approve known device IDs with expected platform/client mode
- No plaintext non-loopback `ws://` targets

---

## 4) OTEL v2 Debugging Cheat Sheet

### Use OTEL when:
- Cron "ran" but no message delivered
- Subagent completed but no announce
- Tool call slow/failing intermittently

### Root-cause ladder
1. **Model leg**: latency/errors from model provider
2. **Tool leg**: exec/tool failure, timeout, permission issue
3. **Delivery leg**: channel send/target resolution failure

### Quick playbook
1. Identify failed run timestamp/job/session
2. Trace spans by run window (cron id / session id)
3. Classify failure leg (model/tool/delivery)
4. Apply fix in that layer only
5. Record incident + prevention in daily notes

### Common signatures
- Delivery-only fail + run output present → channel target/config issue
- Tool timeouts + normal model latency → tool/system bottleneck
- High model latency + normal tools → provider/rate/capacity issue

---

## 5) Validation checklist after any OpenClaw update

- [ ] `openclaw status` clean (gateway reachable/auth OK)
- [ ] Telegram channel OK
- [ ] MC/site watchdog healthy (3333/3334/3335)
- [ ] Morning brief + backup cron lastRun fresh
- [ ] Subagent announce path works
- [ ] No recurring restart storm in first 2 hours

