'use client';

import React from 'react';
import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';

export function getTreePrefix(isLast: boolean): string {
  return isLast ? '└──' : '├──';
}

export function getChapterBadgeText(
  isCompleted: boolean,
  type?: 'reading' | 'challenge' | 'assessment'
): string {
  if (isCompleted) return '[✓]';
  if (type === 'assessment') return '[ASSESS]';
  if (type === 'challenge') return '[CODE]';
  return '[READ]';
}

interface SidebarNavProps {
  modules: ModuleMeta[];
  currentChapter: ChapterMeta | null;
  completedChapterIds: string[];
  onSelectChapter: (modSlug: string, chSlug: string) => void;
  width?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  modules,
  currentChapter,
  completedChapterIds,
  onSelectChapter,
  width,
}) => {
  return (
    <aside
      className="h-full bg-zinc-50 dark:bg-[#09090b] border-r border-zinc-300 dark:border-zinc-800 flex flex-col shrink-0 font-mono text-xs text-zinc-800 dark:text-zinc-200 select-none"
      style={{ width: width ? `${width}px` : '18rem' }}
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-between">
        <h2 className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
          ┌── TRACK DIRECTORY
        </h2>
        <span className="text-[10px] text-zinc-500 font-normal">tree v1.0</span>
      </div>

      {/* Module Tree List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {modules.map((mod, modIdx) => {
          const isLastMod = modIdx === modules.length - 1;
          const modPrefix = getTreePrefix(isLastMod);

          return (
            <div key={mod.slug} className="space-y-1">
              {/* Module Header */}
              <div className="font-bold text-zinc-700 dark:text-zinc-300 text-[11px] uppercase tracking-wide flex items-center gap-1.5 px-1 py-0.5">
                <span className="text-zinc-400 dark:text-zinc-600 select-none">{modPrefix}</span>
                <span className="truncate">{mod.title}</span>
              </div>

              {/* Chapters Sub-tree */}
              <div className="space-y-0.5 pl-3">
                {mod.chapters.map((ch, chIdx) => {
                  const isLastCh = chIdx === mod.chapters.length - 1;
                  const chPrefix = getTreePrefix(isLastCh);
                  const isActive =
                    currentChapter?.moduleSlug === mod.slug && currentChapter?.slug === ch.slug;
                  const isCompleted = completedChapterIds.includes(ch.slug);
                  const badgeText = getChapterBadgeText(isCompleted, ch.type);

                  return (
                    <button
                      key={ch.slug}
                      onClick={() => onSelectChapter(mod.slug, ch.slug)}
                      className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center justify-between group cursor-pointer font-mono ${
                        isActive
                          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold border border-zinc-400 dark:border-zinc-700'
                          : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-zinc-400 dark:text-zinc-600 select-none shrink-0 font-normal">
                          {chPrefix}
                        </span>
                        <span className="text-zinc-500 opacity-0 group-hover:opacity-100 shrink-0">
                          &gt;
                        </span>
                        <span className="truncate">{ch.title}</span>
                      </div>

                      <span
                        className={`text-[10px] shrink-0 font-semibold px-1 py-0.5 rounded ${
                          isCompleted
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : ch.type === 'assessment'
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                            : ch.type === 'challenge'
                            ? 'text-zinc-800 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-800'
                            : 'text-zinc-500 dark:text-zinc-400'
                        }`}
                      >
                        {badgeText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
