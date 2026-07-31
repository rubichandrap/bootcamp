import { describe, it, expect } from 'vitest';
import { RCE_TIMEOUT_MS } from './route';

describe('RCE Engine Execution Timeout Configuration', () => {
  it('should strictly enforce a 5-second (5000ms) execution timeout per spec', () => {
    expect(RCE_TIMEOUT_MS).toBe(5000);
  });
});
