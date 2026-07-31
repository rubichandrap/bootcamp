import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';

export function searchCurriculum(query: string, modules: ModuleMeta[]): ChapterMeta[] {
  if (!query || query.trim() === '') return [];

  const q = query.toLowerCase().trim();
  const matchedChapters: ChapterMeta[] = [];

  for (const mod of modules) {
    for (const ch of mod.chapters) {
      const content = ch.content || '';
      if (
        ch.title.toLowerCase().includes(q) ||
        ch.slug.toLowerCase().includes(q) ||
        content.toLowerCase().includes(q)
      ) {
        matchedChapters.push(ch);
      }
    }
  }

  return matchedChapters;
}
