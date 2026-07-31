# 01 — refactor(progress): define ProgressTracker domain interface and server Drizzle adapter

**What to build:** Create `src/lib/progress/progressTracker.ts` defining the `ProgressTrackerAdapter` domain interface (`getProgress`, `recordSubmission`, `getFailedAttempts`, `calculateModuleProgress`) and implement `DrizzleProgressAdapter` for direct server-side database access using `submissionRepo.ts` and `streak.ts`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `ProgressTrackerAdapter` interface is exported from `src/lib/progress/progressTracker.ts`.
- [ ] `DrizzleProgressAdapter` implements `ProgressTrackerAdapter` using Drizzle ORM transactions.
- [ ] Unit tests in `src/lib/progress/progressTracker.test.ts` verify streak calculation and submission recording logic.
