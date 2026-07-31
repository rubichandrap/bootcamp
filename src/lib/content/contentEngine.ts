import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const TRACKS_DIR = path.join(process.cwd(), 'content/tracks');

export interface ChapterMeta {
  slug: string;
  moduleSlug: string;
  trackSlug: string;
  title: string;
  type: 'reading' | 'challenge' | 'assessment';
  order: number;
  content: string;
  starterCode?: string;
  testCode?: string;
}

export interface ModuleMeta {
  slug: string;
  trackSlug: string;
  title: string;
  description: string;
  order: number;
  chapters: ChapterMeta[];
}

export interface TrackMeta {
  slug: string;
  title: string;
  description: string;
  language: string;
  order: number;
  modules: ModuleMeta[];
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      // Fallback on invalid JSON
    }
  }
  return fallback;
}

export function getAllTracks(): TrackMeta[] {
  if (!fs.existsSync(TRACKS_DIR)) {
    return [];
  }

  const trackDirs = fs
    .readdirSync(TRACKS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const tracks: TrackMeta[] = [];

  for (const trackSlug of trackDirs) {
    const trackPath = path.join(TRACKS_DIR, trackSlug);
    const metaPath = path.join(trackPath, 'track.json');

    const trackInfo = readJsonFile(metaPath, {
      title: trackSlug.toUpperCase(),
      description: '',
      language: trackSlug,
      order: 99,
    });

    const modules = getAllModules(trackSlug);

    tracks.push({
      slug: trackSlug,
      title: trackInfo.title,
      description: trackInfo.description,
      language: trackInfo.language,
      order: trackInfo.order,
      modules,
    });
  }

  tracks.sort((a, b) => a.order - b.order);
  return tracks;
}

export function getTrack(trackSlug: string): TrackMeta | null {
  const tracks = getAllTracks();
  return tracks.find((t) => t.slug === trackSlug) || null;
}

export const getTrackBySlug = getTrack;

export function getModule(trackSlug: string, moduleSlug: string): ModuleMeta | null {
  const modules = getAllModules(trackSlug);
  return modules.find((m) => m.slug === moduleSlug) || null;
}

export function getAllModules(trackSlug: string = 'go'): ModuleMeta[] {
  const modulesDir = path.join(TRACKS_DIR, trackSlug, 'modules');
  if (!fs.existsSync(modulesDir)) {
    return [];
  }

  const moduleDirs = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const modules: ModuleMeta[] = [];

  for (const modSlug of moduleDirs) {
    const modPath = path.join(modulesDir, modSlug);
    const metaPath = path.join(modPath, 'module.json');

    const modInfo = readJsonFile(metaPath, {
      title: modSlug,
      description: '',
      order: 99,
    });

    const files = fs.readdirSync(modPath).filter((f) => f.endsWith('.mdx'));
    const chapters: ChapterMeta[] = [];

    for (const file of files) {
      const filePath = path.join(modPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      const chSlug = file.replace(/\.mdx$/, '');

      chapters.push({
        slug: chSlug,
        moduleSlug: modSlug,
        trackSlug,
        title: data.title || chSlug,
        type: data.type || 'reading',
        order: data.order || 99,
        content,
        starterCode: data.starterCode,
        testCode: data.testCode,
      });
    }

    chapters.sort((a, b) => a.order - b.order);

    modules.push({
      slug: modSlug,
      trackSlug,
      title: modInfo.title,
      description: modInfo.description,
      order: modInfo.order,
      chapters,
    });
  }

  modules.sort((a, b) => a.order - b.order);
  return modules;
}

export function getChapter(
  trackSlug: string,
  moduleSlug: string,
  chapterSlug: string
): ChapterMeta | null {
  const filePath = path.join(TRACKS_DIR, trackSlug, 'modules', moduleSlug, `${chapterSlug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    slug: chapterSlug,
    moduleSlug,
    trackSlug,
    title: data.title || chapterSlug,
    type: data.type || 'reading',
    order: data.order || 99,
    content,
    starterCode: data.starterCode,
    testCode: data.testCode,
  };
}

export function getChapterBySlug(
  trackOrModuleSlug: string,
  moduleOrChapterSlug: string,
  maybeChapterSlug?: string
): ChapterMeta | null {
  if (maybeChapterSlug !== undefined) {
    return getChapter(trackOrModuleSlug, moduleOrChapterSlug, maybeChapterSlug);
  }
  return getChapter('go', trackOrModuleSlug, moduleOrChapterSlug);
}
