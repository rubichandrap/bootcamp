import { describe, it, expect } from 'vitest';
import { READING_PROGRESS_MARKER, isReadingProgress } from './contentConstants';

describe('Content Domain Constants', () => {
  it('should define a valid non-empty reading progress marker constant', () => {
    expect(READING_PROGRESS_MARKER).toBeTruthy();
    expect(typeof READING_PROGRESS_MARKER).toBe('string');
  });

  it('should identify reading progress code submissions accurately', () => {
    expect(isReadingProgress('// Reading Chapter Completed')).toBe(true);
    expect(isReadingProgress('package main')).toBe(false);
  });
});
