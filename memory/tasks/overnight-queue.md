# Overnight Build Queue

## Projects Under Active Overnight Review

### 1. Mission Control v3
**Project:** mission-control/
**Priority:** P1
**Scope:** Bug fixes, UI improvements, API enhancements
**KB:** knowledge/projects/mission-control-v3/
- [x] Agent page role/identity icons → Lucide (mc-v3-ui-fixes #9) — 2026-02-20

### 2. rogergimbel.dev
**Project:** rogergimbel-site/
**Priority:** P2
**Scope:** Polish, content updates, performance
**KB:** knowledge/projects/rogergimbel-site/summary.md

### 3. rodaco.co
**Project:** rodaco-site/
**Priority:** P2
**Scope:** Polish, content updates, performance
**KB:** knowledge/projects/rodaco-site/summary.md

### 4. BladeKeeper ⭐ NEW
**Project:** projects/bladekeeper.app/
**Priority:** P1
**Scope:** WIDE OPEN — UI/UX enhancements, new features, modernization, creativity welcome
**KB:** knowledge/projects/bladekeeper/summary.md
**Skill:** skills/bladekeeper/SKILL.md
**Deploy:** Push to GitHub → Lovable syncs → Roger publishes
**Risk tolerance:** HIGH — this is a fun MVP prototype, be adventurous
**Supabase:** zocftrkoaokqvklugztj

#### Priority Fixes (Do First)
- [x] **Forgot password** on login screen (Supabase auth reset flow) ✅ 2026-02-19
- [x] **Reset password** in user profile/settings page ✅ 2026-02-19
- [x] Profile/settings page general cleanup ✅ 2026-02-19 (account info + theme picker)

#### BladeKeeper Enhancement Ideas
- [ ] Modernize UI — the app is ~1 year old, lots of UX patterns have evolved
- [ ] Improve blade card design (better photos, hover effects, animations)
- [ ] Add blade detail page enhancements (bigger photos, swipe gallery, related info)
- [ ] Dark mode polish (ensure consistent theming)
- [ ] Mobile UX improvements (touch-friendly, swipe gestures)
- [ ] Empty states and onboarding flow for new users
- [ ] Collection card preview improvements (mosaic, cover image)
- [ ] Search/filter improvements (by steel type, manufacturer, blade type, price range)
- [x] Sort options (newest, oldest, value, alphabetical) ✅ 2026-02-19
- [x] Blade statistics dashboard (total value, breakdown by type/maker/steel) ✅ 2026-02-19
- [ ] AI features prep (Snap & Identify button, Ask AI per blade)
- [ ] Animation and micro-interactions
- [ ] Accessibility improvements
- [ ] Performance optimization (lazy loading images, virtual scrolling for large collections)
- [ ] PWA improvements (offline support, install prompt)

#### What's Done
- [x] 31 knives imported with photos ✅
- [x] Collections page separated from My Blades ✅
- [x] Create/edit/delete collections ✅
- [x] Add/remove blades from collections ✅
- [x] Share collections via link ✅
- [x] UI overhaul — warm amber palette, modern card grid ✅ 2026-02-19
- [x] Global card border fix — subtle 40% opacity borders in dark mode ✅ 2026-02-19
- [x] Dark mode polish (card borders, activity items, settings) ✅ 2026-02-19
- [x] **Features / Learn More page** — public marketing page at `/features` with breadcrumbs, auth-aware CTAs, coming soon section ✅ 2026-02-19

## Tonight's Ambitious Sprint (2026-02-20)

### Priority 1 — Must Ship Tonight
- [ ] **[agent-first][BladeKeeper][D4] Audit read hardening** *(code complete locally 2026-02-21; deploy/verify blocked: missing `SUPABASE_ACCESS_TOKEN` + admin bearer token in runtime)*
  - Add stable filter + pagination contract to `/audit` (`action`, `resource`, `result`, `from`, `to`, `limit`, `cursor`)
  - Ensure admin scope enforcement stays intact
  - Verify with `bin/rodaco agent audit bladekeeper --params 'limit=20&action=propose' --token <bearer>` and at least one date-range query

- [ ] **[rogergimbel.dev][UI][mobile-first] Hero conversion pass**
  - Improve H1/subhead readability + spacing rhythm
  - Clarify CTA hierarchy above the fold (primary = contact intent)
  - Confirm no mobile clipping/overlap at 390x844 and 430x932

- [ ] **[rodaco.co][UI][mobile-first] Hero hierarchy + CTA legibility**
  - Reduce logo dominance and rebalance fold toward value prop + CTA
  - Improve nav/CTA contrast over background media
  - Confirm CTA tap targets >=44px and text contrast passes visual check

- [ ] **[bladekeeper.app][landing][UX] Above-fold clarity pass**
  - Increase hero text contrast over background imagery
  - Clarify primary CTA intent (account creation path)
  - Surface clear Login affordance for returning users

- [ ] **[cross-site][QA] Browser-driven E2E proof pack**
  - Run desktop + mobile checks on all three sites using agent-browser snapshots
  - Capture M5 Chrome screenshots with `--virtual-time-budget` for SPA reliability
  - Store findings + before/after evidence in `memory/tasks/overnight-ui-audit-2026-02-20.md`

### Priority 2 — If Time Remains
- [ ] **[agent-first][BladeKeeper][D5] Apply policy gates design draft**
  - Draft allowlist/risk classes (`safe/sensitive/destructive`) and propose enforcement points in `knowledge/infrastructure/agent-first-v0-spec.md`

- [ ] **[agent-first][BladeKeeper][D6-prep] Test matrix skeleton**
  - Prepare pass/fail matrix for allowed vs blocked apply payloads so implementation can be executed fast next run
