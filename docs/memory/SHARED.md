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
On **every Git commit**, preserve the About-only current dev candidate `0.11.4.33` (previous verified Pages release `0.11.4.23`; `0.11.4.25` has green PR CI and is on main, but hosted byte certification is not established here) and its offline notes from `src/modules/release.js`. Do not display a remote GitHub `dev` SHA or version banner outside About. Immutable commit SHAs stay internal to GitHub Actions/history; hosted Pages byte comparison verifies actual deployed content. **Every player-facing game update must also update root `README.md` with the new four-part version in banner and heading, dated summary of shipped features/fixes, compatibility notes where relevant and live link. README/version mismatch blocks release.** Documentation-only commits do not bump the installed version. Follow [`docs/VERSIONING_POLICY.md`](../VERSIONING_POLICY.md).

## Shared risks and working decisions
- Other developer sessions should stop writing to the repository unless newly authorized; still reconcile any concurrent Git changes with the latest SHA. No force pushes or circumvented security checks.
- Old handovers and claims are audit evidence, not proof of completion or blocked ownership. Device tests and Pages deployment require independent verification.
- Do not invent FC27/player-source ratings or alter stored identity IDs without migration.

## Memory hygiene
Read only your own [registered checkpoint](AGENTS_INDEX.json) according to [memory protocol](README.md). Git history preserves older states. Never edit another chat's memory or store secrets.

## Recent release context
- **0.11.4.33 candidate** (2026-10-28): LAN-082 recovers automatically when discovery room capacity is temporarily full. No gameplay, roster, graphics, controls or saves changed; exact-head CI and Pages remain gates.
- **0.11.4.31 candidate** (2026-10-28): Studio disables no-op Magic Trick save buttons and keeps valid equipment changes actionable. Focused regression; exact-head QA and Pages pending.
- **0.11.4.30 candidate** (2026-10-28): unchanged Magic Trick save and absent Trick removal no longer write Career or club roster. Focused test added; full CI and Pages pending.
- **0.11.4.29 candidate** (2026-10-28): Studio shows legacy rating, position OVR and remaining 91+ Magic Trick unlock points for outfield players. New focused regression; exact-head QA/Pages pending.
- **0.11.4.26 candidate** (2026-10-28): STUDIO-TRICK-PREVIEW-02 shows all eight Magic Tricks to outfield players as read-only previews when locked; selection cannot be saved until 91+, but legacy keep/remove remains. Four buttons and saves unchanged. CI, protected promotion and hosted Pages verification pending.
- **0.11.4.25** (2026-10-28): STUDIO-TRICK-HELP-01 preview activation guidance; PR #68 exact-head Full #40649528225 and Modular #40649528401 passed; dev/main synced at a7c671d80816d938cbd535b6023eb3f2e6cb26cc. Pages bytes not verified in this run.
- **0.11.4.23** (2026-10-28): LAN-081 host frozen-phase clock safeguard; main Full #40645171130 (4 Node/4 Chromium, hosted smoke) and Pages #40645170675 green. Physical two-phone QA remains pending.
- **0.11.4.24 candidate** (2026-10-28): STUDIO-STAR-01 reserves new Magic Trick equipment for Star/Superstar outfield players with legacy rating or positional OVR 91+; Gold 90 can keep/remove an existing legacy Trick but cannot equip/replace. Super Shot/Defence rules, controls and saves unchanged. Exact-head CI and Pages pending.
- Full historical feature and release records remain in `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md` and Git history.
