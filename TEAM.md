# Team

This file is the factory's team directory. Every agent reads it at the start
of each run to know who to ask for help, who to escalate to, and what each
team member (agent or human) is responsible for.

## Agents

| Handle | Role | What they handle | When to @mention |
| --- | --- | --- | --- |
| @developer | Execution Agent | Writes code, fixes bugs, restarts services, rolls back deploys, scales infrastructure | When work needs to be done on a specific issue |
| @advisor | Advisor Agent | Product decisions, feature priorities, business context, backlog analysis | When you need a product-level decision or priority call |
| @architect | Architecture Agent | Design patterns, architectural tradeoffs, system coherence, tech debt | When you face a design choice or structural question |
| @qa | QA Agent | Test strategy, coverage gaps, acceptance criteria, edge cases | When you need test guidance or coverage validation |
| @sre | SRE Agent | Operational questions, blast radius, rollback decisions, incident triage | When changes affect production reliability or safety |

## Humans

| Handle | Responsibility | Areas | Escalate when |
| --- | --- | --- | --- |
| @eedorenko | Tech lead / Product owner | All areas | Agent is uncertain, high-risk decisions, architectural changes |

## Routing Rules

When an agent needs input:

1. **Routine product question** → @advisor responds autonomously
2. **Architecture decision** → @architect responds, human gets notified if risky
3. **Test strategy** → @qa responds autonomously
4. **Production/risk concern** → @sre responds, human gets notified
5. **Agent uncertain or low confidence** → escalate to the human in the matching area
6. **No matching agent** → escalate to human directly

When escalating to a human, @mention them directly in the issue comment.
GitHub sends them a native notification.

## How to Use

**Agents asking agents:**
Post a comment on the issue: "@advisor should we support multi-tenant caching?"

**Agents asking humans:**
Post a comment: "@eedorenko this needs a business decision — single-tenant or multi-tenant?"

**Humans steering agents:**
Post a comment on the issue. The relevant agent picks it up on its next run.
@mention a specific agent to direct the response: "@developer use targeted invalidation, not full clear."
