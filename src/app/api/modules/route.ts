import { NextRequest, NextResponse } from 'next/server';
import { getAllModules, getChapterBySlug } from '@/lib/content/contentEngine';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modSlug = searchParams.get('module');
    const chSlug = searchParams.get('chapter');

    if (modSlug && chSlug) {
      const chapter = getChapterBySlug(modSlug, chSlug);
      if (!chapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }
      return NextResponse.json(chapter);
    }

    const modules = getAllModules();
    return NextResponse.json(modules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load content' }, { status: 500 });
  }
}
