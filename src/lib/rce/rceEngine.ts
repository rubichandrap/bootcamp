import { GoExecutor } from '@/lib/rce/goExecutor';
import { PythonExecutor } from '@/lib/rce/pythonExecutor';
import { TypeScriptExecutor } from '@/lib/rce/tsExecutor';
import {
  ExecuteSubmissionParams,
  LanguageExecutor,
  RCE_TIMEOUT_MS,
  SubmissionExecutionResult,
  TestResultItem,
} from '@/lib/rce/types';

export { RCE_TIMEOUT_MS };
export type { TestResultItem, SubmissionExecutionResult, ExecuteSubmissionParams, LanguageExecutor };
export { parseGoTestStream, getGoEnv } from '@/lib/rce/goExecutor';
export { parseVitestJsonOutput } from '@/lib/rce/tsExecutor';
export { parsePytestOutput } from '@/lib/rce/pythonExecutor';

const goExecutor = new GoExecutor();
const tsExecutor = new TypeScriptExecutor();
const pyExecutor = new PythonExecutor();

export const EXECUTOR_REGISTRY: Record<string, LanguageExecutor> = {
  go: goExecutor,
  golang: goExecutor,
  typescript: tsExecutor,
  ts: tsExecutor,
  python: pyExecutor,
  py: pyExecutor,
};

export function getLanguageExecutor(language?: string): LanguageExecutor {
  if (!language) {
    throw new Error('Missing language: cannot select an executor');
  }
  const normalizedLanguage = language.toLowerCase();
  const executor = EXECUTOR_REGISTRY[normalizedLanguage];
  if (!executor) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return executor;
}

export async function executeSubmission(
  params: ExecuteSubmissionParams
): Promise<SubmissionExecutionResult> {
  if (!params.code || !params.testCode) {
    return {
      success: false,
      passed: 0,
      failed: 0,
      tests: [],
      compileError: 'Missing code or testCode',
    };
  }

  try {
    const executor = getLanguageExecutor(params.language);
    return await executor.execute(params);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Execution failed';
    return {
      success: false,
      passed: 0,
      failed: 0,
      tests: [],
      compileError: errorMessage,
    };
  }
}
