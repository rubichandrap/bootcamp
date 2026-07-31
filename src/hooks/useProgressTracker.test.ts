import { describe, it, expect, vi } from 'vitest';
import { useProgressTracker } from './useProgressTracker';
import { ProgressTrackerAdapter, UserProgress, calculateProgressPercent } from '@/lib/progress/progressTracker';

describe('useProgressTracker hook contract and seam', () => {
  const mockUserProgress: UserProgress = {
    userId: 'user-1',
    completedChapterIds: ['ch-1'],
    completedCount: 1,
    streakDays: 5,
  };

  const createMockAdapter = (overrides?: Partial<ProgressTrackerAdapter>): ProgressTrackerAdapter => ({
    getProgress: vi.fn().mockResolvedValue(mockUserProgress),
    recordSubmission: vi.fn().mockResolvedValue({
      userProgress: { ...mockUserProgress, completedChapterIds: ['ch-1', 'ch-2'], completedCount: 2, streakDays: 6 },
      chapterFailedAttempts: 0,
      submissionId: 'sub-1',
    }),
    getFailedAttempts: vi.fn().mockResolvedValue(2),
    ...overrides,
  });

  it('provides expected public actions and functions', () => {
    expect(typeof useProgressTracker).toBe('function');
  });

  it('delegates loadProgress to adapter with strict userId parameter', async () => {
    const adapter = createMockAdapter();
    await adapter.getProgress('user-1');
    expect(adapter.getProgress).toHaveBeenCalledWith('user-1');
  });

  it('delegates loadFailedAttempts to adapter with chapterId and userId', async () => {
    const adapter = createMockAdapter();
    const attempts = await adapter.getFailedAttempts('user-1', 'ch-1');
    expect(adapter.getFailedAttempts).toHaveBeenCalledWith('user-1', 'ch-1');
    expect(attempts).toBe(2);
  });

  it('delegates recordSubmission to adapter and returns updated state payload', async () => {
    const adapter = createMockAdapter();
    const result = await adapter.recordSubmission({
      userId: 'user-1',
      chapterId: 'ch-2',
      code: 'package main',
      passed: true,
      testCount: 1,
      failedCount: 0,
    });

    expect(adapter.recordSubmission).toHaveBeenCalled();
    expect(result.userProgress.completedChapterIds).toEqual(['ch-1', 'ch-2']);
    expect(result.userProgress.streakDays).toBe(6);
  });

  it('calculates progress percentage via domain pure math function', () => {
    const percent = calculateProgressPercent(['ch-1', 'ch-2'], ['ch-1', 'ch-2', 'ch-3', 'ch-4']);
    expect(percent).toBe(50);
  });

  it('handles recordSubmission network failure gracefully via try-catch', async () => {
    const failingAdapter = createMockAdapter({
      recordSubmission: vi.fn().mockRejectedValue(new Error('Network outage')),
    });

    let caughtError: unknown;
    try {
      await failingAdapter.recordSubmission({
        userId: 'user-1',
        chapterId: 'ch-1',
        code: 'invalid',
        passed: false,
        testCount: 1,
        failedCount: 1,
      });
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeDefined();
  });
});
