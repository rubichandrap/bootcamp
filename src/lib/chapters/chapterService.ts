import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';

export async function fetchModules(): Promise<ModuleMeta[]> {
  const res = await fetch('/api/modules');
  return res.json();
}

export async function fetchChapter(
  moduleSlug: string,
  chapterSlug: string
): Promise<ChapterMeta> {
  const res = await fetch(
    `/api/modules?module=${encodeURIComponent(moduleSlug)}&chapter=${encodeURIComponent(chapterSlug)}`
  );
  return res.json();
}

export function findNextChapter(
  modules: ModuleMeta[],
  currentChapterSlug: string
): ChapterMeta | null {
  const allChapters = modules.flatMap((m) => m.chapters);
  const currentIndex = allChapters.findIndex((c) => c.slug === currentChapterSlug);
  if (currentIndex !== -1 && currentIndex + 1 < allChapters.length) {
    return allChapters[currentIndex + 1];
  }
  return null;
}
