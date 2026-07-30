'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Terminal, Cpu, MemoryStick, Zap, AlertCircle, Flame } from 'lucide-react';
import { RCEExecuteResponse } from '@/app/api/rce/execute/route';

interface TerminalOutputProps {
  result: RCEExecuteResponse | null;
  isLoading: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ result, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'perf' | 'escape'>('tests');

  return (
    <div className="h-full w-full bg-[#0d1117] text-slate-200 border border-slate-800 rounded-lg p-4 font-mono text-sm overflow-y-auto flex flex-col">
      {/* Terminal Header & Navigation */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-sans">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Terminal size={15} className="text-violet-400" />
            <span>Console</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-md text-[11px]">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                activeTab === 'tests' ? 'bg-violet-600/30 text-violet-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Test Results
            </button>
            <button
              onClick={() => setActiveTab('perf')}
              className={`px-2.5 py-0.5 rounded transition-colors flex items-center gap-1 ${
                activeTab === 'perf' ? 'bg-violet-600/30 text-violet-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu size={12} /> Performance &amp; Allocations
            </button>
            <button
              onClick={() => setActiveTab('escape')}
              className={`px-2.5 py-0.5 rounded transition-colors flex items-center gap-1 ${
                activeTab === 'escape' ? 'bg-violet-600/30 text-violet-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MemoryStick size={12} /> Escape Analysis
            </button>
          </div>
        </div>

        {result && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 size={14} /> {result.passed} Passed
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <XCircle size={14} /> {result.failed} Failed
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full text-slate-400 gap-2 font-sans text-sm animate-pulse">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          Compiling, benchmarking &amp; executing `go test -benchmem`...
        </div>
      ) : !result ? (
        <div className="flex items-center justify-center h-full text-slate-500 font-sans text-xs italic">
          Click &quot;Run &amp; Verify Code&quot; to execute tests against host RCE engine.
        </div>
      ) : (
        <div className="space-y-4">
          {result.hasRaceDetected && (
            <div className="bg-rose-950/60 border border-rose-600/80 rounded-md p-3 text-rose-200 font-mono text-xs shadow-lg animate-pulse">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
                <Flame size={18} className="text-rose-500" /> WARNING: DATA RACE DETECTED (-race)
              </div>
              <p className="text-[11px] text-rose-300/90 font-sans">
                Goroutines accessed shared memory concurrently without synchronization! Use mutexes or channels to prevent data races.
              </p>
            </div>
          )}

          {result.compileError && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-md p-3 text-rose-300 font-mono text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
                <AlertTriangle size={15} /> Build / Compilation Error
              </div>
              <pre className="whitespace-pre-wrap overflow-x-auto">{result.compileError}</pre>
            </div>
          )}

          {activeTab === 'tests' && result.tests.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-sans font-semibold">
                Test Breakdown
              </div>
              {result.tests.map((test) => (
                <div
                  key={test.name}
                  className={`p-3 rounded-md border text-xs font-mono transition-colors ${
                    test.passed
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="flex items-center gap-2">
                      {test.passed ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <XCircle size={14} className="text-rose-400" />
                      )}
                      {test.name}
                    </span>
                    <span className="text-[11px] opacity-70">
                      {test.duration ? `${(test.duration * 1000).toFixed(1)}ms` : '0ms'}
                    </span>
                  </div>
                  {test.output && (
                    <pre className="mt-2 p-2 bg-black/40 rounded text-[11px] opacity-90 overflow-x-auto whitespace-pre-wrap">
                      {test.output}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Performance & Allocations Tab */}
          {activeTab === 'perf' && (
            <div className="space-y-3 font-sans">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Memory &amp; Benchmark Metrics (`go test -benchmem`)
              </div>

              {result.bench?.hasBench ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase">Bytes / Op</span>
                      <span className="text-lg font-bold text-violet-300 font-mono">
                        {result.bench.bytesPerOp} <span className="text-xs font-normal text-slate-400">B/op</span>
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase">Allocs / Op</span>
                      <span className="text-lg font-bold text-cyan-300 font-mono">
                        {result.bench.allocsPerOp} <span className="text-xs font-normal text-slate-400">allocs</span>
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase">Speed / Op</span>
                      <span className="text-lg font-bold text-emerald-300 font-mono">
                        {result.bench.nsPerOp} <span className="text-xs font-normal text-slate-400">ns/op</span>
                      </span>
                    </div>
                  </div>

                  {/* Allocation Warning Alert */}
                  {result.bench.allocsPerOp > 0 ? (
                    <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-amber-300 text-xs flex items-center gap-2">
                      <AlertCircle size={15} className="text-amber-400 shrink-0" />
                      <span>
                        <strong>Memory Allocation Alert:</strong> Code triggers {result.bench.allocsPerOp} heap allocation(s) ({result.bench.bytesPerOp} bytes/op). Check Escape Analysis tab for heap escape details.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>
                        <strong>Zero Heap Allocations:</strong> Code operates entirely on the stack with 0 allocs/op!
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xs flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  Add a `BenchmarkX(b *testing.B)` function to your test suite to view live allocations.
                </div>
              )}
            </div>
          )}

          {/* Escape Analysis Tab */}
          {activeTab === 'escape' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="text-xs font-semibold text-slate-400 font-sans uppercase tracking-wider mb-2">
                Compiler Escape Analysis &amp; Inlining (`-gcflags="-m"`)
              </div>

              {result.bench?.escapeLogs && result.bench.escapeLogs.length > 0 ? (
                <div className="p-3 bg-black/60 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] space-y-1 max-h-40 overflow-y-auto">
                  {result.bench.escapeLogs.map((log, index) => (
                    <div key={`${index}-${log.substring(0, 10)}`} className="text-violet-300/90">{log}</div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 italic text-xs font-sans">
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
