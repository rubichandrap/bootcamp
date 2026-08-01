import { useEffect, useCallback, useMemo } from 'react';
import { useChapterLifecycle } from '@/hooks/useChapterLifecycle';
import { useChallengeSession } from '@/hooks/useChallengeSession';
import { useProgressTracker } from '@/hooks/useProgressTracker';
import { useReadingSession } from '@/hooks/useReadingSession';
import {
  DEFAULT_USER_ID,
  calculateProgressPercent,
  RecordSubmissionInput,
  RecordSubmissionResult,
} from '@/lib/progress/progressTracker';
import { resolveInitialChapter } from '@/lib/chapters/chapterService';
import { getSocraticHint, isSolutionUnlocked } from '@/lib/hints/socraticHints';
import { setStoredTrack } from '@/hooks/useTrack';
import { TrackSlug } from '@/lib/tracks/trackConfig';

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
export function useWorkspaceSession(trackSlug: TrackSlug) {
  const chapterLifecycle = useChapterLifecycle();
  const challengeSession = useChallengeSession();
  const progressTracker = useProgressTracker();
  const readingSession = useReadingSession();

  // ── Shared port factory ───────────────────────────────────────────────────
  // Eliminates the duplicated recordSubmission callback in run and markAsRead.
  const makeRecordSubmission = useCallback(
    (params: RecordSubmissionInput): Promise<RecordSubmissionResult | undefined> =>
      progressTracker.recordSubmission({ ...params, trackId: trackSlug }),
    // progressTracker.recordSubmission is a stable memoized callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressTracker.recordSubmission, trackSlug]
  );

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
  // currentChapter is deliberately excluded from deps: resolveInitialChapter
  // reads it as a snapshot, not a trigger — auto-select should only re-run when
  // the module list or track changes, not on every chapter navigation.
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
  }, [chapterLifecycle.modules, trackSlug]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapterLifecycle.selectChapter, trackSlug]
  );

  const run = useCallback(() => {
    const ch = chapterLifecycle.currentChapter;
    if (!ch) return;
    challengeSession.runChallengeSession(
      ch.slug,
      {
        recordSubmission: makeRecordSubmission,
        onAdvance: chapterLifecycle.advanceToNextChapter,
        incrementFailedAttempts: progressTracker.incrementFailedAttempts,
      },
      trackSlug
    );
  }, [
    chapterLifecycle.currentChapter,
    chapterLifecycle.advanceToNextChapter,
    challengeSession.runChallengeSession,
    makeRecordSubmission,
    progressTracker.incrementFailedAttempts,
    trackSlug,
  ]);

  const markAsRead = useCallback(() => {
    const ch = chapterLifecycle.currentChapter;
    if (!ch) return;
    readingSession.markAsRead(
      ch.slug,
      {
        recordSubmission: makeRecordSubmission,
        onAdvance: chapterLifecycle.advanceToNextChapter,
      },
      trackSlug
    );
  }, [
    chapterLifecycle.currentChapter,
    chapterLifecycle.advanceToNextChapter,
    readingSession.markAsRead,
    makeRecordSubmission,
    trackSlug,
  ]);

  // ── Derived domain values ─────────────────────────────────────────────────
  // Computed here rather than in the layout shell — these are domain queries,
  // not layout concerns.

  const allChapterIds = useMemo(
    () => chapterLifecycle.modules.flatMap((m) => m.chapters.map((c) => c.slug)),
    [chapterLifecycle.modules]
  );

  const isPassed = currentChapter
    ? progressTracker.completedChapterIds.includes(currentChapter.slug)
    : false;

  const isUnlocked = isSolutionUnlocked({
    passed: isPassed,
    failedAttempts: progressTracker.failedAttempts,
  });

  const activeModuleTitle = currentChapter
    ? chapterLifecycle.modules.find((m) => m.slug === currentChapter.moduleSlug)?.title
    : undefined;

  const activeHint = getSocraticHint(currentChapter?.slug || 'default');

  const progressPercent = calculateProgressPercent(
    progressTracker.completedChapterIds,
    allChapterIds
  );

  // ── Interface ─────────────────────────────────────────────────────────────

  return {
    // Chapter navigation
    modules: chapterLifecycle.modules,
    currentChapter,
    // Progress display
    completedChapterIds: progressTracker.completedChapterIds,
    streakDays: progressTracker.streakDays,
    failedAttempts: progressTracker.failedAttempts,
    progressPercent,
    // Challenge editor state
    code: challengeSession.code,
    testCode: challengeSession.testCode,
    activeTab: challengeSession.activeTab,
    result: challengeSession.result,
    isLoading: challengeSession.isLoading,
    enableRaceCheck: challengeSession.enableRaceCheck,
    // Derived domain values (domain queries, not layout)
    isPassed,
    isUnlocked,
    activeModuleTitle,
    activeHint,
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
