import { useState, useCallback } from 'react';
import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';
import {
  fetchModules as fetchModulesService,
  fetchChapter as fetchChapterService,
  findNextChapter,
} from '@/lib/chapters/chapterService';

export function useChapterLifecycle() {
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [currentChapter, setCurrentChapter] = useState<ChapterMeta | null>(null);

  const loadModules = useCallback(async (trackSlug?: string): Promise<ModuleMeta[]> => {
    try {
      const mods = await fetchModulesService(trackSlug);
      setModules(mods);
      return mods;
    } catch (err) {
      console.error('Failed to load modules', err);
      return [];
    }
  }, []);

  const selectChapter = useCallback(
    async (moduleSlug: string, chapterSlug: string, trackSlug?: string): Promise<ChapterMeta | null> => {
      try {
        const ch = await fetchChapterService(moduleSlug, chapterSlug, trackSlug);
        setCurrentChapter(ch);
        return ch;
      } catch (err) {
        console.error('Failed to select chapter', err);
        return null;
      }
    },
    []
  );

  const advanceToNextChapter = useCallback(async (): Promise<ChapterMeta | null> => {
    if (!currentChapter) return null;
    const next = findNextChapter(modules, currentChapter.slug);
    if (next) {
      return selectChapter(next.moduleSlug, next.slug, currentChapter.trackSlug);
    }
    return null;
  }, [currentChapter, modules, selectChapter]);

  return {
    modules,
    setModules,
    currentChapter,
    setCurrentChapter,
    loadModules,
    selectChapter,
    advanceToNextChapter,
  };
}
