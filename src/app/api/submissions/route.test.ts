import { describe, it, expect } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/submissions endpoint', () => {
  it('should return chapterFailedAttempts count for a specific user and chapter', async () => {
    const userId = `user-lock-test-${Date.now()}`;
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
    expect(data.chapterFailedAttempts).toBe(2);
  });

  it('should support trackId filtering on POST and GET', async () => {
    const userId = `user-track-test-${Date.now()}`;
    const chapterId = 'ts-ch-1';

    const postReq = new NextRequest('http://localhost:3000/api/submissions', {
      method: 'POST',
      body: JSON.stringify({ userId, trackId: 'typescript', chapterId, code: 'const a = 1;', passed: true }),
      headers: { 'Content-Type': 'application/json' },
    });
    const postRes = await POST(postReq);
    expect(postRes.status).toBe(201);

    const getReq = new NextRequest(`http://localhost:3000/api/submissions?userId=${userId}&trackId=typescript`, {
      method: 'GET',
    });

    const getRes = await GET(getReq);
    const data = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(data.completedChapterIds).toContain('ts-ch-1');
  });
});
