# 02 — refactor(progress): create HttpProgressAdapter and thin /api/submissions route

**What to build:** Implement `HttpProgressAdapter` satisfying `ProgressTrackerAdapter` for browser client code. Thin `src/app/api/submissions/route.ts` to delegate GET/POST requests directly to `DrizzleProgressAdapter`.

**Blocked by:** 01 — refactor(progress): define ProgressTracker domain interface and server Drizzle adapter

**Status:** ready-for-agent

- [ ] `HttpProgressAdapter` is implemented in `src/lib/progress/progressTracker.ts`.
- [ ] `src/app/api/submissions/route.ts` delegates GET and POST handling to `DrizzleProgressAdapter`.
- [ ] API endpoint tests in `src/app/api/submissions/route.test.ts` pass cleanly without regressions.
