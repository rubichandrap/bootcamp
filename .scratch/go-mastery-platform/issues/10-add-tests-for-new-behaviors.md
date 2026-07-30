# 10 — Add tests for transactions, COUNT(*), date filtering, and connection

**What to build:** Rename `progress.test.ts` to `submissionRepo.test.ts` and update imports to the new module paths. Add new test cases that verify the behaviors introduced in the split: transaction rollback on `recordSubmission`, `COUNT(*)` for `getFailedAttemptsCount`, SQL-level date filtering in `getUserProgress`, and the `db` export from `connection.ts`.

**Blocked by:** 09 — Split progress.ts into connection.ts and submissionRepo.ts

**Status:** ready-for-agent

- [ ] Rename `progress.test.ts` to `submissionRepo.test.ts`
- [ ] Update all imports to use `@/lib/db/submissionRepo` and `@/lib/db/connection`
- [ ] Add test: `recordSubmission` rolls back both inserts on partial failure (transaction atomicity)
- [ ] Add test: `getFailedAttemptsCount` returns correct count — verify via SQL COUNT not array length
- [ ] Add test: `getUserProgress` does not fetch submissions older than the date window
- [ ] Create `connection.test.ts` verifying `db` is a valid Drizzle instance and database directory exists
- [ ] Verify all tests pass across both test files
