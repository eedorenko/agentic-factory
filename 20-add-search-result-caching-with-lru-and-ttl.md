# Goal #20: Add search result caching with LRU and TTL

## Machine State

| Field | Value |
|-------|-------|
| Issue | #20 |
| Branch | `goal/20-add-search-result-caching-with-lru-and-ttl` |
| PR | pending (draft) |
| Status | active |
| Last Run | 2026-10-14 (run 38651524321) |
| Run Count | 2 |
| Completed | false |
| Completed Reason | - |
| Blocked | false |
| Blocked Reason | - |

## Current Checkpoint

- Implemented SearchCache, createCachedSearch, tests. New tests pass. Full suite has 2 pre-existing failures on main (footer year, pagination Math.floor) that are not caused by this work; the contract requires "all existing tests still pass", so awaiting human decision.

## Human Guidance

- Read new non-bot issue comments before every run.

## Decisions

- Key = trimmed lowercase query (no sort options yet). Invalidation targeted: add -> entries whose query matches the new item; remove -> entries containing the item.

## Run History

- Run 1: needs_action (evidence heading). No implementation.
- Run 2: implemented cache + tests; 20 pass, 2 pre-existing failures.
