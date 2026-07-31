# 01 — refactor(rce): extract parseGoTestStream parser seam and unit test suite

**What to build:** A pure stream parsing seam (`parseGoTestStream`) in the RCE Engine domain module that converts raw `go test -json` events, data race warning output, compiler escape analysis logs (`gcflags="-m"`), and benchmark metric streams into a structured submission execution result object.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] `parseGoTestStream` is implemented and exported from `src/lib/rce/rceEngine.ts`.
- [x] Correctly parses multi-test passing streams, failing test streams, syntax/compile errors, benchmark metrics (`ns/op`, `B/op`, `allocs/op`), and `WARNING: DATA RACE` flags.
- [x] Comprehensive unit test suite in `src/lib/rce/rceEngine.test.ts` passes in Vitest without spawning child processes.
