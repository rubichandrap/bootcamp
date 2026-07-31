'use client';

import React from 'react';
import { Search, Terminal, Flame, Sun, Moon, Menu, Layers } from 'lucide-react';
import { Theme } from '@/hooks/useTheme';

export function formatTitlebarText(trackTitle: string, activeModuleTitle?: string): string {
  if (activeModuleTitle) {
    return `go-mastery-cli v1.0.0 -- track: ${trackTitle} > ${activeModuleTitle}`;
  }
  return `go-mastery-cli v1.0.0 -- track: ${trackTitle}`;
}

export function formatStreakBadge(streakDays: number): string {
  return `🔥 STREAK: ${streakDays}d`;
}

export interface TrackOption {
  slug: string;
  title: string;
}

const DEFAULT_TRACKS: TrackOption[] = [
  { slug: 'go', title: 'Go Mastery' },
  { slug: 'typescript', title: 'TypeScript Mastery' },
];

interface TerminalHeaderProps {
  trackTitle?: string;
  activeTrackSlug?: string;
  activeModuleTitle?: string;
  streakDays?: number;
  theme: Theme;
  tracks?: TrackOption[];
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
  onSelectTrack?: (trackSlug: string) => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  trackTitle = 'Go Mastery',
  activeTrackSlug = 'go',
  activeModuleTitle,
  streakDays = 0,
  theme,
  tracks = DEFAULT_TRACKS,
  onToggleTheme,
  onOpenSearch,
  onToggleSidebar,
  onSelectTrack,
}) => {
  return (
    <header className="h-10 bg-zinc-100 dark:bg-[#09090b] border-b border-zinc-300 dark:border-zinc-800 flex items-center justify-between px-3 font-mono text-xs text-zinc-700 dark:text-zinc-300 select-none shrink-0">
      {/* Left: Hamburger menu, Window Controls & Shell Title */}
      <div className="flex items-center gap-2 sm:gap-3 truncate">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer shrink-0"
            title="Toggle Curriculum Navigation"
            aria-label="Toggle Curriculum Navigation"
          >
            <Menu size={16} />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 inline-block"></span>
        </div>

        <div className="flex items-center gap-2 truncate font-semibold text-zinc-800 dark:text-zinc-200">
          <Terminal size={14} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span className="truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
            {formatTitlebarText(trackTitle, activeModuleTitle)}
          </span>
        </div>
      </div>

      {/* Right: Track Selector, Badges & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Track Switcher */}
        {onSelectTrack && (
          <div className="relative flex items-center gap-1 px-2 py-0.5 rounded border border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
            <Layers size={13} className="shrink-0" />
            <select
              value={activeTrackSlug}
              onChange={(e) => onSelectTrack(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              aria-label="Select Language Track"
            >
              {tracks.map((t) => (
                <option key={t.slug} value={t.slug} className="bg-zinc-900 text-white">
                  [{t.slug.toUpperCase()}] {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Search Chapters (Cmd+K)"
        >
          <Search size={13} className="text-zinc-500 dark:text-zinc-400" />
          <span className="hidden sm:inline">[CMD+K]</span>
        </button>

        {/* Streak badge */}
        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
          <Flame size={12} />
          <span>{formatStreakBadge(streakDays)}</span>
        </div>

        {/* Theme mode toggle badge */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-semibold transition-colors cursor-pointer"
          title="Toggle Light/Dark Mode"
        >
          {theme === 'dark' ? (
            <>
              <Moon size={12} className="text-amber-400" />
              <span className="hidden sm:inline">[MODE: DARK]</span>
            </>
          ) : (
            <>
              <Sun size={12} className="text-amber-600" />
              <span className="hidden sm:inline">[MODE: LIGHT]</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
