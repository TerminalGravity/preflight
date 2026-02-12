import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import type { DocInfo } from "../types.js";

export const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function readIfExists(relPath: string, maxLines = 50): string | null {
  const full = join(PROJECT_DIR, relPath);
  if (!existsSync(full)) return null;
  try {
    const lines = readFileSync(full, "utf-8").split("\n");
    return lines.slice(0, maxLines).join("\n");
  } catch {
    return null;
  }
}

export function findWorkspaceDocs(): Record<string, DocInfo> {
  const docs: Record<string, DocInfo> = {};
  const claudeDir = join(PROJECT_DIR, ".claude");
  if (!existsSync(claudeDir)) return docs;

  const scanDir = (dir: string, prefix = ""): void => {
    try {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const rel = prefix ? `${prefix}/${entry}` : entry;
        const stat = statSync(full);
        if (stat.isDirectory() && !entry.startsWith(".") && !entry.includes("node_modules") && entry !== "prompt-coach-state") {
          scanDir(full, rel);
        } else if (entry.endsWith(".md") && stat.size < 50000) {
          docs[rel] = {
            content: readFileSync(full, "utf-8").split("\n").slice(0, 40).join("\n"),
            mtime: stat.mtime,
            size: stat.size,
          };
        }
      }
    } catch { /* ignore */ }
  };

  scanDir(claudeDir);
  return docs;
}
