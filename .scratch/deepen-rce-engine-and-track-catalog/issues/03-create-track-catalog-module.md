# 03 — Create Deep Track Catalog Service Module for Content & Progress Standing (#46)

**What to build:** Build a deep Track Catalog service module that combines static MDX curriculum definitions with learner database progress standing to expose a unified navigation and metrics interface.

**Blocked by:** #44 — Record ADR-0009 for RCE Engine & Track Catalog Seams

**Status:** ready-for-agent

- [ ] `src/lib/tracks/trackCatalog.ts` provides `getAllTracksOverview`, `getTrackDashboard`, and `getChapterDetails`.
- [ ] Combines curriculum module/chapter structures from `contentEngine` with user standing from `submissionRepo`.
- [ ] Computes track progress percentages and chapter counts internally behind the module seam.
- [ ] Unit tests in `src/lib/tracks/trackCatalog.test.ts` verify metrics calculation and progress correlation in the node test environment.
