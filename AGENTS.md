# SuperMagicFootball working instructions

## Mission and current source

Finish the current product backlog in `docs/MASTER_BACKLOG.md` through small, independently reviewable increments. Keep working through the ordered backlog until it is complete or the user changes direction. The active game source is the existing `dev` branch; use the current `origin/dev` head before editing. Do not create branches, force-push, bypass review/CI, or develop on `main`.

## Owner instruction: continuous autonomous development

The owner directs continuous work through every feature and acceptance item in the canonical plan. Never treat a two-hour heartbeat as the only work window: it is a check-up/resume signal, while development should proceed immediately from one unblocked item to the next during active work. Do not pause the overall goal between increments or because a scheduled check is in the future. Use parallel agents for independent scopes, assign disjoint files, and integrate their evidence into the single backlog. If one item needs owner art review, physical hardware, credentials, deployment access or another external gate, record the exact blocker and keep advancing independent work. Do not mark the plan complete until every planned item and required acceptance gate is actually resolved.

This is authorized coordinated multi-agent work, as explicitly requested by the owner. Parallel work is the default: assign as many independent, well-scoped tasks as the available runtime/account concurrency allows, and keep workers moving through successive unblocked backlog items. Do not impose a one-agent limit or wait for one scope to finish before starting unrelated scopes. There is no promise of unlimited simultaneous agents; when runtime capacity is full, continue the coordinator's own disjoint work and refill slots as workers finish. Assign each worker concrete ownership of files or a read-only audit, avoid concurrent edits to the same files, and coordinate candidates/dependencies before work begins. The task coordinator integrates shared files, validates the combined result, and resolves conflicts. Historical feature claims and old single-developer limits are not blockers. Do not read another agent's private memory or overwrite unrelated work.

**Latest owner steering (2 November 2026):** Prioritize a complete, fun, reliable game: gameplay, playable abilities/tricks, UI, and quality improvements to the player graphics/assets already in the game. Defer roster/team existence checks, player-name matching and stat tuning until core gameplay, visuals and UI are complete. Skip Concept Hero/Royal Concept team and all new concept-hero creation; the owner will handle that work manually. For graphics, work only on existing player assets and use the documented SuperMagicAssetStudio workflow. Preserve identities and saves; never claim visual approval without game-scale review and owner acceptance. If an item is blocked, continue an unblocked gameplay, existing-art or UI item.

Read this file, `docs/README.md`, `docs/MASTER_BACKLOG.md`, the relevant source/tests, and the applicable specialist contract before editing. `docs/history/` and dated handovers are evidence, not current status. `docs/VERSIONING_POLICY.md`, `src/modules/release.js`, `package.json`, and the root README are the version sources; current candidate is **0.12.81.24**. Update this reference with each player-facing candidate. Older `0.9.0.0` planning is superseded.

## Product invariants

- Preserve the 223 team and 2,676 player identities and ordering, squad ratios, six formations, four match actions, existing save compatibility, offline play, and keyboard, touch, and gamepad access.
- Keep gameplay mechanics and appearance work separate unless a backlog item requires both. New art must retain the existing renderer as a safe fallback until replacement assets pass the game-side gates.
- Treat external artwork and generated content as unapproved until provenance, technical checks, real-game visual review, and owner acceptance are recorded.
- Keep SuperMagicAssetStudio project files as authoring sources. The game consumes only explicitly exported assets and a validated manifest; do not assume Studio JSON is a game runtime format.
- For player graphics, follow `docs/GRAPHICS_AGENT_WORKFLOW.md` and the coverage matrix. The active fallback is exactly three modules per frame: one complete headless body image, bald face/head, and hair. Start each cut from that frame's complete source pose; never carry masks or geometry forward between poses as production cuts. Keep source coordinates and a hidden comparison reference. Reuse modules only after recorded source comparison and visual fit review. Reject isolated-limb pivot rigs after seam failure. Mark a view/frame complete only after source-fit, integrity, game integration, and human visual checks pass.
- Follow the current graphics sequence: finish front run frames, then front jump/tackle frames, then true neutral views, then expand actions to other views. Build from each complete source pose and keep its body/head/hair frame-specific unless a documented fit review proves reuse works. Symmetry does not imply automatic mirroring; check visible asymmetries first.

## Delivery and evidence

For each increment, write its acceptance criteria first, add or update focused regressions, preserve compatibility, and update the canonical backlog. Run the affected suites and the full project gates required by the relevant workflow. Graphics work requires actual Studio CLI/browser import or export plus game-browser screenshots; structural tests alone do not prove visual quality. Verify exact `dev` SHA, GitHub CI, protected promotion, Pages deployment, and hosted smoke separately. Physical-device claims require physical-device evidence.

On Windows, Python-backed Node wrappers accept `SMF_PYTHON` when Python is not registered as `py -3`; Linux defaults to `python3`.

The root README release/version data is a Mandatory README release gate: keep it aligned with the package, version policy, and release notes for player-facing changes.

Keep the installed four-part version in About only. Exact commit SHA and deployment checks remain internal release evidence.

Do not publish a version change for documentation-only work. For a player-facing change, follow `docs/VERSIONING_POLICY.md`, update release notes and root README together, and never claim release or deployment before the exact-head gates pass. Report tests and visual checks only when actually run.

## Current entry points

- Overall plan and single status ledger: `docs/MASTER_BACKLOG.md`
- Documentation index: `docs/README.md`
- Studio-backed art workflow: `docs/GRAPHICS_AGENT_WORKFLOW.md`
- Detailed modular-art technical contract: `docs/concept_character_pipeline/ASSET_RIG_AND_RENDERING_SPEC.md` and `ANIMATION_SPEC.md`
- Data validation and merge safeguards: `scripts/validate_data.py`, `scripts/parallel_data_merge.py`
- Release rules: `docs/VERSIONING_POLICY.md`
- Shared context: read `docs/memory/SHARED.md`; `docs/memory/README.md` explains the lean-memory protocol. Read only your own indexed checkpoint when applicable.
- Coordinated assignments and integration rules: `docs/agent_coordination/README.md`.
