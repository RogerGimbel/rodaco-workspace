# OpenClaw Research

## 2026-02-14 — Mission Control v3 API Architecture
- **Finding:** Express route registration with wildcard paths doesn't work in older versions
- **Source:** Overnight build debugging
- **Actionable:** Use exact paths or query params instead of wildcards

## 2026-02-13 — Self-Healing Architecture
- **Finding:** 4-layer MacBook + 6-component Pi health system provides full coverage
- **Source:** Full resilience audit
- **Actionable:** Document as reference architecture for other deployments

## 2026-02-11 — iCloud Sync Pitfalls
- **Finding:** iCloud changes file ownership (UID 501) breaking container writes; creates recursive folder duplication
- **Source:** Obsidian setup debugging
- **Actionable:** Use one-directional sync; clean recursive duplicates immediately

## 2026-02-09 — OpenClaw v2026.2.9 Features
- **Finding:** Grok web search built-in, no Brave API needed
- **Source:** Update notes
- **Actionable:** Remove Brave API references, use tools.web.search.provider: "grok"
