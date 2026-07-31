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
  userId?: string;
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
  getProgress(userId?: string): Promise<UserProgress>;
  recordSubmission(input: RecordSubmissionInput): Promise<RecordSubmissionResult>;
  getFailedAttempts(userId: string, chapterId: string): Promise<number>;
}

export function calculateProgressPercent(
  completedChapterIds: string[],
  totalChapters: string[] | number
): number {
  if (typeof totalChapters === 'number') {
    if (totalChapters <= 0) return 0;
    return Math.round((completedChapterIds.length / totalChapters) * 100);
  }
  if (totalChapters.length === 0) return 0;
  const completedSet = new Set(completedChapterIds);
  const count = totalChapters.filter((id) => completedSet.has(id)).length;
  return Math.round((count / totalChapters.length) * 100);
}

export class DrizzleProgressAdapter implements ProgressTrackerAdapter {
  async getProgress(userId = DEFAULT_USER_ID): Promise<UserProgress> {
    const raw = getUserProgressRepo(userId);
    return {
      userId: raw.userId,
      completedChapterIds: raw.completedChapterIds,
      completedCount: raw.completedCount,
      streakDays: raw.streakDays,
    };
  }

  async recordSubmission(input: RecordSubmissionInput): Promise<RecordSubmissionResult> {
    const targetUserId = input.userId || DEFAULT_USER_ID;
    const res = recordSubmissionRepo({
      userId: targetUserId,
      chapterId: input.chapterId,
      code: input.code,
      passed: input.passed,
      testCount: input.testCount,
      failedCount: input.failedCount,
      compileError: input.compileError,
    });

    const userProgress = await this.getProgress(targetUserId);
    const chapterFailedAttempts = await this.getFailedAttempts(targetUserId, input.chapterId);

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

export class HttpProgressAdapter implements ProgressTrackerAdapter {
  async getProgress(userId = DEFAULT_USER_ID): Promise<UserProgress> {
    const res = await fetch(`/api/submissions?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      throw new Error(`fetchProgress failed with status ${res.status}`);
    }
    const data = await res.json();
    return {
      userId: data.userId || userId,
      completedChapterIds: Array.isArray(data.completedChapterIds) ? data.completedChapterIds : [],
      completedCount: typeof data.completedCount === 'number' ? data.completedCount : 0,
      streakDays: typeof data.streakDays === 'number' ? data.streakDays : 0,
    };
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
      userProgress: {
        userId: data.userProgress?.userId || userId,
        completedChapterIds: Array.isArray(data.userProgress?.completedChapterIds)
          ? data.userProgress.completedChapterIds
          : [],
        completedCount:
          typeof data.userProgress?.completedCount === 'number'
            ? data.userProgress.completedCount
            : 0,
        streakDays:
          typeof data.userProgress?.streakDays === 'number' ? data.userProgress.streakDays : 0,
      },
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
