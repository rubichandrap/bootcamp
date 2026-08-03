import { BenchMetrics } from '@/lib/rce/benchParser';

export const RCE_TIMEOUT_MS = 5000;

export interface TestResultItem {
  name: string;
  passed: boolean;
  duration?: number;
  output?: string;
}

export interface SubmissionExecutionResult {
  success: boolean;
  passed: number;
  failed: number;
  tests: TestResultItem[];
  compileError?: string;
  rawOutput?: string;
  bench?: BenchMetrics;
  hasRaceDetected?: boolean;
}

export interface ExecuteSubmissionParams {
  code: string;
  testCode: string;
  language?: string;
  enableRaceCheck?: boolean;
  timeoutMs?: number;
}

export interface LanguageExecutor {
  execute(params: ExecuteSubmissionParams): Promise<SubmissionExecutionResult>;
}
