# 04 — Extract Reading Session service + hook + tests

**What to build:** Mark-as-read for Reading Chapters extracted from the page shell into a service function with injected ports, with a thin React hook adapter.

**Blocked by:** Ticket 01 (Extract Progress Tracker), Ticket 02 (Extract Chapter Lifecycle).

**Status:** ready-for-agent

- [ ] `markAsRead` service function created with injected ports: `recordSubmission`, `onAdvance`
- [ ] `useReadingSession` hook created — exposes `content`, `title`, `isPassed`, `markAsRead`
- [ ] `markAsRead` tested with stub ports — verifies: posts READING_COMPLETION_MARKER submission with passed=true, then calls onAdvance
- [ ] Hook derives `content` and `title` from current Chapter state
