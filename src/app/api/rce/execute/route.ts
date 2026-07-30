import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

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
}

// Find available Go binary path
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
    const { code, testCode } = await req.json();

    if (!code || !testCode) {
      return NextResponse.json(
        { error: 'Missing code or testCode' },
        { status: 400 }
      );
    }

    // Create unique temporary workspace directory in OS temp (/tmp on Linux)
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'go-rce-'));

    try {
      // Create go.mod inside workspace for hermetic package execution
      const goModContent = `module challenge\n\ngo 1.20\n`;
      await fs.writeFile(path.join(tmpDir, 'go.mod'), goModContent, 'utf-8');
      await fs.writeFile(path.join(tmpDir, 'main.go'), code, 'utf-8');
      await fs.writeFile(path.join(tmpDir, 'main_test.go'), testCode, 'utf-8');

      let stdout = '';
      let stderr = '';
      let compileError: string | undefined = undefined;

      try {
        const result = await execAsync('go test -v -json ./...', {
          cwd: tmpDir,
          timeout: 5000,
          env: getGoEnv(),
        });
        stdout = result.stdout;
        stderr = result.stderr;
      } catch (err: any) {
        stdout = err.stdout || '';
        stderr = err.stderr || err.message || '';

        // Distinguish compiler failure vs test failure
        if (!stdout.includes('"Action":"output"') && stderr) {
          compileError = stderr;
        }
      }

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
          }
        } catch {
          // Ignore non-json lines
        }
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
        rawOutput: stdout || stderr,
      };

      return NextResponse.json(response, { status: 200 });
    } finally {
      // Guaranteed cleanup of temporary directory (defer os.RemoveAll equivalent)
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
