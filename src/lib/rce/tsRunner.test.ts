import { describe, it, expect } from 'vitest';
import { parseVitestJsonOutput, TypeScriptRunner } from './tsRunner';
import { getLanguageRunner } from './rceEngine';

describe('TypeScriptRunner & vitest json parser', () => {
  it('selects TypeScriptRunner for trackId typescript or ts', () => {
    const runner = getLanguageRunner('typescript');
    expect(runner).toBeInstanceOf(TypeScriptRunner);

    const tsShortRunner = getLanguageRunner('ts');
    expect(tsShortRunner).toBeInstanceOf(TypeScriptRunner);
  });

  it('parses successful vitest json output', () => {
    const mockStdout = JSON.stringify({
      testResults: [
        {
          assertionResults: [
            { title: 'returns greeting', status: 'passed', duration: 5, failureMessages: [] },
            { title: 'handles empty name', status: 'passed', duration: 2, failureMessages: [] },
          ],
        },
      ],
    });

    const result = parseVitestJsonOutput(mockStdout, '');

    expect(result.success).toBe(true);
    expect(result.passed).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.tests[0].name).toBe('returns greeting');
    expect(result.tests[0].passed).toBe(true);
  });

  it('parses failed vitest assertion output', () => {
    const mockStdout = JSON.stringify({
      testResults: [
        {
          assertionResults: [
            { title: 'returns greeting', status: 'failed', duration: 4, failureMessages: ['expected Hello to be Hi'] },
          ],
        },
      ],
    });

    const result = parseVitestJsonOutput(mockStdout, '');

    expect(result.success).toBe(false);
    expect(result.passed).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.tests[0].passed).toBe(false);
    expect(result.tests[0].output).toContain('expected Hello to be Hi');
  });

  it('detects syntax error or compile failure from stderr', () => {
    const stderr = 'SyntaxError: Unexpected token (1:5)';
    const result = parseVitestJsonOutput('', stderr);

    expect(result.success).toBe(false);
    expect(result.compileError).toBe(stderr);
  });
});
