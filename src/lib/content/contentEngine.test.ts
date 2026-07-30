import { describe, it, expect } from 'vitest';
import { getAllModules, getChapterBySlug } from './contentEngine';

describe('Curriculum Content Engine', () => {
  it('should list all curriculum modules and ordered chapters', () => {
    const modules = getAllModules();
    expect(modules.length).toBeGreaterThan(0);
    expect(modules[0].slug).toBe('01-fundamentals');
    expect(modules[0].chapters.length).toBeGreaterThan(0);
  });

  it('should load MDX content and metadata for a specific chapter slug', () => {
    const chapter = getChapterBySlug('01-fundamentals', '01-memory-models');
    expect(chapter).not.toBeNull();
    expect(chapter?.title).toContain('Memory');
    expect(chapter?.type).toBe('reading');
    expect(chapter?.content).toContain('Go');
  });
});
