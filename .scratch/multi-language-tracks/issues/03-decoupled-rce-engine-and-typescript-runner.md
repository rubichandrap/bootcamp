# 03 — Decoupled Polymorphic RCE Engine & TypeScript Runner

**What to build:** Refactor RCE Engine into a polymorphic runner architecture (`LanguageExecutor` interface, `GoExecutor`, `TypeScriptExecutor`, and factory router) so learners can run TypeScript challenges and see pass/fail test execution results.

**Blocked by:** 01 — Track-Aware Content Directory & Content Engine

**Status:** done

- [x] `LanguageExecutor` interface defined with standardized `SubmissionExecutionResult`.
- [x] Existing Go test runner extracted cleanly into `GoExecutor`.
- [x] `TypeScriptExecutor` implemented using `vitest` / `node:test` runner with JSON reporter.
- [x] `/api/rce/execute` dispatches to appropriate runner based on `trackId`.
- [x] Unit tests for `TypeScriptExecutor`, `GoExecutor`, and `/api/rce/execute` pass cleanly.
