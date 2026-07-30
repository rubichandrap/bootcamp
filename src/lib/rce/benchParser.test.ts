import { describe, it, expect } from 'vitest';
import { parseBenchOutput } from './benchParser';

describe('Go Benchmark & Memory Allocation Parser', () => {
  it('should parse bytes/op, allocs/op, and ns/op from benchmark output', () => {
    const stdout = `
goos: linux
goarch: amd64
pkg: challenge
cpu: 13th Gen Intel(R) Core(TM) i7-13700H
BenchmarkAdd-20    	1000000000	         0.2841 ns/op	       0 B/op	       0 allocs/op
PASS
ok  	challenge	0.334s
`;
    const stderr = `./main.go:4:6: can inline Add\n./main.go:8:13: inlining call to Add\n`;

    const metrics = parseBenchOutput(stdout, stderr);

    expect(metrics.hasBench).toBe(true);
    expect(metrics.bytesPerOp).toBe(0);
    expect(metrics.allocsPerOp).toBe(0);
    expect(metrics.nsPerOp).toBeCloseTo(0.2841);
    expect(metrics.escapeLogs.some((l) => l.includes('can inline Add'))).toBe(true);
  });

  it('should handle benchmark output with memory allocations', () => {
    const stdout = `
BenchmarkHeapAlloc-20    	 5000000	       240.5 ns/op	      64 B/op	       2 allocs/op
`;
    const metrics = parseBenchOutput(stdout, '');

    expect(metrics.hasBench).toBe(true);
    expect(metrics.bytesPerOp).toBe(64);
    expect(metrics.allocsPerOp).toBe(2);
  });
});
