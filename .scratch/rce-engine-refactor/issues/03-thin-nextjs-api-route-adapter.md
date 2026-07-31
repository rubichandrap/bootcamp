# 03 — refactor(rce): thin Next.js API route to delegate to RCE Engine

**What to build:** Refactor `src/app/api/rce/execute/route.ts` from 177 lines of inline process execution and stream parsing down to a thin ~15-line HTTP adapter that delegates payload execution to `executeSubmission`.

**Blocked by:** 02 — refactor(rce): implement executeSubmission engine seam and workspace lifecycle

**Status:** done

- [x] `src/app/api/rce/execute/route.ts` is thinned to a simple HTTP adapter forwarding requests to `executeSubmission`.
- [x] Returns HTTP 200 with `SubmissionExecutionResult` JSON payload on successful execution.
- [x] Returns HTTP 400 when required fields (`code`, `testCode`) are missing.
- [x] Returns HTTP 500 when unhandled execution errors occur.
- [x] All existing API route tests and UI challenge execution flows pass without regressions.
