import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './errorUtils';

describe('Error Handling Utilities', () => {
  it('should extract message from Error instances', () => {
    expect(getErrorMessage(new Error('Syntax Error'))).toBe('Syntax Error');
  });

  it('should convert raw string errors cleanly', () => {
    expect(getErrorMessage('Raw Failure')).toBe('Raw Failure');
  });

  it('should provide fallback message for unknown types', () => {
    expect(getErrorMessage(null)).toBe('Internal Server Error');
  });
});
