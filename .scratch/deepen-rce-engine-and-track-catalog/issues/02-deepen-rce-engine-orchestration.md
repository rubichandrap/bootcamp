# 02 — Deepen RCE Engine Execution Orchestration and Standardize Error Seam (#45)

**What to build:** Encapsulate RCE execution validation, timeouts, and subprocess failures inside the RCE Engine so callers receive standardized submission evaluation results without unhandled exceptions or subprocess leakage.

**Blocked by:** #44 — Record ADR-0009 for RCE Engine & Track Catalog Seams

**Status:** ready-for-agent

- [ ] `executeSubmission` in `src/lib/rce/rceEngine.ts` validates inputs and handles timeouts and execution failures gracefully.
- [ ] Returns a standardized `SubmissionExecutionResult` object with `success: false` and `compileError` populated on failure.
- [ ] `src/app/api/rce/execute/route.ts` is simplified to a thin 3-line handler delegating directly to `executeSubmission`.
- [ ] Unit tests in `src/lib/rce/rceEngine.test.ts` verify behavior across Go and TypeScript runners without leaking subprocess execution details.
