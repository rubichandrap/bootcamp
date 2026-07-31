import { GoExecutor } from '@/lib/rce/goExecutor';
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

const goExecutor = new GoExecutor();
const tsExecutor = new TypeScriptExecutor();

export const EXECUTOR_REGISTRY: Record<string, LanguageExecutor> = {
  go: goExecutor,
  golang: goExecutor,
  typescript: tsExecutor,
  ts: tsExecutor,
};

export function getLanguageExecutor(trackId: string = 'go'): LanguageExecutor {
  const normalizedTrack = trackId.toLowerCase();
  return EXECUTOR_REGISTRY[normalizedTrack] || goExecutor;
}

export async function executeSubmission(
  params: ExecuteSubmissionParams
): Promise<SubmissionExecutionResult> {
  const executor = getLanguageExecutor(params.trackId);
  return executor.execute(params);
}
