import { NextRequest, NextResponse } from 'next/server';
import { recordSubmission, getUserProgress, getFailedAttemptsCount } from '@/lib/db/submissionRepo';
import { getErrorMessage } from '@/lib/utils/errorUtils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, chapterId, code, passed, testCount, failedCount, compileError } = body;

    if (!userId || !chapterId || code === undefined || passed === undefined) {
      return NextResponse.json(
        { error: 'Missing required submission fields' },
        { status: 400 }
      );
    }

    const result = recordSubmission({
      userId,
      chapterId,
      code,
      passed,
      testCount: testCount || 0,
      failedCount: failedCount || 0,
      compileError,
    });

    const userProgress = getUserProgress(userId);
    const chapterFailedAttempts = getFailedAttemptsCount(userId, chapterId);

    return NextResponse.json(
      {
        ...result,
        userProgress,
        chapterFailedAttempts,
      },
      { status: 201 }
    );
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

    const progress = getUserProgress(userId);
    const chapterFailedAttempts = chapterId ? getFailedAttemptsCount(userId, chapterId) : 0;

    return NextResponse.json(
      {
        ...progress,
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
