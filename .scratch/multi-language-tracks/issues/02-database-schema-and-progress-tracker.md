# 02 — Database Schema & Track-Specific Progress Tracker

**What to build:** Update database schema to add `trackId` column to `user_progress` and `submissions` tables, and update progress tracker services to calculate per-track completion percentages and overall completion while maintaining a unified daily streak across all language tracks.

**Blocked by:** 01 — Track-Aware Content Directory & Content Engine

**Status:** ready-for-agent

- [ ] SQLite database schema includes `track_id` column in `user_progress` and `submissions` tables.
- [ ] `progressTracker` computes per-track completion metrics (`getTrackProgress(userId, trackId)`).
- [ ] `progressTracker` computes overall platform completion metrics (`getOverallProgress(userId)`).
- [ ] Submitting a passing challenge in any track maintains/increments the user's unified daily streak.
- [ ] Unit tests for `submissionRepo` and `progressTracker` pass cleanly.
