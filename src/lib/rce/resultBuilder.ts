import { SubmissionExecutionResult, TestResultItem } from '@/lib/rce/types';

export function buildResult(
  tests: TestResultItem[],
  compileError: string | undefined,
  rawOutput: string
): SubmissionExecutionResult {
  const passedCount = tests.filter((t) => t.passed).length;
  const failedCount = tests.filter((t) => !t.passed).length;

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
