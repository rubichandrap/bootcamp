'use client';

import React from 'react';
import { BookOpen, Code2, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';

interface SidebarNavProps {
  modules: ModuleMeta[];
  currentChapter: ChapterMeta | null;
  completedChapterIds: string[];
  onSelectChapter: (modSlug: string, chSlug: string) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  modules,
  currentChapter,
  completedChapterIds,
  onSelectChapter,
}) => {
  return (
    <div className="h-full w-64 bg-[#0d1117] border-r border-slate-800 flex flex-col shrink-0 font-sans text-xs">
      <div className="p-4 border-b border-slate-800/80">
        <h2 className="font-bold text-slate-200 text-sm uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={16} className="text-violet-400" /> Go Mastery Track
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {modules.map((mod) => (
          <div key={mod.slug} className="space-y-1.5">
            <div className="px-2 font-semibold text-slate-400 text-[11px] uppercase tracking-wide flex items-center justify-between">
              <span>{mod.title}</span>
            </div>

            <div className="space-y-1">
              {mod.chapters.map((ch) => {
                const isActive =
                  currentChapter?.moduleSlug === mod.slug && currentChapter?.slug === ch.slug;
                const isCompleted = completedChapterIds.includes(ch.slug);

                return (
                  <button
                    key={ch.slug}
                    onClick={() => onSelectChapter(mod.slug, ch.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-violet-600/20 text-violet-200 font-medium border border-violet-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {ch.type === 'reading' ? (
                        <BookOpen size={14} className="text-slate-400 group-hover:text-violet-400" />
                      ) : ch.type === 'assessment' ? (
                        <Award size={14} className="text-amber-400" />
                      ) : (
                        <Code2 size={14} className="text-cyan-400" />
                      )}
                      <span className="truncate">{ch.title}</span>
                    </div>

                    {isCompleted ? (
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronRight size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
