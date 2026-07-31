# 02 — refactor(progress): create HttpProgressAdapter and thin /api/submissions route

**What to build:** Implement the browser-facing HTTP progress adapter and simplify the submissions API route handler. Browser client code can interact with progress tracking over HTTP, while the API endpoint acts as a thin delegator forwarding request payloads directly to the server progress adapter.

**Blocked by:** 01 — refactor(progress): define ProgressTracker domain interface and server Drizzle adapter

**Status:** ready-for-agent

- [ ] `HttpProgressAdapter` implements `ProgressTrackerAdapter` for browser contexts via HTTP requests.
- [ ] Submissions API route handler delegates GET and POST requests directly to `DrizzleProgressAdapter`.
- [ ] API endpoint test suite passes cleanly without regressions.
