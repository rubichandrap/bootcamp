# Specification: Split the Progress Module Along Its Seams

## Problem Statement

The persistence layer (`progress.ts`) mixes four unrelated responsibilities into a single 174-line module: database connection lifecycle, raw DDL execution, Drizzle table re-exports, and all submission/progress query functions. This creates Divergent Change — every schema tweak, connection fix, or query optimization forces editing the same file. The module also has two sources of truth for table definitions: Drizzle schema objects in `schema.ts` and raw `CREATE TABLE` SQL in `progress.ts`, which must be kept in sync manually. Several query functions load all rows into JavaScript to compute aggregates that belong in SQL, and `recordSubmission` performs two dependent inserts without transactional guarantees.

## Solution

Decompose `progress.ts` into three focused modules with clean separation: a connection module, a schema module (already exists, becomes the single source of truth), and a submission repository module. Eliminate the raw DDL in favor of `drizzle-kit push` for schema application. Fix query performance by pushing aggregation and filtering into SQL. Wrap multi-step writes in transactions.

## User Stories

1. As a developer, I want the database connection lifecycle isolated in its own module, so that connection setup is importable independently of query logic.
2. As a developer, I want a single source of truth for table definitions (Drizzle schema objects), so that I never need to manually sync raw DDL with ORM types.
3. As a developer, I want `drizzle-kit push` to handle schema application to SQLite, so that schema changes flow from Drizzle objects without maintaining parallel SQL strings.
4. As a developer, I want submission and progress query functions grouped in a dedicated repository module, so that data access logic has one home and one reason to change.
5. As a developer, I want `recordSubmission` to wrap its two inserts (submission + user progress) in a transaction, so that a failure between them cannot leave the database in an inconsistent state.
6. As a developer, I want `getFailedAttemptsCount` to use SQL `COUNT(*)` instead of loading all rows into JavaScript, so that the count happens at the database layer and the response payload stays minimal.
7. As a developer, I want `getUserProgress` to filter submissions by date at the SQL level, so that streak calculation doesn't fetch the entire submission history for a user.
8. As a developer, I want the phantom `modules`, `chapters`, and `users` tables removed from the schema, so that the database only contains tables that are actually used and data ownership is unambiguous.
9. As a developer, I want the API route (`/api/submissions`) to import query functions from the new repository module, so that the route handler stays thin and delegates all data access.
10. As a developer, I want one test file per repository module, so that test structure mirrors production module structure.
11. As a developer, I want the Drizzle instance (`db`) exported only from the connection module, so that production code accesses the database through the repository interface, not directly.
12. As a developer, I want `calculateModuleProgress` retained in the repository, so that per-module progress calculation is ready when the feature is wired to an API route.
13. As a developer, I want the `RecordSubmissionInput` interface exported from the repository module, so that callers have a typed contract for submission data.
14. As a developer, I want `better-sqlite3` and `drizzle-orm` dependencies unchanged, so that the refactor introduces no new runtime dependencies.

## Implementation Decisions

### Module Decomposition

The current `progress.ts` is split into three modules:

- **`db/connection.ts`**: Creates the `.data/` directory if missing, opens the SQLite database with `better-sqlite3`, creates the Drizzle instance, and exports `db`. No query logic, no table definitions, no DDL.
- **`db/schema.ts`** (existing, cleaned): Drizzle `sqliteTable()` objects for `user_progress` and `submissions` only. The `modules`, `chapters`, and `users` tables are deleted. This is the single source of truth for table structure.
- **`db/submissionRepo.ts`**: Imports `db` from connection and table objects from schema. Exports `recordSubmission`, `getFailedAttemptsCount`, `getUserProgress`, `calculateModuleProgress`, and the `RecordSubmissionInput` interface.

### Schema Management

- Raw `CREATE TABLE IF NOT EXISTS` DDL block is deleted from the codebase entirely.
- Schema is applied to SQLite via `drizzle-kit push` (dev dependency).
- A `db:push` npm script is added to `package.json`.
- No migration files are generated — `push` directly syncs schema to the database, which is appropriate for a local SQLite workflow.

### Transactional Writes

`recordSubmission` wraps both inserts (into `submissions` and conditionally into `user_progress`) in a `db.transaction()` call. Both writes succeed or both roll back.

### Query Optimizations

- `getFailedAttemptsCount` uses Drizzle's aggregation (`COUNT(*)` equivalent) instead of `.all().length`.
- `getUserProgress` filters submissions at SQL level with a date window (e.g., last 30 days) instead of fetching all rows.

### Table Cleanup

Deleted from schema and DDL:
- `modules` (content comes from filesystem via `contentEngine.ts`)
- `chapters` (content comes from filesystem via `contentEngine.ts`)
- `users` (no auth system exists)

### API Route Update

`src/app/api/submissions/route.ts` updates its import path from `@/lib/db/progress` to `@/lib/db/submissionRepo`. No changes to the route's request/response contract.

### Drizzle Instance Access

`db` is exported from `connection.ts` only. `submissionRepo.ts` imports it internally. Tests import `db` from `connection.ts` for direct table access during setup/teardown.

## Testing Decisions

Good tests verify external behavior through the module's public interface — the functions it exports and the data they return — not internal implementation details like which SQL was generated or how the Drizzle instance was configured.

### Modules to Test

1. **`db/submissionRepo.ts`** (primary):
   - `recordSubmission`: submitting a passing solution creates both a submission row and a user_progress row; submitting a failing solution creates only a submission row; submitting the same passing chapter twice is idempotent (one progress row); transactional behavior (both inserts succeed or both roll back).
   - `getFailedAttemptsCount`: returns correct count for a user/chapter pair; returns 0 when no failures exist; uses COUNT(*) (verify row count returned, not array length).
   - `getUserProgress`: returns completed chapter IDs and streak; filters submissions by date window; returns empty results for unknown users.
   - `calculateModuleProgress`: returns correct percentage for partial completion; returns 0 for empty chapter list; returns 100 when all chapters complete.

2. **`db/connection.ts`** (lightweight):
   - Exports a valid Drizzle instance; database file is created in `.data/` on first import.

### Prior Art

- `progress.test.ts` (existing): 4 tests covering `recordSubmission`, `getFailedAttemptsCount`, `getUserProgress`, and `calculateModuleProgress`. These tests are preserved and adapted to import from the new module paths.
- `route.test.ts` (existing): API-level test for `GET /api/submissions`. Import path updated; test logic unchanged.
- Test structure mirrors production: `submissionRepo.test.ts` for the repository, `connection.test.ts` for the connection module.

## Out of Scope

- Authentication system or multi-user support.
- Drizzle Kit migration file generation (using `push` instead).
- Refactoring the content engine to use the database (content stays filesystem-based).
- Wiring `calculateModuleProgress` to an API route.
- Refactoring the RCE engine or page shell (separate candidates from the architecture review).

## Further Notes

- All domain terminology aligns with [CONTEXT.md](../../CONTEXT.md).
- This refactor is candidate #2 from the architecture deepening review (`/tmp/architecture-review-20260730.html`).
- Architectical decisions reference ADRs `0001` through `0006` under `docs/adr/`.
