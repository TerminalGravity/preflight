import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type RegisterToolFn = (server: McpServer) => void;

export interface DocInfo {
  content: string;
  mtime: Date;
  size: number;
}

export interface CorrectionEntry {
  timestamp: string;
  branch: string;
  user_said: string;
  wrong_action: string;
  root_cause: string;
  category: string;
}

export interface CheckpointLogEntry {
  timestamp: string;
  branch: string;
  summary: string;
  next_steps: string;
  blockers: string | null;
  dirty_files: number;
}
