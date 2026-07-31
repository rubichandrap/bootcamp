import {
  recordSubmission as recordSubmissionRepo,
  getUserProgress as getUserProgressRepo,
  getFailedAttemptsCount,
  getLatestSubmission as getLatestSubmissionRepo,
} from '@/lib/db/submissionRepo';
import {
  ProgressTrackerAdapter,
  UserProgress,
  RecordSubmissionInput,
  RecordSubmissionResult,
} from './progressTracker';

function toUserProgress(raw: {
  userId: string;
  completedChapterIds: string[];
  completedCount: number;
  streakDays: number;
}): UserProgress {
  return {
    userId: raw.userId,
    completedChapterIds: raw.completedChapterIds,
    completedCount: raw.completedCount,
    streakDays: raw.streakDays,
  };
}

export class DrizzleProgressAdapter implements ProgressTrackerAdapter {
  async getProgress(userId: string): Promise<UserProgress> {
    return toUserProgress(getUserProgressRepo(userId));
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

  async getLatestSubmission(userId: string, chapterId: string): Promise<{ code: string; passed: boolean } | null> {
    const sub = getLatestSubmissionRepo(userId, chapterId);
    if (!sub) return null;
    return {
      code: sub.code,
      passed: sub.passed,
    };
  }
}
