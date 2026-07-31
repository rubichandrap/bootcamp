import { eq, and, inArray, gte, sql, desc } from 'drizzle-orm';
import { db } from '@/lib/db/connection';
import { userProgress, submissions } from '@/lib/db/schema';
import { calculateStreak } from '@/lib/metrics/streak';

export { userProgress, submissions };

export interface RecordSubmissionInput {
  userId: string;
  trackId?: string;
  chapterId: string;
  code: string;
  passed: boolean;
  testCount: number;
  failedCount: number;
  compileError?: string;
}

export function recordSubmission(input: RecordSubmissionInput) {
  const submissionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const trackId = input.trackId || 'go';

  db.transaction((tx) => {
    tx.insert(submissions)
      .values({
        id: submissionId,
        userId: input.userId,
        trackId,
        chapterId: input.chapterId,
        code: input.code,
        passed: input.passed,
        testCount: input.testCount,
        failedCount: input.failedCount,
        compileError: input.compileError || null,
        createdAt: now,
      })
      .run();

    if (input.passed) {
      const existing = tx
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, input.userId),
            eq(userProgress.trackId, trackId),
            eq(userProgress.chapterId, input.chapterId)
          )
        )
        .get();

      if (!existing) {
        const progressId = crypto.randomUUID();
        tx.insert(userProgress)
          .values({
            id: progressId,
            userId: input.userId,
            trackId,
            chapterId: input.chapterId,
            completedAt: now,
          })
          .run();
      }
    }
  });

  return { submissionId, success: true };
}

export function getFailedAttemptsCount(userId: string, chapterId: string, trackId: string = 'go'): number {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        eq(submissions.trackId, trackId),
        eq(submissions.chapterId, chapterId),
        eq(submissions.passed, false)
      )
    )
    .get();

  return result?.count ?? 0;
}

export function getUserProgress(userId: string, options?: { trackId?: string; dateWindowDays?: number }) {
  const trackId = options?.trackId;

  const completedRecords = trackId
    ? db
        .select()
        .from(userProgress)
        .where(and(eq(userProgress.userId, userId), eq(userProgress.trackId, trackId)))
        .all()
    : db
        .select()
        .from(userProgress)
        .where(eq(userProgress.userId, userId))
        .all();

  const completedChapterIds = completedRecords.map((r) => r.chapterId);

  const dateWindowDays = options?.dateWindowDays ?? 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dateWindowDays);
  const dateThreshold = cutoffDate.toISOString();

  // Streak is computed across ALL submissions regardless of trackId
  const submissionRecords = db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        gte(submissions.createdAt, dateThreshold)
      )
    )
    .all();

  const submissionDates = submissionRecords.map((s) => s.createdAt);
  const streakDays = calculateStreak(submissionDates);

  return {
    userId,
    trackId,
    completedChapterIds,
    completedCount: completedChapterIds.length,
    submissionDates,
    streakDays,
  };
}

export function calculateModuleProgress(
  userId: string,
  totalModuleChapterIds: string[],
  trackId: string = 'go'
) {
  if (totalModuleChapterIds.length === 0) return 0;

  const completedRecords = db
    .select()
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.trackId, trackId),
        inArray(userProgress.chapterId, totalModuleChapterIds)
      )
    )
    .all();

  return Math.round((completedRecords.length / totalModuleChapterIds.length) * 100);
}

export function getLatestSubmission(userId: string, chapterId: string, trackId: string = 'go') {
  const result = db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        eq(submissions.trackId, trackId),
        eq(submissions.chapterId, chapterId)
      )
    )
    .orderBy(desc(submissions.createdAt))
    .limit(1)
    .get();

  return result || null;
}
