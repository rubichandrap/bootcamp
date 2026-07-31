import { useCallback } from 'react';
import { markAsRead as markAsReadService } from '@/lib/reading/readingService';
import { RecordSubmissionInput, RecordSubmissionResult } from '@/lib/progress/progressTracker';

export interface MarkAsReadPorts {
  recordSubmission: (params: RecordSubmissionInput) => Promise<RecordSubmissionResult | undefined>;
  onAdvance: () => void;
}

export function useReadingSession() {
  const markAsRead = useCallback(
    async (chapterSlug: string, ports: MarkAsReadPorts, trackId?: string) => {
      try {
        await markAsReadService(
          { chapterId: chapterSlug, trackId },
          {
            recordSubmission: ports.recordSubmission,
            onAdvance: ports.onAdvance,
          }
        );
      } catch (err) {
        console.error('Failed to mark chapter read', err);
      }
    },
    []
  );

  return {
    markAsRead,
  };
}
