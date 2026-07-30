'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Terminal } from 'lucide-react';
import { RCEExecuteResponse } from '@/app/api/rce/execute/route';

interface TerminalOutputProps {
  result: RCEExecuteResponse | null;
  isLoading: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({ result, isLoading }) => {
  return (
    <div className="h-full w-full bg-[#0d1117] text-slate-200 border border-slate-800 rounded-lg p-4 font-mono text-sm overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-sans text-slate-400">
        <div className="flex items-center gap-2 font-medium text-slate-300">
          <Terminal size={16} className="text-violet-400" />
          <span>RCE Execution Logs & Test Results</span>
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
          Compiling & running `go test -json` in temporary workspace...
        </div>
      ) : !result ? (
        <div className="flex items-center justify-center h-full text-slate-500 font-sans text-xs italic">
          Click &quot;Run &amp; Verify Code&quot; to execute tests against host RCE engine.
        </div>
      ) : (
        <div className="space-y-4">
          {result.compileError && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-md p-3 text-rose-300 font-mono text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
                <AlertTriangle size={15} /> Build / Compilation Error
              </div>
              <pre className="whitespace-pre-wrap overflow-x-auto">{result.compileError}</pre>
            </div>
          )}

          {result.tests.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-sans font-semibold">
                Test Breakdown
              </div>
              {result.tests.map((test, i) => (
                <div
                  key={i}
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

          {result.rawOutput && (
            <details className="mt-4 pt-3 border-t border-slate-800/60">
              <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-200 font-sans select-none">
                View Raw JSON Stream Logs
              </summary>
              <pre className="mt-2 p-3 bg-black/60 rounded text-[10px] text-slate-400 overflow-x-auto max-h-48 whitespace-pre-wrap">
                {result.rawOutput}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
