import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeRce, runChallenge } from './challengeService';
import { RCEExecuteResponse } from '@/app/api/rce/execute/route';

describe('challengeService', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = originalFetch;
  });

  describe('executeRce', () => {
    it('posts code and testCode to /api/rce/execute', async () => {
      const mockResult: RCEExecuteResponse = {
        success: true,
        passed: 2,
        failed: 0,
        tests: [],
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await executeRce({
        code: 'package main',
        testCode: 'package main_test',
        enableRaceCheck: true,
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/rce/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'package main',
          testCode: 'package main_test',
          enableRaceCheck: true,
        }),
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('runChallenge', () => {
    it('executes RCE, records passing submission, and calls onAdvance after delay', async () => {
      const mockRceResponse: RCEExecuteResponse = {
        success: true,
        passed: 1,
        failed: 0,
        tests: [],
      };
      const mockExecuteRce = vi.fn().mockResolvedValue(mockRceResponse);
      const mockRecordSubmission = vi.fn().mockResolvedValue({
        completedChapterIds: ['ch-1'],
        streakDays: 1,
        chapterFailedAttempts: 0,
      });
      const mockOnAdvance = vi.fn();

      const runPromise = runChallenge(
        {
          currentChapterSlug: 'ch-1',
          code: 'package main',
          testCode: 'package main_test',
          enableRaceCheck: false,
        },
        {
          executeRce: mockExecuteRce,
          recordSubmission: mockRecordSubmission,
          onAdvance: mockOnAdvance,
        }
      );

      const res = await runPromise;

      expect(mockExecuteRce).toHaveBeenCalledWith({
        code: 'package main',
        testCode: 'package main_test',
        enableRaceCheck: false,
      });
      expect(mockRecordSubmission).toHaveBeenCalledWith({
        userId: 'default-user',
        chapterId: 'ch-1',
        code: 'package main',
        passed: true,
        testCount: 1,
        failedCount: 0,
        compileError: undefined,
      });
      expect(res.result).toEqual(mockRceResponse);
      expect(res.progressResult).toEqual({
        completedChapterIds: ['ch-1'],
        streakDays: 1,
        chapterFailedAttempts: 0,
      });

      expect(mockOnAdvance).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1500);
      expect(mockOnAdvance).toHaveBeenCalledTimes(1);
    });

    it('does not auto-advance when test execution fails', async () => {
      const mockRceResponse: RCEExecuteResponse = {
        success: false,
        passed: 0,
        failed: 1,
        tests: [],
      };
      const mockExecuteRce = vi.fn().mockResolvedValue(mockRceResponse);
      const mockRecordSubmission = vi.fn().mockResolvedValue({
        completedChapterIds: [],
        streakDays: 0,
        chapterFailedAttempts: 1,
      });
      const mockOnAdvance = vi.fn();

      const res = await runChallenge(
        {
          currentChapterSlug: 'ch-1',
          code: 'package main',
          testCode: 'package main_test',
        },
        {
          executeRce: mockExecuteRce,
          recordSubmission: mockRecordSubmission,
          onAdvance: mockOnAdvance,
        }
      );

      expect(res.result.success).toBe(false);
      vi.advanceTimersByTime(2000);
      expect(mockOnAdvance).not.toHaveBeenCalled();
    });

    it('handles RCE API failure gracefully when RCE execution throws', async () => {
      const mockExecuteRce = vi.fn().mockRejectedValue(new Error('Network error'));
      const mockRecordSubmission = vi.fn();
      const mockOnAdvance = vi.fn();

      const res = await runChallenge(
        {
          currentChapterSlug: 'ch-1',
          code: 'package main',
          testCode: 'package main_test',
        },
        {
          executeRce: mockExecuteRce,
          recordSubmission: mockRecordSubmission,
          onAdvance: mockOnAdvance,
        }
      );

      expect(res.result).toEqual({
        success: false,
        passed: 0,
        failed: 1,
        tests: [],
        compileError: 'Network error',
      });
      expect(res.isRceFailure).toBe(true);
      expect(mockRecordSubmission).not.toHaveBeenCalled();
      expect(mockOnAdvance).not.toHaveBeenCalled();
    });
  });
});
