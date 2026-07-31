# 01 — refactor(progress): define ProgressTracker domain interface and server Drizzle adapter

**What to build:** Establish the unified progress tracking domain seam and server-side database adapter. This allows server components and backend services to record learner submissions, query daily streaks, fetch completed chapters, and calculate progress percentages directly without network latency or HTTP fetch wrappers.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Domain models (`UserProgress`, `RecordSubmissionInput`, `RecordSubmissionResult`) and `ProgressTrackerAdapter` interface are defined and exported.
- [ ] Pure synchronous `calculateProgressPercent` calculation function is exported and tested.
- [ ] `DrizzleProgressAdapter` implements `ProgressTrackerAdapter` using atomic database transactions.
- [ ] Domain unit test suite verifies streak calculation, completed chapter tracking, and submission recording.
