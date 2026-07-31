import { READING_PROGRESS_MARKER } from '@/lib/content/contentConstants';
import {
  RecordSubmissionParams,
  RecordSubmissionResult,
  DEFAULT_USER_ID,
} from '@/lib/progress/progressService';

export interface MarkAsReadParams {
  chapterId: string;
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
    userId: params.userId || DEFAULT_USER_ID,
    chapterId: params.chapterId,
    code: READING_PROGRESS_MARKER,
    passed: true,
    testCount: 0,
    failedCount: 0,
  });
  ports.onAdvance();
  return result;
}
