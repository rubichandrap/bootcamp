# 01 — App Skeleton & Basic Host RCE Execution Pipeline

**What to build:** A Next.js application foundation featuring an embedded Monaco Code Editor and an RCE execution API (`/api/rce/execute`) that receives Go code, writes it to a temporary host directory in `/tmp`, executes `go test -json` with a 5-second context timeout, cleans up immediately via `defer os.RemoveAll`, and renders the pass/fail execution results in a terminal output pane.

**Blocked by:** None — can start immediately.

**Status:** done

- [x] Next.js (App Router, TypeScript, TailwindCSS) project initialized.
- [x] Monaco Code Editor component (`@monaco-editor/react`) rendering Go syntax highlighting.
- [x] API endpoint `/api/rce/execute` accepting Go solution code and executing `go test -json` in an isolated `/tmp` workspace.
- [x] Temporary workspaces are automatically cleaned up using `defer os.RemoveAll` upon test completion.
- [x] Execution output pane displays structured test pass/fail results and raw stderr logs.
