import {
  recordSubmission as recordSubmissionRepo,
  getUserProgress as getUserProgressRepo,
  getFailedAttemptsCount,
} from '@/lib/db/submissionRepo';

export const DEFAULT_USER_ID = 'default-user';

export interface UserProgress {
  userId: string;
  completedChapterIds: string[];
  completedCount: number;
  streakDays: number;
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

export interface RecordSubmissionResult {
  userProgress: UserProgress;
  chapterFailedAttempts: number;
  submissionId: string;
}

export interface ProgressTrackerAdapter {
  getProgress(userId: string): Promise<UserProgress>;
  recordSubmission(input: RecordSubmissionInput): Promise<RecordSubmissionResult>;
  getFailedAttempts(userId: string, chapterId: string): Promise<number>;
}

export function calculateProgressPercent(
  completedChapterIds: string[],
  totalChapterIds: string[]
): number {
  if (totalChapterIds.length === 0) return 0;
  const completedSet = new Set(completedChapterIds);
  const count = totalChapterIds.filter((id) => completedSet.has(id)).length;
  return Math.round((count / totalChapterIds.length) * 100);
}

export class DrizzleProgressAdapter implements ProgressTrackerAdapter {
  async getProgress(userId: string): Promise<UserProgress> {
    const raw = getUserProgressRepo(userId);
    return {
      userId: raw.userId,
      completedChapterIds: raw.completedChapterIds,
      completedCount: raw.completedCount,
      streakDays: raw.streakDays,
    };
  }

  async recordSubmission(input: RecordSubmissionInput): Promise<RecordSubmissionResult> {
    const res = recordSubmissionRepo({
      userId: input.userId,
      chapterId: input.chapterId,
      code: input.code,
      passed: input.passed,
      testCount: input.testCount,
      failedCount: input.failedCount,
      compileError: input.compileError,
    });

    const userProgress = await this.getProgress(input.userId);
    const chapterFailedAttempts = await this.getFailedAttempts(input.userId, input.chapterId);

    return {
      userProgress,
      chapterFailedAttempts,
      submissionId: res.submissionId,
    };
  }

  async getFailedAttempts(userId: string, chapterId: string): Promise<number> {
    return getFailedAttemptsCount(userId, chapterId);
  }
}

function parseUserProgress(data: any, fallbackUserId: string): UserProgress {
  return {
    userId: data?.userId || fallbackUserId,
    completedChapterIds: Array.isArray(data?.completedChapterIds) ? data.completedChapterIds : [],
    completedCount: typeof data?.completedCount === 'number' ? data.completedCount : 0,
    streakDays: typeof data?.streakDays === 'number' ? data.streakDays : 0,
  };
}

export class HttpProgressAdapter implements ProgressTrackerAdapter {
  async getProgress(userId = DEFAULT_USER_ID): Promise<UserProgress> {
    const res = await fetch(`/api/submissions?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      throw new Error(`fetchProgress failed with status ${res.status}`);
    }
    const data = await res.json();
    return parseUserProgress(data, userId);
  }

  async recordSubmission(input: RecordSubmissionInput): Promise<RecordSubmissionResult> {
    const userId = input.userId || DEFAULT_USER_ID;
    const payload = {
      userId,
      chapterId: input.chapterId,
      code: input.code,
      passed: input.passed,
      testCount: input.testCount,
      failedCount: input.failedCount,
      compileError: input.compileError,
    };
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`recordSubmission failed with status ${res.status}`);
    }
    const data = await res.json();
    return {
      userProgress: parseUserProgress(data.userProgress, userId),
      chapterFailedAttempts:
        typeof data.chapterFailedAttempts === 'number' ? data.chapterFailedAttempts : 0,
      submissionId: data.submissionId || '',
    };
  }

  async getFailedAttempts(userId: string, chapterId: string): Promise<number> {
    const res = await fetch(
      `/api/submissions?userId=${encodeURIComponent(userId)}&chapterId=${encodeURIComponent(chapterId)}`
    );
    if (!res.ok) {
      throw new Error(`fetchFailedAttemptsForChapter failed with status ${res.status}`);
    }
    const data = await res.json();
    return typeof data.chapterFailedAttempts === 'number' ? data.chapterFailedAttempts : 0;
  }
}

export const defaultHttpProgressAdapter = new HttpProgressAdapter();
