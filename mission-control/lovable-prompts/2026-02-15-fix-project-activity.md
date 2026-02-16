# Fix: Project Activity Tabs — Show Real Activity Data

## Problem
The Activity tab on the Projects page shows "No recent activity for this project" for both BeerPair and Ocean One. The frontend needs to fetch from a new project-specific activity endpoint.

## New API Endpoint
`GET /api/v3/projects/{projectId}/activity`

Where `{projectId}` is `beerpair` or `ocean-one`.

### Response Shape
```json
{
  "activities": [
    {
      "timestamp": "2026-02-12T12:00:00.000Z",
      "date": "2026-02-12",
      "type": "note",
      "category": "BeerPair B2B GTM Asset Sprint",
      "summary": "Massive GTM asset creation session. Built 17 sequential assets for BeerPair.com's B2B strategy.",
      "source": "2026-02-12.md"
    },
    {
      "timestamp": "2026-02-13T12:00:00.000Z",
      "date": "2026-02-13",
      "type": "milestone",
      "category": "Knowledge Graph",
      "summary": "Consolidated BeerPair files into knowledge/projects/beerpair/",
      "source": "summary.md"
    },
    {
      "timestamp": "2026-02-15T17:53:50.000Z",
      "date": "2026-02-15",
      "type": "session",
      "category": "exec",
      "summary": "Ran BeerPair API health check",
      "source": "7534f299.jsonl"
    }
  ],
  "total": 55,
  "project": "beerpair"
}
```

### Activity types
- `note` — from daily memory notes (most common)
- `milestone` — from knowledge graph history entries
- `session` — from recent live session events

## Fix Required in the Activity Tab Component

1. When the Activity tab is selected for a project, fetch: `${API_URL}/api/v3/projects/${projectId}/activity`
   - For BeerPair tab: projectId = "beerpair"
   - For Ocean One tab: projectId = "ocean-one"

2. Use `data.activities` (array) as the data source

3. Render each activity as a card or list item showing:
   - A colored dot or icon based on `activity.type`:
     - `note` → blue dot or 📝
     - `milestone` → green dot or 🏁 
     - `session` → gray dot or ⚡
   - `activity.date` — formatted as "Feb 12, 2026" or similar
   - `activity.category` — as a small label/badge above the summary
   - `activity.summary` — the main text content
   - Group activities by date when multiple activities share the same date

4. If `data.activities` is empty, show: "No activity found for this project yet"

5. Show `data.total` somewhere, like "Showing 30 of 55 activities"

6. Do NOT fetch from `/api/v3/activity` (the global endpoint) — use the project-specific one above

## Important
- All fields in each activity object are strings — safe to render directly
- The response always includes `activities` array, `total` number, and `project` string
- Use optional chaining (`?.`) on all data access to prevent crashes
