import { describe, it, expect } from 'vitest';
import { formatReadingHeader, formatShortcutBadge } from './MdxRenderer';

describe('MdxRenderer Terminal Box Helpers', () => {
  it('should format reading manual page header string', () => {
    const formatted = formatReadingHeader('Goroutines and Channels');
    expect(formatted).toBe('┌─ [MANUAL PAGE] Goroutines and Channels ─────────────────────┐');
  });

  it('should format shortcut badge for actions', () => {
    const badge = formatShortcutBadge('MARK AS READ', '↵');
    expect(badge).toBe('[MARK AS READ: ↵]');
  });
});
