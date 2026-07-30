# Host-Local Temp Workspace RCE Engine with Automatic Cleanup

We decided to build a lightweight, native Go RCE Engine service using host-local temporary directory execution with automatic cleanup (`defer os.RemoveAll`).

## Rationale
- **Zero Disk Bloat**: Temporary submission files are written to RAM-backed `/tmp` directories (`tmpfs`) and deleted immediately after execution via `defer os.RemoveAll`.
- **Instant Execution**: Sub-50ms execution latency without container initialization delays.
- **Native Test Tooling**: Direct support for `go test -json`, `-race` detection for concurrency modules, and benchmark flags.
- **No External Dependencies**: Requires no Docker or external execution containers for local usage.
