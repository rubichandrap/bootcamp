import React from 'react';
import { notFound } from 'next/navigation';
import { getTrackDashboard } from '@/lib/tracks/trackCatalog';
import { TrackWorkspace } from '@/components/TrackWorkspace';
import { TrackSlug } from '@/lib/tracks/trackConfig';

interface TrackDashboardProps {
  params: Promise<{ trackSlug: string }>;
}

export async function generateMetadata({ params }: TrackDashboardProps) {
  const { trackSlug } = await params;
  const track = getTrackDashboard(trackSlug);
  if (!track) return { title: 'Track Not Found' };
  return {
    title: `${track.title} | Developer Mastery Platform`,
    description: track.description,
  };
}

export default async function TrackDashboardPage({ params }: TrackDashboardProps) {
  const { trackSlug } = await params;
  const track = getTrackDashboard(trackSlug);

  if (!track) {
    notFound();
  }

  return <TrackWorkspace trackSlug={trackSlug as TrackSlug} />;
}
