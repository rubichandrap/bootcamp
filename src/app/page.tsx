import React from 'react';
import Link from 'next/link';
import { getAllTracks } from '@/lib/content/contentEngine';
import { getTrackProgress } from '@/lib/db/submissionRepo';
import { DEFAULT_USER_ID } from '@/lib/progress/progressTracker';
import { Code2, ArrowRight, CheckCircle2, Terminal, Flame, Sparkles, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Bootcamp — Developer Mastery Platform',
  description: 'Learn and master Go and TypeScript through interactive reading guides, Monaco challenges, and test-driven Remote Code Execution.',
};

export default function BootcampHomePage() {
  const tracks = getAllTracks();
  const goProgress = getTrackProgress(DEFAULT_USER_ID, 'go');
  const tsProgress = getTrackProgress(DEFAULT_USER_ID, 'typescript');

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans p-4 sm:p-8 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Terminal Header Banner */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-2xl overflow-hidden">
          {/* Title Bar */}
          <div className="h-9 bg-zinc-950 border-b border-zinc-800 px-4 flex items-center justify-between font-mono text-xs text-zinc-400 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 text-zinc-300 font-semibold flex items-center gap-1.5">
                <Terminal size={14} className="text-blue-400" />
                bootcamp v1.0.0
              </span>
            </div>
            <span className="hidden sm:inline text-zinc-400 font-mono text-[11px]">
              DEVELOPER MASTERY PLATFORM
            </span>
          </div>

          {/* ASCII Banner Box */}
          <div className="p-6 sm:p-8 bg-zinc-950/60 overflow-x-auto flex justify-center text-center">
            <pre className="font-mono text-[10px] sm:text-xs md:text-sm text-blue-400 font-bold leading-tight select-none">
{`██████╗  ██████╗  ██████╗ ████████╗██████╗  █████╗ ███╗   ███╗██████╗ 
██╔══██╗██╔═══██╗██╔═══██╗╚══██╔══╝██╔════╝ ██╔══██╗████╗ ████║██╔══██╗
██████╔╝██║   ██║██║   ██║   ██║   ██║      ███████║██╔████╔██║██████╔╝
██╔══██╗██║   ██║██║   ██║   ██║   ██║      ██╔══██║██║╚██╔╝██║██╔═══╝ 
██████╔╝╚██████╔╝╚██████╔╝   ██║   ╚██████╗ ██║  ██║██║ ╚═╝ ██║██║     
╚═════╝  ╚═════╝  ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     `}
            </pre>
          </div>
        </div>

        {/* Subtitle & Hero Description */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Master Programming Languages Test-First
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Interactive developer bootcamp with side-by-side reading guides, embedded code editor, and instant Remote Code Execution (RCE).
          </p>
        </div>

        {/* Track Selection Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-mono font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            <span>Select a Language Track</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tracks.map((track) => {
              const isGo = track.slug === 'go';
              const progress = isGo ? goProgress : tsProgress;
              const totalModules = track.modules.length;
              const totalChapters = track.modules.reduce((acc, m) => acc + m.chapters.length, 0);

              return (
                <div
                  key={track.slug}
                  className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 shadow-lg"
                >
                  <div className="space-y-4">
                    {/* Badge & Info */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-semibold uppercase">
                        <Code2 size={13} />
                        {track.language} Track
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {totalModules} Modules • {totalChapters} Chapters
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {track.description}
                      </p>
                    </div>

                    {/* Live Progress Indicator */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-mono text-zinc-400">
                        <span>Completion Progress</span>
                        <span className="font-semibold text-blue-400">{progress.percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                      <CheckCircle2 size={14} />
                      <span>{isGo ? 'go test -json' : 'vitest -json'}</span>
                    </div>

                    <Link
                      href={`/tracks/${track.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors cursor-pointer"
                    >
                      <span>Explore Track</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
