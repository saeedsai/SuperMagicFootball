# Shared project memory — SuperMagicFootball

**Updated:** 2026-10-16
**Use:** compact context for **all** agents; details and current-state truth live in linked repo files. Do not store per-agent chat histories here.

## Stable project facts

- Browser-playable, modular SuperMagicFootball served from `index.html` with `src/`, `data/` and `style.css`; avoid recreating the game or altering unrelated code. See [root README](../../README.md).
- Protect team/player identity and order, team formations, 2 GK / 3 DF / 4 MF / 3 FW squad distribution, four action buttons, save compatibility, modular artwork and existing offline assets; source of truth is [AGENTS.md](../../AGENTS.md).
- Work in small batches against the **latest GitHub `dev`**. Run targeted and regression tests; preserve concurrent changes; no force push.

## Coordination and sources of truth

- **Start gate and locks:** [coordination protocol](../agent_coordination/README.md), [live claims](../agent_coordination/claims/) and [feature registry](../agent_coordination/FEATURE_REGISTRY.json). A claim may be active even if an older memory says otherwise. Never infer current owner from this file.
- **Product roadmap:** [next milestones](../NEXT_MILESTONES.md), [development priorities](../DEVELOPMENT_PLAN_AND_PRIORITIES.md) and [requirements review](../REQUIREMENTS_REVIEW_20261016.md).
- **Graphics:** [concept character handover](../concept_character_pipeline/NEXT_CHAT_HANDOVER.md) and its progress tracker.
- **Player data:** [club roster batch plan](../CLUB_ROSTER_BATCH_PLAN_20261016.md), [batch ledger](../CLUB_ROSTER_BATCH_LEDGER_20261016.json), [parallel merge guide](../PARALLEL_DATA_MERGE_GUIDE.md).
- **QA/releases:** [QA release record](../QA_RELEASE_v082534_20261016.md), current GitHub Actions, and [hosted play instructions](../../GITHUB_PAGES_SETUP.md).
- **Documentation map:** [docs index](../README.md); [historical-file policy](../ARCHIVE_AND_ACTIVE_FILES.md).

## Mandatory About version rule

**Every Git commit has a unique About-menu development revision:** every agent must retain and verify the per-visit GitHub `dev` commit SHA under **Credits / About**, alongside the stable game-bundle release version. Commit SHA is the per-commit revision, not proof that the same code is live on Pages; never overwrite another agent's UI scope just to bump a string. Before publishing, run the [version policy QA](../VERSIONING_POLICY.md), check the live commit SHA, and report it in the handover.

## Shared risks and working decisions

- Many independent chats write to `dev`; an absent lock or a stale checkpoint does not prove a feature is unowned. Respect exact team IDs and shared-file ownership; reconcile the head before pushing.
- Older versioned plans, massive QA catalogs, screenshots and telemetry remain audit artifacts; do not load all into conversation context or delete without reference checks.
- FC27 or live player information requires trustworthy source verification; do not invent ratings. Graphics work must preserve fallback behavior. Deployment evidence must cite an actual observed run.
- Agent memory is **cooperative isolation only** in this repository, not enforced read permissions or a replacement for ChatGPT-native memory. Never record credentials or sensitive data.

## Memory hygiene

Read this file plus **only your own** [registered checkpoint](AGENTS_INDEX.json) according to [memory protocol](README.md). Each agent revises its own small checkpoint and removes stale completed notes at the end of work; only project-context owner updates shared cross-agent facts. Git history preserves older states.
