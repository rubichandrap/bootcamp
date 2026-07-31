# 03 — Extract Challenge Session service + hook + tests

**What to build:** Challenge execution orchestration (RCE execution → record Submission → auto-advance on pass) extracted from the page shell into a service function with injected ports, with a thin React hook adapter managing editor state.

**Blocked by:** Ticket 01 (Extract Progress Tracker), Ticket 02 (Extract Chapter Lifecycle).

**Status:** ready-for-agent

- [ ] `runChallenge` service function created with injected ports: `executeRce`, `recordSubmission`, `onAdvance`
- [ ] `useChallengeSession` hook created with editor state (code, testCode, activeTab, result, isLoading, enableRaceCheck) + `isUnlocked` computation
- [ ] `runChallenge` tested with stub ports — verifies: execute → record → advance on success; no advance on failure; error result set on RCE failure
- [ ] Hook exposes all editor state + `run` method + `isUnlocked` + `toggleRaceCheck`
