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
import { useResizableLayout } from '@/hooks/useResizableLayout';
import { Play, Sparkles, Code2, Lock, Key, Flame, ChevronRight } from 'lucide-react';

export default function Home() {
  // Theme hook
  const { theme, toggleTheme, monacoTheme } = useTheme();

  // Sub-module hooks
  const progressTracker = useProgressTracker();
  const chapterLifecycle = useChapterLifecycle();
  const challengeSession = useChallengeSession();
  const readingSession = useReadingSession();
  const {
    sidebarWidth,
    workspaceSplit,
    consoleHeight,
    handleSidebarMouseDown,
    handleWorkspaceMouseDown,
    handleConsoleMouseDown,
  } = useResizableLayout();

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

  // 3. Reset editor when currentChapter changes, fetching saved answer from DB if present
  const currentChapter = chapterLifecycle.currentChapter;
  useEffect(() => {
    if (!currentChapter) return;
    const ch = currentChapter;
    let isSubscribed = true;
    async function initChapter() {
      progressTracker.loadFailedAttempts(ch.slug);
      let savedCode: string | undefined;
      if (ch.type !== 'reading') {
        const latestSub = await progressTracker.getLatestSubmission(ch.slug);
        if (latestSub?.code) {
          savedCode = latestSub.code;
        }
      }
      if (isSubscribed) {
        challengeSession.resetForChapter(
          ch.starterCode,
          ch.testCode,
          savedCode,
          ch.slug
        );
      }
    }
    initChapter();
    return () => {
      isSubscribed = false;
    };
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

  // 4. Keyboard shortcut listeners (Cmd+Enter / Enter to run or mark-as-read, Cmd+K for search, Cmd+H for hint)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (chapterLifecycle.currentChapter) {
          if (chapterLifecycle.currentChapter.type === 'reading') {
            handleMarkAsRead();
          } else {
            handleRun();
          }
        }
      } else if (e.key === 'Enter' && chapterLifecycle.currentChapter?.type === 'reading' && !isPaletteOpen && !isHintOpen) {
        e.preventDefault();
        handleMarkAsRead();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHintOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterLifecycle.currentChapter, handleRun, handleMarkAsRead, isPaletteOpen, isHintOpen]);

  const activeHint = getSocraticHint(currentChapter?.slug || 'default');
  const isPassed = currentChapter ? progressTracker.completedChapterIds.includes(currentChapter.slug) : false;
  const isUnlocked = isSolutionUnlocked({ passed: isPassed, failedAttempts: progressTracker.failedAttempts });

  const activeModuleTitle = currentChapter
    ? chapterLifecycle.modules.find((m) => m.slug === currentChapter.moduleSlug)?.title
    : undefined;

  return (
    <div className="h-screen w-screen bg-zinc-100 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col overflow-hidden font-mono select-none">
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
          width={sidebarWidth}
          modules={chapterLifecycle.modules}
          currentChapter={currentChapter}
          completedChapterIds={progressTracker.completedChapterIds}
          onSelectChapter={handleSelectChapter}
        />

        {/* Sidebar Vertical Drag Resizer */}
        <div
          onMouseDown={handleSidebarMouseDown}
          className="w-1.5 hover:w-2 bg-zinc-300 dark:bg-zinc-800 hover:bg-cyan-500 dark:hover:bg-cyan-500 transition-all cursor-col-resize shrink-0 z-10 select-none flex items-center justify-center group"
          title="Drag to resize sidebar"
        >
          <div className="w-0.5 h-6 bg-zinc-400 dark:bg-zinc-600 group-hover:bg-cyan-200 rounded" />
        </div>

        {/* Content & Workspace Area */}
        <div id="workspace-container" className="flex-1 flex overflow-hidden p-3 gap-0">
          {/* Left: Reading / Manual Pane */}
          <div
            style={{ width: currentChapter?.type !== 'reading' ? `${workspaceSplit}%` : '100%' }}
            className="border border-zinc-300 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-[#0c0c0e] p-5 overflow-y-auto flex flex-col justify-between select-text shrink-0"
          >
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

          {/* Reading vs Editor Pane Vertical Drag Resizer */}
          {currentChapter?.type !== 'reading' && (
            <div
              onMouseDown={handleWorkspaceMouseDown}
              className="w-2.5 hover:w-3.5 mx-1 flex items-center justify-center cursor-col-resize shrink-0 z-10 select-none group"
              title="Drag to resize panels"
            >
              <div className="w-1 h-8 rounded bg-zinc-300 dark:bg-zinc-800 group-hover:bg-cyan-500 transition-colors" />
            </div>
          )}

          {/* Right: Code Editor & RCE Output Pane (for Challenge & Assessment Chapters) */}
          {currentChapter?.type !== 'reading' && (
            <div
              id="right-pane-container"
              style={{ width: `${100 - workspaceSplit}%` }}
              className="flex flex-col overflow-hidden shrink-0"
            >
              {/* Code Editor Panel */}
              <div className="flex-1 flex flex-col border border-zinc-300 dark:border-zinc-800 rounded overflow-hidden bg-white dark:bg-[#1e1e1e]">
                {/* Editor File Tab Bar */}
                <div className="h-9 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-800 px-3 flex items-center justify-between text-xs font-mono select-none shrink-0">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => challengeSession.selectTab('code')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                        challengeSession.activeTab === 'code'
                          ? 'bg-zinc-200 dark:bg-[#1e1e1e] text-zinc-950 dark:text-zinc-100 font-bold border border-zinc-400 dark:border-zinc-700'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Code2 size={12} /> main.go
                    </button>
                    <button
                      onClick={() => challengeSession.selectTab('test')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                        challengeSession.activeTab === 'test'
                          ? 'bg-zinc-200 dark:bg-[#1e1e1e] text-zinc-950 dark:text-zinc-100 font-bold border border-zinc-400 dark:border-zinc-700'
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
                      path={`${currentChapter?.slug || 'default'}/main.go`}
                      theme={monacoTheme}
                      value={challengeSession.code}
                      onChange={(v) => challengeSession.updateCode(v || '', currentChapter?.slug)}
                    />
                  ) : challengeSession.activeTab === 'test' ? (
                    <CodeEditor
                      filename="main_test.go"
                      path={`${currentChapter?.slug || 'default'}/main_test.go`}
                      theme={monacoTheme}
                      value={challengeSession.testCode}
                      onChange={(v) => challengeSession.updateTestCode(v || '')}
                    />
                  ) : (
                    <CodeEditor
                      filename="solution.go"
                      path={`${currentChapter?.slug || 'default'}/solution.go`}
                      theme={monacoTheme}
                      value={activeHint.solutionCode || '// Solution Unlocked'}
                      onChange={() => {}}
                    />
                  )}
                </div>
              </div>

              {/* Horizontal Drag Resizer between Editor and Console */}
              <div
                onMouseDown={handleConsoleMouseDown}
                className="h-2.5 hover:h-3.5 my-0.5 flex items-center justify-center cursor-row-resize shrink-0 z-10 select-none group"
                title="Drag to resize console"
              >
                <div className="h-1 w-8 rounded bg-zinc-300 dark:bg-zinc-800 group-hover:bg-cyan-500 transition-colors" />
              </div>

              {/* RCE Console Output */}
              <div style={{ height: `${consoleHeight}px` }} className="shrink-0">
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
