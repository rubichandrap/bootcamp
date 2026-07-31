'use client';

import React from 'react';
import { Sparkles, X, Lightbulb, Lock, Unlock } from 'lucide-react';
import { SocraticHint } from '@/lib/hints/socraticHints';

interface SocraticHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hint: SocraticHint;
  isUnlocked: boolean;
  failedAttempts: number;
}

export const SocraticHintModal: React.FC<SocraticHintModalProps> = ({
  isOpen,
  onClose,
  hint,
  isUnlocked,
  failedAttempts,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1117] border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
            <Sparkles size={18} className="text-amber-400" />
            <span>Socratic Learning Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conceptual Hint */}
        <div className="bg-violet-950/20 border border-violet-800/40 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-violet-300">
            <Lightbulb size={16} /> {hint.title}
          </div>
          <p className="text-slate-300 leading-relaxed">{hint.body}</p>
        </div>

        {/* Solution Unlock Status */}
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <Unlock size={14} className="text-emerald-400" />
            ) : (
              <Lock size={14} className="text-amber-400" />
            )}
            <span className="text-slate-300">
              {isUnlocked
                ? 'Official Solution Unlocked!'
                : `Official Solution Locks (${failedAttempts}/3 attempts)`}
            </span>
          </div>
          {!isUnlocked && (
            <span className="text-[10px] text-slate-500 italic">
              Solve or complete 3 attempts
            </span>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer"
          >
            Back to Coding
          </button>
        </div>
      </div>
    </div>
  );
};
