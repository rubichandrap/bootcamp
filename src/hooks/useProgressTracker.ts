import { useState, useCallback } from 'react';
import {
  ProgressTrackerAdapter,
  defaultHttpProgressAdapter,
  calculateProgressPercent,
  RecordSubmissionInput,
  DEFAULT_USER_ID,
} from '@/lib/progress/progressTracker';

export function useProgressTracker(
  adapter: ProgressTrackerAdapter = defaultHttpProgressAdapter
) {
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);

  const loadProgress = useCallback(
    async (userId = DEFAULT_USER_ID) => {
      try {
        const data = await adapter.getProgress(userId);
        setCompletedChapterIds(data.completedChapterIds);
        setStreakDays(data.streakDays);
      } catch (err) {
        console.error('Failed to load progress', err);
      }
    },
    [adapter]
  );

  const loadFailedAttempts = useCallback(
    async (chapterId: string, userId = DEFAULT_USER_ID) => {
      try {
        const count = await adapter.getFailedAttempts(userId, chapterId);
        setFailedAttempts(count);
      } catch (err) {
        console.error('Failed to fetch failed attempts', err);
        // Retain local failedAttempts count on network error to allow unlock during outages
      }
    },
    [adapter]
  );

  const recordSubmission = useCallback(
    async (params: RecordSubmissionInput) => {
      const res = await adapter.recordSubmission(params);
      if (res.userProgress?.completedChapterIds) {
        setCompletedChapterIds(res.userProgress.completedChapterIds);
      }
      if (typeof res.userProgress?.streakDays === 'number') {
        setStreakDays(res.userProgress.streakDays);
      }
      if (typeof res.chapterFailedAttempts === 'number') {
        setFailedAttempts(res.chapterFailedAttempts);
      }
      return res;
    },
    [adapter]
  );

  const incrementFailedAttempts = useCallback(() => {
    setFailedAttempts((prev) => prev + 1);
  }, []);

  return {
    completedChapterIds,
    setCompletedChapterIds,
    streakDays,
    setStreakDays,
    failedAttempts,
    setFailedAttempts,
    loadProgress,
    loadFailedAttempts,
    recordSubmission,
    incrementFailedAttempts,
    calculateProgressPercent,
  };
}
