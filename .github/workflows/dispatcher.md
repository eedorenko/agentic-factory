---
description: |
  Assigns the coding agent to issues labeled 'ready'. Simple state transition
  handler — not a scheduler. Triggers immediately on label event.

on:
  issues:
    types: [labeled]

labels: [ready]

permissions:
  contents: read
  issues: read
  pull-requests: read

safe-outputs:
  assign-to-agent:
    max: 1
    target: "*"
    allowed: [copilot]
    ignore-if-error: true
  add-labels:
    allowed:
      - in-progress
    max: 1
  remove-labels:
    allowed:
      - ready
    max: 1
  add-comment:
    max: 1

timeout-minutes: 5
---

# Dispatcher

You are a dispatcher agent. Your job is to assign issue
#${{ github.event.issue.number }} to the Copilot coding agent.

**State guard:** First check if this issue has the `ready` label. If it does
NOT have `ready`, call `noop`. If it already has `in-progress`, call `noop`.

## Steps

1. Check the issue is valid for dispatch:
   - Has the `ready` label
   - Is not already assigned
   - Does not already have an open PR from Copilot

2. If valid, assign the issue to the Copilot coding agent using
   `assign_to_agent(issue_number, agent="copilot")`.

3. Post a brief comment confirming the assignment.

4. Transition state:
   - Remove the `ready` label
   - Add the `in-progress` label

5. If the issue cannot be dispatched (already assigned, already has a PR,
   or assignment fails), call `noop` with an explanation.
