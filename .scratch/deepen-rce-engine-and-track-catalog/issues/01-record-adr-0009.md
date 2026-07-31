# 01 — Record ADR-0009 for RCE Engine & Track Catalog Seams (#44)

**What to build:** Formally record the architectural decision for encapsulating RCE Engine execution errors and consolidating Track Catalog curriculum and learner progress data flows.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `docs/adr/0009-deepen-rce-engine-and-track-catalog.md` is created following standard ADR format.
- [ ] Documents the decision to standardise `SubmissionExecutionResult` outputs over throwing domain exceptions.
- [ ] Documents the decision to encapsulate static MDX track metadata and database user progress behind a deep `TrackCatalog` interface.
- [ ] Mentions consequences and rationale for maintaining high locality and testability across server routes.
