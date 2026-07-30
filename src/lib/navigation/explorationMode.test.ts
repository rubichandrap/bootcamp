import { describe, it, expect } from 'vitest';
import { isChapterAccessible } from './explorationMode';

describe('Free Exploration Mode Navigation', () => {
  const allChapterIds = ['ch-1', 'ch-2', 'ch-3'];

  it('should lock uncompleted future chapters when Free Exploration is disabled', () => {
    const completed = ['ch-1'];
    expect(isChapterAccessible('ch-2', completed, allChapterIds, false)).toBe(true);
    expect(isChapterAccessible('ch-3', completed, allChapterIds, false)).toBe(false);
  });

  it('should allow access to any chapter when Free Exploration is enabled', () => {
    const completed: string[] = [];
    expect(isChapterAccessible('ch-3', completed, allChapterIds, true)).toBe(true);
  });
});
