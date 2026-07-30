'use client';

import React, { useState, useEffect } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { TerminalOutput } from '@/components/TerminalOutput';
import { SidebarNav } from '@/components/SidebarNav';
import { MdxRenderer } from '@/components/MdxRenderer';
import { SocraticHintModal } from '@/components/SocraticHintModal';
import { CommandPaletteModal } from '@/components/CommandPaletteModal';
import { RCEExecuteResponse } from '@/app/api/rce/execute/route';
import { ModuleMeta, ChapterMeta } from '@/lib/content/contentEngine';
import { getSocraticHint, isSolutionUnlocked } from '@/lib/hints/socraticHints';
import { calculateStreak } from '@/lib/search/searchEngine';
import { Play, Sparkles, BookOpen, Code2, Award, Zap, CheckCircle2, ChevronRight, Lock, Key, Search } from 'lucide-react';

const DEFAULT_STARTER_CODE = `package main

// Add returns the sum of two integers.
func Add(a, b int) int {
	return a + b
}

// Factorial computes the factorial of n using recursion.
func Factorial(n int) int {
	if n <= 1 {
		return 1
	}
	return n * Factorial(n-1)
}
`;

const DEFAULT_TEST_CODE = `package main

import "testing"

func TestAdd(t *testing.T) {
	if Add(2, 3) != 5 {
		t.Errorf("Add(2, 3) = %d; want 5", Add(2, 3))
	}
}

func TestFactorial(t *testing.T) {
	if Factorial(5) != 120 {
		t.Errorf("Factorial(5) = %d; want 120", Factorial(5))
	}
}
`;

export default function Home() {
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [currentChapter, setCurrentChapter] = useState<ChapterMeta | null>(null);
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);
  const [submissionDates, setSubmissionDates] = useState<string[]>([]);
  
  const [code, setCode] = useState(DEFAULT_STARTER_CODE);
  const [testCode, setTestCode] = useState(DEFAULT_TEST_CODE);
  const [activeTab, setActiveTab] = useState<'code' | 'test' | 'solution'>('code');
  const [result, setResult] = useState<RCEExecuteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Fetch modules and user progress on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const modRes = await fetch('/api/modules');
        const mods: ModuleMeta[] = await modRes.json();
        setModules(mods);

        if (mods.length > 0 && mods[0].chapters.length > 0) {
          setCurrentChapter(mods[0].chapters[0]);
        }

        const progRes = await fetch('/api/submissions?userId=default-user');
        const progData = await progRes.json();
        if (progData.completedChapterIds) {
          setCompletedChapterIds(progData.completedChapterIds);
        }
        if (progData.submissionDates) {
          setSubmissionDates(progData.submissionDates);
        } else {
          setSubmissionDates([new Date().toISOString()]);
        }
      } catch (err) {
        console.error('Failed to load initial modules', err);
      }
    }
    loadInitialData();
  }, []);

  const handleSelectChapter = async (modSlug: string, chSlug: string) => {
    try {
      const res = await fetch(`/api/modules?module=${modSlug}&chapter=${chSlug}`);
      const ch: ChapterMeta = await res.json();
      setCurrentChapter(ch);
      setResult(null);
      setFailedAttempts(0);
      setActiveTab('code');

      if (ch.starterCode) setCode(ch.starterCode);
      if (ch.testCode) setTestCode(ch.testCode);
    } catch (err) {
      console.error('Failed to select chapter', err);
    }
  };

  const advanceToNextChapter = () => {
    if (!currentChapter) return;
    const allChapters = modules.flatMap((m) => m.chapters);
    const currentIndex = allChapters.findIndex((c) => c.slug === currentChapter.slug);
    if (currentIndex !== -1 && currentIndex + 1 < allChapters.length) {
      const next = allChapters[currentIndex + 1];
      handleSelectChapter(next.moduleSlug, next.slug);
    }
  };

  const handleMarkAsRead = async () => {
    if (!currentChapter) return;
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default-user',
          chapterId: currentChapter.slug,
          code: '// Reading Chapter Completed',
          passed: true,
          testCount: 0,
          failedCount: 0,
        }),
      });
      const data = await res.json();
      if (data.userProgress?.completedChapterIds) {
        setCompletedChapterIds(data.userProgress.completedChapterIds);
      }
      advanceToNextChapter();
    } catch (err) {
      console.error('Failed to mark chapter read', err);
    }
  };

  const handleRun = async () => {
    if (!currentChapter) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/rce/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, testCode }),
      });
      const data: RCEExecuteResponse = await res.json();
      setResult(data);

      if (!data.success) {
        setFailedAttempts((prev) => prev + 1);
      }

      const subRes = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default-user',
          chapterId: currentChapter.slug,
          code,
          passed: data.success,
          testCount: data.passed + data.failed,
          failedCount: data.failed,
          compileError: data.compileError,
        }),
      });
      const subData = await subRes.json();
      if (subData.userProgress?.completedChapterIds) {
        setCompletedChapterIds(subData.userProgress.completedChapterIds);
      }

      // Auto-advance if submission passed
      if (data.success) {
        setTimeout(() => advanceToNextChapter(), 1500);
      }
    } catch (err: any) {
      setFailedAttempts((prev) => prev + 1);
      setResult({
        success: false,
        passed: 0,
        failed: 1,
        tests: [],
        compileError: err.message || 'Execution failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcut listeners (Cmd+Enter to run, Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, testCode, currentChapter]);

  const activeHint = getSocraticHint(currentChapter?.slug || 'default');
  const isPassed = currentChapter ? completedChapterIds.includes(currentChapter.slug) : false;
  const isUnlocked = isSolutionUnlocked({ passed: isPassed, failedAttempts });
  const streakDays = calculateStreak(submissionDates);

  const totalChapters = modules.flatMap((m) => m.chapters).length;
  const progressPercent = totalChapters > 0 ? Math.round((completedChapterIds.length / totalChapters) * 100) : 0;

  return (
    <div className="h-screen w-screen bg-[#090d16] text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Top Navigation Header */}
      <header className="h-14 border-b border-slate-800 bg-[#0d1117] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
            <Zap size={18} />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              Go Mastery Platform
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                Vercel Aesthetic • {progressPercent}% Progress
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {currentChapter ? `${currentChapter.title}` : 'Loading Track...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            <span>Streak: <strong className="text-white">{streakDays > 0 ? streakDays : 1} Day</strong></span>
          </div>

          {currentChapter?.type !== 'reading' && (
            <button
              onClick={handleRun}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 text-white font-medium text-xs px-4 py-2 rounded-md shadow-md shadow-violet-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play size={14} fill="currentColor" />
              {isLoading ? 'Executing...' : 'Run & Verify (Cmd+Enter)'}
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <SidebarNav
          modules={modules}
          currentChapter={currentChapter}
          completedChapterIds={completedChapterIds}
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
                      onClick={() => setActiveTab('code')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        activeTab === 'code'
                          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Code2 size={13} /> main.go
                    </button>
                    <button
                      onClick={() => setActiveTab('test')}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        activeTab === 'test'
                          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Code2 size={13} /> main_test.go
                    </button>
                    <button
                      onClick={() => isUnlocked && setActiveTab('solution')}
                      disabled={!isUnlocked}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        activeTab === 'solution'
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
                    {activeTab === 'code' ? 'Solution Code' : activeTab === 'test' ? 'Unit Tests' : 'Reference Solution'}
                  </span>
                </div>

                <div className="flex-1">
                  {activeTab === 'code' ? (
                    <CodeEditor value={code} onChange={(v) => setCode(v || '')} />
                  ) : activeTab === 'test' ? (
                    <CodeEditor value={testCode} onChange={(v) => setTestCode(v || '')} />
                  ) : (
                    <CodeEditor value={activeHint.solutionCode || '// Solution Unlocked'} onChange={() => {}} />
                  )}
                </div>
              </div>

              <div className="h-48">
                <TerminalOutput result={result} isLoading={isLoading} />
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
        failedAttempts={failedAttempts}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        modules={modules}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  );
}
