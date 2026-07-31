import { useCallback } from 'react';
import { markAsRead as markAsReadService } from '@/lib/reading/readingService';
import { RecordSubmissionParams, RecordSubmissionResult } from '@/lib/progress/progressService';

export interface MarkAsReadPorts {
  recordSubmission: (params: RecordSubmissionParams) => Promise<RecordSubmissionResult>;
  onAdvance: () => void;
}

export function useReadingSession() {
  const markAsRead = useCallback(
    async (chapterSlug: string, ports: MarkAsReadPorts) => {
      try {
        await markAsReadService(
          { chapterId: chapterSlug },
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
