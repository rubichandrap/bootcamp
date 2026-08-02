# Feature Spec: Python Mastery Track

## Problem Statement

Learners can currently master Go and TypeScript on the platform, but there is no Python Track. Developers who want to master Python from beginner to expert level cannot choose Python in the Track Catalog, cannot execute Python Challenge Submissions against a test suite, and have no structured curriculum path to expert-level Python concepts (async, metaprogramming, C-extensions).

## Solution

Add a full Python Mastery Track to the platform. The Track contains 9 ordered Modules spanning beginner to expert, each with Reading, Challenge, and Assessment Chapters. Challenge Chapters execute learner Submissions in the RCE Engine via a new pytest-based PythonExecutor. Python appears in the Track Catalog and header Track switcher alongside Go and TypeScript, with per-Track Progress tracked independently.

## User Stories

1. As a learner, I want to see a Python Mastery Track in the Track Catalog, so that I can choose to learn Python alongside or instead of Go and TypeScript.
2. As a learner, I want to switch my active Track to Python from the header Track switcher, so that the workspace loads the Python curriculum.
3. As a learner, I want my active Track preference to persist across sessions, so that I return to Python next time automatically.
4. As a Python beginner, I want a Basics Module covering syntax, types, control flow, and functions, so that I can write my first Python programs.
5. As a Python learner, I want a Core Data Structures Module covering lists, dicts, sets, tuples, and comprehensions, so that I can represent and manipulate data idiomatically.
6. As a Python learner, I want an OOP & Protocols Module covering classes, dunder methods, and protocol-based design, so that I can model behavior with Python's object system.
7. As a Python learner, I want a Functions & Decorators Module covering first-class functions, closures, and decorators, so that I can write reusable, composable behavior.
8. As a Python learner, I want an Iterators & Generators Module covering the iterator protocol, generator pipelines, and itertools, so that I can process data streams efficiently and lazily.
9. As a Python learner, I want an Async & Concurrency Module covering async/await, the event loop, threads, processes, and the GIL, so that I can write concurrent programs.
10. As a Python learner, I want a Packaging & Testing Module covering modules, packages, venvs, pytest, and type hints, so that I can structure and verify real Python projects.
11. As an advanced Python learner, I want a Metaprogramming & Internals Module covering descriptors, metaclasses, `__slots__`, context managers, and the import system, so that I can understand and control Python's machinery.
12. As an expert Python learner, I want a Performance & C-Extensions Module covering profiling, memory behavior, Cython, ctypes, and deep GIL internals, so that I can optimize Python at the native level.
13. As a learner, I want each Module to begin with Reading Chapters, so that I build mental models before writing code.
14. As a learner, I want each Module to contain Challenge Chapters with an embedded Monaco editor, so that I can reinforce each Reading Chapter's concepts with hands-on code.
15. As a learner, I want each Python Challenge Chapter to run against a pytest test suite, so that I get pass/fail verification of my Submission.
16. As a learner, I want each Module to end with an Assessment Chapter integrating all its concepts, so that I prove mastery before unlocking the next Module.
17. As a learner, I want my passing Python Submissions to increment my daily Streak, so that my learning momentum is preserved across all Tracks.
18. As a learner, I want per-Track Progress for Python tracked separately from Go and TypeScript, so that my standing in each language is accurate.
19. As a learner, I want the Python code editor to use Python syntax highlighting, so that my code is legible in the workspace.
20. As a learner, I want the RCE console to report per-test pass/fail results for Python Submissions, so that I can diagnose failing tests.
21. As a learner, I want a compile/execution error surfaced clearly when my Python Submission fails to import or contains a syntax error, so that I know my code failed before tests ran.
22. As a learner, I want a timeout reported when my Python Submission runs too long, so that runaway code does not hang the console.
23. As a learner, I want to open the correct code/test filenames in the editor tabs for Python, so that I am not misled by Go or TypeScript filenames.
24. As a learner, I want the Go-specific race-detector toggle to appear only on the Go Track, so that irrelevant controls are not shown on Python.
25. As a content author, I want the Python curriculum organized under the standard `content/tracks/python` structure, so that adding it requires no platform refactoring.
26. As a platform maintainer, I want the Python RCE runner registered in the executor registry, so that Submissions route to pytest automatically.

## Implementation Decisions

- **Track Catalog placement**: Python Track gets `order: 3` in `track.json`, after Go (1) and TypeScript (2). Catalog sorts by the `order` field; no reordering of existing Tracks.

- **Curriculum structure**: 9 Modules × 7 Chapters each (3 Reading, 3 Challenge, 1 Assessment) = 63 Chapters, mirroring the Go/TypeScript rhythm. Each Challenge Chapter is strictly bounded to concepts taught in its preceding Reading Chapter.

  Module arc (beginner → very expert):
  1. Basics — syntax, types, control flow, functions
  2. Core Data Structures — list/dict/set/tuple, comprehensions
  3. OOP & Protocols — classes, dunder methods, protocol-based design
  4. Functions & Decorators — first-class functions, closures, decorators, functools
  5. Iterators & Generators — iterator protocol, generator pipelines, itertools
  6. Async & Concurrency — async/await, event loop, threads/processes, GIL
  7. Packaging & Testing — modules/packages, venv, pytest, type hints
  8. Metaprogramming & Internals — descriptors, metaclasses, `__slots__`, context managers, import system
  9. Performance & C-Extensions — profiling, memory, Cython, ctypes, GIL deep dive

- **Track config**: `TrackSlug` union extended with `'python'`. New TrackConfig entry: codeFile `solution.py`, testFile `test_solution.py`, solutionFile `solution.py`, language `'python'` (Monaco supports natively).

- **RCE Engine**: New `PythonExecutor` implementing the existing `LanguageExecutor` interface. Registered in `EXECUTOR_REGISTRY` under `python` (and alias `py`). Dispatch via existing `getLanguageExecutor(trackId)`.

  Sandbox layout: writes `solution.py` (learner code) + `test_solution.py` (testCode, `from solution import X`) into a temp dir, runs `python3 -m pytest -q --tb=short`, reuses the existing sandbox timeout backstop (process tree killed on 5s timeout). No pytest plugins.

  Output parsing: pure function parses pytest stdout for per-test pass/fail and totals; maps import/syntax errors and timeouts to `compileError` on `SubmissionExecutionResult`.

- **Header Track switcher**: `TerminalHeader` track options derived from the track config registry instead of a hardcoded list, so Python (and future languages) appear automatically.

- **Go-specific leakage cleanup**: Chapter page file label derives from track config (not a `typescript ? ts : go` ternary). The `-race` toggle renders only for the Go Track.

- **No CONTEXT.md changes**: Python introduces no new platform domain terms; Track, Module, Chapter, Submission, Progress, RCE Engine already generalize.

- **ADR**: Record ADR-0010 documenting the Python RCE runner choice (pytest, stdout parsing, no JSON plugin, `solution.py`/`test_solution.py` layout).

## Testing Decisions

- **Philosophy**: Tests verify external behavior — parser mapping, executor dispatch, track config entries, content discovery — not implementation details.

- **RCE seam**: Unit-test `parsePytestOutput` against captured pytest stdout/stderr fixtures (passing tests, failing tests, import error, syntax error, timeout), mirroring `tsExecutor.test.ts` and `rceEngine.test.ts`. Assert `getLanguageExecutor('python')` returns the Python executor and `executeSubmission` maps results.

- **Track config seam**: Extend `trackConfig.test.ts` to assert the python entry (filenames, language).

- **Content discovery**: Extend `contentEngine.test.ts` to assert Python Track/module/chapter discovery from the content directory.

- **Content verification**: All 63 challenge `testCode`s executed locally with real solutions via pytest to confirm green; solutions removed before commit.

- **Prior art**: `src/lib/rce/tsExecutor.test.ts`, `src/lib/rce/rceEngine.test.ts`, `src/lib/tracks/trackConfig.test.ts`, `src/lib/content/contentEngine.test.ts`.

## Out of Scope

- Languages beyond Python (e.g. Rust) — the architecture supports them but no content is authored.
- Remote environment (Docker/containerized) hardening for Python beyond the existing sandbox; sandbox runs on the host with pytest as-is.
- Third-party pip dependency management for learner code (stdlib-only challenge suites).
- Interactive REPL / debugger integration.
- PyPy or alternative Python implementations.

## Further Notes

- Host has Python 3.14.5 and pytest 9.0.2; `python3 -m pytest` available.
- The 63-chapter curriculum is authored in phases but delivered in full: RCE plumbing first, then Modules 00–08 in order, verifying each module's challenges locally before proceeding.
- TypeScript Track remains the model for module chapter naming (`NN-slug-reading.mdx`, `NN-slug-challenge.mdx`, `NN-assessment.mdx`).
