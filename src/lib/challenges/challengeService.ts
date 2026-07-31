import { RCEExecuteResponse } from '@/app/api/rce/execute/route';
import { RecordSubmissionParams, RecordSubmissionResult } from '@/lib/progress/progressService';

export interface ExecuteRceParams {
  code: string;
  testCode: string;
  enableRaceCheck?: boolean;
}

export async function executeRce(params: ExecuteRceParams): Promise<RCEExecuteResponse> {
  const res = await fetch('/api/rce/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: params.code,
      testCode: params.testCode,
      enableRaceCheck: params.enableRaceCheck,
    }),
  });
  if (!res.ok) {
    throw new Error(`RCE API request failed with status ${res.status}`);
  }
  return res.json();
}

export interface RunChallengeParams {
  currentChapterSlug: string;
  code: string;
  testCode: string;
  enableRaceCheck?: boolean;
  userId?: string;
}

export interface RunChallengePorts {
  executeRce: (params: ExecuteRceParams) => Promise<RCEExecuteResponse>;
  recordSubmission: (params: RecordSubmissionParams) => Promise<RecordSubmissionResult>;
  onAdvance: () => void;
}

export interface RunChallengeResult {
  result: RCEExecuteResponse;
  progressResult?: RecordSubmissionResult;
  isRceFailure?: boolean;
}

export async function runChallenge(
  params: RunChallengeParams,
  ports: RunChallengePorts
): Promise<RunChallengeResult> {
  try {
    const data = await ports.executeRce({
      code: params.code,
      testCode: params.testCode,
      enableRaceCheck: params.enableRaceCheck,
    });

    const progressResult = await ports.recordSubmission({
      userId: params.userId || 'default-user',
      chapterId: params.currentChapterSlug,
      code: params.code,
      passed: data.success,
      testCount: data.passed + data.failed,
      failedCount: data.failed,
      compileError: data.compileError,
    });

    if (data.success) {
      setTimeout(() => {
        ports.onAdvance();
      }, 1500);
    }

    return {
      result: data,
      progressResult,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Execution failed';
    return {
      result: {
        success: false,
        passed: 0,
        failed: 1,
        tests: [],
        compileError: errorMessage,
      },
      isRceFailure: true,
    };
  }
}
