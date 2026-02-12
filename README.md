# prompt-discipline MCP Server

14-tool Model Context Protocol server for prompt discipline enforcement in Claude Code sessions. Covers all 12 scorecard categories.

## Tools

| # | Category | Tool | What it does |
|---|----------|------|-------------|
| 1 | Plans | `scope_work` | Structured execution plans before coding |
| 2 | Clarification | `clarify_intent` | Gathers project context to disambiguate vague prompts |
| 3 | Delegation | `enrich_agent_task` | Enriches sub-agent tasks with file paths and patterns |
| 4 | Follow-up Specificity | `sharpen_followup` | Resolves "fix it"/"do the others" to actual files |
| 5 | Token Efficiency | `token_audit` | Detects waste patterns, grades A-F |
| 6 | Sequencing | `sequence_tasks` | Orders tasks by dependency/locality/risk |
| 7 | Compaction Mgmt | `checkpoint` | Save game before compaction — commits + resumption notes |
| 8 | Session Lifecycle | `check_session_health` | Monitors uncommitted files, time since commit |
| 9 | Error Recovery | `log_correction` | Tracks corrections, identifies error pattern trends |
| 10 | Workspace Hygiene | `audit_workspace` | Finds stale/missing workspace docs vs git activity |
| 11 | Cross-Session | `session_handoff` + `what_changed` | Session briefs + diff summaries |
| 12 | Verification | `verify_completion` | Type check + tests + build before declaring done |

## Install

```bash
git clone https://github.com/alldigitalrewards/prompt-discipline.git
cd prompt-discipline
npm install
```

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "prompt-coach": {
      "command": "npx",
      "args": ["tsx", "/path/to/prompt-discipline/src/index.ts"],
      "env": {
        "CLAUDE_PROJECT_DIR": "/path/to/your/project"
      }
    }
  }
}
```

## Full Plugin

This repo contains only the MCP server. For the full plugin with hooks, slash commands, skills, and agents, see: [alldigitalrewards/claude-plugins](https://github.com/alldigitalrewards/claude-plugins) → `plugins/prompt-discipline/`

## Based On

Analysis of 125 prompts across 9 Claude Code sessions:
- 41% of prompts were under 50 chars (missing files, scope, done conditions)
- ~33K chars/day duplicated from skill pastes
- 6 context compactions from unbounded sessions
- Estimated 30-40% token savings from eliminating vague→wrong→fix cycles
