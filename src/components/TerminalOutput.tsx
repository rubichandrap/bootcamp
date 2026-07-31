'use client';

import React, { useState } from 'react';
import { Terminal, Cpu, MemoryStick, AlertTriangle, Flame, CheckCircle2, XCircle } from 'lucide-react';
import { RCEExecuteResponse } from '@/app/api/rce/execute/route';

interface TerminalOutputProps {
  result: RCEExecuteResponse | null;
  isLoading: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ result, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'perf' | 'escape'>('tests');

  return (
    <div className="h-full w-full bg-zinc-950 dark:bg-[#09090b] text-zinc-200 border border-zinc-300 dark:border-zinc-800 rounded p-3 font-mono text-xs overflow-y-auto flex flex-col select-text">
      {/* Console Titlebar / Tabs */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-300 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
            <Terminal size={14} className="text-zinc-500" />
            <span>RCE CONSOLE STREAM</span>
          </div>

          {/* CLI Tab Switcher */}
          <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-0.5 rounded text-[11px]">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                activeTab === 'tests'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-zinc-100 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              [TESTS]
            </button>
            <button
              onClick={() => setActiveTab('perf')}
              className={`px-2 py-0.5 rounded font-mono transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'perf'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-zinc-100 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Cpu size={12} />
              <span>[PERF]</span>
            </button>
            <button
              onClick={() => setActiveTab('escape')}
              className={`px-2 py-0.5 rounded font-mono transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'escape'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-zinc-100 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <MemoryStick size={12} />
              <span>[ESCAPE]</span>
            </button>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="text-emerald-500 dark:text-emerald-400">
              [PASS: {result.passed}]
            </span>
            <span className="text-red-500 dark:text-red-400">
              [FAIL: {result.failed}]
            </span>
          </div>
        )}
      </div>

      {/* Console Output Body */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 text-zinc-400 gap-2 text-xs font-mono">
          <span className="animate-spin text-zinc-300">/</span>
          <span>$ go test -v -benchmem ./... (executing...)</span>
        </div>
      ) : !result ? (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 text-xs font-mono space-y-1">
          <div>$ go test -v ./...</div>
          <div className="text-[11px] text-zinc-600 dark:text-zinc-600">
            [Press ⌘↵ or click RUN to execute code against RCE sandbox]
          </div>
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs flex-1 overflow-y-auto">
          {/* Race Warning Banner */}
          {result.hasRaceDetected && (
            <div className="border border-red-500/80 bg-red-500/10 rounded p-2.5 text-red-400">
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                <Flame size={14} className="text-red-500" />
                <span>WARNING: DATA RACE DETECTED (-race flag)</span>
              </div>
              <p className="text-[11px] text-red-300">
                Goroutines accessed shared memory concurrently without synchronization!
              </p>
            </div>
          )}

          {/* Compilation Error Banner */}
          {result.compileError && (
            <div className="border border-red-500/80 bg-red-500/10 rounded p-2.5 text-red-300">
              <div className="flex items-center gap-2 font-bold text-xs mb-1 text-red-400">
                <AlertTriangle size={14} />
                <span>BUILD / COMPILE ERROR</span>
              </div>
              <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] font-mono text-red-200">
                {result.compileError}
              </pre>
            </div>
          )}

          {/* Test Breakdown Tab */}
          {activeTab === 'tests' && result.tests.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wide">
                $ go test -v
              </div>
              {result.tests.map((test) => (
                <div
                  key={test.name}
                  className={`p-2.5 rounded border text-xs font-mono ${
                    test.passed
                      ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                      : 'border-red-500/40 bg-red-500/5 text-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2">
                      {test.passed ? (
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle size={13} className="text-red-400 shrink-0" />
                      )}
                      <span>=== RUN   {test.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-normal">
                      {test.duration ? `${(test.duration * 1000).toFixed(1)}ms` : '0ms'}
                    </span>
                  </div>
                  {test.output && (
                    <pre className="mt-1.5 p-2 bg-zinc-900/90 rounded text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                      {test.output}
                    </pre>
                  )}
                  <div className="mt-1 text-[10px] font-semibold text-zinc-500">
                    --- {test.passed ? 'PASS' : 'FAIL'}: {test.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Performance & Allocations Tab */}
          {activeTab === 'perf' && (
            <div className="space-y-2.5 font-mono">
              <div className="text-[11px] text-zinc-500 font-bold uppercase">
                $ go test -benchmem
              </div>

              {result.bench?.hasBench ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 border border-zinc-300 dark:border-zinc-800 rounded bg-zinc-100 dark:bg-zinc-900/60">
                      <div className="text-[10px] text-zinc-500">Bytes / Op</div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {result.bench.bytesPerOp} B/op
                      </div>
                    </div>
                    <div className="p-2 border border-zinc-300 dark:border-zinc-800 rounded bg-zinc-100 dark:bg-zinc-900/60">
                      <div className="text-[10px] text-zinc-500">Allocs / Op</div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {result.bench.allocsPerOp} allocs
                      </div>
                    </div>
                    <div className="p-2 border border-zinc-300 dark:border-zinc-800 rounded bg-zinc-100 dark:bg-zinc-900/60">
                      <div className="text-[10px] text-zinc-500">Speed / Op</div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {result.bench.nsPerOp} ns/op
                      </div>
                    </div>
                  </div>

                  {result.bench.allocsPerOp > 0 ? (
                    <div className="p-2 border border-amber-500/50 bg-amber-500/10 rounded text-amber-500 text-xs">
                      [ALLOCATION WARNING] {result.bench.allocsPerOp} heap allocation(s) ({result.bench.bytesPerOp} B/op).
                    </div>
                  ) : (
                    <div className="p-2 border border-emerald-500/50 bg-emerald-500/10 rounded text-emerald-500 text-xs">
                      [ZERO ALLOCATIONS] 0 allocs/op achieved!
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2 border border-zinc-300 dark:border-zinc-800 rounded text-zinc-500 text-xs">
                  No benchmarks detected. Add `BenchmarkX(b *testing.B)` to view allocations.
                </div>
              )}
            </div>
          )}

          {/* Escape Analysis Tab */}
          {activeTab === 'escape' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="text-[11px] text-zinc-500 font-bold uppercase">
                $ go build -gcflags=&quot;-m&quot;
              </div>
              {result.bench?.escapeLogs && result.bench.escapeLogs.length > 0 ? (
                <div className="p-2 border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 rounded text-[11px] text-zinc-700 dark:text-zinc-300 space-y-1">
                  {result.bench.escapeLogs.map((log, index) => (
                    <div key={`${index}-${log.substring(0, 10)}`}>{log}</div>
                  ))}
                </div>
              ) : (
                <div className="text-zinc-500 italic text-xs">
                  No heap escape logs detected. All stack variables remained in stack frames.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
