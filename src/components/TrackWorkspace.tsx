'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CodeEditor } from '@/components/CodeEditor';
import { TerminalOutput } from '@/components/TerminalOutput';
import { SidebarNav } from '@/components/SidebarNav';
import { MdxRenderer } from '@/components/MdxRenderer';
import { TerminalHeader } from '@/components/TerminalHeader';
import { SocraticHintModal } from '@/components/SocraticHintModal';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';
import { useWorkspaceSession } from '@/hooks/useWorkspaceSession';
import { useTheme } from '@/hooks/useTheme';
import { useResizableLayout } from '@/hooks/useResizableLayout';
import { setStoredTrack } from '@/hooks/useTrack';
import { getTrackConfig, TrackSlug } from '@/lib/tracks/trackConfig';
import { Play, Sparkles, Code2, Lock, Key, Flame, ChevronRight, BookOpen, Terminal as TerminalIcon } from 'lucide-react';

interface TrackWorkspaceProps {
  trackSlug?: TrackSlug;
}

export const TrackWorkspace: React.FC<TrackWorkspaceProps> = ({ trackSlug = 'go' }) => {
  const router = useRouter();

  // Layout hooks
  const { theme, toggleTheme, monacoTheme } = useTheme();
  const {
    sidebarWidth,
    workspaceSplit,
    consoleHeight,
    isDesktop,
    handleSidebarMouseDown,
    handleSidebarTouchStart,
    handleWorkspaceMouseDown,
    handleWorkspaceTouchStart,
    handleConsoleMouseDown,
    handleConsoleTouchStart,
  } = useResizableLayout();

  // Workspace Session — owns all Chapter, Challenge, and Progress coordination
  const session = useWorkspaceSession(trackSlug);

  // Track config — replaces all repeated track ternaries
  const trackCfg = getTrackConfig(trackSlug);

  // Layout-only state
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'guide' | 'code' | 'terminal'>('guide');

  // Chapter selection — wraps session action with layout side-effects
  const handleSelectChapter = useCallback(
    async (modSlug: string, chSlug: string) => {
      await session.selectChapter(modSlug, chSlug);
      setIsSidebarOpen(false);
      setActiveMobileTab('guide');
    },
    // session.selectChapter is a stable memoized callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session.selectChapter]
  );

  // Keyboard shortcuts — layout concern; calls session actions for run/read
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (session.currentChapter) {
          if (session.currentChapter.type === 'reading') {
            session.markAsRead();
          } else {
            session.run();
          }
        }
      } else if (e.key === 'Enter' && session.currentChapter?.type === 'reading' && !isPaletteOpen && !isHintOpen) {
        e.preventDefault();
        session.markAsRead();
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
  }, [session.currentChapter, session.run, session.markAsRead, isPaletteOpen, isHintOpen]);

  const currentChapter = session.currentChapter;

  return (
    <div className="h-[100dvh] min-h-[100dvh] w-full max-w-full bg-zinc-100 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col overflow-hidden font-mono select-none">
      {/* Top Terminal Emulator Titlebar Header */}
      <TerminalHeader
        trackTitle={trackCfg.title}
        activeTrackSlug={trackSlug}
        activeModuleTitle={session.activeModuleTitle}
        streakDays={session.streakDays}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsPaletteOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onSelectTrack={(slug) => {
          setStoredTrack(slug);
          router.push(`/tracks/${slug}`);
        }}
      />

      {/* Main Terminal Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar Nav */}
        <div className="hidden lg:flex h-full">
          <SidebarNav
            width={sidebarWidth}
            modules={session.modules}
            currentChapter={currentChapter}
            completedChapterIds={session.completedChapterIds}
            onSelectChapter={handleSelectChapter}
          />
          {/* Desktop Sidebar Drag Resizer */}
          <div
            onMouseDown={handleSidebarMouseDown}
            onTouchStart={handleSidebarTouchStart}
            className="w-6 -mx-2 px-2 hover:bg-cyan-500/20 transition-all cursor-col-resize shrink-0 z-10 select-none flex items-center justify-center group"
            title="Drag to resize sidebar"
          >
            <div className="w-1 h-8 rounded bg-zinc-300 dark:bg-zinc-800 group-hover:bg-cyan-500 transition-colors" />
          </div>
        </div>

        {/* Mobile/Tablet Slide-over Sidebar Drawer */}
        {isSidebarOpen && (
          <>
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-zinc-50 dark:bg-[#09090b] shadow-2xl lg:hidden flex flex-col">
              <SidebarNav
                modules={session.modules}
                currentChapter={currentChapter}
                completedChapterIds={session.completedChapterIds}
                onSelectChapter={handleSelectChapter}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
          </>
        )}

        {/* Content & Workspace Container */}
        <div id="workspace-container" className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 sm:p-3 gap-0">
          {/* Mobile Segmented View Control Bar */}
          {currentChapter?.type !== 'reading' && (
            <div className="flex md:hidden items-center justify-around bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded p-1 mb-2 text-xs font-mono shrink-0">
              <button
                onClick={() => setActiveMobileTab('guide')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded transition-colors font-bold ${
                  activeMobileTab === 'guide'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <BookOpen size={13} />
                <span>Guide</span>
              </button>
              <button
                onClick={() => setActiveMobileTab('code')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded transition-colors font-bold ${
                  activeMobileTab === 'code'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Code2 size={13} />
                <span>Code</span>
              </button>
              <button
                onClick={() => setActiveMobileTab('terminal')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded transition-colors font-bold ${
                  activeMobileTab === 'terminal'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <TerminalIcon size={13} />
                <span>Terminal</span>
              </button>
            </div>
          )}

          {/* Left / Guide Pane */}
          <div
            style={{ width: isDesktop && currentChapter?.type !== 'reading' ? `${workspaceSplit}%` : '100%' }}
            className={`border border-zinc-300 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-[#0c0c0e] p-3 sm:p-5 overflow-y-auto flex-col justify-between select-text shrink-0 ${
              currentChapter?.type === 'reading' || activeMobileTab === 'guide'
                ? 'flex w-full md:w-auto flex-1 md:flex-initial'
                : 'hidden md:flex'
            }`}
          >
            <div>
              {/* Header Box Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-300 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200 truncate">
                  <span>┌─ [CHAPTER]</span>
                  <span className="truncate">{currentChapter?.title || 'Loading...'}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Race Detector Toggle */}
                  {currentChapter?.type !== 'reading' && (
                    <button
                      onClick={() => session.toggleRaceCheck()}
                      className={`px-2 py-0.5 rounded border text-[11px] font-mono transition-colors cursor-pointer ${
                        session.enableRaceCheck
                          ? 'border-red-500 bg-red-500/10 text-red-500 font-bold'
                          : 'border-zinc-300 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Flame size={12} className="inline mr-1" />
                      <span>-race</span>
                    </button>
                  )}

                  {session.isPassed && (
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
            <div className="pt-4 mt-6 border-t border-zinc-300 dark:border-zinc-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setIsHintOpen(true)}
                className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
              >
                <Sparkles size={14} />
                <span>[SOCRATIC HINT]</span>
              </button>

              {currentChapter?.type === 'reading' ? (
                <button
                  onClick={session.markAsRead}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded shadow transition-colors cursor-pointer"
                >
                  <span>[MARK AS READ &amp; CONTINUE]</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={session.run}
                  disabled={session.isLoading}
                  className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-bold text-xs px-4 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Play size={13} fill="currentColor" />
                  <span>{session.isLoading ? '[EXECUTING...]' : '[RUN TESTS]'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Reading vs Editor Pane Vertical Drag Resizer */}
          {currentChapter?.type !== 'reading' && (
            <div
              onMouseDown={handleWorkspaceMouseDown}
              onTouchStart={handleWorkspaceTouchStart}
              className="hidden md:flex w-6 -mx-2 px-2 items-center justify-center cursor-col-resize shrink-0 z-10 select-none group"
              title="Drag to resize panels"
            >
              <div className="w-1 h-8 rounded bg-zinc-300 dark:bg-zinc-800 group-hover:bg-cyan-500 transition-colors" />
            </div>
          )}

          {/* Right: Code Editor & RCE Output Pane */}
          {currentChapter?.type !== 'reading' && (
            <div
              id="right-pane-container"
              style={{ width: isDesktop ? `${100 - workspaceSplit}%` : '100%' }}
              className={`flex-col overflow-hidden shrink-0 ${
                activeMobileTab === 'code' || activeMobileTab === 'terminal'
                  ? 'flex w-full md:w-auto flex-1 md:flex-initial'
                  : 'hidden md:flex'
              }`}
            >
              {/* Code Editor Panel */}
              <div
                className={`flex-1 flex-col border border-zinc-300 dark:border-zinc-800 rounded overflow-hidden bg-white dark:bg-[#1e1e1e] ${
                  activeMobileTab === 'code' ? 'flex' : 'hidden md:flex'
                }`}
              >
                {/* Editor File Tab Bar */}
                <div className="h-9 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-800 px-3 flex items-center justify-between text-xs font-mono select-none shrink-0">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <button
                      onClick={() => session.selectTab('code')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                        session.activeTab === 'code'
                          ? 'bg-zinc-200 dark:bg-[#1e1e1e] text-zinc-950 dark:text-zinc-100 font-bold border border-zinc-400 dark:border-zinc-700'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Code2 size={12} /> {trackCfg.codeFile}
                    </button>
                    <button
                      onClick={() => session.selectTab('test')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                        session.activeTab === 'test'
                          ? 'bg-zinc-200 dark:bg-[#1e1e1e] text-zinc-950 dark:text-zinc-100 font-bold border border-zinc-400 dark:border-zinc-700'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Code2 size={12} /> {trackCfg.testFile}
                    </button>
                    <button
                      onClick={() => session.isUnlocked && session.selectTab('solution')}
                      disabled={!session.isUnlocked}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                        session.activeTab === 'solution'
                          ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700'
                          : session.isUnlocked
                          ? 'text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer'
                          : 'text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {session.isUnlocked ? <Key size={12} /> : <Lock size={12} />} [SOLUTION]
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  {session.activeTab === 'code' ? (
                    <CodeEditor
                      key={`${currentChapter?.slug || 'default'}-code`}
                      filename={trackCfg.codeFile}
                      language={trackCfg.language}
                      path={`${currentChapter?.slug || 'default'}/${trackCfg.codeFile}`}
                      theme={monacoTheme}
                      value={session.code}
                      onChange={(v) => session.updateCode(v || '', currentChapter?.slug)}
                    />
                  ) : session.activeTab === 'test' ? (
                    <CodeEditor
                      key={`${currentChapter?.slug || 'default'}-test`}
                      filename={trackCfg.testFile}
                      language={trackCfg.language}
                      path={`${currentChapter?.slug || 'default'}/${trackCfg.testFile}`}
                      theme={monacoTheme}
                      value={session.testCode}
                      onChange={(v) => session.updateTestCode(v || '')}
                    />
                  ) : (
                    <CodeEditor
                      key={`${currentChapter?.slug || 'default'}-solution`}
                      filename={trackCfg.solutionFile}
                      language={trackCfg.language}
                      path={`${currentChapter?.slug || 'default'}/solution`}
                      theme={monacoTheme}
                      value={session.activeHint.solutionCode || '// Solution Unlocked'}
                      onChange={() => {}}
                    />
                  )}
                </div>
              </div>

              {/* Drag Resizer between Editor and Console */}
              <div
                onMouseDown={handleConsoleMouseDown}
                onTouchStart={handleConsoleTouchStart}
                className="hidden md:flex h-6 -my-2 py-2 items-center justify-center cursor-row-resize shrink-0 z-10 select-none group"
                title="Drag to resize console"
              >
                <div className="h-1 w-8 rounded bg-zinc-300 dark:bg-zinc-800 group-hover:bg-cyan-500 transition-colors" />
              </div>

              {/* RCE Console Output */}
              <div
                style={{ height: !isDesktop || activeMobileTab === 'terminal' ? '100%' : `${consoleHeight}px` }}
                className={`shrink-0 ${
                  activeMobileTab === 'terminal'
                    ? 'flex flex-1 h-full'
                    : 'hidden md:block'
                }`}
              >
                <TerminalOutput result={session.result} isLoading={session.isLoading} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Socratic Hint Modal */}
      <SocraticHintModal
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        hint={session.activeHint}
        isUnlocked={session.isUnlocked}
        failedAttempts={session.failedAttempts}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        modules={session.modules}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  );
};
