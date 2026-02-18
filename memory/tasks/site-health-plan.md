# Site Health Automation Plan

*Created: 2026-02-17*
*Status: PLANNING*

## Step 4: Computer-Use Testing Cron (Weekly)

### Concept
Weekly automated click-through of all 3 sites using Sonnet 4.6's improved computer use capabilities. Not just "is it up?" — actually navigate, click links, verify content renders correctly.

### Sites to Test
1. **Mission Control** — http://100.124.209.59:3333/ (6 pages: home, ops, agent, projects, knowledge, research)
2. **Rodaco.co** — http://100.124.209.59:3334/ (single page, 8 sections)
3. **rogergimbel.dev** — http://100.124.209.59:3335/ (single page, multiple sections)

### What to Check
- All pages load (HTTP 200)
- No JavaScript errors in console
- All navigation links work (click each, verify destination)
- No broken images or missing assets
- Content renders (not blank/white screens)
- Mobile viewport check (resize to 375px width, screenshot)
- Forms work (contact form on rodaco.co — don't submit, just verify it renders)
- Performance: page load time under 3 seconds

### Implementation
- **Schedule:** Sunday 3 AM ET (after overnight build, before morning brief)
- **Model:** Sonnet 4.6 (computer use improvements)
- **Method:** Use `bash bin/remote-screenshot` for screenshots + browser tool for click-through
- **Output:** Write results to `memory/tasks/site-health-report.md`
- **Alert:** If any site fails, send Telegram to Roger

### Cron Payload Draft
```
Weekly site health audit. For each site (MC :3333, rodaco.co :3334, rogergimbel.dev :3335):
1. Take screenshot of each page/section using bash bin/remote-screenshot
2. Use browser tool to navigate — click every nav link, verify pages load
3. Check for console errors
4. Screenshot mobile viewport (375px width)
5. Write results to memory/tasks/site-health-report.md
6. If ANY site is down or has critical issues, send Telegram to Roger (chat ID 1425151324)
7. Reply NO_REPLY if all healthy
```

---

## Step 5: Weekly Automated CLI Health Check

### Concept
Lightweight CLI-based health check — faster and cheaper than full browser testing. Runs more frequently (daily or multiple times per week). Complements the browser test.

### Checks
```bash
# HTTP status for all 3 sites
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3333/
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3334/
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3335/

# MC API health
curl -s http://127.0.0.1:3333/api/v3/health

# SSL/redirect check (production URLs)
curl -s -o /dev/null -w '%{http_code}' https://rodaco.co
curl -s -o /dev/null -w '%{http_code}' https://rogergimbel.dev

# Page content sanity (verify real content, not error pages)
curl -s http://127.0.0.1:3334/ | grep -c "Rodaco"
curl -s http://127.0.0.1:3335/ | grep -c "Roger Gimbel"

# Response time
curl -s -o /dev/null -w '%{time_total}' http://127.0.0.1:3333/
curl -s -o /dev/null -w '%{time_total}' http://127.0.0.1:3334/
curl -s -o /dev/null -w '%{time_total}' http://127.0.0.1:3335/

# Container/process health
pgrep -f "node.*server.cjs" | wc -l
curl -s http://127.0.0.1:3333/api/v3/health | jq .status
```

### Implementation Options

**Option A: Upgrade existing Sites Watchdog**
- Current: every 2 min, just checks HTTP 200 and restarts if down
- Upgraded: add content checks, response time, production URL checks
- Pro: One fewer cron job. Con: Makes the fast watchdog slower.

**Option B: Separate weekly deep check**
- Keep existing watchdog for fast up/down monitoring
- Add new weekly cron for deep checks (SSL, content, response time, production)
- Pro: Separation of concerns. Con: More cron jobs.

**Recommendation: Option B** — keep the watchdog fast, add a separate weekly deep check.

### Schedule
- **Fast watchdog:** Every 2 min (existing, unchanged)
- **Deep health check:** Daily at 6 AM ET (before morning brief, results feed into brief)
- **Browser click-through:** Weekly Sunday 3 AM ET

### Three-Tier Monitoring
| Tier | Frequency | Method | What |
|------|-----------|--------|------|
| 1 | Every 2 min | Watchdog cron | HTTP 200 + auto-restart |
| 2 | Daily 6 AM | CLI health check | Content, SSL, response time, production URLs |
| 3 | Weekly Sun 3 AM | Browser click-through | Full navigation, screenshots, mobile, console errors |
