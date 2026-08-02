import { runInSandboxTmpDir } from '@/lib/rce/executorUtils';
import { buildResult } from '@/lib/rce/resultBuilder';
import {
  ExecuteSubmissionParams,
  LanguageExecutor,
  RCE_TIMEOUT_MS,
  SubmissionExecutionResult,
  TestResultItem,
} from '@/lib/rce/types';

const PYTHON_BIN = '/usr/bin/python3';

export function parsePytestOutput(
  stdout: string,
  stderr: string,
  timedOut?: boolean
): SubmissionExecutionResult {
  const rawOutput = (stdout + '\n' + stderr).trim();
  let compileError: string | undefined = undefined;

  if (timedOut) {
    return {
      success: false,
      passed: 0,
      failed: 0,
      tests: [],
      compileError: 'Execution timed out',
      rawOutput,
    };
  }

  const tests: TestResultItem[] = [];
  let sawErrorStatus = false;

  // Per-test result lines: "<file>::<test_name> PASSED/FAILED/ERROR"
  const testLineRe = /^(\S+\.py)::([^\s]+)\s+(PASSED|FAILED|ERROR)/;
  for (const line of stdout.split('\n')) {
    const match = testLineRe.exec(line);
    if (match) {
      if (match[3] === 'ERROR') {
        sawErrorStatus = true;
      }
      tests.push({ name: match[2], passed: match[3] === 'PASSED' });
    }
  }

  const errorBlockRe = /(E\s+\w+Error[^\n]*|ModuleNotFoundError[^\n]*|SyntaxError[^\n]*|IndentationError[^\n]*)/;

  // Collection errors (import / syntax) surface as ERROR blocks with a traceback.
  if (tests.length === 0 && /(ModuleNotFoundError|ImportError|SyntaxError|IndentationError)/.test(stdout)) {
    const errorMatch = stdout.match(errorBlockRe);
    compileError = errorMatch ? errorMatch[1] : 'Python compilation error';
  } else if (sawErrorStatus) {
    const errorMatch = stdout.match(errorBlockRe);
    if (errorMatch) {
      compileError = errorMatch[1];
    }
  } else if (tests.length === 0) {
    compileError = 'No tests collected';
  }

  return buildResult(tests, compileError, rawOutput);
}

export class PythonExecutor implements LanguageExecutor {
  async execute(params: ExecuteSubmissionParams): Promise<SubmissionExecutionResult> {
    const { code, testCode, timeoutMs = RCE_TIMEOUT_MS } = params;

    if (!code || !testCode) {
      throw new Error('Missing code or testCode');
    }

    const formattedTestCode = testCode.replace(/from\s+['"]\.\/solution['"]/g, `from solution`);

    const { stdout, stderr, timedOut } = await runInSandboxTmpDir({
      prefix: 'py-rce',
      files: {
        'solution.py': code,
        'test_solution.py': formattedTestCode,
      },
      cmd: `${PYTHON_BIN} -m pytest -v --tb=short test_solution.py`,
      timeoutMs,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
    });

    return parsePytestOutput(stdout, stderr, timedOut);
  }
}
