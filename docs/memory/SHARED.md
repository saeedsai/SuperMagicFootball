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
On **every Git commit**, preserve the About-only current dev candidate `0.11.4.24` (previous verified Pages release `0.11.4.23`) and its offline notes from `src/modules/release.js`. Do not display a remote GitHub `dev` SHA or version banner outside About. Immutable commit SHAs stay internal to GitHub Actions/history; hosted Pages byte comparison verifies actual deployed content. **Every player-facing game update must also update root `README.md` with the new four-part version in banner and heading, dated summary of shipped features/fixes, compatibility notes where relevant and live link. README/version mismatch blocks release.** Documentation-only commits do not bump the installed version. Follow [`docs/VERSIONING_POLICY.md`](../VERSIONING_POLICY.md).

## Shared risks and working decisions
- Other developer sessions should stop writing to the repository unless newly authorized; still reconcile any concurrent Git changes with the latest SHA. No force pushes or circumvented security checks.
- Old handovers and claims are audit evidence, not proof of completion or blocked ownership. Device tests and Pages deployment require independent verification.
- Do not invent FC27/player-source ratings or alter stored identity IDs without migration.

## Memory hygiene
Read only your own [registered checkpoint](AGENTS_INDEX.json) according to [memory protocol](README.md). Git history preserves older states. Never edit another chat's memory or store secrets.




- **0.11.4.3 dev candidate (2026-10-27):** WebRTC-first internet match with approved WSS relayed backup, shared host-authoritative gameplay protocol, bounded broker frames and automatic fallback. Render/main/Pages and live two-device certification pending.

- **0.11.4.4 dev candidate (2026-10-27):** Secure hosted signaling gets a 60-second cold-start watchdog; same-origin LAN retains 12 seconds. Timed-out hosted sockets still reconnect; no roster, control or save changes. Full CI, Pages/Render and physical two-device play pending.

- **0.11.4.5 dev candidate (2026-10-27):** Invalid explicit LAN/P2P signaling URL overrides fail closed instead of silently changing discovery scope; valid WSS and defaults unchanged. CI, Pages/Render and two-phone play unverified.

- **0.11.4.6 dev candidate (2026-10-27):** LAN/P2P short-lived signaling connections no longer reset exponential backoff; stable 30-second sessions reset retry delay. Four focused source tests passed locally; exact-head CI, Pages/Render and physical two-device gameplay remain unverified.

- **0.11.4.8 dev candidate (2026-10-27):** Approved internet relay buffers one early guest hello until host channel opens, tolerating a lost echo; focused two-peer regression added. Exact-head CI, Pages/Render and physical two-device acceptance pending.

- **0.11.4.9 dev candidate (2026-10-27):** Early approved internet relay hello requires matching session, build and opposite role, preventing stale frames from consuming the single pre-open handshake buffer. Focused regression added; exact-head CI, Pages, broker and two-client acceptance pending.

- **0.11.4.11 dev candidate (2026-10-27):** Approved relay now budgets the complete 24,000-byte broker JSON frame, including UTF-8, room ID and escaping. P2P-RELAY-08 tests both peer directions and corrects P2P-RELAY-04. Earlier P2P-RELAY-07 covers 4 KiB pre-open hello parsing. Exact-head CI, main/Pages and physical two-client play pending.

- **0.11.4.12 dev candidate (2026-10-27):** A validated pre-channel host hello survives signaling reorder; lost later echoes no longer strand the guest. P2P-RELAY-09 added. Exact-head CI, main/Pages and physical devices pending.

- **0.11.4.13 dev candidate (2026-10-27):** Approved relay rejects incompatible direct/foreign SDP for host and guest. P2P-RELAY-10 added; exact-head CI and real two-device play pending.

- **0.11.4.15 dev (2026-10-28):** LAN-073 resets host controls and frozen phase after RTC reconnect. CI/Pages/devices pending.

- **0.11.4.16 dev (2026-10-28):** LAN-074 clears frozen-phase guest Jump edge history; focused regression committed, exact-head CI/Pages/physical phones require verification.

- **0.11.4.18 dev (2026-10-28):** LAN-076 reports failed authoritative host snapshots as failed steps and retries frozen phase delivery. Focused regression added; exact-head CI, Pages bytes and physical devices remain independent gates.
\n- **0.11.4.20 dev candidate (2026-10-28):** LAN-078 requires an exact-frame input-packet send receipt before guest input cursor advances; malformed/missing receipts retry. Exact-head QA, Pages and physical two-device acceptance remain independent.\n
- **0.11.4.24 dev candidate (2026-10-28):** Player Studio Magic Tricks are Star/Superstar-only (legacy rating or positional OVR 91+); Gold 90 may keep/remove an existing legacy Trick but cannot equip/replace. Four controls, other equipment and saves unchanged. CI and Pages pending.
