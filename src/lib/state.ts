import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";
import { PROJECT_DIR } from "./files.js";

export const STATE_DIR = join(PROJECT_DIR, ".claude", "prompt-coach-state");

// Ensure state directory exists
if (!existsSync(STATE_DIR)) {
  mkdirSync(STATE_DIR, { recursive: true });
}

export function loadState(name: string): Record<string, any> {
  const p = join(STATE_DIR, `${name}.json`);
  if (!existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return {};
  }
}

export function saveState(name: string, data: Record<string, any>): void {
  writeFileSync(join(STATE_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

export function appendLog(filename: string, entry: Record<string, any>): void {
  const logFile = join(STATE_DIR, filename);
  appendFileSync(logFile, JSON.stringify(entry) + "\n");
}

export function readLog(filename: string): Record<string, any>[] {
  const logFile = join(STATE_DIR, filename);
  if (!existsSync(logFile)) return [];
  try {
    return readFileSync(logFile, "utf-8").trim().split("\n").map(l => JSON.parse(l));
  } catch {
    return [];
  }
}

export function now(): string {
  return new Date().toISOString();
}
