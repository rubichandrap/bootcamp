import { NextRequest, NextResponse } from 'next/server';
import {
  executeSubmission,
  RCE_TIMEOUT_MS,
  TestResultItem,
  SubmissionExecutionResult as RCEExecuteResponse,
} from '@/lib/rce/rceEngine';
import { getErrorMessage } from '@/lib/utils/errorUtils';

export { RCE_TIMEOUT_MS };
export type { TestResultItem, RCEExecuteResponse };

export async function POST(req: NextRequest) {
  try {
    const { code, testCode, trackId, enableRaceCheck } = await req.json();

    if (!code || !testCode) {
      return NextResponse.json(
        { error: 'Missing code or testCode' },
        { status: 400 }
      );
    }

    const response = await executeSubmission({
      code,
      testCode,
      trackId,
      enableRaceCheck,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
