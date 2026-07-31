import { NextRequest, NextResponse } from 'next/server';
import { DrizzleProgressAdapter } from '@/lib/progress/progressTracker';
import { getErrorMessage } from '@/lib/utils/errorUtils';

const progressAdapter = new DrizzleProgressAdapter();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, chapterId, code, passed, testCount, failedCount, compileError } = body;

    if (!userId || !chapterId || typeof code !== 'string' || typeof passed !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required submission fields' },
        { status: 400 }
      );
    }

    const result = await progressAdapter.recordSubmission({
      userId,
      chapterId,
      code,
      passed,
      testCount: typeof testCount === 'number' ? testCount : 0,
      failedCount: typeof failedCount === 'number' ? failedCount : 0,
      compileError: typeof compileError === 'string' ? compileError : undefined,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const chapterId = searchParams.get('chapterId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const userProgress = await progressAdapter.getProgress(userId);
    const chapterFailedAttempts = chapterId
      ? await progressAdapter.getFailedAttempts(userId, chapterId)
      : 0;

    return NextResponse.json(
      {
        ...userProgress,
        chapterFailedAttempts,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
