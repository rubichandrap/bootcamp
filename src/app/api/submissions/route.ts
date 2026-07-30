import { NextRequest, NextResponse } from 'next/server';
import { recordSubmission, getUserProgress } from '@/lib/db/progress';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 'default-user', chapterId, code, passed, testCount, failedCount, compileError } = body;

    if (!chapterId || code === undefined || passed === undefined) {
      return NextResponse.json({ error: 'Missing required submission parameters' }, { status: 400 });
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

    const userProgressData = getUserProgress(userId);

    return NextResponse.json({
      ...result,
      userProgress: userProgressData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record submission' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default-user';

    const userProgressData = getUserProgress(userId);
    return NextResponse.json(userProgressData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch progress' }, { status: 500 });
  }
}
