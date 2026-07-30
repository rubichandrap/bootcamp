import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, and } from 'drizzle-orm';
import { users, modules, chapters, userProgress, submissions } from './schema';
import { calculateStreak } from '@/lib/search/searchEngine';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

const dbDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(path.join(dbDir, 'app.db'));
export const db = drizzle(sqlite);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    "order" INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    completed_at TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    code TEXT NOT NULL,
    passed INTEGER NOT NULL,
    test_count INTEGER NOT NULL,
    failed_count INTEGER NOT NULL,
    compile_error TEXT,
    created_at TEXT NOT NULL
  );
`);

export { users, modules, chapters, userProgress, submissions };

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
  
  const userCompleted = getUserProgress(userId).completedChapterIds;
  const completedInModule = totalModuleChapterIds.filter((id) => userCompleted.includes(id));

  return Math.round((completedInModule.length / totalModuleChapterIds.length) * 100);
}
