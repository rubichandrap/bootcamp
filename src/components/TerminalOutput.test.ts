import { describe, it, expect } from 'vitest';
import { SubmissionExecutionResult as RCEExecuteResponse } from '@/lib/rce/rceEngine';
import { CONSOLE_TABS, ConsoleTab } from './TerminalOutput';

describe('TerminalOutput Component & Interface', () => {
  it('should support hasRaceDetected property in RCEExecuteResponse contract', () => {
    const res: RCEExecuteResponse = {
      success: false,
      passed: 1,
      failed: 1,
      tests: [],
      hasRaceDetected: true,
    };

    expect(res.hasRaceDetected).toBe(true);
  });

  it('should export typed ConsoleTab configurations without duplicating layout logic', () => {
    const tabIds: ConsoleTab[] = CONSOLE_TABS.map((t) => t.id);
    expect(tabIds).toEqual(['tests', 'perf', 'escape']);
  });
});
