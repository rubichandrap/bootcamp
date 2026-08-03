import { describe, it, expect } from 'vitest';
import { getTrackConfig } from './trackConfig';

describe('getTrackConfig', () => {
  it('returns go language for go track', () => {
    expect(getTrackConfig('go')!.language).toBe('go');
  });

  it('returns typescript language for typescript track', () => {
    expect(getTrackConfig('typescript')!.language).toBe('typescript');
  });

  it('returns correct file names for go track', () => {
    const cfg = getTrackConfig('go')!;
    expect(cfg.codeFile).toBe('main.go');
    expect(cfg.testFile).toBe('main_test.go');
    expect(cfg.solutionFile).toBe('solution.go');
    expect(cfg.title).toBe('Go Mastery');
    expect(cfg.supportsRaceCheck).toBe(true);
  });

  it('returns correct file names for typescript track', () => {
    const cfg = getTrackConfig('typescript')!;
    expect(cfg.codeFile).toBe('solution.ts');
    expect(cfg.testFile).toBe('solution.test.ts');
    expect(cfg.title).toBe('TypeScript Mastery');
  });

  it('returns python language for python track', () => {
    expect(getTrackConfig('python')!.language).toBe('python');
  });

  it('returns correct file names for python track', () => {
    const cfg = getTrackConfig('python')!;
    expect(cfg.codeFile).toBe('solution.py');
    expect(cfg.testFile).toBe('test_solution.py');
    expect(cfg.solutionFile).toBe('solution.py');
    expect(cfg.title).toBe('Python Mastery');
    expect(cfg.supportsRaceCheck).toBe(false);
  });

  it('returns undefined for an unknown track', () => {
    expect(getTrackConfig('ruby')).toBeUndefined();
  });
});
