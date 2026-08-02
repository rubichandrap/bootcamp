import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export interface SandboxExecOptions {
  prefix: string;
  files: Record<string, string>;
  cmd: string;
  timeoutMs: number;
  env?: NodeJS.ProcessEnv;
}

export interface SandboxExecResult {
  stdout: string;
  stderr: string;
  timedOut?: boolean;
}

function execWithProcessTreeTimeout(
  cmd: string,
  options: { cwd: string; env?: NodeJS.ProcessEnv },
  timeoutMs: number
): Promise<SandboxExecResult> {
  return new Promise((resolve) => {
    let timedOut = false;
    let stdout = '';
    let stderr = '';

    // detached makes the shell a session leader; killing -pid signals the whole group,
    // including any child processes the learner's code spawns.
    const child = spawn(cmd, {
      cwd: options.cwd,
      env: options.env,
      shell: true,
      detached: true,
    });

    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf-8');
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf-8');
    });

    const timer = setTimeout(() => {
      timedOut = true;
      if (child.pid) {
        try {
          // Negative pid signals the whole process group (detached session leader).
          process.kill(-child.pid, 'SIGTERM');
        } catch {
          // Process already exited.
        }
      }
    }, timeoutMs);

    child.on('error', () => {
      clearTimeout(timer);
      resolve({ stdout, stderr, timedOut });
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut && code === null && signal === 'SIGTERM') {
        resolve({ stdout, stderr, timedOut: true });
        return;
      }
      resolve({ stdout, stderr, timedOut });
    });
  });
}

export async function runInSandboxTmpDir(options: SandboxExecOptions): Promise<SandboxExecResult> {
  const { prefix, files, cmd, timeoutMs, env } = options;
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), `${prefix}-`));

  try {
    for (const [filename, content] of Object.entries(files)) {
      await fs.writeFile(path.join(tmpDir, filename), content, 'utf-8');
    }

    return await execWithProcessTreeTimeout(cmd, { cwd: tmpDir, env }, timeoutMs);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}
