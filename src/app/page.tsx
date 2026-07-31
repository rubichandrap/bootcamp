'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { TerminalOutput } from '@/components/TerminalOutput';
import { SidebarNav } from '@/components/SidebarNav';
import { MdxRenderer } from '@/components/MdxRenderer';
import { SocraticHintModal } from '@/components/SocraticHintModal';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';
import { getSocraticHint, isSolutionUnlocked } from '@/lib/hints/socraticHints';
import { useProgressTracker } from '@/hooks/useProgressTracker';
import { useChapterLifecycle } from '@/hooks/useChapterLifecycle';
import { useChallengeSession } from '@/hooks/useChallengeSession';
import { useReadingSession } from '@/hooks/useReadingSession';
import { Play, Sparkles, BookOpen, Code2, Award, Zap, CheckCircle2, ChevronRight, Lock, Key, Search, Flame } from 'lucide-react';

export default function Home() {
  // Four deep sub-module hooks
  const progressTracker = useProgressTracker();
  const chapterLifecycle = useChapterLifecycle();
  const challengeSession = useChallengeSession();
  const readingSession = useReadingSession();

  // Page shell UI state
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Chapter selection handler that coordinates across hooks
  const handleSelectChapter = useCallback(
    async (modSlug: string, chSlug: string) => {
      const ch = await chapterLifecycle.selectChapter(modSlug, chSlug);
      if (ch) {
        challengeSession.resetForChapter(ch.starterCode, ch.testCode);
        await progressTracker.loadFailedAttempts(chSlug);
      }
    },
    [chapterLifecycle, challengeSession, progressTracker]
  );

  // Fetch modules and user progress on mount
  useEffect(() => {
    async function loadInitialData() {
      await progressTracker.loadProgress();
      const mods = await chapterLifecycle.loadModules();

      if (mods.length > 0 && mods[0].chapters.length > 0) {
        const firstCh = mods[0].chapters[0];
        await handleSelectChapter(firstCh.moduleSlug, firstCh.slug);
      }
    }
    loadInitialData();
  }, []);

  const handleRun = useCallback(() => {
    if (!chapterLifecycle.currentChapter) return;
    challengeSession.runChallengeSession(chapterLifecycle.currentChapter.slug, {
      recordSubmission: progressTracker.recordSubmission,
      onAdvance: chapterLifecycle.advanceToNextChapter,
      incrementFailedAttempts: progressTracker.incrementFailedAttempts,
    });
  }, [chapterLifecycle.currentChapter, challengeSession, progressTracker]);

  const handleMarkAsRead = useCallback(() => {
    if (!chapterLifecycle.currentChapter) return;
    readingSession.markAsRead(chapterLifecycle.currentChapter.slug, {
      recordSubmission: progressTracker.recordSubmission,
      onAdvance: chapterLifecycle.advanceToNextChapter,
    });
  }, [chapterLifecycle.currentChapter, readingSession, progressTracker, chapterLifecycle]);

  // Keyboard shortcut listeners (Cmd+Enter to run, Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (chapterLifecycle.currentChapter && chapterLifecycle.currentChapter.type !== 'reading') {
          handleRun();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterLifecycle.currentChapter, handleRun]);

  const currentChapter = chapterLifecycle.currentChapter;
  const activeHint = getSocraticHint(currentChapter?.slug || 'default');
  const isPassed = currentChapter ? progressTracker.completedChapterIds.includes(currentChapter.slug) : false;
  const isUnlocked = isSolutionUnlocked({ passed: isPassed, failedAttempts: progressTracker.failedAttempts });

  const totalChapters = chapterLifecycle.modules.flatMap((m) => m.chapters).length;
  const progressPercent =
    totalChapters > 0 ? Math.round((progressTracker.completedChapterIds.length / totalChapters) * 100) : 0;

  return (
    <div className="h-screen w-screen bg-[#090d16] text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Top Navigation Header */}
      <header className="h-14 border-b border-slate-800 bg-[#0d1117] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
            <Zap size={18} />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              Go Mastery Platform
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                Vercel Aesthetic
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {currentChapter ? `${currentChapter.title}` : 'Loading Track...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Race Check UI Toggle */}
          <button
            onClick={() => challengeSession.setEnableRaceCheck((prev) => !prev)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
              challengeSession.enableRaceCheck
                ? 'bg-rose-950/40 border-rose-600 text-rose-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Enable Go Data Race Detector (-race)"
          >
            <Flame size={13} className={challengeSession.enableRaceCheck ? 'text-rose-400' : 'text-slate-500'} />
            <span>-race</span>
          </button>

          {/* Header Progress Bar */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Progress: {progressPercent}%</span>
            <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className="bg-linear-to-r from-violet-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Cmd+K Search Trigger */}
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Search size={13} className="text-violet-400" />
            <span>Search...</span>
            <kbd className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-mono">
              Cmd+K
            </kbd>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md">
            <Award size={14} className="text-amber-400" />
            <span>
              Streak: <strong className="text-white">{progressTracker.streakDays} Days</strong>
            </span>
          </div>

          {currentChapter?.type !== 'reading' && (
            <button
              onClick={handleRun}
              disabled={challengeSession.isLoading}
              className="flex items-center gap-2 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 text-white font-medium text-xs px-4 py-2 rounded-md shadow-md shadow-violet-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              {challengeSession.isLoading ? 'Executing...' : 'Run & Verify (Cmd+Enter)'}
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <SidebarNav
          modules={chapterLifecycle.modules}
          currentChapter={currentChapter}
          completedChapterIds={progressTracker.completedChapterIds}
          onSelectChapter={handleSelectChapter}
        />

        {/* Content & Workspace */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Article / Explanation Pane */}
          <div className="flex-1 border border-slate-800 rounded-xl bg-[#0d1117]/80 p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400">
                  <BookOpen size={14} /> {currentChapter?.title || 'Loading...'}
                </div>
                {isPassed && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 size={12} /> Completed
                  </span>
                )}
              </div>

              {currentChapter?.content ? (
                <MdxRenderer content={currentChapter.content} />
              ) : (
                <p className="text-xs text-slate-500 italic">Select a chapter to begin...</p>
              )}
            </div>

            <div className="pt-4 mt-6 border-t border-slate-800/60 flex items-center justify-between">
              <button
                onClick={() => setIsHintOpen(true)}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
              >
                <Sparkles size={14} /> Socratic Hint
              </button>

              {currentChapter?.type === 'reading' && (
                <button
                  onClick={handleMarkAsRead}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-md shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 size={14} /> Mark as Read &amp; Continue <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Code Editor & RCE Output Pane (for Challenge & Assessment Chapters) */}
          {currentChapter?.type !== 'reading' && (
            <div className="w-1/2 flex flex-col gap-4 overflow-hidden">
              <div className="flex-1 flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-[#0d1117]">
                <div className="h-10 bg-[#161b22] border-b border-slate-800 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => challengeSession.setActiveTab('code')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        challengeSession.activeTab === 'code'
                          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Code2 size={13} /> main.go
                    </button>
                    <button
                      onClick={() => challengeSession.setActiveTab('test')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        challengeSession.activeTab === 'test'
                          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Code2 size={13} /> main_test.go
                    </button>
                    <button
                      onClick={() => isUnlocked && challengeSession.setActiveTab('solution')}
                      disabled={!isUnlocked}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        challengeSession.activeTab === 'solution'
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                          : isUnlocked
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-slate-600 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {isUnlocked ? <Key size={13} /> : <Lock size={13} />} Official Solution
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {challengeSession.activeTab === 'code'
                      ? 'Solution Code'
                      : challengeSession.activeTab === 'test'
                      ? 'Unit Tests'
                      : 'Reference Solution'}
                  </span>
                </div>

                <div className="flex-1">
                  {challengeSession.activeTab === 'code' ? (
                    <CodeEditor
                      value={challengeSession.code}
                      onChange={(v) => challengeSession.setCode(v || '')}
                    />
                  ) : challengeSession.activeTab === 'test' ? (
                    <CodeEditor
                      value={challengeSession.testCode}
                      onChange={(v) => challengeSession.setTestCode(v || '')}
                    />
                  ) : (
                    <CodeEditor value={activeHint.solutionCode || '// Solution Unlocked'} onChange={() => {}} />
                  )}
                </div>
              </div>

              <div className="h-48">
                <TerminalOutput result={challengeSession.result} isLoading={challengeSession.isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Socratic Hint Modal */}
      <SocraticHintModal
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        hint={activeHint}
        isUnlocked={isUnlocked}
        failedAttempts={progressTracker.failedAttempts}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        modules={chapterLifecycle.modules}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  );
}
