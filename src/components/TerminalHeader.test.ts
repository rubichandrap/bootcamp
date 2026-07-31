import { describe, it, expect } from 'vitest';
import { formatTitlebarText, formatStreakBadge } from './TerminalHeader';

describe('TerminalHeader Component Utilities', () => {
  it('should format titlebar text with Unix breadcrumb and active module/track', () => {
    const formatted = formatTitlebarText('Go Mastery Track', 'Fundamentals', 'go');
    expect(formatted).toBe('~ / tracks / go > Fundamentals');
  });

  it('should format streak badge in CLI style', () => {
    const badge = formatStreakBadge(5);
    expect(badge).toBe('🔥 STREAK: 5d');
  });

  it('should format titlebar text fallback when no active module is selected', () => {
    const formatted = formatTitlebarText('Go Mastery', undefined, 'go');
    expect(formatted).toBe('~ / tracks / go');
  });

  it('should format catalog breadcrumb when track is catalog or not provided', () => {
    const formatted = formatTitlebarText('Track Catalog');
    expect(formatted).toBe('~ / catalog');
  });
});


