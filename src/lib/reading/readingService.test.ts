import { describe, it, expect, vi } from 'vitest';
import { markAsRead } from './readingService';
import { READING_PROGRESS_MARKER } from '@/lib/content/contentConstants';

describe('readingService', () => {
  describe('markAsRead', () => {
    it('records a submission with READING_PROGRESS_MARKER and calls onAdvance', async () => {
      const mockRecordSubmission = vi.fn().mockResolvedValue({
        completedChapterIds: ['ch-reading-1'],
        streakDays: 2,
      });
      const mockOnAdvance = vi.fn();

      const result = await markAsRead(
        { chapterId: 'ch-reading-1' },
        { recordSubmission: mockRecordSubmission, onAdvance: mockOnAdvance }
      );

      expect(mockRecordSubmission).toHaveBeenCalledWith({
        userId: 'default-user',
        chapterId: 'ch-reading-1',
        code: READING_PROGRESS_MARKER,
        passed: true,
        testCount: 0,
        failedCount: 0,
      });
      expect(mockOnAdvance).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        completedChapterIds: ['ch-reading-1'],
        streakDays: 2,
      });
    });
  });
});
