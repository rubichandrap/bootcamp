import { NextRequest, NextResponse } from 'next/server';
import { DrizzleProgressAdapter } from '@/lib/progress/drizzleProgressAdapter';
import { getErrorMessage } from '@/lib/utils/errorUtils';

const progressAdapter = new DrizzleProgressAdapter();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, trackId, chapterId, code, passed, testCount, failedCount, compileError } = body;

    if (!userId || !chapterId || typeof code !== 'string' || typeof passed !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required submission fields' },
        { status: 400 }
      );
    }

    const result = await progressAdapter.recordSubmission({
      userId,
      trackId: typeof trackId === 'string' ? trackId : undefined,
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
    const trackId = searchParams.get('trackId') || undefined;
    const chapterId = searchParams.get('chapterId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const userProgress = await progressAdapter.getProgress(userId, trackId);
    const chapterFailedAttempts = chapterId
      ? await progressAdapter.getFailedSubmissions(userId, chapterId, trackId)
      : 0;
    const latestSubmission = chapterId
      ? await progressAdapter.getLatestSubmission(userId, chapterId, trackId)
      : null;

    return NextResponse.json(
      {
        ...userProgress,
        chapterFailedAttempts,
        latestSubmission,
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
