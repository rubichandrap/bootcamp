'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MdxRendererProps {
  content: string;
}

export const MdxRenderer: React.FC<MdxRendererProps> = ({ content }) => {
  return (
    <article className="prose prose-invert max-w-none text-xs text-slate-300 space-y-4 font-sans leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-slate-100 pb-2 border-b border-slate-800/80 mb-4 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-violet-300 mt-6 mb-2 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-slate-200 mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-slate-300 leading-relaxed my-2 text-xs">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 my-2 text-slate-300 text-xs">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 my-2 text-slate-300 text-xs">
              {children}
            </ol>
          ),
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            if (isInline) {
              return (
                <code
                  className="bg-slate-900 text-violet-300 px-1.5 py-0.5 rounded border border-slate-800/80 font-mono text-[11px]"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-[#0d1117]">
                <div className="bg-[#161b22] px-3 py-1 text-[10px] text-slate-400 font-mono border-b border-slate-800 uppercase">
                  {match ? match[1] : 'code'}
                </div>
                <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto whitespace-pre">
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
