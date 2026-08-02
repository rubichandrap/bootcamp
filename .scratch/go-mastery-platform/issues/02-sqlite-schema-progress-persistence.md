# 02 — SQLite Schema & Progress Tracking Persistence

**What to build:** Database storage using SQLite and Drizzle ORM to persist modules, chapters, user progress, and submission history, ensuring that completed chapters and test run logs remain saved across application restarts.

**Blocked by:** 01 — App Skeleton & Basic Host RCE Execution Pipeline

**Status:** done

- [x] SQLite database setup with Drizzle ORM schema defining `users`, `modules`, `chapters`, `user_progress`, and `submissions`.
- [x] Server Action / API route `/api/submissions` to log submission attempts and test results.
- [x] Database helper functions to fetch chapter completion states and overall module progress.
- [x] Integration tests verifying progress mutation and state persistence.
