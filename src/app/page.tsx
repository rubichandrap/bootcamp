'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { TerminalOutput } from '@/components/TerminalOutput';
import { SidebarNav } from '@/components/SidebarNav';
import { MdxRenderer } from '@/components/MdxRenderer';
import { TerminalHeader } from '@/components/TerminalHeader';
import { SocraticHintModal } from '@/components/SocraticHintModal';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';
import { getSocraticHint, isSolutionUnlocked } from '@/lib/hints/socraticHints';
import { useProgressTracker } from '@/hooks/useProgressTracker';
import { useChapterLifecycle } from '@/hooks/useChapterLifecycle';
import { useChallengeSession } from '@/hooks/useChallengeSession';
import { useReadingSession } from '@/hooks/useReadingSession';
import { useTheme } from '@/hooks/useTheme';
import { Play, Sparkles, Code2, Lock, Key, Flame, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Home() {
  // Theme hook
  const { theme, toggleTheme, monacoTheme } = useTheme();

  // Sub-module hooks
  const progressTracker = useProgressTracker();
  const chapterLifecycle = useChapterLifecycle();
  const challengeSession = useChallengeSession();
  const readingSession = useReadingSession();

  // Page shell UI state
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Chapter selection handler
  const handleSelectChapter = useCallback(
    async (modSlug: string, chSlug: string) => {
      await chapterLifecycle.selectChapter(modSlug, chSlug);
    },
    [chapterLifecycle]
  );

  // 1. Initial data loading effect
  useEffect(() => {
    async function loadInitialData() {
      await progressTracker.loadProgress();
      await chapterLifecycle.loadModules();
    }
    loadInitialData();
  }, []);

  // 2. Auto-select first Chapter when modules load
  useEffect(() => {
    if (!chapterLifecycle.currentChapter && chapterLifecycle.modules.length > 0) {
      const firstMod = chapterLifecycle.modules[0];
      if (firstMod.chapters.length > 0) {
        const firstCh = firstMod.chapters[0];
        handleSelectChapter(firstCh.moduleSlug, firstCh.slug);
      }
    }
  }, [chapterLifecycle.modules, chapterLifecycle.currentChapter, handleSelectChapter]);

  // 3. Reset editor when currentChapter changes
  const currentChapter = chapterLifecycle.currentChapter;
  useEffect(() => {
    if (!currentChapter) return;
    challengeSession.resetForChapter(currentChapter.starterCode, currentChapter.testCode);
    progressTracker.loadFailedAttempts(currentChapter.slug);
  }, [currentChapter?.slug]);

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

  // 4. Keyboard shortcut listeners (Cmd+Enter to run, Cmd+K for search)
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

  const activeHint = getSocraticHint(currentChapter?.slug || 'default');
  const isPassed = currentChapter ? progressTracker.completedChapterIds.includes(currentChapter.slug) : false;
  const isUnlocked = isSolutionUnlocked({ passed: isPassed, failedAttempts: progressTracker.failedAttempts });

  const activeModuleTitle = currentChapter
    ? chapterLifecycle.modules.find((m) => m.slug === currentChapter.moduleSlug)?.title
    : undefined;

  return (
    <div className="h-screen w-screen bg-zinc-950 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col overflow-hidden font-mono select-none">
      {/* Top Terminal Emulator Titlebar Header */}
      <TerminalHeader
        trackTitle="Go Mastery"
        activeModuleTitle={activeModuleTitle}
        streakDays={progressTracker.streakDays}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsPaletteOpen(true)}
      />

      {/* Main Terminal Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <SidebarNav
          modules={chapterLifecycle.modules}
          currentChapter={currentChapter}
          completedChapterIds={progressTracker.completedChapterIds}
          onSelectChapter={handleSelectChapter}
        />

        {/* Content & Workspace Area */}
        <div className="flex-1 flex overflow-hidden p-3 gap-3">
          {/* Left: Reading / Manual Pane */}
          <div className="flex-1 border border-zinc-300 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-[#0c0c0e] p-5 overflow-y-auto flex flex-col justify-between select-text">
            <div>
              {/* Header Box Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-300 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200">
                  <span>┌─ [CHAPTER]</span>
                  <span>{currentChapter?.title || 'Loading...'}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Race Detector Toggle */}
                  {currentChapter?.type !== 'reading' && (
                    <button
                      onClick={() => challengeSession.toggleRaceCheck()}
                      className={`px-2 py-0.5 rounded border text-[11px] font-mono transition-colors cursor-pointer ${
                        challengeSession.enableRaceCheck
                          ? 'border-red-500 bg-red-500/10 text-red-500 font-bold'
                          : 'border-zinc-300 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Flame size={12} className="inline mr-1" />
                      <span>-race</span>
                    </button>
                  )}

                  {isPassed && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                      [✓ COMPLETED]
                    </span>
                  )}
                </div>
              </div>

              {currentChapter?.content ? (
                <MdxRenderer content={currentChapter.content} />
              ) : (
                <p className="text-xs text-zinc-500 italic">$ loading manual page content...</p>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 mt-6 border-t border-zinc-300 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setIsHintOpen(true)}
                className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
              >
                <Sparkles size={14} /> [SOCRATIC HINT: ⌘H]
              </button>

              {currentChapter?.type === 'reading' ? (
                <button
                  onClick={handleMarkAsRead}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded shadow transition-colors cursor-pointer"
                >
                  <span>[MARK AS READ &amp; CONTINUE: ↵]</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleRun}
                  disabled={challengeSession.isLoading}
                  className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-bold text-xs px-4 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Play size={13} fill="currentColor" />
                  <span>{challengeSession.isLoading ? '[EXECUTING...]' : '[RUN TESTS: ⌘↵]'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Code Editor & RCE Output Pane (for Challenge & Assessment Chapters) */}
          {currentChapter?.type !== 'reading' && (
            <div className="w-1/2 flex flex-col gap-3 overflow-hidden">
              {/* Code Editor Panel */}
              <div className="flex-1 flex flex-col border border-zinc-300 dark:border-zinc-800 rounded overflow-hidden bg-zinc-900 dark:bg-[#1e1e1e]">
                {/* Editor File Tab Bar */}
                <div className="h-9 bg-zinc-200 dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-800 px-3 flex items-center justify-between text-xs font-mono select-none shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => challengeSession.selectTab('code')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                        challengeSession.activeTab === 'code'
                          ? 'bg-zinc-950 dark:bg-[#1e1e1e] text-zinc-100 font-bold border border-zinc-400 dark:border-zinc-700'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Code2 size={12} /> main.go
                    </button>
                    <button
                      onClick={() => challengeSession.selectTab('test')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                        challengeSession.activeTab === 'test'
                          ? 'bg-zinc-950 dark:bg-[#1e1e1e] text-zinc-100 font-bold border border-zinc-400 dark:border-zinc-700'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Code2 size={12} /> main_test.go
                    </button>
                    <button
                      onClick={() => isUnlocked && challengeSession.selectTab('solution')}
                      disabled={!isUnlocked}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                        challengeSession.activeTab === 'solution'
                          ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700'
                          : isUnlocked
                          ? 'text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer'
                          : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isUnlocked ? <Key size={12} /> : <Lock size={12} />} [SOLUTION]
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  {challengeSession.activeTab === 'code' ? (
                    <CodeEditor
                      filename="main.go"
                      theme={monacoTheme}
                      value={challengeSession.code}
                      onChange={(v) => challengeSession.updateCode(v || '')}
                    />
                  ) : challengeSession.activeTab === 'test' ? (
                    <CodeEditor
                      filename="main_test.go"
                      theme={monacoTheme}
                      value={challengeSession.testCode}
                      onChange={(v) => challengeSession.updateTestCode(v || '')}
                    />
                  ) : (
                    <CodeEditor
                      filename="solution.go"
                      theme={monacoTheme}
                      value={activeHint.solutionCode || '// Solution Unlocked'}
                      onChange={() => {}}
                    />
                  )}
                </div>
              </div>

              {/* RCE Console Output */}
              <div className="h-52">
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
