# Team

This file is the factory's team directory. Every agent reads it (via AGENTS.md)
to know who to ask for help, who to escalate to, and what each team member
(agent or human) is responsible for.

## Pipeline Agents

| Handle | Agent | Workflow | What they handle |
| --- | --- | --- | --- |
| @advisor | Advisor | advisor.md | Triages issues, answers product questions, makes priority/scope decisions. The product knowledge center. |
| @executor | Execution Agent | executor.md | Implements tasks via multi-run Goal pattern: plans if complex, codes, runs tests, runs the program, verifies Definition of Done, opens PRs. Communicates via issue and PR comments. |
| @reviewer | Review Agent | reviewer.md | Multi-lens code review (Functional, Standards, Security, Readiness). Assigns Copilot as reviewer, incorporates its findings. Submits proper GitHub reviews (APPROVE/REQUEST_CHANGES). Severity taxonomy: Critical/High/Medium/Low. Depth tiers based on risk labels. |
| @orchestrator | Orchestrator | orchestrator.md | Monitors pipeline health, detects stuck states, nudges agents via @mentions. Enforces Escalation Policy table. Runs after every agent completes + every 30m. Pure plumbing — no product decisions. |

## Feedback Agents

| Handle | Agent | What they handle |
| --- | --- | --- |
| @sre | SRE Agent | Detects + diagnoses production anomalies, creates incident/bug issues |
| @analyst | Analyst | Analyzes usage patterns and trends, creates feature/enhancement issues |
| @healer | Healer | Scores agent performance, creates harness improvement issues |

## Verify Agents (Future)

| Handle | Agent | Workflow | What they handle |
| --- | --- | --- | --- |
| @architect | Architecture Agent | (future) | Design patterns, architectural tradeoffs, system coherence |
| @qa | QA Agent | (future) | Test strategy, coverage gaps, acceptance criteria, edge cases |

## Humans

| Handle | Responsibility | Areas | Escalate when |
| --- | --- | --- | --- |
| @eedorenko | Tech lead / Product owner | All areas | Agent is uncertain, high-risk decisions, architectural changes |

## State Machine (Labels)

| Label | Meaning | Set by | Consumed by |
| --- | --- | --- | --- |
| `ready` | Triaged and approved for execution | Advisor | Executor |
| `in-progress` | Execution Agent is working on it | Executor | Executor |
| `done` | PR merged, issue closed | (after merge) | — |
| `needs-info` | Missing information, waiting for reporter | Advisor | — |
| `complex` | Multiple files, design decisions needed | Advisor | Executor (plans first) |
| `risky` | Breaking changes, security, production impact | Advisor | Executor (plans + waits for approval) |
| `blocked` | Stuck, needs human input | Any agent | Orchestrator (re-escalates) |
| `needs-attention` | Orchestrator detected a problem | Orchestrator | Humans |

## Routing Rules

When an agent needs input, choose the best responder:

1. **Trivial decision** → just decide, don't ask anyone
2. **Routine product question** → @advisor
3. **Architecture/design question** → @architect
4. **Test strategy question** → @qa
5. **Operational/safety concern** → @sre
6. **Need input from issue reporter** → @mention the issue author directly
7. **Uncertain or high-risk** → @mention human from this file with your suggestion
8. **Wrong agent asked you** → redirect to the right agent with context

## Escalation Policy

The Orchestrator enforces these rules. Agents should also be aware of what's
expected of them — if you see yourself as the target, act before the
Orchestrator has to nudge you.

| Condition | Threshold | Action | Target |
| --- | --- | --- | --- |
| Issue is `ready`, not picked up | 10 min | "Pick up issue #N" | @executor |
| Issue `in-progress`, no PR, no comment | 24h | "What's blocking?" | @executor |
| Issue `in-progress` with commits but no PR for 30+ min | 30 min | "Create PR for issue #N" | @executor |
| PR ready for review, no review submitted | 1h | "Review PR #N" | @reviewer |
| @mention unanswered | 1h | Nudge the mentioned agent | mentioned agent |
| @mention unanswered | 4h | Escalate to human | human from TEAM.md |
| Issue `blocked`, no human response | 48h | Re-escalate with context | human from TEAM.md |
| Issue `needs-info`, no reporter response | 7 days | Close as stale | — |
| 5+ issues `in-progress` simultaneously | — | Warn about capacity | @advisor |

## Anti-Loop Rules

- Never @mention yourself in your response
- Never respond to your own comments
- If a comment doesn't contain your @handle, call noop
- Check comment author — if it's github-actions[bot] with your signature, noop
