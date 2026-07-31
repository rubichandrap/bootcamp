import { describe, it, expect } from 'vitest';
import { searchCurriculum } from './searchEngine';
import { calculateStreak } from '@/lib/metrics/streak';
import { ModuleMeta } from '@/lib/content/contentEngine';

describe('Command Palette Search Engine', () => {
  const sampleModules: ModuleMeta[] = [
    {
      slug: '01-fundamentals',
      trackSlug: 'go',
      title: 'Go Fundamentals',
      description: 'Pointers and memory',
      order: 1,
      chapters: [
        {
          slug: '01-memory-models',
          moduleSlug: '01-fundamentals',
          trackSlug: 'go',
          title: 'Go Memory Models',
          type: 'reading',
          order: 1,
          content: 'Pointers content',
        },
        {
          slug: '02-slice-headers',
          moduleSlug: '01-fundamentals',
          trackSlug: 'go',
          title: 'Slice Header Internals',
          type: 'challenge',
          order: 2,
          content: 'Slices content',
        },
      ],
    },
  ];

  it('should search chapters by title query', () => {
    const results = searchCurriculum('memory', sampleModules);
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Go Memory Models');
  });

  it('should calculate consecutive streak days correctly', () => {
    const today = new Date().toISOString();
    const streak = calculateStreak([today]);
    expect(streak).toBe(1);
  });

  it('should safely search chapters with missing or undefined content without crashing', () => {
    const mockMods: ModuleMeta[] = [
      {
        slug: 'test-mod',
        trackSlug: 'go',
        title: 'Test Module',
        description: '',
        order: 1,
        chapters: [
          {
            slug: 'no-content-ch',
            moduleSlug: 'test-mod',
            trackSlug: 'go',
            title: 'No Content Chapter',
            type: 'reading',
            order: 1,
            content: undefined as unknown as string,
          },
        ],
      },
    ];

    const results = searchCurriculum('content', mockMods);
    expect(results.length).toBe(1);
  });
});
