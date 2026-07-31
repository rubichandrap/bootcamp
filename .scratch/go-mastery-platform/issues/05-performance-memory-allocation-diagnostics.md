# 05 — Performance & Memory Allocation Diagnostics

**What to build:** A dedicated "Performance & Allocations" tab in the workspace terminal pane parsing `go test -benchmem` output (`B/op`, `allocs/op`, and stack vs heap escape analysis logs) to give learners deep insight into Go memory overhead.

**Blocked by:** 04 — Interactive Challenge Workspace & Socratic Hints

**Status:** completed

- [x] RCE Engine flag handler running `go test -benchmem -gcflags="-m"` during challenge evaluations.
- [x] Output parser extracting bytes per operation (`B/op`), allocations per operation (`allocs/op`), and escape analysis diagnostics.
- [x] Terminal "Performance & Allocations" tab rendering visual metrics cards and memory allocation alerts.
