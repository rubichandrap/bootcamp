import React from 'react';
import Link from 'next/link';
import { getAllTracks } from '@/lib/content/contentEngine';
import { getTrackProgress } from '@/lib/db/submissionRepo';
import { DEFAULT_USER_ID } from '@/lib/progress/progressTracker';
import { Layers, ArrowRight, Code2, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Language Tracks | Developer Mastery Platform',
  description: 'Choose your learning track: Master Go or TypeScript with interactive challenges.',
};

export default function TracksCatalogPage() {
  const tracks = getAllTracks();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-mono text-sm font-semibold">
            <Layers size={16} />
            <span>LANGUAGE TRACKS</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Choose Your Track
          </h1>
          <p className="text-zinc-400 max-w-2xl text-sm sm:text-base">
            Select a programming language track to start your interactive journey from fundamentals to advanced patterns.
          </p>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track) => {
            const totalModules = track.modules.length;
            const totalChapters = track.modules.reduce((acc, m) => acc + m.chapters.length, 0);
            const trackProgress = getTrackProgress(DEFAULT_USER_ID, track.slug);

            return (
              <div
                key={track.slug}
                className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Badge & Language */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-semibold uppercase">
                      <Code2 size={12} />
                      {track.language}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {totalModules} Modules • {totalChapters} Chapters
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {track.title}
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-mono text-zinc-400">
                      <span>Progress</span>
                      <span className="font-semibold text-blue-400">{trackProgress.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${trackProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                    <CheckCircle2 size={14} />
                    <span>Interactive RCE Supported</span>
                  </div>

                  <Link
                    href={`/tracks/${track.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors cursor-pointer"
                  >
                    <span>Start Track</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
