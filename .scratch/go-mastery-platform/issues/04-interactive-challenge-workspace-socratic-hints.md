# 04 — Interactive Challenge Workspace & Socratic Hints

**What to build:** The full 3-Pane interactive Challenge workspace (MDX explanation on the left, Monaco Editor on top-right, dual Test Results & Terminal Output on bottom-right) that loads challenge starter code and hidden test suites, serves Socratic conceptual hints on request, and unlocks the next chapter upon passing `go test`.

**Blocked by:** 03 — Curriculum Content Engine & Reading Chapters

**Status:** completed

- [x] Responsive 3-pane split view workspace for Challenge Chapters.
- [x] Challenge loader mounting `starter.go` into Monaco Editor and loading hidden `_test.go` suites.
- [x] Keyboard shortcut (`Cmd+Enter`) triggering RCE submission execution.
- [x] Socratic Hints drawer providing conceptual nudges without giving direct solution code.
- [x] Solution reveal tab unlocking only after passing the challenge or completing 3 failed submission attempts.
- [x] Passing all test cases automatically marks the Challenge Chapter as completed in SQLite.
