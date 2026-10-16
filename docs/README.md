# Project documentation — start here

The **live game** is described in [root README](../README.md). This index points to canonical *active* documents rather than asking every ChatGPT agent to ingest hundreds of reports.

## Read order for an agent

1. [Mandatory agent protocol](../AGENTS.md)
2. [Low-context memory startup](memory/README.md), [shared memory](memory/SHARED.md), and **only your own** file in [agent index](memory/AGENTS_INDEX.json)
3. [Feature claims / conflict resolution](agent_coordination/README.md) with [live reservations](agent_coordination/claims/)
4. Only the relevant workstream source and tests for the **one** claimed task

## Canonical documents by purpose

| Purpose | Active entry point |
| --- | --- |
| Roadmap and gaps | [Next milestones](NEXT_MILESTONES.md), [development plan](DEVELOPMENT_PLAN_AND_PRIORITIES.md), [requirements review](REQUIREMENTS_REVIEW_20261016.md) |
| Cross-agent code and roster coordination | [Claims](agent_coordination/README.md), [safe data merge](PARALLEL_DATA_MERGE_GUIDE.md) |
| Player database batches | [Club roster plan](CLUB_ROSTER_BATCH_PLAN_20261016.md), [ledger](CLUB_ROSTER_BATCH_LEDGER_20261016.json), [metadata batches](PLAYER_METADATA_BATCHES_20261016.json) |
| Illustrated player artwork | [Concept pipeline](concept_character_pipeline/NEXT_CHAT_HANDOVER.md), [tracker](concept_character_pipeline/PROGRESS_TRACKER.json) |
| Current QA evidence and status | [Release QA](QA_RELEASE_v082534_20261016.md), [status](STATUS.md), **live GitHub Actions** for newer revisions |
| Documentation retention | [Active/archive policy](ARCHIVE_AND_ACTIVE_FILES.md), [historical changelogs](history/changelogs/) |

## Cleanup rules

- **Current:** root launch docs, the links above, `docs/memory/`, agent coordination, source, scripts and tests.
- **Historical evidence, not startup input:** old `TEST_REPORT_*`, `GAP_REGISTER_*`, `QA_EXECUTION_*`, `qa_runs*/`, and dated specialist handovers. Keep available for reproducibility, but do not use as live status.
- **Generated/transient:** never commit `tests/.generated/`, Python caches, local Playwright scratch results or `node_modules/`; see root `.gitignore`.
- Remove a tracked file **only** after verifying it is not imported, named by tests/workflows, a provenance record, or owned by an active agent. Prefer minimal deletions over speculative sweeping changes. This baseline intentionally retains historical records until their dependencies are audited.

## Agent adoption prompt

> At the start of your next turn, re-read live `dev` `AGENTS.md` and `docs/memory/README.md`; load `docs/memory/SHARED.md` plus **only your own** file from `docs/memory/AGENTS_INDEX.json`. Treat GitHub claims as the sole live ownership truth; at every checkpoint replace stale notes in your own memory, report exact tests/commit and avoid loading old chat transcripts or other agents' memory.
