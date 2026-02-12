import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { run, getBranch, getStatus, getRecentCommits, getDiffFiles, getStagedFiles } from "../lib/git.js";
import { findWorkspaceDocs } from "../lib/files.js";
import { PROJECT_DIR } from "../lib/files.js";
import { existsSync } from "fs";
import { join } from "path";

export function registerClarifyIntent(server: McpServer): void {
  server.tool(
    "clarify_intent",
    `Clarify a vague user instruction by gathering project context. Call BEFORE executing when the user's prompt is missing specific files, actions, scope, or done conditions. Returns git state, test failures, recent changes, and workspace priorities.`,
    {
      user_message: z.string().describe("The user's raw message/instruction to clarify"),
      suspected_area: z.string().optional().describe("Best guess area: 'tests', 'git', 'ui', 'api', 'schema'"),
    },
    async ({ user_message, suspected_area }) => {
      const sections: string[] = [];
      const branch = getBranch();
      const status = getStatus();
      const recentCommits = getRecentCommits(5);
      const recentFiles = getDiffFiles("HEAD~3");
      const staged = getStagedFiles();
      const dirty = status ? status.split("\n").length : 0;

      sections.push(`## Git State\nBranch: ${branch}\nDirty files: ${dirty}\n${status ? `\`\`\`\n${status}\n\`\`\`` : "Working tree clean"}\nStaged: ${staged || "nothing"}\n\nRecent commits:\n\`\`\`\n${recentCommits}\n\`\`\`\n\nRecently changed files:\n\`\`\`\n${recentFiles}\n\`\`\``);

      const area = (suspected_area || "").toLowerCase();
      if (!area || area.includes("test") || area.includes("fix")) {
        const typeErrors = run("pnpm tsc --noEmit 2>&1 | grep -c 'error TS' || echo '0'");
        const testFiles = run("find tests -name '*.spec.ts' -maxdepth 4 2>/dev/null | head -20");
        let failingTests = "unknown";
        if (existsSync(join(PROJECT_DIR, "playwright-report"))) {
          failingTests = run(`cat playwright-report/results.json 2>/dev/null | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const r=JSON.parse(d);const f=r.suites?.flatMap(s=>s.specs?.filter(sp=>sp.ok===false).map(sp=>sp.title)||[])||[];console.log(f.length?f.join('\\n'):'all passing')}catch{console.log('could not parse')}})" 2>/dev/null || echo "no report"`, { timeout: 5000 });
        }
        sections.push(`## Test State\nType errors: ${typeErrors}\nFailing tests: ${failingTests}\nTest files:\n\`\`\`\n${testFiles}\n\`\`\``);
      }

      const workspaceDocs = findWorkspaceDocs();
      const priorityDocs = Object.entries(workspaceDocs)
        .filter(([n]) => /gap|roadmap|current|todo|changelog/i.test(n))
        .slice(0, 3);
      if (priorityDocs.length > 0) {
        sections.push(`## Workspace Priorities\n${priorityDocs.map(([n, d]) => `### .claude/${n}\n\`\`\`\n${d.content}\n\`\`\``).join("\n\n")}`);
      }

      const msg = user_message.toLowerCase();
      const signals: string[] = [];
      if (msg.match(/fix|repair|broken|failing|error/)) signals.push("FIX: Check test output and type errors for specific failures.");
      if (msg.match(/test|spec|suite|playwright/)) signals.push("TESTS: Check failing tests and test files above.");
      if (msg.match(/commit|push|pr|merge/)) signals.push("GIT: Check dirty files and branch above.");
      if (msg.match(/add|create|new|build/)) signals.push("CREATE: Check workspace priorities for what's planned.");
      if (msg.match(/remove|delete|clean|strip/)) signals.push("REMOVE: Check conversation for what 'them/it' refers to.");
      if (msg.match(/check|verify|confirm|status/)) signals.push("VERIFY: Use git/test state above to answer.");
      if (msg.match(/everything|all|entire|whole/)) signals.push("⚠️ UNBOUNDED: Narrow down using workspace priorities.");
      if (!signals.length) signals.push("UNCLEAR: Ask ONE clarifying question.");

      sections.push(`## Intent Signals\n${signals.map(s => `- ${s}`).join("\n")}`);
      sections.push(`## Recommendation\n1. **Proceed with specifics** — state what you'll do and why\n2. **Ask ONE question** — if context doesn't disambiguate`);

      return { content: [{ type: "text" as const, text: sections.join("\n\n") }] };
    }
  );
}
