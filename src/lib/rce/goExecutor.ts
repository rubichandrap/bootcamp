import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { parseBenchOutput } from '@/lib/rce/benchParser';
import {
  ExecuteSubmissionParams,
  LanguageExecutor,
  RCE_TIMEOUT_MS,
  SubmissionExecutionResult,
  TestResultItem,
} from '@/lib/rce/types';

const execAsync = promisify(exec);

export function parseGoTestStream(
  stdout: string,
  stderr: string,
  enableRaceCheck?: boolean
): SubmissionExecutionResult {
  let compileError: string | undefined = undefined;
  const rawText = (stdout + '\n' + stderr).trim();

  // Detect compilation or syntax errors
  if (!stdout.includes('"Action":"output"') && stderr) {
    compileError = stderr;
  }
  if (!compileError && stderr.includes('syntax error')) {
    compileError = stderr;
  }

  // Benchmark metrics parsing
  const bench = parseBenchOutput(stdout, stderr);

  // Data race detection
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

  const tests: TestResultItem[] = Array.from(testsMap.values()).map((t) => ({
    name: t.name,
    passed: t.passed,
    duration: t.duration,
    output: t.output.join(''),
  }));

  const passedCount = tests.filter((t) => t.passed).length;
  const failedCount = tests.filter((t) => !t.passed).length;

  const isSuccess = compileError ? false : overallPassed && tests.length > 0;

  return {
    success: isSuccess,
    passed: passedCount,
    failed: failedCount,
    tests,
    compileError,
    rawOutput: rawText,
    bench,
    hasRaceDetected: enableRaceCheck ? hasRaceDetected : false,
  };
}

export function getGoEnv() {
  const home = os.homedir();
  const gvmGoBin = process.env.GO_BIN_PATH || path.join(home, '.gvm/gos/go1.20/bin');
  const gvmRoot = process.env.GOROOT || path.join(home, '.gvm/gos/go1.20');
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

export class GoExecutor implements LanguageExecutor {
  async execute(params: ExecuteSubmissionParams): Promise<SubmissionExecutionResult> {
    const { code, testCode, enableRaceCheck, timeoutMs = RCE_TIMEOUT_MS } = params;

    if (!code || !testCode) {
      throw new Error('Missing code or testCode');
    }

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'go-rce-'));

    try {
      const goModContent = `module challenge\n\ngo 1.20\n`;
      await fs.writeFile(path.join(tmpDir, 'go.mod'), goModContent, 'utf-8');
      await fs.writeFile(path.join(tmpDir, 'main.go'), code, 'utf-8');
      await fs.writeFile(path.join(tmpDir, 'main_test.go'), testCode, 'utf-8');

      let stdout = '';
      let stderr = '';

      const raceFlag = enableRaceCheck ? '-race' : '';
      const hasBenchFunctions = testCode.includes('Benchmark');
      const benchFlags = hasBenchFunctions ? '-bench=. -benchmem -gcflags="-m"' : '';
      const cmd = `go test -v ${raceFlag} ${benchFlags} -json ./...`;

      try {
        const result = await execAsync(cmd, {
          cwd: tmpDir,
          timeout: timeoutMs,
          env: getGoEnv(),
        });
        stdout = result.stdout;
        stderr = result.stderr;
      } catch (err: unknown) {
        const execErr = err as { stdout?: string; stderr?: string; message?: string };
        stdout = execErr.stdout || '';
        stderr = execErr.stderr || execErr.message || '';
      }

      return parseGoTestStream(stdout, stderr, enableRaceCheck);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
