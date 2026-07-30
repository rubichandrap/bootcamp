import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, and, inArray } from 'drizzle-orm';
import { userProgress, submissions } from './schema';
import { calculateStreak } from '@/lib/metrics/streak';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const dbDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(path.join(dbDir, 'app.db'));
export const db = drizzle(sqlite);

export { userProgress, submissions };

export interface RecordSubmissionInput {
  userId: string;
  chapterId: string;
  code: string;
  passed: boolean;
  testCount: number;
  failedCount: number;
  compileError?: string;
}

export function recordSubmission(input: RecordSubmissionInput) {
  const submissionId = randomUUID();
  const now = new Date().toISOString();

  db.insert(submissions)
    .values({
      id: submissionId,
      userId: input.userId,
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
    const existing = db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, input.userId), eq(userProgress.chapterId, input.chapterId)))
      .get();

    if (!existing) {
      const progressId = randomUUID();
      db.insert(userProgress)
        .values({
          id: progressId,
          userId: input.userId,
          chapterId: input.chapterId,
          completedAt: now,
        })
        .run();
    }
  }

  return { submissionId, success: true };
}

export function getFailedAttemptsCount(userId: string, chapterId: string): number {
  const failedRecords = db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.userId, userId),
        eq(submissions.chapterId, chapterId),
        eq(submissions.passed, false)
      )
    )
    .all();

  return failedRecords.length;
}

export function getUserProgress(userId: string) {
  const completedRecords = db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .all();

  const completedChapterIds = completedRecords.map((r) => r.chapterId);

  const submissionRecords = db
    .select()
    .from(submissions)
    .where(eq(submissions.userId, userId))
    .all();

  const submissionDates = submissionRecords.map((s) => s.createdAt);
  const streakDays = calculateStreak(submissionDates);

  return {
    userId,
    completedChapterIds,
    completedCount: completedChapterIds.length,
    submissionDates,
    streakDays,
  };
}

export function calculateModuleProgress(userId: string, totalModuleChapterIds: string[]) {
  if (totalModuleChapterIds.length === 0) return 0;
  
  const completedRecords = db
    .select()
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        inArray(userProgress.chapterId, totalModuleChapterIds)
      )
    )
    .all();

  return Math.round((completedRecords.length / totalModuleChapterIds.length) * 100);
}
