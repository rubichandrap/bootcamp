# 02 — SQLite Schema & Progress Tracking Persistence

**What to build:** Database storage using SQLite and Drizzle ORM to persist modules, chapters, user progress, and submission history, ensuring that completed chapters and test run logs remain saved across application restarts.

**Blocked by:** 01 — App Skeleton & Basic Host RCE Execution Pipeline

**Status:** ready-for-agent

- [ ] SQLite database setup with Drizzle ORM schema defining `users`, `modules`, `chapters`, `user_progress`, and `submissions`.
- [ ] Server Action / API route `/api/submissions` to log submission attempts and test results.
- [ ] Database helper functions to fetch chapter completion states and overall module progress.
- [ ] Integration tests verifying progress mutation and state persistence.
