# Project documentation — start here

The **live game** is described in [root README](../README.md). This index points to canonical *active* documents for the owner-designated **single developer**, without loading hundreds of historical reports.

## Read order for the sole developer

1. [Mandatory agent protocol](../AGENTS.md)
2. [Low-context memory startup](memory/README.md), [shared memory](memory/SHARED.md), and **only your own** file in [agent index](memory/AGENTS_INDEX.json)
3. [Single-developer coordination](agent_coordination/README.md); [retired claims](agent_coordination/claims/) are audit records, not locks
4. Current source/tests and the relevant owner-priority backlog for **one small incremental task**

## Canonical documents by purpose

| Purpose | Active entry point |
| --- | --- |
| Roadmap and gaps | [Next milestones](NEXT_MILESTONES.md), [development plan](DEVELOPMENT_PLAN_AND_PRIORITIES.md), [requirements review](REQUIREMENTS_REVIEW_20261016.md) |
| About-only release version and internal commit audit | [Versioning policy](VERSIONING_POLICY.md), [current release metadata](../src/modules/release.js); [historical About notes](UI_ABOUT_LIVE_VERSION_20261016.md) |
| Central development and handovers | [Single-developer log](DEVELOPMENT_LOG_SINGLE_OWNER.md), [historical claims](agent_coordination/README.md), [safe data merge](PARALLEL_DATA_MERGE_GUIDE.md) |
| Player database batches | [Club roster plan](CLUB_ROSTER_BATCH_PLAN_20261016.md), [ledger](CLUB_ROSTER_BATCH_LEDGER_20261016.json), [metadata batches](PLAYER_METADATA_BATCHES_20261016.json) |
| Illustrated player artwork | [Concept pipeline](concept_character_pipeline/NEXT_CHAT_HANDOVER.md), [tracker](concept_character_pipeline/PROGRESS_TRACKER.json) |
| Current QA evidence and status | [Release QA](QA_RELEASE_v082534_20261016.md), [status](STATUS.md), **live GitHub Actions** for newer revisions |
| Documentation retention | [Active/archive policy](ARCHIVE_AND_ACTIVE_FILES.md), [historical changelogs](history/changelogs/) |

## Cleanup rules

- **Current:** root launch docs, the links above, `docs/memory/`, agent coordination, source, scripts and tests.
- **Historical evidence, not startup input:** old `TEST_REPORT_*`, `GAP_REGISTER_*`, `QA_EXECUTION_*`, `qa_runs*/`, and dated specialist handovers. Keep available for reproducibility, but do not use as live status.
- **Generated/transient:** never commit `tests/.generated/`, Python caches, local Playwright scratch results or `node_modules/`; see root `.gitignore`.
- Remove a tracked file **only** after verifying it is not imported, named by tests/workflows, a provenance record, or owned by an active agent. Prefer minimal deletions over speculative sweeping changes. This baseline intentionally retains historical records until their dependencies are audited.

## Former-agent retirement instruction

> The owner selected `smf-hourly-dev-20261019` as the **sole ongoing developer**. Former specialist agent chats must **not commit** to this repository unless expressly reauthorized. Historical GitHub claims are retired as code-edit gates. Keep their source and handovers intact, use the newest `dev` SHA, and do not read or edit another chat's memory. See `AGENTS.md` and `docs/agent_coordination/README.md`.
