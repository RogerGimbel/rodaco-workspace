# Backup System Fix Plan — 2026-02-13

## Status: ✅ COMPLETE (Phases 1-4)

---

## Phase 1: Secrets ✅
- [x] Scrubbed moltbook_sk_, am_19..., R0dac0_B33r... from MEMORY.md, knowledge/MEMORY.md, memory/2026-01-31.md
- [x] Fixed bin/email to use $AGENTMAIL_API_KEY env var instead of hardcoded key
- [x] Stored BeerPair password in ~/.openclaw/credentials/beerpair.txt
- [x] Rewrote git history (orphan branch, single clean commit)
- [x] Force pushed clean history to GitHub
- [x] Moved PAT from remote URL to .git-credentials (gitignored)
- [ ] **Roger TODO:** Rotate Moltbook API key and AgentMail API key (old ones are in GitHub's reflog for ~90 days, then gone)

## Phase 2: Cron Collision ✅
- [x] Disabled host-side `backup-to-pi.sh` cron (commented out, script renamed .disabled)
- [x] Container-side OpenClaw cron is sole backup mechanism (4 AM MT daily)

## Phase 3: Repo Bloat ✅
- [x] Added to .gitignore: *.png, *.pdf, bin/gh, image dirs, .git-credentials
- [x] Removed 37 PNGs, 1 PDF (14MB), bin/gh (37MB) from tracking
- [x] Files still exist on disk, just not in git

## Phase 4: Script Hardening ✅
- [x] Added "file changed" error handler to BOTH workspace and config tar (run_tar wrapper)
- [x] Added gzip -t integrity verification after each archive
- [x] Corrupt archives get deleted instead of rotating into day-of-week slot
- [x] Added .git-credentials to backup exclusions
- [x] Added error counter — script exits 1 if any errors occurred
- [x] Cleaned 744MB of old backup artifacts from Pi
- [x] Added detailed comments explaining what's excluded and why
- [x] Tested full run: workspace 85MB ✓ verified, config 140MB ✓ verified

## Phase 5: Nice-to-Haves (Deferred)
- [ ] Deduplicate images across beerpair-deploy/, knowledge/, mission-control/
- [ ] Antfarm workflow memory stays excluded (220MB, rebuildable, documented in script)

## Final Architecture
- **Daily 4 AM MT:** OpenClaw cron → backup-to-pi (tar+ssh+verify) → backup-to-github (git push)
- **Pi retention:** 7 day-of-week + 14 dated snapshots, auto-pruned
- **GitHub:** Full version history, .gitignore handles exclusions
- **PAT storage:** /home/node/workspace/.git-credentials (chmod 600, gitignored, backup-excluded)
- **Secrets:** None in git history. Credentials in env vars or ~/.openclaw/credentials/

*Completed: 2026-02-13 14:31 MT*
