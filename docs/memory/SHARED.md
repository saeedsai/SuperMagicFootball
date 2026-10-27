# Shared project memory — SuperMagicFootball
**Updated:** 2026-10-27

## Stable project facts
- Browser-playable modular game from `index.html`, `src/`, `data/`, `style.css`. See [root README](../../README.md).
- Preserve all 223 team / 2676 player IDs and order, 2 GK / 3 DF / 4 MF / 3 FW team squads, six formations, four action buttons, save compatibility and offline functionality. Latest `dev` is the coding source of truth.

## Coordination and sources of truth
- **Single developer (owner directive 2026-10-20):** `smf-hourly-dev-20261019` owns ongoing coding. [AGENTS.md](../../AGENTS.md) and [coordination policy](../agent_coordination/README.md) retire feature locks. Old [claims](../agent_coordination/claims/) and [registry](../agent_coordination/FEATURE_REGISTRY.json) remain historical, not development gates.
- **Product roadmap:** [next milestones](../NEXT_MILESTONES.md), [30-feature audit](../OWNER_PRIORITY_FEATURE_AUDIT_20261019.md), [15-owner additions](../OWNER_UI_ART_SAVES_VERSION_BACKLOG_20261020.md).
- **Graphics:** [concept character handover](../concept_character_pipeline/NEXT_CHAT_HANDOVER.md).
- **Player data:** [club roster batch plan](../CLUB_ROSTER_BATCH_PLAN_20261016.md), [parallel merge guide](../PARALLEL_DATA_MERGE_GUIDE.md).
- **QA:** [single-developer log](../DEVELOPMENT_LOG_SINGLE_OWNER.md), GitHub Actions and [Pages](../../GITHUB_PAGES_SETUP.md).

## Mandatory About version rule
On **every Git commit**, preserve the About-only installed release version `0.11.3.11` and its offline notes from `src/modules/release.js`. Do not display a remote GitHub `dev` SHA or version banner outside About. Immutable commit SHAs stay internal to GitHub Actions/history; hosted Pages byte comparison verifies actual deployed content. **Every player-facing game update must also update root `README.md` with the new four-part version in banner and heading, dated summary of shipped features/fixes, compatibility notes where relevant and live link. README/version mismatch blocks release.** Documentation-only commits do not bump the installed version. Follow [`docs/VERSIONING_POLICY.md`](../VERSIONING_POLICY.md).

## Shared risks and working decisions
- Other developer sessions should stop writing to the repository unless newly authorized; still reconcile any concurrent Git changes with the latest SHA. No force pushes or circumvented security checks.
- Old handovers and claims are audit evidence, not proof of completion or blocked ownership. Device tests and Pages deployment require independent verification.
- Do not invent FC27/player-source ratings or alter stored identity IDs without migration.

## Memory hygiene
Read only your own [registered checkpoint](AGENTS_INDEX.json) according to [memory protocol](README.md). Git history preserves older states. Never edit another chat's memory or store secrets.

- **0.11.3.10 candidate (2026-10-27):** LAN/Online P2P hosts release failed WebRTC peers on readiness or match-start failure, keeping their room available for retry. Exact-head CI, Pages and real-device verification remain separate gates.

- **0.11.3.11 candidate (2026-10-27):** Host SDP answer processing is bounded to 25 seconds after receipt; stale peers are released for retry and late failures ignored. New exact-head QA, Pages and physical two-device play are separate gates.
