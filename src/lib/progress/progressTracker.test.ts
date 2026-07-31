import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateProgressPercent,
  HttpProgressAdapter,
} from './progressTracker';
import { DrizzleProgressAdapter } from './drizzleProgressAdapter';
import { db } from '@/lib/db/connection';
import { userProgress, submissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

describe('ProgressTracker Domain & Adapters', () => {
  const testUserId = 'test-progress-user-1';
  const drizzleAdapter = new DrizzleProgressAdapter();

  beforeEach(() => {
    db.delete(submissions).where(eq(submissions.userId, testUserId)).run();
    db.delete(userProgress).where(eq(userProgress.userId, testUserId)).run();
    vi.restoreAllMocks();
  });

  describe('calculateProgressPercent', () => {
    it('calculates correct percentage rounded to whole number', () => {
      expect(calculateProgressPercent(['ch1', 'ch2'], ['ch1', 'ch2', 'ch3', 'ch4'])).toBe(50);
      expect(calculateProgressPercent(['ch1'], ['ch1', 'ch2', 'ch3'])).toBe(33);
    });

    it('returns 0 when total chapters is empty or completed is empty', () => {
      expect(calculateProgressPercent([], ['ch1', 'ch2'])).toBe(0);
      expect(calculateProgressPercent(['ch1'], [])).toBe(0);
    });
  });

  describe('DrizzleProgressAdapter', () => {
    it('fetches user progress correctly when no records exist', async () => {
      const progress = await drizzleAdapter.getProgress(testUserId);
      expect(progress.userId).toBe(testUserId);
      expect(progress.completedChapterIds).toEqual([]);
      expect(progress.completedCount).toBe(0);
      expect(progress.streakDays).toBe(0);
    });

    it('records passing submission, updates completed chapters and streak', async () => {
      const result = await drizzleAdapter.recordSubmission({
        userId: testUserId,
        chapterId: 'ch-1',
        code: 'package main',
        passed: true,
        testCount: 2,
        failedCount: 0,
      });

      expect(result.submissionId).toBeDefined();
      expect(result.userProgress.completedChapterIds).toContain('ch-1');
      expect(result.userProgress.completedCount).toBe(1);
      expect(result.chapterFailedAttempts).toBe(0);

      const fetched = await drizzleAdapter.getProgress(testUserId);
      expect(fetched.completedChapterIds).toContain('ch-1');
    });

    it('records failing submission and increments failed attempts count', async () => {
      const result = await drizzleAdapter.recordSubmission({
        userId: testUserId,
        chapterId: 'ch-2',
        code: 'package main error',
        passed: false,
        testCount: 2,
        failedCount: 1,
      });

      expect(result.userProgress.completedChapterIds).not.toContain('ch-2');
      expect(result.chapterFailedAttempts).toBe(1);

      const failedCount = await drizzleAdapter.getFailedAttempts(testUserId, 'ch-2');
      expect(failedCount).toBe(1);
    });

    it('returns latest submission for a chapter', async () => {
      await drizzleAdapter.recordSubmission({
        userId: testUserId,
        chapterId: 'ch-latest-1',
        code: 'func solve() { return 42 }',
        passed: true,
        testCount: 1,
        failedCount: 0,
      });

      const latest = await drizzleAdapter.getLatestSubmission(testUserId, 'ch-latest-1');
      expect(latest).toEqual({
        code: 'func solve() { return 42 }',
        passed: true,
      });
    });
  });

  describe('HttpProgressAdapter', () => {
    const httpAdapter = new HttpProgressAdapter();

    it('getProgress calls GET /api/submissions', async () => {
      const mockProgress = {
        userId: 'u-1',
        completedChapterIds: ['c-1'],
        completedCount: 1,
        streakDays: 2,
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProgress,
      });

      const res = await httpAdapter.getProgress('u-1');
      expect(fetch).toHaveBeenCalledWith('/api/submissions?userId=u-1');
      expect(res).toEqual(mockProgress);
    });

    it('recordSubmission calls POST /api/submissions', async () => {
      const mockResult = {
        userProgress: { userId: 'u-1', completedChapterIds: ['c-1'], completedCount: 1, streakDays: 1 },
        chapterFailedAttempts: 0,
        submissionId: 'sub-123',
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });

      const input = {
        userId: 'u-1',
        chapterId: 'c-1',
        code: 'package main',
        passed: true,
        testCount: 1,
        failedCount: 0,
      };
      const res = await httpAdapter.recordSubmission(input);

      expect(fetch).toHaveBeenCalledWith('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      expect(res).toEqual(mockResult);
    });

    it('getFailedAttempts calls GET /api/submissions with chapterId', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ chapterFailedAttempts: 3 }),
      });

      const attempts = await httpAdapter.getFailedAttempts('u-1', 'ch-9');
      expect(fetch).toHaveBeenCalledWith('/api/submissions?userId=u-1&chapterId=ch-9');
      expect(attempts).toBe(3);
    });

    it('getLatestSubmission calls GET /api/submissions and parses latestSubmission', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          latestSubmission: { code: 'package main\nfunc main(){}', passed: true },
        }),
      });

      const latest = await httpAdapter.getLatestSubmission('u-1', 'ch-1');
      expect(fetch).toHaveBeenCalledWith('/api/submissions?userId=u-1&chapterId=ch-1');
      expect(latest).toEqual({
        code: 'package main\nfunc main(){}',
        passed: true,
      });
    });

    it('throws error when fetch response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(httpAdapter.getProgress('u-1')).rejects.toThrow('fetchProgress failed with status 500');
    });
  });
});
