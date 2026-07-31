import { exec, ExecOptions } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SandboxExecOptions {
  prefix: string;
  files: Record<string, string>;
  cmd: string;
  timeoutMs: number;
  env?: ExecOptions['env'];
}

export interface SandboxExecResult {
  stdout: string;
  stderr: string;
}

export async function runInSandboxTmpDir(options: SandboxExecOptions): Promise<SandboxExecResult> {
  const { prefix, files, cmd, timeoutMs, env } = options;
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));

  try {
    for (const [filename, content] of Object.entries(files)) {
      await fs.writeFile(path.join(tmpDir, filename), content, 'utf-8');
    }

    let stdout = '';
    let stderr = '';

    try {
      const result = await execAsync(cmd, {
        cwd: tmpDir,
        timeout: timeoutMs,
        env,
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (err: unknown) {
      const execErr = err as { stdout?: string; stderr?: string; message?: string };
      stdout = execErr.stdout || '';
      stderr = execErr.stderr || execErr.message || '';
    }

    return { stdout, stderr };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}
