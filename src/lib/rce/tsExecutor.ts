import { runInSandboxTmpDir } from '@/lib/rce/executorUtils';
import {
  ExecuteSubmissionParams,
  LanguageExecutor,
  RCE_TIMEOUT_MS,
  SubmissionExecutionResult,
  TestResultItem,
} from '@/lib/rce/types';

export function parseVitestJsonOutput(stdout: string, stderr: string): SubmissionExecutionResult {
  const rawOutput = (stdout + '\n' + stderr).trim();
  let compileError: string | undefined = undefined;

  // Check syntax or compile error
  if (stderr.includes('SyntaxError') || stderr.includes('TransformError') || stderr.includes('Cannot find module')) {
    compileError = stderr;
  }

  const tests: TestResultItem[] = [];
  let passedCount = 0;
  let failedCount = 0;

  try {
    // Find json substring in stdout
    const jsonStart = stdout.indexOf('{');
    const jsonEnd = stdout.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);

      if (parsed.testResults && Array.isArray(parsed.testResults)) {
        for (const fileResult of parsed.testResults) {
          if (fileResult.assertionResults && Array.isArray(fileResult.assertionResults)) {
            for (const assertion of fileResult.assertionResults) {
              const isPassed = assertion.status === 'passed';
              const name = assertion.title || assertion.fullName || 'test';
              if (isPassed) passedCount++;
              else failedCount++;

              const failureMsg = Array.isArray(assertion.failureMessages)
                ? assertion.failureMessages.join('\n')
                : '';

              tests.push({
                name,
                passed: isPassed,
                duration: assertion.duration || 0,
                output: failureMsg,
              });
            }
          }
        }
      }
    }
  } catch {
    // Fallback parsing if JSON output is malformed
  }

  if (tests.length === 0 && stderr) {
    compileError = stderr;
  }

  const isSuccess = compileError ? false : failedCount === 0 && passedCount > 0;

  return {
    success: isSuccess,
    passed: passedCount,
    failed: failedCount,
    tests,
    compileError,
    rawOutput,
  };
}

export class TypeScriptExecutor implements LanguageExecutor {
  async execute(params: ExecuteSubmissionParams): Promise<SubmissionExecutionResult> {
    const { code, testCode, timeoutMs = RCE_TIMEOUT_MS } = params;

    if (!code || !testCode) {
      throw new Error('Missing code or testCode');
    }

    const formattedTestCode = testCode.replace(/from\s+['"]\.\/solution['"]/g, `from './solution'`);

    const { stdout, stderr } = await runInSandboxTmpDir({
      prefix: 'ts-rce',
      files: {
        'solution.ts': code,
        'solution.test.ts': formattedTestCode,
      },
      cmd: 'npx vitest run --reporter=json solution.test.ts',
      timeoutMs,
      env: { ...process.env, NODE_ENV: 'test' },
    });

    return parseVitestJsonOutput(stdout, stderr);
  }
}
