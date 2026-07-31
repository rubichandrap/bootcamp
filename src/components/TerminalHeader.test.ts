import { describe, it, expect } from 'vitest';
import { formatTitlebarText, formatStreakBadge } from './TerminalHeader';

describe('TerminalHeader Component Utilities', () => {
  it('should format titlebar text with version and active module/track', () => {
    const formatted = formatTitlebarText('Go Mastery Track', 'Fundamentals');
    expect(formatted).toBe('go-mastery-cli v1.0.0 -- track: Go Mastery Track > Fundamentals');
  });

  it('should format streak badge in CLI style', () => {
    const badge = formatStreakBadge(5);
    expect(badge).toBe('🔥 STREAK: 5d');
  });

  it('should format titlebar text fallback when no active module is selected', () => {
    const formatted = formatTitlebarText('Go Mastery');
    expect(formatted).toBe('go-mastery-cli v1.0.0 -- track: Go Mastery');
  });
});

