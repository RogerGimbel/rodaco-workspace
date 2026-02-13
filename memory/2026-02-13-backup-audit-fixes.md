# Backup Audit Fix Plan v2 — 2026-02-13

## Context
Second audit of backup system found 8 issues after initial implementation.
Work through top-to-bottom. Check boxes as completed.

---

## 1. Bump cron timeout (HIGH)
- [ ] Update cron job `d1a919c2-b9d9-4ab6-a1ce-e4215d559536` timeout from 300s → 600s
- [ ] Verify: `cron list` shows updated timeout

## 2. Remove Claude chat exports from git (HIGH)
- [ ] Add to .gitignore: `claude-conversations.json`, `claude-memories.json`, `claude-projects.json`
- [ ] `git rm --cached claude-conversations.json claude-memories.json claude-projects.json`
- [ ] Verify: `git ls-files | grep claude-` returns nothing

## 3. Shrink .git (HIGH)
- [ ] `git gc --aggressive --prune=now`
- [ ] `git repack -a -d --depth=250 --window=250`
- [ ] Check size: should drop from 61MB significantly
- [ ] Note: old packfiles contain the 37MB gh binary and PNGs from pre-orphan history

## 4. Deduplicate .gitignore (MEDIUM)
- [ ] Remove duplicate entries: `.claude/`, `.clawdhub/`, `.local/`, `.npm-cache/`, `antfarm/`, `.git-credentials`
- [ ] Organize into clean sections
- [ ] Verify no tracked files sneak back in

## 5. Write restore procedure (MEDIUM)
- [ ] Create `knowledge/infrastructure/intel-macbook/restore-procedure.md`
- [ ] Document: what's backed up, where it lives, step-by-step restore
- [ ] Cover both scenarios: MacBook dies (restore from Pi) and Pi dies (restore from GitHub)
- [ ] Include: Docker volume recreation, env var setup, SSH key restoration
- [ ] Include: what's NOT backed up and needs manual recreation (qmd cache, node_modules, pylib)

## 6. Make backup failure alerting explicit (MEDIUM)
- [ ] Edit `bin/backup-to-pi`: on error, write failure message to a status file
- [ ] Edit `bin/backup-to-github`: same
- [ ] Create wrapper script `bin/backup-all` that runs both and sends Telegram alert on failure
- [ ] Update cron job to call `bin/backup-all` instead of relying on sub-agent prompt
- [ ] Or: simpler — just update the cron prompt to be more explicit about HOW to alert

## 7. Gitignore heartbeat-state.json (LOW)
- [ ] Add `heartbeat-state.json` to .gitignore (covers both `memory/` and `knowledge/memory/` copies)
- [ ] `git rm --cached memory/heartbeat-state.json knowledge/memory/heartbeat-state.json`
- [ ] These files change on every heartbeat and create noisy auto-commits

## 8. Review knowledge/openclaw.json (LOW)
- [ ] Check contents: `cat knowledge/openclaw.json | head -20`
- [ ] If it contains API keys or tokens → gitignore + rm --cached
- [ ] If it's just structure/reference → leave it, add comment noting it's safe

---

## After all fixes
- [ ] Commit all changes with descriptive message
- [ ] Push to GitHub
- [ ] Run `bin/backup-to-pi` manually — verify clean
- [ ] Run `bin/backup-to-github` manually — verify clean  
- [ ] Check .git size dropped
- [ ] Update `memory/2026-02-13-backup-fixes.md` status

*Created: 2026-02-13 ~14:45 MT*
*Status: NOT STARTED*
