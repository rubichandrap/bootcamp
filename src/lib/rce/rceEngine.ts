import { GoRunner } from '@/lib/rce/goRunner';
import { TypeScriptRunner } from '@/lib/rce/tsRunner';
import {
  ExecuteSubmissionParams,
  LanguageRunner,
  RCE_TIMEOUT_MS,
  SubmissionExecutionResult,
  TestResultItem,
} from '@/lib/rce/types';

export { RCE_TIMEOUT_MS };
export type { TestResultItem, SubmissionExecutionResult, ExecuteSubmissionParams, LanguageRunner };
export { parseGoTestStream, getGoEnv } from '@/lib/rce/goRunner';
export { parseVitestJsonOutput } from '@/lib/rce/tsRunner';

const goRunner = new GoRunner();
const tsRunner = new TypeScriptRunner();

export function getLanguageRunner(trackId: string = 'go'): LanguageRunner {
  if (trackId === 'typescript' || trackId === 'ts') {
    return tsRunner;
  }
  return goRunner;
}

export async function executeSubmission(
  params: ExecuteSubmissionParams
): Promise<SubmissionExecutionResult> {
  const runner = getLanguageRunner(params.trackId);
  return runner.execute(params);
}
