'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { ModuleMeta } from '@/lib/content/contentEngine';
import { searchCurriculum } from '@/lib/search/searchEngine';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleMeta[];
  onSelectChapter: (modSlug: string, chSlug: string, trackSlug?: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  modules,
  onSelectChapter,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results =
    query.trim() === ''
      ? modules.flatMap((m) => m.chapters)
      : searchCurriculum(query, modules);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        const sel = results[selectedIndex];
        onSelectChapter(sel.moduleSlug, sel.slug, sel.trackSlug);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex, onSelectChapter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center pt-20 p-4 font-mono">
      <div className="bg-white dark:bg-[#09090b] border border-zinc-300 dark:border-zinc-800 rounded max-w-xl w-full overflow-hidden shadow-2xl flex flex-col text-xs text-zinc-800 dark:text-zinc-200">
        {/* Terminal Header */}
        <div className="p-2.5 border-b border-zinc-300 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-900/80 flex items-center justify-between font-bold">
          <span>┌─ [CMD+K] COMMAND PALETTE &amp; TRACK SEARCH ─────────────┐</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-0.5 cursor-pointer"
            title="Close [ESC]"
          >
            <X size={14} />
          </button>
        </div>

        {/* Input */}
        <div className="p-3 border-b border-zinc-300 dark:border-zinc-800 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900/40">
          <span className="text-zinc-400 font-bold">$</span>
          <Search size={14} className="text-zinc-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters across all tracks... (e.g. Go, TypeScript, Slices, Generics)"
            className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none"
            autoFocus
          />
        </div>

        {/* Results grouped by Module */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-3">
          {results.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs italic">
              No matching chapters found for &quot;{query}&quot;.
            </div>
          ) : (
            (() => {
              const groupedModules: {
                moduleKey: string;
                moduleTitle: string;
                trackSlug: string;
                chapters: typeof results;
              }[] = [];

              const groupMap = new Map<string, typeof groupedModules[0]>();

              for (const ch of results) {
                const modKey = `${ch.trackSlug || 'go'}:${ch.moduleSlug}`;
                let group = groupMap.get(modKey);
                if (!group) {
                  const parentMod = modules.find(
                    (m) => m.slug === ch.moduleSlug && (m.trackSlug || 'go') === (ch.trackSlug || 'go')
                  );
                  const moduleTitle = parentMod?.title || ch.moduleSlug;
                  group = {
                    moduleKey: modKey,
                    moduleTitle,
                    trackSlug: ch.trackSlug || 'go',
                    chapters: [],
                  };
                  groupMap.set(modKey, group);
                  groupedModules.push(group);
                }
                group.chapters.push(ch);
              }

              return groupedModules.map((group) => (
                <div key={group.moduleKey} className="space-y-1">
                  {/* Module Group Header */}
                  <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="truncate">┌─ MODULE: {group.moduleTitle}</span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-extrabold">
                      [{group.trackSlug.toUpperCase()}]
                    </span>
                  </div>

                  {/* Chapter items */}
                  {group.chapters.map((ch) => {
                    const flatIndex = results.findIndex(
                      (r) => r.slug === ch.slug && r.moduleSlug === ch.moduleSlug && r.trackSlug === ch.trackSlug
                    );
                    const isSelected = flatIndex === selectedIndex;
                    return (
                      <button
                        key={`${ch.trackSlug || 'go'}-${ch.moduleSlug}-${ch.slug}`}
                        onClick={() => {
                          onSelectChapter(ch.moduleSlug, ch.slug, ch.trackSlug);
                          onClose();
                        }}
                        className={`w-full text-left pl-4 pr-2.5 py-1.5 rounded transition-colors flex items-center justify-between group cursor-pointer border font-mono ${
                          isSelected
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold border-zinc-400 dark:border-zinc-700'
                            : 'border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`select-none font-bold ${
                              isSelected
                                ? 'text-cyan-600 dark:text-cyan-400 opacity-100'
                                : 'text-zinc-400 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            &gt;
                          </span>
                          <span className="truncate">{ch.title}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] shrink-0 text-zinc-500 font-normal">
                          <span className="uppercase">[{ch.type}]</span>
                          {isSelected && (
                            <span className="text-cyan-600 dark:text-cyan-400 font-bold">[ENTER]</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ));
            })()
          )}
        </div>

        {/* Footer */}
        <div className="p-2 bg-zinc-100 dark:bg-zinc-900/60 border-t border-zinc-300 dark:border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between px-3">
          <span>Press [ESC] to exit modal</span>
          <span>[UP/DOWN] Navigate | [ENTER] Select</span>
        </div>
      </div>
    </div>
  );
};
