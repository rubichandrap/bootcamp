# Candidate 3: Unify Domain Progress & Database Persistence into a Deep Progress Tracker

## Executive Summary

Currently, learner progress tracking (streak calculation, completed chapter tracking, per-chapter failed attempt counts, module progress percentages) is split across 4 shallow layers:
1. `src/hooks/useProgressTracker.ts` (React State container)
2. `src/lib/progress/progressService.ts` (Shallow HTTP `fetch` wrapper)
3. `src/app/api/submissions/route.ts` (Next.js API route handler)
4. `src/lib/db/submissionRepo.ts` (Drizzle ORM SQL queries)

This creates architectural friction where `progressService.ts` merely mirrors `submissionRepo.ts` structures over HTTP `fetch`, making server-side or offline execution impossible without network mocking.

---

## Architectural Deepening Plan

### 1. Unified Domain Seam (`src/lib/progress/progressTracker.ts`)

Define a single cohesive **Progress Tracker** domain module:

```typescript
export interface ProgressData {
  userId: string;
  completedChapterIds: string[];
  completedCount: number;
  streakDays: number;
  chapterFailedAttempts?: number;
}

export interface RecordSubmissionInput {
  userId: string;
  chapterId: string;
  code: string;
  passed: boolean;
  testCount: number;
  failedCount: number;
  compileError?: string;
}

export interface ProgressTrackerAdapter {
  getProgress(userId: string, chapterId?: string): Promise<ProgressData>;
  recordSubmission(input: RecordSubmissionInput): Promise<ProgressData>;
  getFailedAttempts(userId: string, chapterId: string): Promise<number>;
  calculateModuleProgress(userId: string, totalModuleChapterIds: string[]): Promise<number>;
}
```

### 2. Adapters

- **Server Adapter (`DrizzleProgressAdapter`)**: Implements `ProgressTrackerAdapter` directly using `submissionRepo.ts` transactions and `streak.ts` logic.
- **Client Adapter (`HttpProgressAdapter`)**: Implements `ProgressTrackerAdapter` for the browser using `/api/submissions` HTTP requests.

### 3. Benefits

- **Locality**: Progress invariants (streak calculations, completion criteria) are defined once.
- **Test Surface**: Pure domain calculations can be unit-tested in Vitest without mock HTTP fetch or live DB connections.
- **Deletion Test**: Eliminates double-wrapping of API endpoints in `progressService.ts`.

---

## Step-by-Step Execution Tickets

- Ticket 01: `refactor(progress): define ProgressTracker domain interface and server Drizzle adapter`
- Ticket 02: `refactor(progress): create HttpProgressAdapter and thin /api/submissions route`
- Ticket 03: `refactor(progress): update useProgressTracker hook to consume ProgressTracker seam`
