import { describe, it, expect } from 'vitest';
import { READING_COMPLETION_MARKER, isReadingCompletion } from './contentConstants';

describe('Content Domain Constants', () => {
  it('should define a valid non-empty reading completion marker constant', () => {
    expect(READING_COMPLETION_MARKER).toBeTruthy();
    expect(typeof READING_COMPLETION_MARKER).toBe('string');
  });

  it('should identify reading completion code submissions accurately', () => {
    expect(isReadingCompletion('// Reading Chapter Completed')).toBe(true);
    expect(isReadingCompletion('package main')).toBe(false);
  });
});
