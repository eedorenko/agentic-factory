# Agent Instructions

## Team Directory

Read `TEAM.md` for the full team directory — agent handles (@advisor,
@executor, @reviewer, @orchestrator, @architect, @qa, @sre, @analyst, @healer), human contacts,
responsibilities, and routing rules for when to ask whom.

## Communication

- Use @mentions in issue comments to talk to other agents and humans
- Read `TEAM.md` to find the right handle for your question
- Read `CODEOWNERS` to find the right human for code-specific questions
- Be direct — state questions clearly so the responder doesn't have to
  read the whole thread

## GitHub API Access

**Use MCP tools for all GitHub API calls.** Do NOT use `gh` CLI, `curl`,
`git fetch/push`, or direct HTTP to github.com. The runtime firewall blocks
direct access to github.com. Instead:

- Read issues, PRs, files, repos → GitHub MCP server tools
- Write operations (comments, labels, PRs, merges) → safe-output tools
- Git operations (push, branch) → safe-output tools

The `gh` CLI is not authenticated in the agent runtime. Direct network
calls to github.com will be blocked by the firewall.

## Conventions

- Write clear, concise code
- Include unit tests for new functionality
- Follow existing patterns in the codebase
- Small, focused changes — one concern per PR
- Node.js built-in test runner: `node --test src/**/*.test.js`

## Architecture

- This is an experiment repo for testing agentic factory patterns
- Document what you learn in PR descriptions
- Source code lives in `src/`
