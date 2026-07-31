import { useState, useCallback } from 'react';
import {
  fetchProgress,
  recordSubmission as recordSubmissionService,
  fetchFailedAttemptsForChapter,
  incrementFailedAttempts as incrementFailedAttemptsHelper,
  RecordSubmissionParams,
  RecordSubmissionResult,
} from '@/lib/progress/progressService';

export function useProgressTracker() {
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);

  const loadProgress = useCallback(async (userId = 'default-user') => {
    try {
      const data = await fetchProgress(userId);
      setCompletedChapterIds(data.completedChapterIds);
      setStreakDays(data.streakDays);
    } catch (err) {
      console.error('Failed to load progress', err);
    }
  }, []);

  const loadFailedAttempts = useCallback(async (chapterSlug: string, userId = 'default-user') => {
    try {
      const count = await fetchFailedAttemptsForChapter(chapterSlug, userId);
      setFailedAttempts(count);
    } catch (err) {
      console.error('Failed to fetch failed attempts', err);
      setFailedAttempts(0);
    }
  }, []);

  const recordSubmission = useCallback(
    async (params: RecordSubmissionParams): Promise<RecordSubmissionResult> => {
      const res = await recordSubmissionService(params);
      if (res.completedChapterIds) {
        setCompletedChapterIds(res.completedChapterIds);
      }
      if (typeof res.streakDays === 'number') {
        setStreakDays(res.streakDays);
      }
      if (typeof res.chapterFailedAttempts === 'number') {
        setFailedAttempts(res.chapterFailedAttempts);
      }
      return res;
    },
    []
  );

  const incrementFailedAttempts = useCallback(() => {
    setFailedAttempts((prev) => incrementFailedAttemptsHelper(prev));
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
  };
}
