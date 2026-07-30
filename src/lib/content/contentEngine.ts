import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = path.join(process.cwd(), 'content/modules');

export interface ChapterMeta {
  slug: string;
  moduleSlug: string;
  title: string;
  type: 'reading' | 'challenge' | 'assessment';
  order: number;
  content: string;
  starterCode?: string;
  testCode?: string;
}

export interface ModuleMeta {
  slug: string;
  title: string;
  description: string;
  order: number;
  chapters: ChapterMeta[];
}

export function getAllModules(): ModuleMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const moduleDirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const modules: ModuleMeta[] = [];

  for (const modSlug of moduleDirs) {
    const modPath = path.join(CONTENT_DIR, modSlug);
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
      title: modInfo.title,
      description: modInfo.description,
      order: modInfo.order,
      chapters,
    });
  }

  modules.sort((a, b) => a.order - b.order);
  return modules;
}

export function getChapterBySlug(moduleSlug: string, chapterSlug: string): ChapterMeta | null {
  const filePath = path.join(CONTENT_DIR, moduleSlug, `${chapterSlug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  return {
    slug: chapterSlug,
    moduleSlug,
    title: data.title || chapterSlug,
    type: data.type || 'reading',
    order: data.order || 99,
    content,
    starterCode: data.starterCode,
    testCode: data.testCode,
  };
}
