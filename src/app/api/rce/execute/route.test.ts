import { describe, it, expect } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/rce/execute', () => {
  it('should compile and pass a valid Go code submission', async () => {
    const code = `package main

func Add(a, b int) int {
	return a + b
}
`;
    const testCode = `package main

import "testing"

func TestAdd(t *testing.T) {
	if Add(2, 3) != 5 {
		t.Errorf("expected 5, got %d", Add(2, 3))
	}
}
`;

    const req = new NextRequest('http://localhost:3000/api/rce/execute', {
      method: 'POST',
      body: JSON.stringify({ code, testCode, language: 'go' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.passed).toBeGreaterThanOrEqual(1);
    expect(data.failed).toBe(0);
    expect(data.tests[0].name).toBe('TestAdd');
    expect(data.tests[0].passed).toBe(true);
  });

  it('should capture failing tests accurately', async () => {
    const code = `package main

func Add(a, b int) int {
	return a - b // incorrect logic
}
`;
    const testCode = `package main

import "testing"

func TestAdd(t *testing.T) {
	if Add(2, 3) != 5 {
		t.Errorf("expected 5, got %d", Add(2, 3))
	}
}
`;

    const req = new NextRequest('http://localhost:3000/api/rce/execute', {
      method: 'POST',
      body: JSON.stringify({ code, testCode, language: 'go' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.failed).toBeGreaterThanOrEqual(1);
  });

  it('should handle syntax compile errors gracefully', async () => {
    const code = `package main

func BrokenSyntax() {
	invalid syntax here
}
`;
    const testCode = `package main

import "testing"

func TestBroken(t *testing.T) {
	BrokenSyntax()
}
`;

    const req = new NextRequest('http://localhost:3000/api/rce/execute', {
      method: 'POST',
      body: JSON.stringify({ code, testCode, language: 'go' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.compileError).toBeTruthy();
  });

  it('should pass enableRaceCheck flag and return hasRaceDetected boolean field', async () => {
    const code = `package main

func Add(a, b int) int {
	return a + b
}
`;
    const testCode = `package main

import "testing"

func TestAdd(t *testing.T) {
	if Add(2, 3) != 5 {
		t.Errorf("expected 5, got %d", Add(2, 3))
	}
}
`;

    const req = new NextRequest('http://localhost:3000/api/rce/execute', {
      method: 'POST',
      body: JSON.stringify({ code, testCode, enableRaceCheck: true, language: 'go' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.hasRaceDetected).toBeDefined();
    expect(data.hasRaceDetected).toBe(false);
  });

  it('fails fast with a clear error when language is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/rce/execute', {
      method: 'POST',
      body: JSON.stringify({ code: 'package main', testCode: 'func TestX(t *testing.T){}' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.compileError).toMatch(/language/i);
  });

  it('fails fast with a clear error for an unsupported language', async () => {
    const req = new NextRequest('http://localhost:3000/api/rce/execute', {
      method: 'POST',
      body: JSON.stringify({
        code: 'package main',
        testCode: 'func TestX(t *testing.T){}',
        language: 'ruby',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.compileError).toMatch(/unsupported/i);
  });
});
