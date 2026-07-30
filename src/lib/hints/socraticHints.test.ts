import { describe, it, expect } from 'vitest';
import { getSocraticHint, isSolutionUnlocked } from './socraticHints';

describe('Socratic Hints & Solution Unlocking Rules', () => {
  it('should return conceptual hints without copy-pasteable code', () => {
    const hint = getSocraticHint('02-slice-headers');
    expect(hint).toBeTruthy();
    expect(hint.title).toContain('Hint');
    expect(hint.body).not.toContain('func '); // No direct code solution
  });

  it('should lock solution by default when unpassed and failed attempts < 3', () => {
    const unlocked = isSolutionUnlocked({ passed: false, failedAttempts: 2 });
    expect(unlocked).toBe(false);
  });

  it('should unlock solution when challenge is passed', () => {
    const unlocked = isSolutionUnlocked({ passed: true, failedAttempts: 0 });
    expect(unlocked).toBe(true);
  });

  it('should unlock solution after 3 failed attempts', () => {
    const unlocked = isSolutionUnlocked({ passed: false, failedAttempts: 3 });
    expect(unlocked).toBe(true);
  });
});
