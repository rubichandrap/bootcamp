import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchModules, fetchChapter, findNextChapter } from './chapterService';
import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';

describe('chapterService', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('fetchModules', () => {
    it('fetches modules from /api/modules', async () => {
      const mockModules: ModuleMeta[] = [
        {
          slug: 'mod-1',
          trackSlug: 'go',
          title: 'Module 1',
          description: 'Desc 1',
          order: 1,
          chapters: [
            {
              slug: 'ch-1',
              title: 'Chapter 1',
              type: 'reading',
              moduleSlug: 'mod-1',
              trackSlug: 'go',
              order: 1,
              content: '# Content 1',
            },
          ],
        },
      ];
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockModules,
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchModules();

      expect(mockFetch).toHaveBeenCalledWith('/api/modules');
      expect(result).toEqual(mockModules);
    });
  });

  describe('fetchChapter', () => {
    it('fetches single chapter from /api/modules?module=...&chapter=...', async () => {
      const mockChapter: ChapterMeta = {
        slug: 'ch-1',
        title: 'Chapter 1',
        type: 'challenge',
        moduleSlug: 'mod-1',
        trackSlug: 'go',
        order: 1,
        content: '# Content 1',
        starterCode: 'func main() {}',
      };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockChapter,
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await fetchChapter('mod-1', 'ch-1');

      expect(mockFetch).toHaveBeenCalledWith('/api/modules?module=mod-1&chapter=ch-1');
      expect(result).toEqual(mockChapter);
    });
  });

  describe('findNextChapter', () => {
    const modules: ModuleMeta[] = [
      {
        slug: 'mod-1',
        trackSlug: 'go',
        title: 'Module 1',
        description: 'Desc 1',
        order: 1,
        chapters: [
          {
            slug: 'ch-1',
            title: 'Chapter 1',
            type: 'reading',
            moduleSlug: 'mod-1',
            trackSlug: 'go',
            order: 1,
            content: '# Chapter 1',
          },
          {
            slug: 'ch-2',
            title: 'Chapter 2',
            type: 'challenge',
            moduleSlug: 'mod-1',
            trackSlug: 'go',
            order: 2,
            content: '# Chapter 2',
          },
        ],
      },
      {
        slug: 'mod-2',
        trackSlug: 'go',
        title: 'Module 2',
        description: 'Desc 2',
        order: 2,
        chapters: [
          {
            slug: 'ch-3',
            title: 'Chapter 3',
            type: 'assessment',
            moduleSlug: 'mod-2',
            trackSlug: 'go',
            order: 1,
            content: '# Chapter 3',
          },
        ],
      },
    ];

    it('returns the next chapter within the same module', () => {
      const next = findNextChapter(modules, 'ch-1');
      expect(next).toEqual(modules[0].chapters[1]);
    });

    it('returns the first chapter of the next module when transitioning modules', () => {
      const next = findNextChapter(modules, 'ch-2');
      expect(next).toEqual(modules[1].chapters[0]);
    });

    it('returns null when on the last chapter in the Track', () => {
      const next = findNextChapter(modules, 'ch-3');
      expect(next).toBeNull();
    });

    it('returns null if current chapter is not found', () => {
      const next = findNextChapter(modules, 'unknown-ch');
      expect(next).toBeNull();
    });

    it('returns null if modules array is empty', () => {
      const next = findNextChapter([], 'ch-1');
      expect(next).toBeNull();
    });
  });
});
