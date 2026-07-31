import { NextRequest, NextResponse } from 'next/server';
import { executeSubmission } from '@/lib/rce/rceEngine';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const response = await executeSubmission(body);
  return NextResponse.json(response, { status: 200 });
}
