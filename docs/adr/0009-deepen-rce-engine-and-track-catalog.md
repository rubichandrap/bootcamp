# 9. Deepen RCE Engine Orchestration and Track Catalog Seams

Date: 2026-08-01

## Status

Accepted

## Context

The platform previously suffered from architectural friction in two key areas:
1. **RCE Engine Orchestration**: `src/lib/rce/rceEngine.ts` acted as a shallow registry lookup. Input validation, execution timeouts, process error handling, and result mapping leaked into Next.js API routes (`src/app/api/rce/execute/route.ts`).
2. **Track & Progress Navigation**: Server components (`TracksCatalogPage` and `TrackDashboardPage`) reached directly into `contentEngine.ts` (MDX files) and `submissionRepo.ts` (database user progress), performing inline array reductions and metrics calculations in view rendering code.

## Decision

1. **RCE Engine Error Seam**:
   - Encapsulate execution validation, timeouts, and process exceptions within `executeSubmission` in `src/lib/rce/rceEngine.ts`.
   - Standardise outputs to always return a `SubmissionExecutionResult` object, setting `success: false` and `compileError` on failure rather than throwing unhandled exceptions.
   - Simplify `src/app/api/rce/execute/route.ts` to a 3-line handler that proxies requests to `executeSubmission`.

2. **Track Catalog Seam**:
   - Introduce a deep `TrackCatalog` service module in `src/lib/tracks/trackCatalog.ts`.
   - Expose three clean methods: `getAllTracksOverview(userId)`, `getTrackDashboard(trackSlug, userId)`, and `getChapterDetails(trackSlug, moduleSlug, chapterSlug)`.
   - Hide MDX content parsing (`contentEngine`) and database user progress repo (`submissionRepo`) as internal data sources behind this seam.
   - Refactor track server components to consume `TrackCatalog` service functions exclusively.

## Consequences

- High `locality`: RCE execution errors concentrate in `rceEngine.ts`; track metrics and progress correlation concentrate in `trackCatalog.ts`.
- High `leverage`: Server pages and API routes shrink significantly into thin proxy/rendering layers.
- Simplified testing: Service functions can be tested directly in the `node` Vitest environment without mocking React UI components or complex Next.js request handlers.
