# 02 — refactor(rce): implement executeSubmission engine seam and workspace lifecycle

**What to build:** The core `executeSubmission` domain service in `src/lib/rce/rceEngine.ts` that manages temporary workspace directory creation (`fs.mkdtemp`), Go toolchain path and environment variable setup (`GOROOT`, `GOCACHE`, `PATH`), child process execution (`execAsync`) with a 5000ms timeout guard, delegation to `parseGoTestStream`, and guaranteed directory cleanup in a `finally` block.

**Blocked by:** 01 — refactor(rce): extract parseGoTestStream parser seam and unit test suite

**Status:** done

- [x] `executeSubmission(params: ExecuteSubmissionParams): Promise<SubmissionExecutionResult>` is implemented and exported from `src/lib/rce/rceEngine.ts`.
- [x] Automatically creates temporary directory and writes `go.mod`, `main.go`, and `main_test.go`.
- [x] Enforces 5000ms execution timeout (`RCE_TIMEOUT_MS`).
- [x] Guaranteed directory removal in `finally` block even when process fails or times out.
- [x] Integration tests in `src/lib/rce/rceEngine.test.ts` pass cleanly when running Go test execution against host Go toolchain.
