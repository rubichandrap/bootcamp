import { useEffect, useCallback } from 'react';
import { useChapterLifecycle } from '@/hooks/useChapterLifecycle';
import { useChallengeSession } from '@/hooks/useChallengeSession';
import { useProgressTracker } from '@/hooks/useProgressTracker';
import { useReadingSession } from '@/hooks/useReadingSession';
import { DEFAULT_USER_ID } from '@/lib/progress/progressTracker';
import { resolveInitialChapter } from '@/lib/chapters/chapterService';
import { setStoredTrack } from '@/hooks/useTrack';

/**
 * useWorkspaceSession — the Workspace Session for a given Track.
 *
 * Owns all coordination between Chapter lifecycle, Challenge execution, and
 * Progress tracking. Exposes an action-oriented interface: computed values and
 * named actions only. The wiring between sub-hooks is hidden behind this seam.
 *
 * Layout concerns (sidebar open state, mobile tabs, modals) are NOT owned here
 * — they remain in the calling component.
 */
export function useWorkspaceSession(trackSlug: string) {
  const chapterLifecycle = useChapterLifecycle();
  const challengeSession = useChallengeSession();
  const progressTracker = useProgressTracker();
  const readingSession = useReadingSession();

  // ── Effect 1: Track/Progress load ────────────────────────────────────────
  // Fires when trackSlug changes. Stores the active Track, loads Progress and
  // Modules in parallel.
  useEffect(() => {
    async function loadInitialData() {
      setStoredTrack(trackSlug);
      await progressTracker.loadProgress(DEFAULT_USER_ID, trackSlug);
      await chapterLifecycle.loadModules(trackSlug);
    }
    loadInitialData();
    // progressTracker.loadProgress and chapterLifecycle.loadModules are stable
    // memoized callbacks — only trackSlug drives re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackSlug]);

  // ── Effect 2: Auto-select initial Chapter ────────────────────────────────
  // Fires when Modules load or Track changes. Delegates the selection decision
  // to the pure resolveInitialChapter function from lib/chapters/chapterService.
  useEffect(() => {
    if (chapterLifecycle.modules.length === 0) return;
    const toSelect = resolveInitialChapter(
      chapterLifecycle.modules,
      chapterLifecycle.currentChapter,
      trackSlug
    );
    if (toSelect) {
      chapterLifecycle.selectChapter(toSelect.moduleSlug, toSelect.slug, trackSlug);
    }
    // chapterLifecycle.selectChapter is stable (empty useCallback deps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterLifecycle.modules, chapterLifecycle.currentChapter, trackSlug]);

  // ── Effect 3: Chapter-change reset ───────────────────────────────────────
  // Fires when the current Chapter slug changes. Resets the Challenge editor
  // synchronously, then asynchronously restores the latest Submission code and
  // loads failed attempt counts. The isSubscribed flag guards against stale
  // async updates when the user navigates away before the fetch resolves.
  const currentChapter = chapterLifecycle.currentChapter;
  useEffect(() => {
    if (!currentChapter) return;
    const ch = currentChapter;
    let isSubscribed = true;

    challengeSession.resetForChapter(ch.starterCode, ch.testCode, undefined, ch.slug);

    async function initChapter() {
      progressTracker.loadFailedAttempts(ch.slug, DEFAULT_USER_ID, trackSlug);
      if (ch.type !== 'reading') {
        const latestSub = await progressTracker.getLatestSubmission(
          ch.slug,
          DEFAULT_USER_ID,
          trackSlug
        );
        if (latestSub?.code && isSubscribed) {
          challengeSession.resetForChapter(
            ch.starterCode,
            ch.testCode,
            latestSub.code,
            ch.slug
          );
        }
      }
    }
    initChapter();

    return () => {
      isSubscribed = false;
    };
    // challengeSession.resetForChapter and progressTracker methods are stable
    // memoized callbacks — only chapter slug and trackSlug drive re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapter?.slug, trackSlug]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const selectChapter = useCallback(
    async (moduleSlug: string, chapterSlug: string) => {
      return chapterLifecycle.selectChapter(moduleSlug, chapterSlug, trackSlug);
    },
    // chapterLifecycle.selectChapter is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapterLifecycle.selectChapter, trackSlug]
  );

  const run = useCallback(() => {
    const ch = chapterLifecycle.currentChapter;
    if (!ch) return;
    challengeSession.runChallengeSession(
      ch.slug,
      {
        recordSubmission: (params) =>
          progressTracker.recordSubmission({ ...params, trackId: trackSlug }),
        onAdvance: chapterLifecycle.advanceToNextChapter,
        incrementFailedAttempts: progressTracker.incrementFailedAttempts,
      },
      trackSlug
    );
  }, [
    chapterLifecycle.currentChapter,
    chapterLifecycle.advanceToNextChapter,
    challengeSession.runChallengeSession,
    progressTracker.recordSubmission,
    progressTracker.incrementFailedAttempts,
    trackSlug,
  ]);

  const markAsRead = useCallback(() => {
    const ch = chapterLifecycle.currentChapter;
    if (!ch) return;
    readingSession.markAsRead(
      ch.slug,
      {
        recordSubmission: (params) =>
          progressTracker.recordSubmission({ ...params, trackId: trackSlug }),
        onAdvance: chapterLifecycle.advanceToNextChapter,
      },
      trackSlug
    );
  }, [
    chapterLifecycle.currentChapter,
    chapterLifecycle.advanceToNextChapter,
    readingSession.markAsRead,
    progressTracker.recordSubmission,
    trackSlug,
  ]);

  // ── Interface ─────────────────────────────────────────────────────────────

  return {
    // Chapter navigation
    modules: chapterLifecycle.modules,
    currentChapter: chapterLifecycle.currentChapter,
    // Progress display
    completedChapterIds: progressTracker.completedChapterIds,
    streakDays: progressTracker.streakDays,
    failedAttempts: progressTracker.failedAttempts,
    // Challenge editor state
    code: challengeSession.code,
    testCode: challengeSession.testCode,
    activeTab: challengeSession.activeTab,
    result: challengeSession.result,
    isLoading: challengeSession.isLoading,
    enableRaceCheck: challengeSession.enableRaceCheck,
    // Actions
    selectChapter,
    run,
    markAsRead,
    updateCode: challengeSession.updateCode,
    updateTestCode: challengeSession.updateTestCode,
    selectTab: challengeSession.selectTab,
    toggleRaceCheck: challengeSession.toggleRaceCheck,
  };
}
