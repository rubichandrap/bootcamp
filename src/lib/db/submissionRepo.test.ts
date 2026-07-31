import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordSubmission,
  getUserProgress,
  getTrackProgress,
  getOverallProgress,
  getStreak,
  getFailedAttemptsCount,
  calculateModuleProgress,
  getLatestSubmission,
  userProgress,
  submissions,
} from './submissionRepo';
import { db } from './connection';
import { eq, sql } from 'drizzle-orm';

describe('SQLite Progress Tracking & Submissions', () => {
  const testUserId = 'user-progress-test-1';
  const chapterId = 'ch-1-1';

  beforeEach(() => {
    // Reset test database tables scoped to testUserId before each test run
    db.delete(submissions).where(eq(submissions.userId, testUserId)).run();
    db.delete(userProgress).where(eq(userProgress.userId, testUserId)).run();
  });

  it('should log a submission attempt and mark chapter completed when passed is true', () => {
    const res = recordSubmission({
      userId: testUserId,
      chapterId: chapterId,
      code: 'package main',
      passed: true,
      testCount: 2,
      failedCount: 0,
    });

    expect(res.submissionId).toBeTruthy();

    const progress = getUserProgress(testUserId);
    expect(progress.completedChapterIds).toContain(chapterId);
    expect(progress.completedCount).toBe(1);
  });

  it('should log failing submissions without marking the chapter as completed', () => {
    const res = recordSubmission({
      userId: testUserId,
      chapterId: 'ch-1-2',
      code: 'package main // bug',
      passed: false,
      testCount: 2,
      failedCount: 1,
      compileError: 'syntax error',
    });

    expect(res.submissionId).toBeTruthy();

    const progress = getUserProgress(testUserId);
    expect(progress.completedChapterIds).not.toContain('ch-1-2');
  });

  it('should query and return the exact failed attempt count for a user and chapter', () => {
    recordSubmission({
      userId: testUserId,
      chapterId: 'ch-failed-test',
      code: 'fail 1',
      passed: false,
      testCount: 1,
      failedCount: 1,
    });

    recordSubmission({
      userId: testUserId,
      chapterId: 'ch-failed-test',
      code: 'fail 2',
      passed: false,
      testCount: 1,
      failedCount: 1,
    });

    recordSubmission({
      userId: testUserId,
      chapterId: 'ch-failed-test',
      code: 'pass 3',
      passed: true,
      testCount: 1,
      failedCount: 0,
    });

    const failedCount = getFailedAttemptsCount(testUserId, 'ch-failed-test');
    expect(failedCount).toBe(2);
  });

  it('should calculate exact module progress percentage based on completed chapters', () => {
    const moduleChapters = ['ch-mod-1', 'ch-mod-2', 'ch-mod-3', 'ch-mod-4'];

    recordSubmission({
      userId: testUserId,
      chapterId: 'ch-mod-1',
      code: 'pass 1',
      passed: true,
      testCount: 1,
      failedCount: 0,
    });

    recordSubmission({
      userId: testUserId,
      chapterId: 'ch-mod-3',
      code: 'pass 3',
      passed: true,
      testCount: 1,
      failedCount: 0,
    });

    const percent = calculateModuleProgress(testUserId, moduleChapters);
    expect(percent).toBe(50);
  });

  it('should commit submission and progress rows atomically on a passing submission', () => {
    recordSubmission({
      userId: testUserId,
      chapterId: 'ch-atomic-commit',
      code: 'package main',
      passed: true,
      testCount: 2,
      failedCount: 0,
    });

    const submissionCount = db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(eq(submissions.chapterId, 'ch-atomic-commit'))
      .get();

    const progressCount = db
      .select({ count: sql<number>`count(*)` })
      .from(userProgress)
      .where(eq(userProgress.chapterId, 'ch-atomic-commit'))
      .get();

    expect(submissionCount?.count).toBe(1);
    expect(progressCount?.count).toBe(1);
  });

  it('should roll back all writes when a transaction throws', () => {
    const testId = 'test-tx-rollback-' + crypto.randomUUID();

    expect(() =>
      db.transaction((tx) => {
        tx.insert(submissions)
          .values({
            id: testId,
            userId: testUserId,
            chapterId: 'ch-tx-rollback',
            code: 'rollback test',
            passed: true,
            testCount: 1,
            failedCount: 0,
            compileError: null,
            createdAt: new Date().toISOString(),
          })
          .run();

        // Duplicate primary key — triggers constraint violation
        tx.insert(submissions)
          .values({
            id: testId,
            userId: testUserId,
            chapterId: 'ch-tx-rollback-2',
            code: 'rollback test 2',
            passed: true,
            testCount: 1,
            failedCount: 0,
            compileError: null,
            createdAt: new Date().toISOString(),
          })
          .run();
      })
    ).toThrow();

    const result = db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(eq(submissions.id, testId))
      .get();

    expect(result?.count).toBe(0);
  });

  it('should return 0 from getFailedAttemptsCount when user has no submissions', () => {
    const count = getFailedAttemptsCount('user-no-submissions', 'any-chapter');
    expect(count).toBe(0);
  });

  it('should return correct count from getFailedAttemptsCount with many mixed submissions', () => {
    const manyChapter = 'ch-many-fails';
    const manyUser = testUserId;

    // 5 failed submissions
    for (let i = 0; i < 5; i++) {
      recordSubmission({
        userId: manyUser,
        chapterId: manyChapter,
        code: `fail ${i}`,
        passed: false,
        testCount: 1,
        failedCount: 1,
      });
    }

    // 3 passing submissions (should not be counted)
    for (let i = 0; i < 3; i++) {
      recordSubmission({
        userId: manyUser,
        chapterId: manyChapter,
        code: `pass ${i}`,
        passed: true,
        testCount: 1,
        failedCount: 0,
      });
    }

    const count = getFailedAttemptsCount(manyUser, manyChapter);
    expect(count).toBe(5);
  });

  it('should filter out submissions older than the date window in getUserProgress', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 60);
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 1);

    db.insert(submissions)
      .values({
        id: 'test-old-' + crypto.randomUUID(),
        userId: testUserId,
        chapterId: 'ch-old-submission',
        code: 'old code',
        passed: false,
        testCount: 1,
        failedCount: 1,
        compileError: null,
        createdAt: oldDate.toISOString(),
      })
      .run();

    db.insert(submissions)
      .values({
        id: 'test-recent-' + crypto.randomUUID(),
        userId: testUserId,
        chapterId: 'ch-recent-submission',
        code: 'recent code',
        passed: true,
        testCount: 1,
        failedCount: 0,
        compileError: null,
        createdAt: recentDate.toISOString(),
      })
      .run();

    const progress = getUserProgress(testUserId);

    expect(progress.submissionDates).toHaveLength(1);
  });

  it('should include submissions within the custom date window', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);
    const recentDate2 = new Date();
    recentDate2.setDate(recentDate2.getDate() - 5);

    db.insert(submissions)
      .values({
        id: 'test-window-' + crypto.randomUUID(),
        userId: testUserId,
        chapterId: 'ch-window-1',
        code: 'code',
        passed: false,
        testCount: 1,
        failedCount: 1,
        compileError: null,
        createdAt: recentDate.toISOString(),
      })
      .run();

    db.insert(submissions)
      .values({
        id: 'test-window-' + crypto.randomUUID(),
        userId: testUserId,
        chapterId: 'ch-window-2',
        code: 'code',
        passed: false,
        testCount: 1,
        failedCount: 1,
        compileError: null,
        createdAt: recentDate2.toISOString(),
      })
      .run();

    const progress = getUserProgress(testUserId, { dateWindowDays: 10 });

    expect(progress.submissionDates).toHaveLength(2);
  });

  it('should return the latest submission for a user and chapter', () => {
    recordSubmission({
      userId: testUserId,
      chapterId: 'ch-latest-test',
      code: 'code 1',
      passed: false,
      testCount: 1,
      failedCount: 1,
    });

    recordSubmission({
      userId: testUserId,
      chapterId: 'ch-latest-test',
      code: 'code 2 - latest answer',
      passed: true,
      testCount: 1,
      failedCount: 0,
    });

    const latest = getLatestSubmission(testUserId, 'ch-latest-test');
    expect(latest).not.toBeNull();
    expect(latest?.code).toBe('code 2 - latest answer');
    expect(latest?.passed).toBe(true);
  });

  it('should isolate completed chapters by trackId while keeping a unified streak', () => {
    recordSubmission({
      userId: testUserId,
      trackId: 'go',
      chapterId: 'go-ch-1',
      code: 'package main',
      passed: true,
      testCount: 1,
      failedCount: 0,
    });

    recordSubmission({
      userId: testUserId,
      trackId: 'typescript',
      chapterId: 'ts-ch-1',
      code: 'const x = 1;',
      passed: true,
      testCount: 1,
      failedCount: 0,
    });

    const goProgress = getUserProgress(testUserId, { trackId: 'go' });
    expect(goProgress.completedChapterIds).toEqual(['go-ch-1']);
    expect(goProgress.completedCount).toBe(1);

    const tsProgress = getUserProgress(testUserId, { trackId: 'typescript' });
    expect(tsProgress.completedChapterIds).toEqual(['ts-ch-1']);
    expect(tsProgress.completedCount).toBe(1);

    const overallProgress = getUserProgress(testUserId);
    expect(overallProgress.completedChapterIds).toHaveLength(2);
    expect(overallProgress.streakDays).toBeGreaterThanOrEqual(1);
  });

  it('provides explicit getTrackProgress, getOverallProgress, and getStreak helpers', () => {
    recordSubmission({
      userId: testUserId,
      trackId: 'go',
      chapterId: 'go-ch-100',
      code: 'package main',
      passed: true,
      testCount: 1,
      failedCount: 0,
    });

    const trackProg = getTrackProgress(testUserId, 'go');
    expect(trackProg.trackId).toBe('go');
    expect(trackProg.completedChapterIds).toContain('go-ch-100');

    const overallProg = getOverallProgress(testUserId);
    expect(overallProg.completedCount).toBeGreaterThanOrEqual(1);

    const streak = getStreak(testUserId);
    expect(streak).toBeGreaterThanOrEqual(1);
  });
});
