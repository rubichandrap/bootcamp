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

  // Unescape JSON stdout lines if go test -json output is passed
  let fullText = stdout + '\n' + stderr;
  const lines = fullText.split('\n');

  let cleanText = '';
  for (const line of lines) {
    if (line.startsWith('{') && line.endsWith('}')) {
      try {
        const obj = JSON.parse(line);
        if (obj.Output) {
          cleanText += obj.Output;
        }
      } catch {
        cleanText += line + '\n';
      }
    } else {
      cleanText += line + '\n';
    }
  }

  // Regex pattern matching benchmark output:
  // e.g. BenchmarkAdd/Sub-20 1000000000 0.2841 ns/op 0 B/op 0 allocs/op
  const benchRegex = /Benchmark[\w/.-]+\s+\d+\s+(?<ns>[\d.]+)\s+ns\/op\s+(?<bytes>\d+)\s+B\/op\s+(?<allocs>\d+)\s+allocs\/op/;

  const match = cleanText.match(benchRegex);
  if (match && match.groups) {
    hasBench = true;
    nsPerOp = parseFloat(match.groups.ns);
    bytesPerOp = parseInt(match.groups.bytes, 10);
    allocsPerOp = parseInt(match.groups.allocs, 10);
  }

  // Parse compiler escape analysis logs from gcflags="-m"
  const escapeLogs: string[] = [];
  const textLines = cleanText.split('\n');

  for (const line of textLines) {
    const trimmed = line.trim();
    if (
      trimmed.includes('escapes to heap') ||
      trimmed.includes('moved to heap') ||
      trimmed.includes('does not escape') ||
      trimmed.includes('can inline')
    ) {
      if (!escapeLogs.includes(trimmed)) {
        escapeLogs.push(trimmed);
      }
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
