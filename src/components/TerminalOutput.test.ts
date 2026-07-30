import { describe, it, expect } from 'vitest';
import { RCEExecuteResponse } from '@/app/api/rce/execute/route';

describe('TerminalOutput Data Race Warning Interface', () => {
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
});
