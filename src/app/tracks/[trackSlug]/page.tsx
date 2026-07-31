import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTrackDashboard } from '@/lib/tracks/trackCatalog';
import { BookOpen, CheckCircle, Code2, ArrowLeft, ArrowRight } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Back */}
        <Link
          href="/tracks"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Tracks</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold uppercase">
              {track.language} Track
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{track.title}</h1>
          <p className="text-zinc-400 text-sm sm:text-base">{track.description}</p>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-blue-400" />
            <span>Curriculum Modules</span>
          </h2>

          <div className="space-y-4">
            {track.modules.map((moduleItem, index) => (
              <div
                key={moduleItem.slug}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-blue-400 font-semibold uppercase tracking-wider">
                      Module {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{moduleItem.title}</h3>
                    {moduleItem.description && (
                      <p className="text-zinc-400 text-sm mt-1">{moduleItem.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-mono text-zinc-500 shrink-0">
                    {moduleItem.chapters.length} Chapters
                  </span>
                </div>

                {/* Chapter list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {moduleItem.chapters.map((ch) => (
                    <Link
                      key={ch.slug}
                      href={`/tracks/${track.slug}/${moduleItem.slug}/${ch.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-zinc-800/80 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-850 transition-colors group cursor-pointer text-xs font-medium text-zinc-300 hover:text-white"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {ch.type === 'challenge' ? (
                          <Code2 size={14} className="text-emerald-400 shrink-0" />
                        ) : ch.type === 'assessment' ? (
                          <CheckCircle size={14} className="text-purple-400 shrink-0" />
                        ) : (
                          <BookOpen size={14} className="text-blue-400 shrink-0" />
                        )}
                        <span className="truncate">{ch.title}</span>
                      </div>
                      <ArrowRight size={12} className="text-zinc-500 group-hover:text-blue-400 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
