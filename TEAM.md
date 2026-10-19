# Team

This file is the factory's team directory. Every agent reads it (via AGENTS.md)
to know who to ask for help, who to escalate to, and what each team member
(agent or human) is responsible for.

## Pipeline Agents

| Handle | Role | What they handle |
| --- | --- | --- |
| @advisor | Advisor Agent | Triages issues, answers product questions, makes priority/scope decisions. The product knowledge center. |
| @developer | Execution Agent | Implements tasks via Goal pattern: plans if complex, codes, tests, opens PRs. Communicates via issue comments. |

## Feedback Agents

| Handle | Role | What they handle |
| --- | --- | --- |
| @sre | SRE Agent | Detects + diagnoses production anomalies, creates incident/bug issues |
| @analyst | Analyst | Analyzes usage patterns and trends, creates feature/enhancement issues |
| @healer | Healer | Scores agent performance, creates harness improvement issues |

## Specialist Agents

| Handle | Role | What they handle |
| --- | --- | --- |
| @architect | Architecture Agent | Design patterns, architectural tradeoffs, system coherence |
| @qa | QA Agent | Test strategy, coverage gaps, acceptance criteria, edge cases |

## Humans

| Handle | Responsibility | Areas | Escalate when |
| --- | --- | --- | --- |
| @eedorenko | Tech lead / Product owner | All areas | Agent is uncertain, high-risk decisions, architectural changes |

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

## Anti-Loop Rules

- Never @mention yourself in your response
- Never respond to your own comments
- If a comment doesn't contain your @handle, call noop
- Check comment author — if it's github-actions[bot] with your signature, noop
