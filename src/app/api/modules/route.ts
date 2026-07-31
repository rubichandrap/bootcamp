import { NextRequest, NextResponse } from 'next/server';
import { getAllModules, getAllTracks, getChapterBySlug } from '@/lib/content/contentEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modSlug = searchParams.get('module');
    const chSlug = searchParams.get('chapter');
    const trackSlug = searchParams.get('track');

    if (modSlug && chSlug) {
      const chapter = getChapterBySlug(trackSlug || 'go', modSlug, chSlug);
      if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
      return NextResponse.json(chapter);
    }

    if (trackSlug === 'all') {
      const allTracks = getAllTracks();
      const allModules = allTracks.flatMap((t) => t.modules);
      return NextResponse.json(allModules);
    }

    const modules = getAllModules(trackSlug || 'go');
    return NextResponse.json(modules);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load content';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
