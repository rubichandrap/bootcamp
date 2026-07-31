import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchProgress,
  recordSubmission,
  fetchFailedAttemptsForChapter,
  incrementFailedAttempts,
  calculateProgressPercent,
} from './progressService';

describe('progressService', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('fetchProgress', () => {
    it('fetches progress data from /api/submissions with default userId', async () => {
      const mockResponse = { completedChapterIds: ['ch-1', 'ch-2'], streakDays: 3 };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      vi.stubGlobal('fetch', mockFetch);

      const progress = await fetchProgress();

      expect(mockFetch).toHaveBeenCalledWith('/api/submissions?userId=default-user');
      expect(progress).toEqual({ completedChapterIds: ['ch-1', 'ch-2'], streakDays: 3 });
    });

    it('handles custom userId and missing/malformed fields gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      vi.stubGlobal('fetch', mockFetch);

      const progress = await fetchProgress('user-123');

      expect(mockFetch).toHaveBeenCalledWith('/api/submissions?userId=user-123');
      expect(progress).toEqual({ completedChapterIds: [], streakDays: 0 });
    });
  });

  describe('recordSubmission', () => {
    it('posts submission data and returns updated progress and failed attempts', async () => {
      const mockResponseBody = {
        userProgress: { completedChapterIds: ['ch-1'], streakDays: 1 },
        chapterFailedAttempts: 2,
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponseBody,
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await recordSubmission({
        userId: 'default-user',
        chapterId: 'ch-1',
        code: 'package main',
        passed: true,
        testCount: 2,
        failedCount: 0,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default-user',
          chapterId: 'ch-1',
          code: 'package main',
          passed: true,
          testCount: 2,
          failedCount: 0,
        }),
      });
      expect(result).toEqual({
        completedChapterIds: ['ch-1'],
        streakDays: 1,
        chapterFailedAttempts: 2,
      });
    });
  });

  describe('fetchFailedAttemptsForChapter', () => {
    it('fetches failed attempts count for a specific chapter', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ chapterFailedAttempts: 4 }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const count = await fetchFailedAttemptsForChapter('ch-2');

      expect(mockFetch).toHaveBeenCalledWith('/api/submissions?userId=default-user&chapterId=ch-2');
      expect(count).toBe(4);
    });

    it('returns 0 if chapterFailedAttempts is not a number', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      vi.stubGlobal('fetch', mockFetch);

      const count = await fetchFailedAttemptsForChapter('ch-2');
      expect(count).toBe(0);
    });

    it('throws an error if response is not ok', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(fetchFailedAttemptsForChapter('ch-2')).rejects.toThrow(
        'fetchFailedAttemptsForChapter failed with status 500'
      );
    });
  });

  describe('incrementFailedAttempts', () => {
    it('increments the failed attempts counter by 1', () => {
      expect(incrementFailedAttempts(0)).toBe(1);
      expect(incrementFailedAttempts(3)).toBe(4);
    });
  });

  describe('calculateProgressPercent', () => {
    it('returns 0 when total chapters is empty', () => {
      expect(calculateProgressPercent(['ch-1'], [])).toBe(0);
    });

    it('returns rounded percentage of completed chapters', () => {
      expect(calculateProgressPercent(['ch-1'], ['ch-1', 'ch-2', 'ch-3'])).toBe(33);
      expect(calculateProgressPercent(['ch-1', 'ch-2'], ['ch-1', 'ch-2', 'ch-3', 'ch-4'])).toBe(50);
      expect(calculateProgressPercent(['ch-1', 'ch-2', 'ch-3'], ['ch-1', 'ch-2', 'ch-3'])).toBe(100);
    });
  });
});
