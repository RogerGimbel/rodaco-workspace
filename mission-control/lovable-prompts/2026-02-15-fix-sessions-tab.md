# Fix: Agent Sessions Tab — React Error #31

## Problem
The Sessions tab on the Agent page (`/agent`) crashes with "Minified React error #31" — which means "Objects are not valid as a React child." The data loads briefly then the component crashes.

## API Response Shape
The endpoint `GET /api/v3/agent/sessions` returns:
```json
{
  "sessions": [
    {
      "key": "7534f299-e58b-4e50-855f-40ccfc4e399f",
      "file": "7534f299-e58b-4e50-855f-40ccfc4e399f.jsonl",
      "kind": "main",
      "type": "main",
      "startedAt": "2026-02-15T17:54:10.616Z",
      "age": "2h",
      "size": 0
    }
  ],
  "active": [...same shape...],
  "recent": [...same shape...],
  "total": 50
}
```

ALL fields in each session object are **strings or numbers** — none are objects or arrays.

## Fix Required
In the Sessions tab component (likely `AgentSessions.tsx` or similar):

1. Use `data.sessions` (array) as the data source — NOT `data.active` or `data.recent`
2. When rendering each session, make sure you're rendering **string values only**, not the session object itself
3. For each session, display:
   - `session.key` (truncated to first 8 chars) as the session ID
   - `session.type` — badge showing "main" or "isolated"
   - `session.age` — how long ago (e.g. "2h", "15m", "30s")
   - `session.startedAt` — formatted date
   - `session.file` — the filename
4. Use `String()` or optional chaining on any value before rendering: `{String(session.key)}` 
5. Show `data.total` as the total count in a header
6. If `data.sessions` is empty or undefined, show: "No sessions found" (not a crash)

## Key Point
The crash is because somewhere a session object (or a field that could be an object) is being passed directly as a React child. Wrap ALL rendered values in `String()` to be safe, or ensure only primitive values are passed to JSX.
