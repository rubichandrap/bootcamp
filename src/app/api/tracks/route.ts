import { NextResponse } from 'next/server';
import { getAllTracksOverview } from '@/lib/tracks/trackCatalog';

export async function GET() {
  try {
    const tracks = getAllTracksOverview();
    return NextResponse.json(tracks);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tracks';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
