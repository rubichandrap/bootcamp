# 05 — RCE Terminal Console Stream & Challenge Workspace

**What to build:** split-pane Challenge Workspace with synced Monaco Editor and RCE Engine console output formatted as authentic `go test -v ./...` logs (`=== RUN`, `--- PASS`, `FAIL`), CLI run button (`[RUN TESTS: ⌘↵]`), and unit tests verifying log parsing and status rendering.

**Blocked by:** 01 — Theme Management System & Global Functional Monochrome Design Tokens

**Status:** ready-for-agent

- [ ] Refactor `TerminalOutput.tsx` to stream execution results as `go test -v ./...` logs.
- [ ] Implement functional monochrome accents (Green PASS / Red FAIL / Amber Race Warning).
- [ ] Add `[RUN TESTS: ⌘↵]` CLI shortcut button and execution indicator.
- [ ] Add unit tests verifying log stream formatting and race detection display.
