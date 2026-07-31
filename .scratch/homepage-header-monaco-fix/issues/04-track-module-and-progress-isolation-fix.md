# 04 — Track Module & Progress Isolation Bug Fixes

**What to build:** Fix module list not updating when switching tracks via select input, and fix cross-track progress leakage where marking a chapter completed in Go marked the same-slug chapter completed in TypeScript.

**Blocked by:** None — immediate bugfix.

**Status:** completed

- [x] `fetchModules` and `fetchChapter` support `trackSlug` parameter.
- [x] `TrackWorkspace` effect re-fetches modules on `initialTrackSlug` change and auto-selects first chapter of new track.
- [x] `loadProgress`, `loadFailedAttempts`, and `getLatestSubmission` query database filtered by `trackId`.
- [x] `readingSession` and `challengeSession` record submissions with `trackId`.
- [x] Cross-track progress leakage resolved and verified with vitest suite.
