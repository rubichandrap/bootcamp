# 01 — Python Track RCE plumbing + `00-basics` module

**What to build:** Make Python a fully selectable, executable Track. A learner can switch to "Python Mastery" in the header Track switcher, read the Basics Module's Reading Chapters, run its Challenge Chapters against a pytest suite in the RCE Engine, and complete the Module's Assessment to unlock the next Module. This is the tracer bullet that proves the whole Python path works end-to-end; later module tickets ride on it.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Python Track appears in Track Catalog at order 3 and in header Track switcher (switcher derives from track config, no hardcoded list)
- [x] Track config extended for Python: codeFile `solution.py`, testFile `test_solution.py`, solutionFile `solution.py`, language `python` (Monaco syntax highlighting works)
- [x] New `PythonExecutor` implements `LanguageExecutor`: writes `solution.py` + `test_solution.py` (`from solution import X`) to sandbox tmp dir, runs `python3 -m pytest -v --tb=short`, reuses existing 5s process-tree timeout
- [x] `parsePytestOutput` pure function maps pytest stdout/stderr to `SubmissionExecutionResult` (per-test pass/fail, totals, import/syntax errors and timeouts as `compileError`)
- [x] Python registered in executor registry (aliases `python`, `py`); `getLanguageExecutor('python')` dispatches correctly
- [x] Chapter page code-file label derives from track config (no `typescript ? ts : go` ternary) so Python shows `solution.py`
- [x] `-race` toggle renders only on the Go Track, not Python
- [x] ADR-0010 recorded: pytest runner choice, stdout parsing, no JSON plugin, `solution.py`/`test_solution.py` layout
- [x] Unit tests: `parsePytestOutput` fixtures (pass/fail/import error/syntax error/timeout/ERROR status), executor dispatch, track config entries
- [x] `00-basics` Module authored, 7 chapters: Basics — syntax, types, control flow, functions (3 Reading, 3 Challenge, 1 Assessment)
- [x] All Basics challenge `testCode` suites verified locally green against real solutions via pytest

## Blocked by

None — can start immediately.
