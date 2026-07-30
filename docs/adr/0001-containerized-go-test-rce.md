# Containerized Backend Execution with `go test` for RCE Engine

We decided to use an isolated backend containerized runner with standard `go test` rather than in-browser WebAssembly execution. This ensures accurate Go runtime diagnostics, race condition detection (`-race`), and support for standard library concurrency primitives without WebAssembly isolation limitations.
