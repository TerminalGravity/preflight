import { execSync } from "child_process";

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function run(cmd: string, opts: { timeout?: number } = {}): string {
  try {
    return execSync(cmd, {
      cwd: PROJECT_DIR,
      encoding: "utf-8",
      timeout: opts.timeout || 10000,
      maxBuffer: 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (e: any) {
    return e.stdout?.trim() || e.stderr?.trim() || `[command failed: ${cmd}]`;
  }
}

export function getBranch(): string {
  return run("git branch --show-current");
}

export function getStatus(): string {
  return run("git status --short");
}

export function getRecentCommits(count = 5): string {
  return run(`git log --oneline -${count}`);
}

export function getLastCommit(): string {
  return run("git log --oneline -1");
}

export function getLastCommitTime(): string {
  return run("git log -1 --format='%ci'");
}

export function getDiffFiles(ref = "HEAD~3"): string {
  return run(`git diff --name-only ${ref} 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || echo 'no commits'`);
}

export function getStagedFiles(): string {
  return run("git diff --staged --name-only");
}

export function getDiffStat(ref = "HEAD~5"): string {
  return run(`git diff ${ref} --stat 2>/dev/null || git diff HEAD~3 --stat`);
}
