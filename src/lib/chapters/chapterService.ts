import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';

export async function fetchModules(): Promise<ModuleMeta[]> {
  const res = await fetch('/api/modules');
  if (!res.ok) {
    throw new Error(`fetchModules failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchChapter(
  moduleSlug: string,
  chapterSlug: string
): Promise<ChapterMeta> {
  const res = await fetch(
    `/api/modules?module=${encodeURIComponent(moduleSlug)}&chapter=${encodeURIComponent(chapterSlug)}`
  );
  if (!res.ok) {
    throw new Error(`fetchChapter failed with status ${res.status}`);
  }
  return res.json();
}

export function findNextChapter(
  modules: ModuleMeta[],
  currentChapterSlug: string
): ChapterMeta | null {
  const allChapters = modules.flatMap((moduleItem) => moduleItem.chapters);
  const currentIndex = allChapters.findIndex((chapter) => chapter.slug === currentChapterSlug);
  if (currentIndex !== -1 && currentIndex + 1 < allChapters.length) {
    return allChapters[currentIndex + 1];
  }
  return null;
}
