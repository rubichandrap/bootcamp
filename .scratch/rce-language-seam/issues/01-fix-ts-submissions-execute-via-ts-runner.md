# 01 — fix(rce): non-Go submissions execute via their own language runner

**What to build:** A learner in the TypeScript or Python Track runs a Challenge and their code executes through the correct runner (vitest for TypeScript, pytest for Python), not the Go runner. The RCE pipeline carries the active Track's language all the way from the workspace session to the executor, so non-Go submissions are no longer written into a Go `main.go` and compiled by `go test`. Confirmed affected: TypeScript produced `expected 'package', found export`; Python fails the same way with its own Go compile error. When a language is missing or unsupported, execution fails fast with a clear message instead of silently falling back to Go. The editor header badge reflects the active language instead of a hardcoded Go version.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Language derived from the active Track slug is forwarded through the challenge service and RCE endpoint to the executor (no silent default).
- [ ] TypeScript Track submissions run via vitest and report real test results — the Go compile error is gone.
- [ ] Python Track submissions run via pytest and report real test results — no Go compile error.
- [ ] Missing or unsupported language produces a clear error message rather than silently running Go.
- [ ] Editor header badge shows the active track's language, not a hardcoded Go label.
- [ ] Unit tests cover: challenge service forwards the derived language; engine fails fast on missing/unknown language; RCE endpoint passes the language through.
