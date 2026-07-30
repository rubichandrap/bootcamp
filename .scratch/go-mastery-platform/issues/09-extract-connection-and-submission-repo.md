# 09 — Split progress.ts into connection.ts and submissionRepo.ts

**What to build:** Decompose the 174-line `progress.ts` module (which mixes connection lifecycle, DDL, table re-exports, and all query functions) into two focused modules behind clean seams. The connection module owns the SQLite connection and Drizzle instance lifecycle. The submission repository owns all data access for submission recording, failed attempt counting, progress queries, and module progress calculation. The API route and all tests import from the new modules. The old `progress.ts` file is deleted.

**Blocked by:** 08 — Set up Drizzle Kit schema push and clean the schema

**Status:** ready-for-agent

- [ ] Create `db/connection.ts` containing directory creation, SQLite open, Drizzle initialization, and `db` export (no query logic, no DDL)
- [ ] Create `db/submissionRepo.ts` importing `db` from `connection.ts` and table objects from `schema.ts`
- [ ] Move `recordSubmission`, `getFailedAttemptsCount`, `getUserProgress`, `calculateModuleProgress`, and `RecordSubmissionInput` into `submissionRepo.ts`
- [ ] Wrap `recordSubmission` inserts in `db.transaction()` for atomicity
- [ ] Replace `.all().length` in `getFailedAttemptsCount` with SQL `COUNT(*)`
- [ ] Add SQL-level date filtering (30-day window) in `getUserProgress` instead of fetching all submissions
- [ ] Update `src/app/api/submissions/route.ts` to import from `@/lib/db/submissionRepo`
- [ ] Delete `src/lib/db/progress.ts`
- [ ] Verify API endpoint still returns correct data for both POST and GET
