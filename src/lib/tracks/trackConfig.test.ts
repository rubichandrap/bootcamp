import { describe, it, expect } from 'vitest';
import { getTrackConfig } from './trackConfig';

describe('getTrackConfig', () => {
  it('returns go language for go track', () => {
    expect(getTrackConfig('go').language).toBe('go');
  });

  it('returns typescript language for typescript track', () => {
    expect(getTrackConfig('typescript').language).toBe('typescript');
  });

  it('returns correct file names for go track', () => {
    const cfg = getTrackConfig('go');
    expect(cfg.codeFile).toBe('main.go');
    expect(cfg.testFile).toBe('main_test.go');
    expect(cfg.solutionFile).toBe('solution.go');
    expect(cfg.title).toBe('Go Mastery');
  });

  it('returns correct file names for typescript track', () => {
    const cfg = getTrackConfig('typescript');
    expect(cfg.codeFile).toBe('solution.ts');
    expect(cfg.testFile).toBe('solution.test.ts');
    expect(cfg.title).toBe('TypeScript Mastery');
  });
});
