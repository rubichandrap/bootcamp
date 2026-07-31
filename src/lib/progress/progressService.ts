export const DEFAULT_USER_ID = 'default-user';

export interface ProgressData {
  completedChapterIds: string[];
  streakDays: number;
}

export interface RecordSubmissionParams {
  userId?: string;
  chapterId: string;
  code: string;
  passed: boolean;
  testCount: number;
  failedCount: number;
  compileError?: string;
}

export interface RecordSubmissionResult {
  completedChapterIds: string[];
  streakDays: number;
  chapterFailedAttempts?: number;
}

export async function fetchProgress(userId = DEFAULT_USER_ID): Promise<ProgressData> {
  const res = await fetch(`/api/submissions?userId=${encodeURIComponent(userId)}`);
  const data = await res.json();
  return {
    completedChapterIds: Array.isArray(data.completedChapterIds) ? data.completedChapterIds : [],
    streakDays: typeof data.streakDays === 'number' ? data.streakDays : 0,
  };
}

export async function recordSubmission(
  params: RecordSubmissionParams
): Promise<RecordSubmissionResult> {
  const userId = params.userId || DEFAULT_USER_ID;
  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      chapterId: params.chapterId,
      code: params.code,
      passed: params.passed,
      testCount: params.testCount,
      failedCount: params.failedCount,
      compileError: params.compileError,
    }),
  });
  const data = await res.json();
  return {
    completedChapterIds: Array.isArray(data.userProgress?.completedChapterIds)
      ? data.userProgress.completedChapterIds
      : [],
    streakDays: typeof data.userProgress?.streakDays === 'number' ? data.userProgress.streakDays : 0,
    chapterFailedAttempts:
      typeof data.chapterFailedAttempts === 'number' ? data.chapterFailedAttempts : undefined,
  };
}

export async function fetchFailedAttemptsForChapter(
  chapterId: string,
  userId = DEFAULT_USER_ID
): Promise<number> {
  const res = await fetch(
    `/api/submissions?userId=${encodeURIComponent(userId)}&chapterId=${encodeURIComponent(chapterId)}`
  );
  const data = await res.json();
  return typeof data.chapterFailedAttempts === 'number' ? data.chapterFailedAttempts : 0;
}

export function incrementFailedAttempts(currentFailedAttempts: number): number {
  return currentFailedAttempts + 1;
}
