# Deep Progress Tracker Refactor Specification

## Problem Statement

Learner Progress tracking (Streak calculation, completed Chapter tracking, per-Chapter failed attempt counts, and Module progress percentages) is currently split across 4 shallow layers:
1. `src/hooks/useProgressTracker.ts` (React State container)
2. `src/lib/progress/progressService.ts` (Shallow HTTP `fetch` wrapper)
3. `src/app/api/submissions/route.ts` (Next.js API route handler)
4. `src/lib/db/submissionRepo.ts` (Drizzle ORM SQL queries)

This creates architectural friction:
- `progressService.ts` merely double-wraps `submissionRepo.ts` over HTTP `fetch`.
- Pure domain math (such as calculating progress percentages) is mixed with async I/O.
- Server-side code or offline executions cannot track or verify progress without mocking network layers.
- Global user progress state and single-chapter failed attempt counts are coupled ambiguously.

## Solution

Unify domain progress and persistence behind a single cohesive **Progress Tracker** seam (`ProgressTrackerAdapter`) with clean separation between pure domain calculations and async I/O adapters (`DrizzleProgressAdapter` for server/DB, `HttpProgressAdapter` for browser/API).

## User Stories

1. As a learner, I want my completed Chapters and daily Streak to update immediately after submitting a passing solution, so that I can track my Go mastery progress seamlessly.
2. As a learner, I want my failed attempt counts per Chapter to update accurately upon failing a challenge, so that hint unlocking and error tracking reflect my real progress.
3. As a learner, I want the platform to retain my local failed attempt count if a network request fails, so that outage resilience is maintained.
4. As a developer, I want a single `ProgressTrackerAdapter` domain interface, so that server components, API routes, and client hooks interact with the exact same domain contract.
5. As a developer, I want pure progress percentage calculation (`calculateProgressPercent`) to be synchronous and decoupled from I/O adapters, so that calculation logic can be unit-tested without Promise or network mocks.
6. As a developer, I want `useProgressTracker` to accept an injected adapter (defaulting to `HttpProgressAdapter`), so that React UI components can be tested with mock adapters without spun-up server infrastructure.

## Implementation Decisions

- **Domain Model Types (`src/lib/progress/progressTracker.ts`)**:
  - `UserProgress`: `{ userId: string; completedChapterIds: string[]; completedCount: number; streakDays: number }`
  - `RecordSubmissionInput`: `{ userId: string; chapterId: string; code: string; passed: boolean; testCount: number; failedCount: number; compileError?: string }`
  - `RecordSubmissionResult`: `{ userProgress: UserProgress; chapterFailedAttempts: number; submissionId: string }`

- **Domain Interface Seam (`ProgressTrackerAdapter`)**:
  - `getProgress(userId: string): Promise<UserProgress>`
  - `recordSubmission(input: RecordSubmissionInput): Promise<RecordSubmissionResult>`
  - `getFailedAttempts(userId: string, chapterId: string): Promise<number>`

- **Pure Math Separation**:
  - `calculateProgressPercent(completedChapterIds: string[], totalChapterIds: string[]): number` exported as a pure synchronous utility function.

- **Adapter Implementations**:
  - `DrizzleProgressAdapter`: Implements `ProgressTrackerAdapter` directly using `submissionRepo.ts` Drizzle ORM transactions and `streak.ts` calculation logic.
  - `HttpProgressAdapter`: Implements `ProgressTrackerAdapter` for browser context, executing requests to `/api/submissions`.
  - Thin API Route Handler (`src/app/api/submissions/route.ts`): Delegates GET and POST handling directly to `DrizzleProgressAdapter`.

- **Hook Refactoring (`src/hooks/useProgressTracker.ts`)**:
  - Accepts `adapter: ProgressTrackerAdapter = defaultHttpProgressAdapter` via default parameter dependency injection.
  - Manages React state for `completedChapterIds`, `streakDays`, `failedAttempts`.
  - Preserves optimistic local updates (`incrementFailedAttempts`) and network failure fallbacks.

## Testing Decisions

- **Seams for Testing**:
  - **Domain Seam (`ProgressTrackerAdapter`)**: Unit test `DrizzleProgressAdapter` with Vitest against an in-memory/test DB, and `HttpProgressAdapter` with mock fetch.
  - **Pure Math Seam**: Unit test `calculateProgressPercent` with zero async or mock dependencies.
  - **Hook Seam**: Unit test `useProgressTracker` using a mock implementation of `ProgressTrackerAdapter`.

- **Good Test Criteria**: Tests must test external behavior and domain invariants (e.g. streak calculation, state updates on passing/failing submissions) rather than internal implementation details.

## Out of Scope

- Changes to database schemas (`schema.ts`).
- Changes to the RCE Engine test runner execution (`rceEngine.ts`).
- Modifying non-progress UI components in the application.

## Further Notes

- Execution tickets located in `.scratch/progress-tracker-refactor/issues/`.
