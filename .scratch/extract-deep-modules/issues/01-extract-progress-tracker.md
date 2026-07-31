# 01 — Extract Progress Tracker service + hook + tests

**What to build:** Progress state management (completed Chapter IDs, Streak, per-Chapter failed attempts) extracted from the page shell into service functions backed by the /api/submissions API, with a thin React hook adapter.

**Blocked by:** None — can start immediately.

**Status: done

- [x] Service functions created: `fetchProgress`, `recordSubmission`, `fetchFailedAttemptsForChapter`, `incrementFailedAttempts`
- [x] `useProgressTracker` hook created with Progress state + methods delegating to service functions
- [x] Service functions tested with mocked `fetch` (node environment) — verifies correct API calls and state updates
- [x] `incrementFailedAttempts` is a local state mutation only (no API call)
