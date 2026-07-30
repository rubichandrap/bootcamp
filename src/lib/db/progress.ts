import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, and } from 'drizzle-orm';
import { userProgress, submissions } from './schema';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dbDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(path.join(dbDir, 'app.db'));
export const db = drizzle(sqlite);

// Initialize database tables if not existing
sqlite.exec(`
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
  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Log submission
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

  // If submission passed, mark chapter as completed if not already marked
  if (input.passed) {
    const existing = db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, input.userId), eq(userProgress.chapterId, input.chapterId)))
      .get();

    if (!existing) {
      const progressId = `prog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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

  return {
    userId,
    completedChapterIds,
    completedCount: completedChapterIds.length,
  };
}
