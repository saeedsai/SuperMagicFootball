# Agent memory — Context-management implementation

**Agent ID:** `context-admin-20261016`
**Updated:** 2026-10-16
**Status:** delivered and QA-verified; project-context claim released.

## Mission

Reduce chat context load using Git-backed shared and per-chat memory, a minimal read sequence and safe documentation navigation. Do not edit gameplay or another agent's code.

## Current checkpoint

- Created `docs/memory/SHARED.md`, nine registered agent memories, `AGENTS_INDEX.json`, and `docs/memory/README.md`.
- Added a canonical `docs/README.md` navigation index and mandatory startup references in `AGENTS.md`, root README and coordination README.
- Registered `project-context` lock and updated its CLI allowlist without changing claim behavior.
- Added automatic `tests/project_memory_contract.test.cjs`; an initial failing wording assertion was corrected and reverified.
- **No tracked historical documents deleted:** references and provenance not sufficiently audited; old QA/roster evidence remains intentionally accessible.

## Next smallest action

- At each existing agent's **next** checkpoint, send the adoption prompt in `docs/README.md`; that agent verifies its identity and replaces its own seeded notes with actual verified progress. For a new chat, register a distinct new ID with an authorized project-context owner.
- Future project-context owner can inventory one candidate historical duplicate, verify references/tests/ownership, then safely archive/delete in a separately tested batch.

## Ownership and exclusions

- `project-context` released after implementation. This file belongs only to `context-admin-20261016`; no access to other chats' memory is needed.
- GitHub does **not** technically restrict per-chat file reads; this is a mandatory cooperative rule for compliant agents.

## Evidence

- Implemented: [commit e06a99b](https://github.com/saeedsai/SuperMagicFootball/commit/e06a99b34e3e3c7fdece7883d497f892afd51fba); compatibility fix: [commit 06218cf](https://github.com/saeedsai/SuperMagicFootball/commit/06218cf3d2b6c34e93b6de2789da4689e57bd33e); test fix: [commit 9ede8af](https://github.com/saeedsai/SuperMagicFootball/commit/9ede8af1ed4835e8e6544effc3a41e5697fd11b1).
- [Modular Dev QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38903891342): **121/121 Node**, **20/20 merge Python**, **10/10 claim Python**, data/165-club validations and Python compile passed. Full browser regression not re-run by this doc-only checkpoint; external Pages reachability not independently confirmed.

## Cleanup

- This file is the latest concise checkpoint; no transcript, obsolete to-dos or copied GitHub lock status. Preserve historical evidence by Git links.
