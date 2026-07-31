'use client';

import React from 'react';
import { X, Lock, Unlock } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-mono">
      <div className="bg-zinc-950 dark:bg-[#09090b] border border-zinc-300 dark:border-zinc-800 rounded max-w-md w-full p-4 shadow-2xl space-y-3 text-xs text-zinc-800 dark:text-zinc-200">
        {/* Terminal Window Bar */}
        <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-800 pb-2 font-bold">
          <span>┌─ [HINT SYSTEM] Socratic Assistant ──────┐</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-0.5"
            title="Close [ESC]"
          >
            <X size={14} />
          </button>
        </div>

        {/* Conceptual Hint */}
        <div className="border border-amber-500/40 bg-amber-500/10 rounded p-3 space-y-1.5 text-amber-600 dark:text-amber-300">
          <div className="font-bold text-xs flex items-center gap-1.5">
            <span>#</span>
            <span>{hint.title}</span>
          </div>
          <p className="text-zinc-800 dark:text-zinc-300 leading-relaxed text-xs">
            {hint.body}
          </p>
        </div>

        {/* Solution Unlock Status */}
        <div className="p-2.5 border border-zinc-300 dark:border-zinc-800 rounded bg-zinc-100 dark:bg-zinc-900/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <Unlock size={14} className="text-emerald-500 dark:text-emerald-400" />
            ) : (
              <Lock size={14} className="text-amber-500 dark:text-amber-400" />
            )}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {isUnlocked
                ? '[SOLUTION UNLOCKED]'
                : `[SOLUTION LOCKED: ${failedAttempts}/3 ATTEMPTS]`}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded font-bold text-xs transition-colors cursor-pointer border border-zinc-400 dark:border-zinc-700"
          >
            [BACK TO CODING: ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
