# prompt-discipline MCP Server

Model Context Protocol server for prompt discipline enforcement in Claude Code sessions.

## Tools

- **clarify_intent** — Analyzes vague prompts and returns clarifying questions + project context
- **check_session_health** — Reports tool call count, token usage, and session warnings
- **enrich_agent_task** — Enriches a sub-agent task description with full context
- **what_changed** — Summarizes recent file changes to prevent redundant work

## Setup

```bash
npm install
```

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "prompt-coach": {
      "command": "node",
      "args": ["path/to/src/index.js"],
      "env": {
        "CLAUDE_PROJECT_DIR": "/path/to/your/project"
      }
    }
  }
}
```

## Part of

This MCP server is part of the [prompt-discipline plugin](https://github.com/alldigitalrewards/claude-plugins) for Claude Code.
