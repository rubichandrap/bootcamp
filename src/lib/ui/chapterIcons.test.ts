import { describe, it, expect } from 'vitest';
import { getChapterTypeLabel } from './chapterIcons';

describe('Chapter Icons UI Helper', () => {
  it('should return human-readable chapter type labels', () => {
    expect(getChapterTypeLabel('reading')).toBe('Reading Article');
    expect(getChapterTypeLabel('challenge')).toBe('Interactive Challenge');
    expect(getChapterTypeLabel('assessment')).toBe('Capstone Assessment');
  });

  it('should return default label for unknown chapter type', () => {
    expect(getChapterTypeLabel('unknown' as unknown as 'reading')).toBe('Chapter');
  });
});
