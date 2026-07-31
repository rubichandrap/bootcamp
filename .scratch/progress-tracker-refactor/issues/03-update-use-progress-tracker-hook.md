# 03 — refactor(progress): update useProgressTracker hook to consume ProgressTracker seam

**What to build:** Refactor `src/hooks/useProgressTracker.ts` to consume `ProgressTrackerAdapter` (defaulting to `HttpProgressAdapter`), encapsulating raw state setters behind high-level domain actions (`loadProgress`, `recordSubmission`, `loadFailedAttempts`, `incrementFailedAttempts`).

**Blocked by:** 02 — refactor(progress): create HttpProgressAdapter and thin /api/submissions route

**Status:** ready-for-agent

- [ ] `useProgressTracker.ts` uses `HttpProgressAdapter` and exposes domain actions.
- [ ] `src/app/page.tsx` consumes the deepened `useProgressTracker` hook seamlessly.
- [ ] All Vitest unit and integration test suites pass with 100% success.
