# Shared project memory — SuperMagicFootball
**Updated:** 2026-10-28

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
On **every Git commit**, preserve the About-only current dev candidate `0.11.4.44` (previous verified Pages release `0.11.4.23`; `0.11.4.25` has green PR CI and is on main, but hosted byte certification is not established here) and its offline notes from `src/modules/release.js`. Do not display a remote GitHub `dev` SHA or version banner outside About. Immutable commit SHAs stay internal to GitHub Actions/history; hosted Pages byte comparison verifies actual deployed content. **Every player-facing game update must also update root `README.md` with the new four-part version in banner and heading, dated summary of shipped features/fixes, compatibility notes where relevant and live link. README/version mismatch blocks release.** Documentation-only commits do not bump the installed version. Follow [`docs/VERSIONING_POLICY.md`](../VERSIONING_POLICY.md).

## Shared risks and working decisions
- Other developer sessions should stop writing to the repository unless newly authorized; still reconcile any concurrent Git changes with the latest SHA. No force pushes or circumvented security checks.
- Old handovers and claims are audit evidence, not proof of completion or blocked ownership. Device tests and Pages deployment require independent verification.
- Do not invent FC27/player-source ratings or alter stored identity IDs without migration.

## Memory hygiene
Read only your own [registered checkpoint](AGENTS_INDEX.json) according to [memory protocol](README.md). Git history preserves older states. Never edit another chat's memory or store secrets.

## Recent release context
- **0.11.4.44 candidate** (2026-10-29): LAN-093 preserves host consent/negotiation status across duplicate registration acknowledgements; two-mode regression. Exact-head CI/Pages and physical acceptance pending.
- **0.11.4.42 candidate** (2026-10-28): LAN-091 protects the active Online P2P relay latch against replayed host approval. Focused regression added; CI and Pages pending.
- **0.11.4.41 candidate** (2026-10-28): LAN-090 guards host consent during negotiation/active play and live status against late broker errors. Focused LAN/Online P2P regression; exact-head CI, protected promotion and Pages acceptance pending.
- **0.11.4.40 candidate** (2026-10-28): LAN-089 guards started host matches against late broker guest-left/host-registered events; two-mode regression. Initial CI exposed stale source regex and shared memory over 6 KiB; fixed in follow-up. Exact-head QA, Pages and physical acceptance pending.
- **0.11.4.39 released** (2026-10-28): LAN-088 guards started guest matches against late host departure. Exact-head 4 Node + 4 Chromium and Modular QA green at ff3d3650; Render broker deployed LIVE via dep-dbh5amvlk1mc73f9mci0 at 20:05 UTC.
- **0.11.4.38 released** (2026-10-28): LAN-087 retains valid matching hosts from mixed-scope directory snapshots.
- **0.11.4.37 released** (2026-10-28): LAN-086 binds admission replies to room and request IDs.
- Older releases, test evidence and handovers are in `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md` and Git history. Physical two-device LAN/P2P acceptance remains open; Render commit auto-deploy drift still needs investigation.
