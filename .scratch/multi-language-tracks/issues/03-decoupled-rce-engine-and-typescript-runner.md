# 03 — Decoupled Polymorphic RCE Engine & TypeScript Runner

**What to build:** Refactor RCE Engine into a polymorphic runner architecture (`LanguageRunner` interface, `GoRunner`, `TypeScriptRunner`, and factory router) so learners can run TypeScript challenges and see pass/fail test execution results.

**Blocked by:** 01 — Track-Aware Content Directory & Content Engine

**Status:** ready-for-agent

- [ ] `LanguageRunner` interface defined with standardized `SubmissionExecutionResult`.
- [ ] Existing Go test runner extracted cleanly into `GoRunner`.
- [ ] `TypeScriptRunner` implemented using `vitest` / `node:test` runner with JSON reporter.
- [ ] `/api/rce/execute` dispatches to appropriate runner based on `trackId`.
- [ ] Unit tests for `TypeScriptRunner`, `GoRunner`, and `/api/rce/execute` pass cleanly.
