'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Code2, Award, ChevronRight } from 'lucide-react';
import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';
import { searchCurriculum } from '@/lib/search/searchEngine';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleMeta[];
  onSelectChapter: (modSlug: string, chSlug: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  modules,
  onSelectChapter,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChapterMeta[]>([]);

  useEffect(() => {
    if (query.trim() === '') {
      // Show all chapters by default when empty search
      setResults(modules.flatMap((m) => m.chapters));
    } else {
      setResults(searchCurriculum(query, modules));
    }
  }, [query, modules]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 p-4">
      <div className="bg-[#0d1117] border border-slate-800 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col font-sans text-xs">
        {/* Search Bar Input */}
        <div className="p-3 border-b border-slate-800 flex items-center gap-3 bg-[#161b22]">
          <Search size={16} className="text-violet-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters, modules, or Go topics... (e.g. Memory, Slices)"
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-xs focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs italic">
              No matching chapters or Go topics found for &quot;{query}&quot;.
            </div>
          ) : (
            results.map((ch) => (
              <button
                key={`${ch.moduleSlug}-${ch.slug}`}
                onClick={() => {
                  onSelectChapter(ch.moduleSlug, ch.slug);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-slate-800/80 transition-all flex items-center justify-between group cursor-pointer border border-transparent hover:border-slate-700/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                    {ch.type === 'reading' ? (
                      <BookOpen size={14} />
                    ) : ch.type === 'assessment' ? (
                      <Award size={14} className="text-amber-400" />
                    ) : (
                      <Code2 size={14} className="text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">
                      {ch.title}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                      {ch.moduleSlug} • {ch.type}
                    </div>
                  </div>
                </div>

                <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
              </button>
            ))
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="p-2.5 bg-[#161b22] border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono px-4">
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Esc</kbd> to close</span>
          <span>Use <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Cmd+K</kbd> anytime</span>
        </div>
      </div>
    </div>
  );
};
