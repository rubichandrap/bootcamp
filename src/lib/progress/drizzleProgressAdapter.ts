import {
  recordSubmission as recordSubmissionRepo,
  getUserProgress as getUserProgressRepo,
  getFailedSubmissionsCount,
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
  trackId?: string;
  completedChapterIds: string[];
  completedCount: number;
  streakDays: number;
}): UserProgress {
  return {
    userId: raw.userId,
    trackId: raw.trackId,
    completedChapterIds: raw.completedChapterIds,
    completedCount: raw.completedCount,
    streakDays: raw.streakDays,
  };
}

export class DrizzleProgressAdapter implements ProgressTrackerAdapter {
  async getProgress(userId: string, trackId?: string): Promise<UserProgress> {
    return toUserProgress(getUserProgressRepo(userId, { trackId }));
  }

  async recordSubmission(input: RecordSubmissionInput): Promise<RecordSubmissionResult> {
    const res = recordSubmissionRepo({
      userId: input.userId,
      trackId: input.trackId,
      chapterId: input.chapterId,
      code: input.code,
      passed: input.passed,
      testCount: input.testCount,
      failedCount: input.failedCount,
      compileError: input.compileError,
    });

    const userProgress = await this.getProgress(input.userId, input.trackId);
    const chapterFailedAttempts = await this.getFailedSubmissions(input.userId, input.chapterId, input.trackId);

    return {
      userProgress,
      chapterFailedAttempts,
      submissionId: res.submissionId,
    };
  }

  async getFailedSubmissions(userId: string, chapterId: string, trackId?: string): Promise<number> {
    return getFailedSubmissionsCount(userId, chapterId, trackId || 'go');
  }

  async getFailedAttempts(userId: string, chapterId: string, trackId?: string): Promise<number> {
    return this.getFailedSubmissions(userId, chapterId, trackId);
  }

  async getLatestSubmission(userId: string, chapterId: string, trackId?: string): Promise<{ code: string; passed: boolean } | null> {
    const sub = getLatestSubmissionRepo(userId, chapterId, trackId || 'go');
    if (!sub) return null;
    return {
      code: sub.code,
      passed: sub.passed,
    };
  }
}
