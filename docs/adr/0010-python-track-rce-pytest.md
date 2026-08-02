# 10. Python Track RCE via pytest stdout parsing

Date: 2026-08-02

## Status

Accepted

## Context

Adding a Python Mastery Track requires a Remote Code Execution runner for learner Submissions. The Go runner uses `go test -json`; the TypeScript runner uses vitest's JSON reporter. Python has no compile step — syntax and import errors surface at test-run time — so the execution strategy must handle a dynamically typed, interpreted runtime.

## Decision

1. **Test runner**: Use `pytest` (`/usr/bin/python3 -m pytest -v --tb=short`). Chosen over the stdlib `unittest` for richer assertions and failure output, and over `pytest --json-report` to avoid an extra pip plugin dependency.
2. **Output parsing**: Parse verbose pytest stdout for per-test `PASSED`/`FAILED` lines and totals via a pure `parsePytestOutput` function. No structured JSON output.
3. **Sandbox layout**: `solution.py` (learner code) + `test_solution.py` (test suite, `from solution import ...`), mirroring the TypeScript `solution.ts` + test layout. Test file name `test_solution.py` enables pytest auto-discovery.
4. **Timeouts**: Reuse the existing sandbox process-tree timeout (5s default) rather than adding the `pytest-timeout` plugin. The shared sandbox util now reports `timedOut` on kill so the runner maps timeouts to `compileError: 'Execution timed out'`.
5. **Interpreter resolution**: The runner invokes the system Python that carries pytest (`/usr/bin/python3`) directly, since the pyenv shim on the host lacks pytest.

## Consequences

- Python Submissions route through the same `LanguageExecutor` interface and `SubmissionExecutionResult` shape as Go and TypeScript, keeping the RCE registry polymorphic.
- No new runtime dependencies are introduced for the platform; pytest is a host prerequisite like the Go toolchain.
- Failure modes differ from compiled languages: a broken import or syntax error appears as a pytest collection error, surfaced as a `compileError` rather than a compile-step error.
