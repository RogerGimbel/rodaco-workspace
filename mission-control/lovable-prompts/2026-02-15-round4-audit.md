# Lovable Prompts — Round 4 Audit (2026-02-15)

---

## 🔴 CRITICAL 1: Hero Card Shows "Degraded" When API Is Healthy

```
The Rodaco hero card shows a yellow "Degraded" status, but the API health endpoint returns "ok". 

The issue: the frontend is likely counting individual widget fetch failures (which happen during auto-refresh if even one endpoint is slow) and marking the whole system as "Degraded".

Fix the status logic:
1. "Online" (green) = /api/v3/health returns status "ok" — this is the ONLY check that matters for the hero card
2. "Degraded" (yellow) = /api/v3/health returns but individual widget endpoints are failing (more than 3 out of total)
3. "Offline" (red) = /api/v3/health itself fails to respond

Don't count individual widget failures as "degraded" — those widgets already show their own error states. The hero card should reflect overall API reachability, not per-widget success.

Currently the API is healthy and responding, so this should show "Online" with a green dot.
```

---

## 🔴 CRITICAL 2: Progress Bar Colors Still Wrong

```
The disk and RAM progress bars still have incorrect color thresholds. From the screenshot:

- Pi ROOT: 31/58 GB (55%) — showing RED. Should be GREEN.
- Pi RAM: 4.1/7.9 GB (52%) — showing RED. Should be GREEN.
- Pi DOCKER: 17/229 GB (8%) — showing GREEN. Correct.
- Pi MEDIA: 590/1833 GB (34%) — showing GREEN. Correct.
- MacBook RAM: 12.6/12.9 GB (97%) — showing RED. Correct!
- MacBook DISK: 10/371 GB (3%) — showing GREEN. Correct.

The color thresholds need to be applied universally to ALL progress bars:
- 0-70%: GREEN (#10b981 or similar emerald)
- 70-85%: YELLOW/AMBER (#f59e0b)
- 85-100%: RED (#ef4444)

Search the codebase for ALL progress bar components and ensure they use these thresholds. The bug is likely that some bars use the raw value color logic (where any significant fill = red) instead of percentage-based thresholds.

Also: Pi temperature 120°F (49°C) should display green — it's well under the 140°F warning threshold.
```

---

## 🟡 FIX 3: Breadcrumb Shows Extra Segment

```
The Projects page breadcrumb shows "Projects / BeerPair / Dashboard" — that's 3 levels but should be 2. It seems like it's showing both the active project tab AND the Dashboard tab simultaneously.

Fix:
- Show only: "Projects / BeerPair" when BeerPair tab is active
- Show: "Projects / Ocean One" when Ocean One tab is active
- Show: "Projects / Dashboard" when Dashboard tab is active
- Never show 3 levels — breadcrumb should be: Page / Active Tab
```

---

## 🟡 FIX 4: Today's Summary Card — API Calls and Sessions Show "—"

```
The Today's Summary card shows:
- API Calls: — (dash, no data)
- Sessions: — (dash, no data)
- Cost: $0.00
- Cron Runs: 6
- Build: "Overnight Build"

The dashes mean the frontend can't extract the data. Fix:

For API Calls: 
- Get from /api/v3/usage, look at byDay array for today's date entry
- Sum input + output tokens, or show the "calls" count from byModel totals
- The data IS there (480 calls from claude-opus-4-6) — the frontend just isn't parsing it correctly

For Sessions:
- /api/v3/agent/sessions currently returns 0 sessions (API-side issue)
- Show "0" instead of "—" when the API returns an empty array
- "—" should only show when the fetch itself fails

For Build:
- Currently just shows "Overnight Build" — add the duration: "Overnight Build — 23min"
- Get from /api/v3/overnight-log, first section's content, extract duration
```

---

## 🟡 FIX 5: Theme Toggle Says "Light mode" in Dark Mode

```
The sidebar shows "Toggle theme" button with text "Light mode" while the app is in dark mode. This is confusing — does it mean "switch TO light mode" or "currently IN light mode"?

Fix:
1. In dark mode: show moon icon + "Dark" (or just the icon, no text)
2. In light mode: show sun icon + "Light" (or just the icon, no text)
3. The icon/label should reflect the CURRENT theme, not the target
4. Or: just show the icon that toggles (moon in dark mode, sun in light mode) with no text — cleaner
5. Move it to the header bar (top-right, next to the refresh button) instead of buried in the sidebar
```

---

## 🟡 FIX 6: Tab Content Still Potentially Empty on Inner Pages

```
From the structural audit, inner pages (Ops, Agent, Projects, Knowledge, Research) may still show empty content below tabs when data loads. Since I can't visually verify from my browser, please confirm:

1. Go to each page and click each tab
2. Verify content appears (not just tab buttons)
3. If any tab shows blank space, check:
   - Is the component fetching data? (Network tab in devtools)
   - Is the response being parsed correctly?
   - Is the component rendering the parsed data?

If tabs DO have content now, great! Skip this prompt.
If tabs are STILL empty, add console.log statements temporarily to debug which step fails:
- console.log("Fetching:", endpoint)
- console.log("Response:", data)  
- console.log("Rendering:", parsedData)
```

---

## 🟢 ENHANCEMENT 7: MacBook RAM Warning

```
MacBook RAM is at 97% (12.6/12.9 GB) — that's genuinely concerning. Add a visual warning:

1. When any metric is in the red zone (>85%), add a subtle pulse animation to the progress bar
2. Add a small warning icon (⚠️) next to the value text
3. Consider adding a tooltip: "RAM usage critical — 12.6 GB of 12.9 GB used"
4. In the System Health card (if visible), this should contribute to lowering the MacBook health score
```

---

## 🟢 ENHANCEMENT 8: Bottom Nav — Add Active State Indicator

```
The mobile bottom navigation bar looks good, but from the screenshot:
1. The active page (Home) should have a more prominent indicator — filled icon or accent color underline
2. Inactive tabs should be slightly dimmed/muted
3. Add a subtle haptic-like bounce animation when tapping a nav item (CSS scale transform: 0.95 → 1.0 over 100ms)
4. The icon + text should be vertically centered with consistent spacing
5. Consider: badge indicators on nav items (e.g., red dot on Ops if there are active tasks, dot on Agent if health warnings exist)
```

---

## 🟢 ENHANCEMENT 9: Add Favicon and PWA Manifest

```
The site needs a proper favicon and PWA (Progressive Web App) setup so it can be added to phone home screens:

1. Add a favicon: use the ⚡ lightning bolt or a stylized "MC" monogram
2. Add a web manifest (manifest.json):
   - name: "Rodaco Mission Control"
   - short_name: "Rodaco MC"
   - theme_color: "#0f172a" (dark background)
   - background_color: "#0f172a"
   - display: "standalone"
   - icons: generate 192x192 and 512x512 PNG icons
3. Add meta tags for mobile:
   - <meta name="apple-mobile-web-app-capable" content="yes">
   - <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
   - <meta name="theme-color" content="#0f172a">
4. This lets Roger add MC to his iPhone home screen and it opens like a native app (no browser chrome)
```

---

## 🟢 ENHANCEMENT 10: Pull-to-Refresh on Mobile

```
On mobile, add pull-to-refresh gesture:
1. Pulling down from the top of the page triggers a data refresh
2. Show a circular loading spinner during refresh
3. Snap back when complete
4. Only enable on the main content area, not on scrollable sub-components

This is a natural mobile interaction that users expect from dashboard apps.
```

---

## 🟢 ENHANCEMENT 11: Scroll Position — Sticky Header on Scroll

```
As the user scrolls down the Home page (which is getting long with all the cards), the page title and refresh indicator scroll away.

Fix:
1. Make the top bar sticky: page title ("Home") + "Live Updated Xs ago" + refresh button should stick to the top as you scroll
2. When scrolled, add a subtle bottom shadow to the sticky bar to separate it from content
3. The hero card and summary card should scroll normally (not sticky)
4. On mobile: the top bar should be especially sticky since the content is very long in single-column layout
```

---

## 🟢 ENHANCEMENT 12: Home Page — Section Headers for Visual Grouping

```
The Home page now has many cards (hero, summary, macbook, pi, health, cost, performance, cron, usage, activity). They need visual grouping to avoid feeling like a wall of cards.

Add section headers:
1. "Infrastructure" — above MacBook + Pi cards
2. "Metrics" — above Cost Analytics + System Performance + Cron Jobs
3. "System Health" — above the health score card (or group it with Infrastructure)
4. "Activity" — above usage chart + activity feed

Section headers should be:
- Small, uppercase, muted text (like "INFRASTRUCTURE")
- With a thin horizontal line extending to the right
- Subtle, not dominant — they organize without shouting
```

---

## 🟢 ENHANCEMENT 13: Quick Action Buttons on Device Cards

```
Add subtle action buttons to the MacBook and Pi device cards:

MacBook card:
- "SSH" button — copies SSH command to clipboard: "ssh rogergimbel@100.124.209.59"
- "Restart" button (disabled/gray, just visual — shows tooltip "Use Telegram to restart")

Pi card:
- "SSH" button — copies: "ssh rogergimbel@100.83.169.87"
- "Docker" button — links to Pi's Portainer/Docker dashboard if available

These are small icon buttons in the card header, next to the device name. Hover tooltip explains each.
```

---

## Implementation Order

1. **Critical 1** — Fix "Degraded" → "Online" status logic
2. **Critical 2** — Fix progress bar color thresholds (AGAIN — didn't take effect)
3. **Fix 3** — Breadcrumb extra segment
4. **Fix 4** — Summary card dashes → real values
5. **Fix 5** — Theme toggle label confusion
6. **Fix 6** — Verify tab content renders (Roger to check visually)
7. **Enhancement 9** — PWA manifest + favicon (high value, easy)
8. **Enhancement 11** — Sticky header on scroll
9. **Enhancement 12** — Section headers for grouping
10. **Enhancement 8** — Bottom nav active state
11. **Enhancement 7** — RAM warning pulse
12. **Enhancement 10** — Pull-to-refresh mobile
13. **Enhancement 13** — Quick action buttons on device cards
