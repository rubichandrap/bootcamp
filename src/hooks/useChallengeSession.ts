import { useState, useCallback } from 'react';
import { SubmissionExecutionResult as RCEExecuteResponse } from '@/lib/rce/rceEngine';
import {
  runChallenge as runChallengeService,
  RunChallengePorts,
} from '@/lib/challenges/challengeService';

export const DEFAULT_STARTER_CODE = `package main

// Add returns the sum of two integers.
func Add(a, b int) int {
	return a + b
}

// Factorial computes the factorial of n using recursion.
func Factorial(n int) int {
	if n <= 1 {
		return 1
	}
	return n * Factorial(n-1)
}
`;

export const DEFAULT_TEST_CODE = `package main

import "testing"

func TestAdd(t *testing.T) {
	if Add(2, 3) != 5 {
		t.Errorf("Add(2, 3) = %d; want 5", Add(2, 3))
	}
}

func TestFactorial(t *testing.T) {
	if Factorial(5) != 120 {
		t.Errorf("Factorial(5) = %d; want 120", Factorial(5))
	}
}
`;

export function useChallengeSession() {
  const [code, setCode] = useState(DEFAULT_STARTER_CODE);
  const [testCode, setTestCode] = useState(DEFAULT_TEST_CODE);
  const [activeTab, setActiveTab] = useState<'code' | 'test' | 'solution'>('code');
  const [result, setResult] = useState<RCEExecuteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enableRaceCheck, setEnableRaceCheck] = useState(false);
  const [codeByChapter, setCodeByChapter] = useState<Record<string, string>>({});
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const updateCode = useCallback((newCode: string, chapterId?: string) => {
    setCode(newCode);
    const chId = chapterId || activeChapterId;
    if (chId) {
      setCodeByChapter((prev) => ({ ...prev, [chId]: newCode }));
    }
  }, [activeChapterId]);

  const updateTestCode = useCallback((newTestCode: string) => {
    setTestCode(newTestCode);
  }, []);

  const selectTab = useCallback((tab: 'code' | 'test' | 'solution') => {
    setActiveTab(tab);
  }, []);

  const toggleRaceCheck = useCallback(() => {
    setEnableRaceCheck((prev) => !prev);
  }, []);

  const resetForChapter = useCallback(
    (starterCode?: string, testCodeInput?: string, savedSubmissionCode?: string, chapterId?: string) => {
      setResult(null);
      setActiveTab('code');
      if (chapterId) {
        setActiveChapterId(chapterId);
      }
      let initialCode = starterCode ?? DEFAULT_STARTER_CODE;
      if (chapterId && codeByChapter[chapterId] !== undefined) {
        initialCode = codeByChapter[chapterId];
      } else if (savedSubmissionCode) {
        initialCode = savedSubmissionCode;
        if (chapterId) {
          setCodeByChapter((prev) => ({ ...prev, [chapterId]: savedSubmissionCode }));
        }
      }
      setCode(initialCode);
      setTestCode(testCodeInput ?? DEFAULT_TEST_CODE);
    },
    [codeByChapter]
  );

  const runChallengeSession = useCallback(
    async (chapterId: string, ports?: Partial<RunChallengePorts>) => {
      setIsLoading(true);
      try {
        const res = await runChallengeService(
          {
            chapterId,
            code,
            testCode,
            enableRaceCheck,
          },
          ports
        );

        setResult(res.result);
      } finally {
        setIsLoading(false);
      }
    },
    [code, testCode, enableRaceCheck]
  );

  return {
    code,
    testCode,
    activeTab,
    result,
    isLoading,
    enableRaceCheck,
    updateCode,
    updateTestCode,
    selectTab,
    toggleRaceCheck,
    resetForChapter,
    runChallengeSession,
  };
}
