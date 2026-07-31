'use client';

import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  theme?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'go',
  theme = 'vs-dark',
}) => {
  return (
    <div className="h-full w-full border border-slate-800 rounded-lg overflow-hidden bg-[#1e1e1e]">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        theme={theme}
        value={value}
        onChange={onChange}
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          tabSize: 4,
          insertSpaces: true,
        }}
      />
    </div>
  );
};
