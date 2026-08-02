import { describe, it, expect } from 'vitest';
import { parseGoTestStream, executeSubmission, getLanguageExecutor } from './rceEngine';

describe('rceEngine', () => {
  describe('parseGoTestStream', () => {
    it('parses successful go test -json output with multiple tests', () => {
      const stdout = [
        JSON.stringify({ Action: 'run', Test: 'TestAdd' }),
        JSON.stringify({ Action: 'output', Test: 'TestAdd', Output: '=== RUN   TestAdd\n' }),
        JSON.stringify({ Action: 'output', Test: 'TestAdd', Output: '--- PASS: TestAdd (0.00s)\n' }),
        JSON.stringify({ Action: 'pass', Test: 'TestAdd', Elapsed: 0.001 }),
        JSON.stringify({ Action: 'run', Test: 'TestFactorial' }),
        JSON.stringify({ Action: 'output', Test: 'TestFactorial', Output: '=== RUN   TestFactorial\n' }),
        JSON.stringify({ Action: 'output', Test: 'TestFactorial', Output: '--- PASS: TestFactorial (0.00s)\n' }),
        JSON.stringify({ Action: 'pass', Test: 'TestFactorial', Elapsed: 0.002 }),
        JSON.stringify({ Action: 'pass', Elapsed: 0.005 }),
      ].join('\n');

      const result = parseGoTestStream(stdout, '');

      expect(result.success).toBe(true);
      expect(result.passed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.tests).toHaveLength(2);
      expect(result.tests[0]).toEqual({
        name: 'TestAdd',
        passed: true,
        duration: 0.001,
        output: '=== RUN   TestAdd\n--- PASS: TestAdd (0.00s)\n',
      });
      expect(result.tests[1]).toEqual({
        name: 'TestFactorial',
        passed: true,
        duration: 0.002,
        output: '=== RUN   TestFactorial\n--- PASS: TestFactorial (0.00s)\n',
      });
      expect(result.compileError).toBeUndefined();
      expect(result.hasRaceDetected).toBe(false);
    });

    it('parses failed test execution output', () => {
      const stdout = [
        JSON.stringify({ Action: 'run', Test: 'TestAdd' }),
        JSON.stringify({ Action: 'output', Test: 'TestAdd', Output: '=== RUN   TestAdd\n' }),
        JSON.stringify({ Action: 'output', Test: 'TestAdd', Output: '    main_test.go:7: Add(2, 3) = 6; want 5\n' }),
        JSON.stringify({ Action: 'fail', Test: 'TestAdd', Elapsed: 0.001 }),
      ].join('\n');

      const result = parseGoTestStream(stdout, '');

      expect(result.success).toBe(false);
      expect(result.passed).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.tests[0].passed).toBe(false);
    });

    it('detects compilation errors from stderr or stdout', () => {
      const stderr = 'main.go:5:2: syntax error: unexpected token';
      const result = parseGoTestStream('', stderr);

      expect(result.success).toBe(false);
      expect(result.compileError).toBe(stderr);
    });

    it('detects data race warnings when enableRaceCheck is true', () => {
      const stdout = JSON.stringify({ Action: 'run', Test: 'TestRace' }) + '\n' +
        JSON.stringify({ Action: 'fail', Test: 'TestRace', Elapsed: 0.01 });
      const stderr = '==================\nWARNING: DATA RACE\nRead at 0x000000...\n==================\n';

      const result = parseGoTestStream(stdout, stderr, true);

      expect(result.hasRaceDetected).toBe(true);
    });

    it('parses benchmark output metrics via benchParser', () => {
      const stdout = [
        JSON.stringify({ Action: 'output', Output: 'BenchmarkAdd-8 1000000 1.25 ns/op 16 B/op 1 allocs/op\n' }),
        JSON.stringify({ Action: 'output', Output: './main.go:10:6: inline snippet\n' }),
      ].join('\n');

      const result = parseGoTestStream(stdout, '');

      expect(result.bench!.hasBench).toBe(true);
      expect(result.bench!.nsPerOp).toBe(1.25);
      expect(result.bench!.bytesPerOp).toBe(16);
      expect(result.bench!.allocsPerOp).toBe(1);
    });
  });

  describe('executeSubmission', () => {
    it('returns failure result when code or testCode is missing', async () => {
      const result = await executeSubmission({ code: '', testCode: 'func TestX(t *testing.T){}' });
      expect(result.success).toBe(false);
      expect(result.compileError).toBe('Missing code or testCode');
      expect(result.passed).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('compiles and executes valid Go code submission', async () => {
      const code = `package main
func Add(a, b int) int { return a + b }
`;
      const testCode = `package main
import "testing"
func TestAdd(t *testing.T) {
  if Add(2, 3) != 5 { t.Errorf("want 5") }
}
`;
      const result = await executeSubmission({ code, testCode });
      expect(result.success).toBe(true);
      expect(result.passed).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.tests[0].name).toBe('TestAdd');
    });

    it('dispatches typescript trackId to TypeScriptExecutor correctly', () => {
      const executor = getLanguageExecutor('typescript');
      expect(executor.constructor.name).toBe('TypeScriptExecutor');
    });

    it('dispatches python trackId to PythonExecutor correctly', () => {
      const executor = getLanguageExecutor('python');
      expect(executor.constructor.name).toBe('PythonExecutor');
    });
  });
});
