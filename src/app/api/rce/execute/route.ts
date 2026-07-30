import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { parseBenchOutput, BenchMetrics } from '@/lib/rce/benchParser';

const execAsync = promisify(exec);

export interface TestResultItem {
  name: string;
  passed: boolean;
  duration?: number;
  output?: string;
}

export interface RCEExecuteResponse {
  success: boolean;
  passed: number;
  failed: number;
  tests: TestResultItem[];
  compileError?: string;
  rawOutput?: string;
  bench?: BenchMetrics;
  hasRaceDetected?: boolean;
}

function getGoEnv() {
  const home = os.homedir();
  const gvmGoBin = path.join(home, '.gvm/gos/go1.20/bin');
  const gvmRoot = path.join(home, '.gvm/gos/go1.20');
  const currentPath = process.env.PATH || '';

  const extendedPath = [
    gvmGoBin,
    '/usr/local/go/bin',
    path.join(home, '.local/bin'),
    currentPath,
  ].join(':');

  return {
    ...process.env,
    PATH: extendedPath,
    GOROOT: gvmRoot,
    GOCACHE: path.join(os.tmpdir(), 'go-build-cache'),
  };
}

export async function POST(req: NextRequest) {
  try {
    const { code, testCode, enableRaceCheck } = await req.json();

    if (!code || !testCode) {
      return NextResponse.json(
        { error: 'Missing code or testCode' },
        { status: 400 }
      );
    }

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'go-rce-'));

    try {
      const goModContent = `module challenge\n\ngo 1.20\n`;
      await fs.writeFile(path.join(tmpDir, 'go.mod'), goModContent, 'utf-8');
      await fs.writeFile(path.join(tmpDir, 'main.go'), code, 'utf-8');
      await fs.writeFile(path.join(tmpDir, 'main_test.go'), testCode, 'utf-8');

      let stdout = '';
      let stderr = '';
      let compileError: string | undefined = undefined;

      const raceFlag = enableRaceCheck ? '-race' : '';
      const hasBenchFunctions = testCode.includes('Benchmark');
      const benchFlags = hasBenchFunctions ? '-bench=. -benchmem -gcflags="-m"' : '';
      const cmd = `go test -v ${raceFlag} ${benchFlags} -json ./...`;

      try {
        const result = await execAsync(cmd, {
          cwd: tmpDir,
          timeout: 8000,
          env: getGoEnv(),
        });
        stdout = result.stdout;
        stderr = result.stderr;
      } catch (err: any) {
        stdout = err.stdout || '';
        stderr = err.stderr || err.message || '';

        if (!stdout.includes('"Action":"output"') && stderr) {
          compileError = stderr;
        }
      }

      // Parse benchmark metrics
      const bench = parseBenchOutput(stdout, stderr);

      // Detect data race warnings in output
      const rawText = stdout + '\n' + stderr;
      const hasRaceDetected = rawText.includes('WARNING: DATA RACE') || rawText.includes('Found 1 data race');

      // Parse go test -json stream output
      const lines = stdout.split('\n').filter(Boolean);
      const testsMap = new Map<string, { name: string; passed: boolean; duration: number; output: string[] }>();

      let overallPassed = true;

      for (const line of lines) {
        try {
          const evt = JSON.parse(line);
          if (evt.Test) {
            if (!testsMap.has(evt.Test)) {
              testsMap.set(evt.Test, { name: evt.Test, passed: true, duration: 0, output: [] });
            }
            const item = testsMap.get(evt.Test)!;
            if (evt.Output) {
              item.output.push(evt.Output);
            }
            if (evt.Action === 'pass') {
              item.passed = true;
              item.duration = evt.Elapsed || 0;
            } else if (evt.Action === 'fail') {
              item.passed = false;
              item.duration = evt.Elapsed || 0;
              overallPassed = false;
            }
          } else if (evt.Action === 'output' && evt.Output && evt.Output.includes('build failed')) {
            compileError = evt.Output;
          }
        } catch {
          // Ignore non-json lines
        }
      }

      if (!compileError && stderr.includes('syntax error')) {
        compileError = stderr;
      }

      const tests: TestResultItem[] = Array.from(testsMap.values()).map((t) => ({
        name: t.name,
        passed: t.passed,
        duration: t.duration,
        output: t.output.join(''),
      }));

      const passedCount = tests.filter((t) => t.passed).length;
      const failedCount = tests.filter((t) => !t.passed).length;

      const isSuccess = compileError ? false : overallPassed && tests.length > 0;

      const response: RCEExecuteResponse = {
        success: isSuccess,
        passed: passedCount,
        failed: failedCount,
        tests,
        compileError,
        rawOutput: rawText.trim(),
        bench,
        hasRaceDetected: enableRaceCheck ? hasRaceDetected : false,
      };

      return NextResponse.json(response, { status: 200 });
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
