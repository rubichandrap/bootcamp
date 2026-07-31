# 03 — refactor(progress): update useProgressTracker hook to consume ProgressTracker seam

**What to build:** Update the frontend `useProgressTracker` React hook to consume `ProgressTrackerAdapter` using default parameter dependency injection. The hook orchestrates local React state updates, handles optimistic attempt count increments, and maintains network error fallbacks while delegating I/O to the adapter.

**Blocked by:** 02 — refactor(progress): create HttpProgressAdapter and thin /api/submissions route

**Status:** ready-for-agent

- [ ] `useProgressTracker` accepts an optional `ProgressTrackerAdapter` instance, defaulting to the HTTP progress adapter.
- [ ] Optimistic local updates and network failure fallback logic are preserved.
- [ ] Application page components consume the updated hook seamlessly.
- [ ] React hook unit tests and UI integration tests pass with 100% success.
