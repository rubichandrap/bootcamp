import {
  defaultHttpProgressAdapter,
  calculateProgressPercent as calculatePercentDomain,
  DEFAULT_USER_ID,
  RecordSubmissionInput,
  UserProgress,
} from '@/lib/progress/progressTracker';

export { DEFAULT_USER_ID };

export interface ProgressData {
  completedChapterIds: string[];
  streakDays: number;
}

export type RecordSubmissionParams = RecordSubmissionInput;

export interface RecordSubmissionResult {
  completedChapterIds?: string[];
  streakDays?: number;
  chapterFailedAttempts?: number;
  userProgress?: UserProgress;
  submissionId?: string;
}

export async function fetchProgress(userId = DEFAULT_USER_ID): Promise<ProgressData> {
  const data = await defaultHttpProgressAdapter.getProgress(userId);
  return {
    completedChapterIds: data.completedChapterIds,
    streakDays: data.streakDays,
  };
}

export async function recordSubmission(
  params: RecordSubmissionParams
): Promise<RecordSubmissionResult> {
  const res = await defaultHttpProgressAdapter.recordSubmission(params);
  return {
    completedChapterIds: res.userProgress.completedChapterIds,
    streakDays: res.userProgress.streakDays,
    chapterFailedAttempts: res.chapterFailedAttempts,
  };
}

export async function fetchFailedAttemptsForChapter(
  chapterId: string,
  userId = DEFAULT_USER_ID
): Promise<number> {
  return defaultHttpProgressAdapter.getFailedAttempts(userId, chapterId);
}

export function incrementFailedAttempts(currentFailedAttempts: number): number {
  return currentFailedAttempts + 1;
}

export function calculateProgressPercent(
  completedChapterIds: string[],
  totalChapters: string[]
): number {
  return calculatePercentDomain(completedChapterIds, totalChapters);
}
