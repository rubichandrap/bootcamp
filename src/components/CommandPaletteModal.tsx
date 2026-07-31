'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { ModuleMeta } from '@/lib/content/contentEngine';
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
        onSelectChapter(sel.moduleSlug, sel.slug);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex, onSelectChapter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center pt-20 p-4 font-mono">
      <div className="bg-zinc-950 dark:bg-[#09090b] border border-zinc-300 dark:border-zinc-800 rounded max-w-xl w-full overflow-hidden shadow-2xl flex flex-col text-xs text-zinc-800 dark:text-zinc-200">
        {/* Terminal Header */}
        <div className="p-2.5 border-b border-zinc-300 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-900/80 flex items-center justify-between font-bold">
          <span>┌─ [CMD+K] COMMAND PALETTE &amp; TRACK SEARCH ─────────────┐</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-0.5"
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
            placeholder="Search chapters or Go topics... (e.g. Slices, Channels)"
            className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 text-xs font-mono focus:outline-none"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs italic">
              No matching chapters found for &quot;{query}&quot;.
            </div>
          ) : (
            results.map((ch, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${ch.moduleSlug}-${ch.slug}`}
                  onClick={() => {
                    onSelectChapter(ch.moduleSlug, ch.slug);
                    onClose();
                  }}
                  className={`w-full text-left p-2.5 rounded transition-colors flex items-center justify-between group cursor-pointer border font-mono ${
                    isSelected
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold border-zinc-400 dark:border-zinc-700'
                      : 'border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`select-none font-bold ${
                        isSelected ? 'text-zinc-900 dark:text-white opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      &gt;
                    </span>
                    <span className="truncate">{ch.title}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] shrink-0 text-zinc-500 font-normal">
                    <span className="uppercase">[{ch.type}]</span>
                    <span>[ENTER]</span>
                  </div>
                </button>
              );
            })
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
