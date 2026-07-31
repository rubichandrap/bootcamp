'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TerminalHeader } from '@/components/TerminalHeader';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';
import { useTheme } from '@/hooks/useTheme';
import { useProgressTracker } from '@/hooks/useProgressTracker';
import { useChapterLifecycle } from '@/hooks/useChapterLifecycle';
import type { ModuleMeta } from '@/lib/content/contentEngine';
import type { TrackOverview } from '@/lib/tracks/trackCatalog';
import { Layers, ArrowRight, Code2, CheckCircle2, Terminal as TerminalIcon, Sparkles, Flame } from 'lucide-react';

export default function Homepage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const progressTracker = useProgressTracker();

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [tracks, setTracks] = useState<TrackOverview[]>([]);
  const [allModules, setAllModules] = useState<ModuleMeta[]>([]);

  useEffect(() => {
    async function loadData() {
      await progressTracker.loadProgress();
      try {
        const [tracksRes, modulesRes] = await Promise.all([
          fetch('/api/tracks'),
          fetch('/api/modules?track=all'),
        ]);
        if (tracksRes.ok) {
          const tracksData = await tracksRes.json();
          setTracks(tracksData);
        }
        if (modulesRes.ok) {
          const modulesData = await modulesRes.json();
          setAllModules(modulesData);
        }
      } catch (err) {
        console.error('Failed to fetch track overview', err);
      }
    }
    loadData();
  }, []);

  // Keyboard shortcut Cmd+K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectChapter = (modSlug: string, chSlug: string, trackSlug?: string) => {
    setIsPaletteOpen(false);
    router.push(`/tracks/${trackSlug || 'go'}`);
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-full bg-zinc-100 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-mono select-none overflow-x-hidden">
      {/* Top Terminal Header */}
      <TerminalHeader
        trackTitle="Track Catalog"
        activeTrackSlug="catalog"
        streakDays={progressTracker.streakDays}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsPaletteOpen(true)}
        onSelectTrack={(slug) => router.push(`/tracks/${slug}`)}
      />

      {/* Main Terminal Shell Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-between space-y-8">
        <div className="space-y-8">
          {/* Terminal Banner & Prompt Header */}
          <div className="border border-zinc-300 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-[#0c0c0e] p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                <TerminalIcon size={16} className="text-cyan-600 dark:text-cyan-400" />
                <span>┌─ [BOOTCAMP TRACK CATALOG]</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <Flame size={13} className="text-amber-500" />
                <span>STREAK: {progressTracker.streakDays} DAYS</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                <span>$</span>
                <span>bootcamp tracks list --interactive</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                Select Your Learning Track
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
                Master modern engineering through structured tracks. Read theory, solve embedded Monaco challenges, and verify your code against automated test suites in real-time.
              </p>
            </div>
          </div>

          {/* Available Tracks Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-300 dark:border-zinc-800 pb-2">
              <span>┌─ [AVAILABLE TRACKS]</span>
              <span>{tracks.length} TRACKS LOADED</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tracks.map((track) => {
                const isStarted = track.percentage > 0;
                return (
                  <div
                    key={track.slug}
                    className="group flex flex-col justify-between rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0c0c0e] p-6 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all shadow-sm duration-200"
                  >
                    <div className="space-y-5">
                      {/* Language Badge & Module Info */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                          <Code2 size={13} />
                          [{track.language.toUpperCase()}]
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {track.totalModules} MODULES • {track.totalChapters} CHAPTERS
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {track.title}
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
                          {track.description}
                        </p>
                      </div>

                      {/* Progress Metrics */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 font-bold">
                          <span>PROGRESS</span>
                          <span className="text-cyan-600 dark:text-cyan-400">{track.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded overflow-hidden">
                          <div
                            className="h-full bg-cyan-600 dark:bg-cyan-500 rounded transition-all duration-300"
                            style={{ width: `${track.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 size={14} />
                        <span>[✓ RCE RUNNER]</span>
                      </div>

                      <Link
                        href={`/tracks/${track.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <span>{isStarted ? '[CONTINUE TRACK]' : '[START TRACK]'}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <footer className="pt-6 border-t border-zinc-300 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div>$ status: system operational</div>
          <div>[PRESS CMD+K TO SEARCH]</div>
        </footer>
      </main>

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        modules={allModules}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  );
}
