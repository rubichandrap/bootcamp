import { NextRequest, NextResponse } from 'next/server';
import { DrizzleProgressAdapter } from '@/lib/progress/progressTracker';
import { getErrorMessage } from '@/lib/utils/errorUtils';

const progressAdapter = new DrizzleProgressAdapter();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, chapterId, code, passed } = body;

    if (!userId || !chapterId || code === undefined || passed === undefined) {
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
      testCount: body.testCount || 0,
      failedCount: body.failedCount || 0,
      compileError: body.compileError,
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
    const { searchParams } = new URL(req.url);
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
        userProgress,
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
