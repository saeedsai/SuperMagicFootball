# Shared project memory — SuperMagicFootball
**Updated:** 2026-10-31

## Stable project facts
- Browser-playable modular game in `index.html`, `src/`, `data/`, and `style.css`. See [root README](../../README.md).
- Preserve 223 team and 2,676 player identities/order, 2 GK / 3 DF / 4 MF / 3 FW squads, six formations, four match actions, save compatibility and offline play.
- Current development source is the existing `dev` branch; verify its full SHA before and after integration.

## Coordination and sources of truth
- The owner authorized coordinated scoped multi-agent development on 2026-10-31. Follow [AGENTS.md](../../AGENTS.md) and the [coordination policy](../agent_coordination/README.md); historical feature claims and registry entries are not locks.
- Overall current plan/status: [master backlog](../MASTER_BACKLOG.md). Dated inventories and QA reports are evidence, not competing status ledgers.
- Graphics: [Studio workflow](../GRAPHICS_AGENT_WORKFLOW.md), [current art handover](../concept_character_pipeline/NEXT_CHAT_HANDOVER.md), [technical contracts](../concept_character_pipeline/README.md).
- Data: [roster merge guide](../PARALLEL_DATA_MERGE_GUIDE.md). QA and release: current GitHub Actions, [version policy](../VERSIONING_POLICY.md), and [Pages setup](../../GITHUB_PAGES_SETUP.md).

## Mandatory About version rule
Keep the installed four-part version and release notes in `src/modules/release.js`; show them only in About. Keep root `README.md`'s version banner/heading and dated player-facing summary aligned. Every player-facing game update must also update root README. Documentation-only changes do not bump the version. Follow [`docs/VERSIONING_POLICY.md`](../VERSIONING_POLICY.md). Immutable commit SHA, exact-head QA and hosted byte checks are internal release evidence; do not show remote development SHA to players.

## Memory hygiene
Read only your own [registered checkpoint](AGENTS_INDEX.json) when one applies. The shared Git repository cannot grant file-specific access; these boundaries are cooperative. Do not read/edit another agent's private checkpoint or store secrets. Git history preserves older states.
