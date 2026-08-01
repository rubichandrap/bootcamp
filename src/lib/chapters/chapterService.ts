import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';

export async function fetchModules(trackSlug?: string): Promise<ModuleMeta[]> {
  const url = trackSlug ? `/api/modules?track=${encodeURIComponent(trackSlug)}` : '/api/modules';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`fetchModules failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchChapter(
  moduleSlug: string,
  chapterSlug: string,
  trackSlug?: string
): Promise<ChapterMeta> {
  const trackParam = trackSlug ? `&track=${encodeURIComponent(trackSlug)}` : '';
  const res = await fetch(
    `/api/modules?module=${encodeURIComponent(moduleSlug)}&chapter=${encodeURIComponent(chapterSlug)}${trackParam}`
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

export function resolveInitialChapter(
  modules: ModuleMeta[],
  currentChapter: ChapterMeta | null,
  trackSlug: string
): ChapterMeta | null {
  if (modules.length === 0) return null;
  const firstChapter = modules[0].chapters[0] ?? null;
  if (!currentChapter) return firstChapter;
  if (currentChapter.trackSlug !== trackSlug) return firstChapter;
  const existsInModules = modules.some((m) =>
    m.chapters.some((c) => c.slug === currentChapter.slug)
  );
  if (!existsInModules) return firstChapter;
  return null;
}
