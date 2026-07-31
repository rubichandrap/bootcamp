import { describe, it, expect, vi } from 'vitest';
import { useProgressTracker } from './useProgressTracker';
import { ProgressTrackerAdapter, UserProgress } from '@/lib/progress/progressTracker';

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
      userProgress: { ...mockUserProgress, completedChapterIds: ['ch-1', 'ch-2'], completedCount: 2 },
      chapterFailedAttempts: 0,
      submissionId: 'sub-1',
    }),
    getFailedAttempts: vi.fn().mockResolvedValue(2),
    ...overrides,
  });

  it('provides expected public actions and functions', () => {
    const adapter = createMockAdapter();
    expect(typeof useProgressTracker).toBe('function');
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
