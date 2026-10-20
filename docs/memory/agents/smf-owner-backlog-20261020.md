# SuperMagicFootball — owner backlog session
**Agent ID:** `smf-owner-backlog-20261020`  
**Updated:** 2026-10-20

## Mission
Record explicit owner requirements for menu navigation, semantic release versioning, Career/Cup multi-slot saves, player art/animations, graphical UI and editable ability/stats UI. This is a **documentation-only** chat, not the hourly development agent.

## Current checkpoint
Created [owner's 15-item supplementary backlog](../../OWNER_UI_ART_SAVES_VERSION_BACKLOG_20261020.md) alongside the existing 30-feature audit. Its P0 items include Back navigation, removing main menu dev-banner, four-part real release version starting `0.9.0.0` visible only in About, ten Career and ten Cups save slots, and Studio controls for stats/moves. P1 includes illustrated menus and major eight-view graphics/animations. Added pointer overrides to [owner audit](../../OWNER_PRIORITY_FEATURE_AUDIT_20261019.md) and [milestones](../../NEXT_MILESTONES.md). **No game/runtime/CI changes shipped**.

## Next smallest action
A separately owned `ui-controls` iteration should first reproduce and fix Back navigation and remove the home dev-to-About wording. Full semantic version migration needs coordinated `ui-controls`, `release-infra`, and context governance changes, including changing existing mandatory About/SHA tests; do not remove internal SHA QA provenance.

## Ownership and exclusions
Project-context documentation lock for this single backlog update; release after recording handover. No other agents' memories, gameplay code, UI source, graphics assets, saved player IDs, or CI pipelines modified.

## Evidence
[New spec](../../OWNER_UI_ART_SAVES_VERSION_BACKLOG_20261020.md); [GitHub Actions](https://github.com/saeedsai/SuperMagicFootball/actions). Same-commit full QA not a prerequisite for claiming a docs feature implemented; mark runtime work PLANNED.

## Cleanup
No temporary artifacts or source changes. Maintain legacy 30-item statuses intact.
