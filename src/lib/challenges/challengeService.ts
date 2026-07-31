import { RCEExecuteResponse } from '@/app/api/rce/execute/route';
import {
  RecordSubmissionParams,
  RecordSubmissionResult,
  recordSubmission as recordSubmissionService,
  DEFAULT_USER_ID,
} from '@/lib/progress/progressService';

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
  chapterId: string;
  code: string;
  testCode: string;
  enableRaceCheck?: boolean;
  userId?: string;
  autoAdvanceDelayMs?: number;
}

export interface RunChallengePorts {
  executeRce: (params: ExecuteRceParams) => Promise<RCEExecuteResponse>;
  recordSubmission: (params: RecordSubmissionParams) => Promise<RecordSubmissionResult>;
  onAdvance: () => void;
  incrementFailedAttempts?: () => void;
}

export interface RunChallengeResult {
  result: RCEExecuteResponse;
  progressResult?: RecordSubmissionResult;
  isRceFailure?: boolean;
}

export async function runChallenge(
  params: RunChallengeParams,
  ports?: Partial<RunChallengePorts>
): Promise<RunChallengeResult> {
  const resolvedExecuteRce = ports?.executeRce || executeRce;
  const resolvedRecordSubmission = ports?.recordSubmission || recordSubmissionService;
  const autoAdvanceDelay = params.autoAdvanceDelayMs ?? 1500;

  let data: RCEExecuteResponse;
  try {
    data = await resolvedExecuteRce({
      code: params.code,
      testCode: params.testCode,
      enableRaceCheck: params.enableRaceCheck,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Execution failed';
    ports?.incrementFailedAttempts?.();
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

  let progressResult: RecordSubmissionResult | undefined;
  try {
    progressResult = await resolvedRecordSubmission({
      userId: params.userId || DEFAULT_USER_ID,
      chapterId: params.chapterId,
      code: params.code,
      passed: data.success,
      testCount: data.passed + data.failed,
      failedCount: data.failed,
      compileError: data.compileError,
    });
  } catch (err) {
    console.error('Failed to record submission', err);
  }

  if (data.success && ports?.onAdvance) {
    if (autoAdvanceDelay > 0) {
      setTimeout(() => {
        ports.onAdvance!();
      }, autoAdvanceDelay);
    } else {
      ports.onAdvance();
    }
  }

  return {
    result: data,
    progressResult,
  };
}
