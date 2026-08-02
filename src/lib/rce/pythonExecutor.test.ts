import { describe, it, expect } from 'vitest';
import { parsePytestOutput } from './pythonExecutor';

const PASS_STDOUT = [
  '============================= test session starts ==============================',
  'platform linux -- Python 3.14.4, pytest-9.0.2, pluggy-1.6.0',
  'collecting ... collected 2 items',
  '',
  'test_solution.py::test_add PASSED                                        [ 50%]',
  'test_solution.py::test_subtract PASSED                                   [100%]',
  '',
  '============================== 2 passed in 0.02s ===============================',
].join('\n');

const MIXED_STDOUT = [
  '============================= test session starts ==============================',
  'platform linux -- Python 3.14.4, pytest-9.0.2, pluggy-1.6.0',
  'collecting ... collected 2 items',
  '',
  'test_solution.py::test_add PASSED                                        [ 50%]',
  'test_solution.py::test_fail FAILED                                       [100%]',
  '',
  '=================================== FAILURES ===================================',
  '__________________________________ test_fail ___________________________________',
  'test_solution.py:7: in test_fail',
  '    assert fail() == 2',
  'E   assert 1 == 2',
  '========================= 1 failed, 1 passed in 0.03s ==========================',
].join('\n');

const IMPORT_ERROR_STDOUT = [
  '============================= test session starts ==============================',
  'platform linux -- Python 3.14.4, pytest-9.0.2, pluggy-1.6.0',
  'collecting ... collected 0 items / 1 error',
  '',
  '==================================== ERRORS ====================================',
  '_____________________ ERROR collecting test_solution.py ______________________',
  "ImportError while importing test module 'test_solution.py'.",
  'test_solution.py:1: in <module>',
  '    from nope import x',
  "E   ModuleNotFoundError: No module named 'nope'",
  '=========================== short test summary info ============================',
  'ERROR test_solution.py',
  '!!!!!!!!!!!!!!!!!!!! Interrupted: 1 error during collection !!!!!!!!!!!!!!!!!!!!',
].join('\n');

const SYNTAX_ERROR_STDOUT = [
  '============================= test session starts ==============================',
  'platform linux -- Python 3.14.4, pytest-9.0.2, pluggy-1.6.0',
  'collecting ... collected 0 items / 1 error',
  '',
  '==================================== ERRORS ====================================',
  '_______________________ ERROR collecting solution.py ________________________',
  '    def broken(:',
  '               ^',
  'E   SyntaxError: invalid syntax',
  '=========================== short test summary info ============================',
  'ERROR solution.py',
  '!!!!!!!!!!!!!!!!!!!! Interrupted: 1 error during collection !!!!!!!!!!!!!!!!!!!!',
].join('\n');

const ERROR_STDOUT = [
  '============================= test session starts ==============================',
  'platform linux -- Python 3.14.4, pytest-9.0.2, pluggy-1.6.0',
  'collecting ... collected 1 item',
  '',
  'test_solution.py::test_setup ERROR                                       [100%]',
  '',
  '==================================== ERRORS ====================================',
  '_________________________________ ERROR at setup ________________________________',
  'test_solution.py:3: in setup',
  '    raise RuntimeError("boom")',
  'E   RuntimeError: boom',
  '=========================== short test summary info ============================',
  'ERROR test_solution.py::test_setup',
  '=============================== 1 error in 0.02s ===============================',
].join('\n');

describe('parsePytestOutput', () => {
  it('parses all-passing output with per-test results', () => {
    const result = parsePytestOutput(PASS_STDOUT, '');

    expect(result.success).toBe(true);
    expect(result.passed).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.tests).toHaveLength(2);
    expect(result.tests[0]).toEqual({ name: 'test_add', passed: true });
    expect(result.tests[1]).toEqual({ name: 'test_subtract', passed: true });
    expect(result.compileError).toBeUndefined();
  });

  it('parses mixed pass/fail output', () => {
    const result = parsePytestOutput(MIXED_STDOUT, '');

    expect(result.success).toBe(false);
    expect(result.passed).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.tests).toHaveLength(2);
    expect(result.tests[0].passed).toBe(true);
    expect(result.tests[1].passed).toBe(false);
    expect(result.tests[1].name).toBe('test_fail');
  });

  it('detects import errors as compile errors', () => {
    const result = parsePytestOutput(IMPORT_ERROR_STDOUT, '');

    expect(result.success).toBe(false);
    expect(result.passed).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.tests).toHaveLength(0);
    expect(result.compileError).toContain('ModuleNotFoundError');
  });

  it('detects syntax errors as compile errors', () => {
    const result = parsePytestOutput(SYNTAX_ERROR_STDOUT, '');

    expect(result.success).toBe(false);
    expect(result.compileError).toContain('SyntaxError');
  });

  it('reports a timeout as a compile error', () => {
    const result = parsePytestOutput('', '', true);

    expect(result.success).toBe(false);
    expect(result.compileError).toContain('timed out');
  });

  it('counts ERROR-status tests as failed', () => {
    const result = parsePytestOutput(ERROR_STDOUT, '');

    expect(result.success).toBe(false);
    expect(result.passed).toBe(0);
    expect(result.failed).toBe(1);
    expect(result.tests).toHaveLength(1);
    expect(result.tests[0]).toEqual({ name: 'test_setup', passed: false });
    expect(result.compileError).toContain('RuntimeError');
  });

  it('returns failure when no tests are collected and no error is found', () => {
    const result = parsePytestOutput('============================== no tests ran in 0.00s ===============================', '');

    expect(result.success).toBe(false);
    expect(result.passed).toBe(0);
    expect(result.failed).toBe(0);
  });
});
