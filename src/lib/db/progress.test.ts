import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordSubmission,
  getUserProgress,
  getFailedAttemptsCount,
  calculateModuleProgress,
  db,
  userProgress,
  submissions,
} from './progress';

describe('SQLite Progress Tracking & Submissions', () => {
  const testUserId = 'user-1';
  const chapterId = 'ch-1-1';

  beforeEach(() => {
    // Reset test database tables before each test run
    db.delete(submissions).run();
    db.delete(userProgress).run();
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
});
