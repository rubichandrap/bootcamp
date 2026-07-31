import { READING_COMPLETION_MARKER } from '@/lib/content/contentConstants';
import { RecordSubmissionParams, RecordSubmissionResult } from '@/lib/progress/progressService';

export interface MarkAsReadParams {
  currentChapterSlug: string;
  userId?: string;
}

export interface MarkAsReadPorts {
  recordSubmission: (params: RecordSubmissionParams) => Promise<RecordSubmissionResult>;
  onAdvance: () => void;
}

export async function markAsRead(
  params: MarkAsReadParams,
  ports: MarkAsReadPorts
): Promise<RecordSubmissionResult> {
  const result = await ports.recordSubmission({
    userId: params.userId || 'default-user',
    chapterId: params.currentChapterSlug,
    code: READING_COMPLETION_MARKER,
    passed: true,
    testCount: 0,
    failedCount: 0,
  });
  ports.onAdvance();
  return result;
}
