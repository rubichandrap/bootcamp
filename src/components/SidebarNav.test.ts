import { describe, it, expect } from 'vitest';
import { getTreePrefix, getChapterBadgeText } from './SidebarNav';

describe('SidebarNav ASCII Tree Helpers', () => {
  it('should generate correct ASCII branch prefixes', () => {
    expect(getTreePrefix(false)).toBe('├──');
    expect(getTreePrefix(true)).toBe('└──');
  });

  it('should generate correct status badge text for chapters', () => {
    expect(getChapterBadgeText(true, 'reading')).toBe('[✓]');
    expect(getChapterBadgeText(false, 'reading')).toBe('[READ]');
    expect(getChapterBadgeText(false, 'challenge')).toBe('[CODE]');
    expect(getChapterBadgeText(false, 'assessment')).toBe('[ASSESS]');
  });
});
