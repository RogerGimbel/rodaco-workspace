---
name: memory-search
description: Search the agent's long-term memory and session history using QMD semantic search. Use this when you need to recall past conversations, stored knowledge, or previously learned information.
metadata: {"clawdbot":{"emoji":"🧠","requires":{"bins":["qmd"]}}}
---

# memory-search

Search agent memory using QMD (Quick Markdown Search) with BM25 + vector similarity.

## Basic search (BM25)
Fast keyword-based search:
```bash
qmd search "your query here" -n 5
```

## Vector search
Semantic similarity search using embeddings:
```bash
qmd vsearch "your query here" -n 5
```

## Full search with reranking
Combined search with query expansion and neural reranking (slower but most accurate):
```bash
qmd query "your query here" -n 5
```

## Search specific collections
Filter by collection name:
- `memory` - Workspace knowledge files
- `sessions` - Past conversation sessions

```bash
qmd search "query" -c memory -n 5
qmd search "query" -c sessions -n 5
```

## Output formats
- Default: formatted snippets with context
- `--json` - JSON output with full metadata
- `--files` - Just file paths and scores
- `--full` - Full document content instead of snippets

## Examples
```bash
# Find information about Roger
qmd search "Roger Gimbel" -n 3

# Find past discussions about media stack
qmd search "media stack" -c sessions -n 5

# Semantic search for infrastructure topics
qmd vsearch "home network setup" -n 3
```

**NOTE:** Use `qmd search` for quick lookups, `qmd vsearch` for concept matching, and `qmd query` when you need the most relevant results.
