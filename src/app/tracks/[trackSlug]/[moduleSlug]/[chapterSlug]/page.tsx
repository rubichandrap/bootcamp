import React from 'react';
import { getChapterDetails } from '@/lib/tracks/trackCatalog';
import { getTrackConfig } from '@/lib/tracks/trackConfig';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Code2, CheckCircle2 } from 'lucide-react';
import { MdxRenderer } from '@/components/MdxRenderer';

interface ChapterPageProps {
  params: Promise<{
    trackSlug: string;
    moduleSlug: string;
    chapterSlug: string;
  }>;
}

export async function generateMetadata({ params }: ChapterPageProps) {
  const { trackSlug, moduleSlug, chapterSlug } = await params;
  const chapter = getChapterDetails(trackSlug, moduleSlug, chapterSlug);
  if (!chapter) return { title: 'Chapter Not Found' };
  return {
    title: `${chapter.title} | ${trackSlug.toUpperCase()} Track`,
  };
}

export default async function ChapterWorkspacePage({ params }: ChapterPageProps) {
  const { trackSlug, moduleSlug, chapterSlug } = await params;
  const chapter = getChapterDetails(trackSlug, moduleSlug, chapterSlug);

  if (!chapter) {
    notFound();
  }

  const trackCfg = getTrackConfig(trackSlug)!;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Back */}
        <Link
          href={`/tracks/${trackSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to {trackSlug.toUpperCase()} Dashboard</span>
        </Link>

        {/* Chapter Header */}
        <div className="space-y-2 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold uppercase">
              {trackSlug} • {moduleSlug}
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono uppercase">
              {chapter.type}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{chapter.title}</h1>
        </div>

        {/* MDX Reading Content */}
        <div className="prose prose-invert max-w-none">
          <MdxRenderer content={chapter.content} />
        </div>

        {/* Starter & Test Code info if challenge */}
        {chapter.type === 'challenge' && (
          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold">
              <Code2 size={16} />
              <span>INTERACTIVE RCE CHALLENGE CODE</span>
            </div>

            {chapter.starterCode && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-zinc-400">Solution Starter Code (`${trackCfg.solutionFile}`):</span>
                <pre className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-200 overflow-x-auto">
                  <code>{chapter.starterCode}</code>
                </pre>
              </div>
            )}

            {chapter.testCode && (
              <div className="space-y-2">
                <span className="text-xs font-mono text-zinc-400">Test Verification Suite:</span>
                <pre className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-200 overflow-x-auto">
                  <code>{chapter.testCode}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
