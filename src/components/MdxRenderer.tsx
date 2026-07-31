'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function formatReadingHeader(title: string): string {
  return `┌─ [READING CHAPTER] ${title} ─────────────────────┐`;
}

export function formatShortcutBadge(label: string, shortcut: string): string {
  return `[${label}: ${shortcut}]`;
}

interface MdxRendererProps {
  content: string;
}

export const MdxRenderer: React.FC<MdxRendererProps> = ({ content }) => {
  return (
    <article className="max-w-none text-xs text-zinc-800 dark:text-zinc-200 space-y-4 font-mono leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <div className="mb-4 pb-2 border-b border-zinc-300 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-500 font-normal text-xs block mb-1">
                READING CHAPTER -- Go Mastery Track
              </span>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>$</span>
                <span>{children}</span>
                <span className="animate-pulse">█</span>
              </h1>
            </div>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-2 flex items-center gap-1.5">
              <span className="text-zinc-500">&gt;&gt;</span>
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-4 mb-1 flex items-center gap-1">
              <span className="text-zinc-400">#</span>
              <span>{children}</span>
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed my-2 text-xs">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-1.5 my-2 pl-2 text-zinc-700 dark:text-zinc-300 text-xs">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2">
              <span className="text-zinc-400 select-none">-&gt;</span>
              <div className="flex-1">{children}</div>
            </li>
          ),
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            if (isInline) {
              return (
                <code
                  className="bg-zinc-200 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 font-mono text-[11px]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-4 border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-[#0c0c0e] rounded">
                <div className="bg-zinc-200 dark:bg-zinc-900 px-3 py-1 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono border-b border-zinc-300 dark:border-zinc-800 uppercase flex items-center justify-between">
                  <span>┌─ {match ? match[1] : 'code'} ──</span>
                  <span>[UTF-8]</span>
                </div>
                <pre className="p-3 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto whitespace-pre">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};
