'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  theme?: string;
  filename?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'go',
  theme = 'vs-dark',
  filename = 'main.go',
}) => {
  return (
    <div className="h-full w-full border border-zinc-300 dark:border-zinc-800 rounded overflow-hidden bg-zinc-900 dark:bg-[#1e1e1e] flex flex-col font-mono">
      <div className="bg-zinc-200 dark:bg-zinc-900 px-3 py-1 text-[10px] font-mono border-b border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 uppercase flex items-center justify-between select-none shrink-0">
        <span>┌─ [EDITOR] {filename} ──</span>
        <span>[GO 1.22]</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          theme={theme}
          value={value}
          onChange={onChange}
          options={{
            fontSize: 13,
            fontFamily: 'var(--font-geist-mono), JetBrains Mono, Fira Code, monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            tabSize: 4,
            insertSpaces: true,
          }}
        />
      </div>
    </div>
  );
};
