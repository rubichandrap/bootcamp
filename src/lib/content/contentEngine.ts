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

    let trackInfo = {
      title: trackSlug.toUpperCase(),
      description: '',
      language: trackSlug,
      order: 99,
    };

    if (fs.existsSync(metaPath)) {
      try {
        trackInfo = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch {
        // Fallback
      }
    }

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

export function getTrackBySlug(trackSlug: string): TrackMeta | null {
  const tracks = getAllTracks();
  return tracks.find((t) => t.slug === trackSlug) || null;
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

    let modInfo = { title: modSlug, description: '', order: 99 };
    if (fs.existsSync(metaPath)) {
      try {
        modInfo = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch {
        // Fallback
      }
    }

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

export function getChapterBySlug(
  arg1: string,
  arg2: string,
  arg3?: string
): ChapterMeta | null {
  let trackSlug = 'go';
  let moduleSlug = '';
  let chapterSlug = '';

  if (arg3 !== undefined) {
    trackSlug = arg1;
    moduleSlug = arg2;
    chapterSlug = arg3;
  } else {
    moduleSlug = arg1;
    chapterSlug = arg2;
  }

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
