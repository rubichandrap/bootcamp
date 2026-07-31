import { READING_PROGRESS_MARKER } from '@/lib/content/contentConstants';
import {
  RecordSubmissionInput,
  RecordSubmissionResult,
  DEFAULT_USER_ID,
} from '@/lib/progress/progressTracker';

export interface MarkAsReadParams {
  chapterId: string;
  trackId?: string;
  userId?: string;
}

export interface MarkAsReadPorts {
  recordSubmission: (params: RecordSubmissionInput) => Promise<RecordSubmissionResult | undefined>;
  onAdvance: () => void;
}

export async function markAsRead(
  params: MarkAsReadParams,
  ports: MarkAsReadPorts
): Promise<RecordSubmissionResult | undefined> {
  const result = await ports.recordSubmission({
    userId: params.userId || DEFAULT_USER_ID,
    trackId: params.trackId,
    chapterId: params.chapterId,
    code: READING_PROGRESS_MARKER,
    passed: true,
    testCount: 0,
    failedCount: 0,
  });

  if (ports.onAdvance) {
    ports.onAdvance();
  }

  return result;
}
