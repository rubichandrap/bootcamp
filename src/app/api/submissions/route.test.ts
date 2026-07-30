import { describe, it, expect } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/submissions endpoint', () => {
  it('should return chapterFailedAttempts count for a specific user and chapter', async () => {
    const userId = 'user-lock-test';
    const chapterId = 'ch-lock-1';

    // Log 2 failing submissions
    const subReq1 = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify({ userId, chapterId, code: 'fail 1', passed: false }),
      headers: { 'Content-Type': 'application/json' },
    });
    await POST(subReq1);

    const subReq2 = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify({ userId, chapterId, code: 'fail 2', passed: false }),
      headers: { 'Content-Type': 'application/json' },
    });
    await POST(subReq2);

    // Query GET /api/submissions
    const getReq = new NextRequest(`http://localhost:3000/api/submissions?userId=${userId}&chapterId=${chapterId}`, {
      method: 'GET',
    });

    const res = await GET(getReq);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.chapterFailedAttempts).toBeGreaterThanOrEqual(2);
  });
});
