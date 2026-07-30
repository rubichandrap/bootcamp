export interface BenchMetrics {
  hasBench: boolean;
  nsPerOp: number;
  bytesPerOp: number;
  allocsPerOp: number;
  escapeLogs: string[];
}

export function parseBenchOutput(stdout: string, stderr: string): BenchMetrics {
  let hasBench = false;
  let nsPerOp = 0;
  let bytesPerOp = 0;
  let allocsPerOp = 0;

  // Regex pattern for go test -benchmem output line:
  // e.g. BenchmarkAdd-20    1000000000         0.2841 ns/op          0 B/op          0 allocs/op
  const benchRegex = /Benchmark\w+.*?\s+(\d+)\s+([\d.]+)\s+ns\/op\s+(\d+)\s+B\/op\s+(\d+)\s+allocs\/op/;

  const match = stdout.match(benchRegex);
  if (match) {
    hasBench = true;
    nsPerOp = parseFloat(match[2]);
    bytesPerOp = parseInt(match[3], 10);
    allocsPerOp = parseInt(match[4], 10);
  }

  // Parse escape analysis logs from gcflags="-m" in stderr or stdout
  const escapeLogs: string[] = [];
  const lines = (stderr + '\n' + stdout).split('\n');

  for (const line of lines) {
    if (
      line.includes('inline') ||
      line.includes('escapes to heap') ||
      line.includes('moved to heap') ||
      line.includes('does not escape')
    ) {
      escapeLogs.push(line.trim());
    }
  }

  return {
    hasBench,
    nsPerOp,
    bytesPerOp,
    allocsPerOp,
    escapeLogs,
  };
}
