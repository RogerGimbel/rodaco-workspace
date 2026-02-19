# Gemini 3.1 Pro Preview

**Released:** February 19, 2026
**Status:** Preview (GA coming soon)
**Source:** Google Blog, Artificial Analysis Intelligence Index v4.0, OfficeChai

---

## Access

- **Model ID (Gemini API):** `gemini-3.1-pro-preview`
- **Agentic variant:** `gemini-3.1-pro-preview-customtools` (tuned for tool use/bash)
- **Our key:** `GEMINI_API_KEY` (AIzaSyDaO0Jf...) — confirmed in model list, no upgrade needed
- **Also on OpenRouter:** `google/gemini-3.1-pro-preview` (fallback route)
- **Availability checker:** `bin/check-gemini-31` (exit 0=live, 1=overloaded, 2=error)
- **Poller cron:** `gemini-3.1-availability-check` (ID: `61f6cfa2`) — every 30 min, self-destructs + Telegrams Roger when live

---

## Specs

| Property | Value |
|----------|-------|
| Context window | 1M tokens |
| Max output | ~65K tokens |
| Modalities | Text, image, video, audio, code |
| Pricing (≤200K ctx) | $2/$12 per 1M (input/output) |
| Pricing (>200K ctx) | $4/$18 per 1M |
| Cache read | $0.20–0.40/M |
| Cache write | $0.375/M |
| Speed | ~114 output tokens/sec |

**Cost vs competitors (full Artificial Analysis benchmark suite):**
- Gemini 3.1 Pro Preview: **$892**
- Claude Opus 4.6 (max): **$1,800+**
- GPT-5.2 (xhigh): **$1,800+**

---

## Overall Intelligence Rankings (Artificial Analysis Index v4.0)

| Rank | Model | Score |
|------|-------|-------|
| 🥇 1 | **Gemini 3.1 Pro Preview** | **57** |
| 🥈 2 | Claude Opus 4.6 | 53 |
| 🥉 3 | Claude Sonnet 4.6 | 51 |
| 4 | GPT-5.2 (xhigh) | ~51 |

Leads in **6 of 10 categories**: Terminal-Bench Hard, SciCode, AA-Omniscience, Humanity's Last Exam, GPQA Diamond, CritPt.

---

## Coding Benchmarks

### Terminal-Bench Hard (agentic coding — real terminal tasks, Docker-verified)
*Most realistic real-world coding benchmark — software engineering, sysadmin, debugging, compiling, server config*

| Rank | Model | Score |
|------|-------|-------|
| 🥇 1 | **Gemini 3.1 Pro Preview** | **53.8%** |
| 🥈 2 | Claude Sonnet 4.6 (adaptive reasoning, max effort) | 53.0% |
| 🥉 3 | Claude Opus 4.6 (non-reasoning, high effort) | 48.5% |
| 4 | GPT-5.2 | 47.0% |

### SWE-bench Verified (fixing real GitHub issues)
*GPT-5.1 Codex's home turf — best scores require max reasoning effort*

| Model | Score | Notes |
|-------|-------|-------|
| GPT-5.1 Codex-Max (xhigh) | **77.9%** | Max reasoning, specialized coding model |
| GPT-5.1 Codex (high) | 73.7% | High reasoning effort |
| GPT-5.1 Codex (medium) | 66.0% | Official SWE-bench leaderboard |
| Gemini 3.1 Pro Preview | TBD | Too new, not yet scored |
| Claude Opus 4.6 | ~70%+ | Competitive |

### SciCode (research-level scientific coding)
Gemini 3.1 Pro Preview **leads** — one of its 6 top categories.

### Coding Index (Artificial Analysis composite)
- Gemini 3.1 Pro Preview: **55.5** (top)

---

## Other Key Benchmarks

| Benchmark | Gemini 3.1 | Notes |
|-----------|-----------|-------|
| ARC-AGI-2 | **77.1%** | 2x its predecessor (Gemini 3 Pro) |
| GPQA Diamond | **94.1%** | Scientific reasoning, leads field |
| Humanity's Last Exam | Leads | Hardest general knowledge test |
| CritPt | **18%** | Research-level physics, +5pts above next best |
| AA-Omniscience (hallucination) | Leads | Hallucination rate dropped 38pp vs Gemini 3 Pro |
| GDPval-AA (general agentic) | **4th–5th** | Claude Sonnet/Opus + GPT-5.2 still lead here |

---

## Where Claude Still Beats It

**GDPval-AA (general agentic workflows)** — multi-step real-world task planning and execution. Claude Sonnet 4.6, Opus 4.6, and GPT-5.2 all rank above Gemini 3.1 Pro Preview here. For heavy autonomous agent pipelines, Anthropic retains an edge.

---

## GPT-5.1 Codex Context

- Released November 13, 2025
- Specialized coding model — SWE-bench is its benchmark
- Beats Gemini on SWE-bench (with max reasoning), but loses on Terminal-Bench Hard
- More expensive and overkill as a daily driver
- We have the key (`OPENAI_API_KEY`) but it's not our current daily driver

---

## Daily Driver Assessment

**Roger's intent:** Test as daily driver once 503s clear (poller active).

**Case for switching:**
- #1 on Intelligence Index, beats Opus and Sonnet overall
- #1 on Terminal-Bench Hard (most realistic coding benchmark)
- Half the price of Opus, comparable to Sonnet
- Same 1M context window
- Hallucination rate massively improved vs Gemini 3 Pro

**Case for caution:**
- Still in Preview (GA "coming soon")
- General agentic workflows (GDPval-AA) — Claude still leads
- No Gemini-equivalent of Anthropic's "thinking" mode for deep reasoning
- Preview models can have tighter rate limits
- Google rate limits on preview tier may bite on heavy cron usage

**Rollback:** Instant — `/model sonnet`

**Switchover plan:** `memory/gemini-31-switchover-plan.md`

---

## History

- [2026-02-19] Announced and released in preview
- [2026-02-19] Confirmed in our GEMINI_API_KEY model list
- [2026-02-19] 503 on launch day (high traffic)
- [2026-02-19] Availability poller set up (cron ID: 61f6cfa2, every 30 min)
- [2026-02-19] Benchmark research completed and stored
