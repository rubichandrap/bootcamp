import { describe, it, expect } from 'vitest';
import { formatReadingHeader, formatShortcutBadge } from './MdxRenderer';

describe('MdxRenderer Domain Terminology & Headers', () => {
  it('should use canonical domain glossary term "Reading Chapter"', () => {
    const formatted = formatReadingHeader('Goroutines and Channels');
    expect(formatted).toBe('┌─ [READING CHAPTER] Goroutines and Channels ─────────────────────┐');
  });

  it('should format shortcut badge for actions', () => {
    const badge = formatShortcutBadge('MARK AS READ', '↵');
    expect(badge).toBe('[MARK AS READ: ↵]');
  });
});
