'use client';

import React, { useState, useEffect } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { TerminalOutput } from '@/components/TerminalOutput';
import { RCEExecuteResponse } from '@/app/api/rce/execute/route';
import { Play, Sparkles, BookOpen, Code2, Award, Zap } from 'lucide-react';

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
  const [code, setCode] = useState(DEFAULT_STARTER_CODE);
  const [testCode, setTestCode] = useState(DEFAULT_TEST_CODE);
  const [activeTab, setActiveTab] = useState<'code' | 'test'>('code');
  const [result, setResult] = useState<RCEExecuteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/rce/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, testCode }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, testCode]);

  return (
    <div className="h-screen w-screen bg-[#090d16] text-slate-100 flex flex-col overflow-hidden font-sans">
      {/* Top Header */}
      <header className="h-14 border-b border-slate-800 bg-[#0d1117] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
            <Zap size={18} />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              Go Mastery Platform
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
                Vercel Aesthetic • Host RCE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Module 1: Go Fundamentals & Memory Models</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md">
            <Award size={14} className="text-amber-400" />
            <span>Streak: <strong className="text-white">1 Day</strong></span>
          </div>

          <button
            onClick={handleRun}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 text-white font-medium text-xs px-4 py-2 rounded-md shadow-md shadow-violet-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play size={14} fill="currentColor" />
            {isLoading ? 'Executing...' : 'Run & Verify (Cmd+Enter)'}
          </button>
        </div>
      </header>

      {/* Main 3-Pane Split View */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Pane: Article Reading Material */}
        <div className="w-1/3 border border-slate-800 rounded-xl bg-[#0d1117]/80 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-2">
              <BookOpen size={14} /> Chapter 1.1: Go Memory Models & Pointers
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-4">Understanding Value vs. Reference Semantics</h2>

            <div className="prose prose-invert prose-sm text-slate-300 space-y-4 text-xs leading-relaxed">
              <p>
                Unlike languages with managed reference semantics, Go gives explicit control over memory allocation and value passing.
              </p>

              <div className="p-3 bg-violet-950/20 border border-violet-800/40 rounded-lg text-slate-200">
                <strong className="text-violet-300 font-semibold block mb-1">Key Principles:</strong>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                  <li>Everything in Go is passed by value (copies are made upon function invocation).</li>
                  <li>Pointers (`*T`) pass the memory address by value, allowing caller mutation.</li>
                  <li>Slice headers hold pointers to underlying array memory.</li>
                </ul>
              </div>

              <p>
                <strong>Your Challenge:</strong> Implement the recursive <code className="text-violet-300 bg-slate-900 px-1 py-0.5 rounded">Factorial</code> and <code className="text-violet-300 bg-slate-900 px-1 py-0.5 rounded">Add</code> functions in the Monaco Editor to pass all table-driven tests executed via host RCE!
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" /> Socratic Hint Available
            </span>
            <button className="text-violet-400 hover:text-violet-300 underline text-xs">
              View Conceptual Hint
            </button>
          </div>
        </div>

        {/* Right Workspace: Monaco Editor (Top) & Terminal Output (Bottom) */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Editor Header & Code/Test Tabs */}
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
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                {activeTab === 'code' ? 'Solution Code' : 'Unit Tests (Read-Only)'}
              </span>
            </div>

            <div className="flex-1">
              {activeTab === 'code' ? (
                <CodeEditor value={code} onChange={(v) => setCode(v || '')} />
              ) : (
                <CodeEditor value={testCode} onChange={(v) => setTestCode(v || '')} />
              )}
            </div>
          </div>

          {/* Bottom Terminal Output Pane */}
          <div className="h-48">
            <TerminalOutput result={result} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
