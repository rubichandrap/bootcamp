import { describe, it, expect } from 'vitest';
import { useChallengeSession, DEFAULT_STARTER_CODE, DEFAULT_TEST_CODE } from './useChallengeSession';

describe('useChallengeSession module & defaults', () => {
  it('defines default starter and test code', () => {
    expect(DEFAULT_STARTER_CODE).toContain('package main');
    expect(DEFAULT_TEST_CODE).toContain('package main');
  });

  it('exports useChallengeSession hook function', () => {
    expect(typeof useChallengeSession).toBe('function');
  });
});
