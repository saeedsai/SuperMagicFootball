# UI-HALFTIME-FATIGUE-SPOTLIGHT — player-specific halftime fitness watch

**Date:** 16 October 2026  
**Owner:** `ui-halftime-fatigue-20261016-gpt6-session8` · **Exclusive claim:** `ui-controls`  
**Base before claim:** `fd76fcb2ddd0fe83566226d70c99b372d09b20ee`

## Delivered small requirement

The existing read-only halftime coaching notes now identify up to **two most exhausted on-field starters**, displaying their shirt numbers, names, natural roles and rounded fitness percentages. Additional tired starters produce a compact `+N more` hint. The watch is hidden if nobody crosses the existing **40% fitness / 60% fatigue** warning boundary. Both home and local two-player away teams use independently scoped, authoritative fatigue ledgers, not bench players or transient sprite animation values.

This is **advice only**. It does not choose substitutions, change tactics or talks, edit team data, advance the match, alter saves or remap buttons. Names, positions and shirt numbers from editable rosters are HTML-escaped before HTML insertion to protect the menu. The existing dedicated half-time coaching panel, accessibility labels, tab navigation, substitution advice, and approved six formations remain intact.

## Exact changed paths and acceptance

- `src/modules/ui.js`: isolated pure `halftimeFatigueSpotlight(game,side)`, rendered only inside `halftimeCoachPanel`.
- `tests/halftime_fatigue_spotlight.test.cjs`: 5 contracts for deterministic fatigue ordering, threshold, side isolation, escaping, bench exclusion, no mutations.
- `tests/halftime_fatigue_spotlight_browser_qa.py`: real modular Quick Match => halftime desktop and simulated touch, seeded fatigue, safe editable malicious-name HTML, unchanged team plans/stored keys/controls, no-warning case and resume.
- `docs/NEXT_MILESTONES.md`: bounded milestone and next-five handover.

**Required CI:** exact source Modular Game Dev QA, Full Regression Census (all four Node and four Chromium shards), Pages deployment and public desktop/simulated touch Quick Match smoke. Record the actual commit SHA, run links and results; do not assume passing earlier historical regressions automatically certify this source.

## Known limits / scope separation

The next unblocked task is to certify the latest regression result. National team source/testing full-census trigger omission is tracked separately in [issue #2](https://github.com/saeedsai/SuperMagicFootball/issues/2) and must be handled by the `release-infra` owner, not this batch. Concept graphics, QA tooling and roster identities have separate claim owners. Unused old files were not deleted because existing artwork, tests, archived QA results and provenance records may be referenced by other agents. Physical iOS/Android, Safari/Firefox, offline/PWA upgrade, original content parity, advanced modes and multiplayer remain deferred.

## Next five small iterations

1. Complete **exact-source** all-shard regression and hosted smoke after this new display, fixing only specifically reproduced within-scope faults.
2. Source-measure goalkeeper near-corner/ordinary/Super Shot fairness at mirrored directions and fatigue levels before engine tuning.
3. Finish keeper held-ball glove and release pose refinements inside an independent graphics claim.
4. Improve first-touch and directional pass-follow-through animation; separately audit provenance conflicts using its existing tooling owner.
5. Expand career squad guidance and half-time coaching accessibility without changing persistent schema or arcade action buttons.

## Integration and final handover

Implementation commit, test outcomes, hosted smoke and release metadata to be appended after CI. Claim must be released even for a partial handover.

## Integrated test report and current checkpoint — 16 October 2026

**Delivered implementation on GitHub `dev`:** [`b23eed0743ca5ed2f181e2ded23d92682e1b9513`](https://github.com/saeedsai/SuperMagicFootball/commit/b23eed0743ca5ed2f181e2ded23d92682e1b9513). This was rebased from the initial prepared commit after another agent advanced the branch, using an expected-head non-force ref update. The complete patch contains one isolated `src/modules/ui.js` helper, 5 new Node contracts, a desktop/emulated-touch Chromium acceptance, and roadmap/documentation. The feature remains present in subsequent shared `dev` commits.

**Passed, exact feature source:** [Modular Game Dev QA #38900390556](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900390556) on `b23eed07` **SUCCESS**: **104/104 active Node subtests passed**, 0 failed. All five new fatigue-spotlight contracts passed, including malicious-name escaping, current lineup/bench exclusion, team isolation, threshold and absence of game/save side effects; **17/17 Python merge** and **8/8 feature-claim protocol** tests passed. Modular fixture build and data preflight completed.

**Full census:** [#38900391708](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900391708) on `b23eed07` was **CANCELLED** by concurrent `dev` updates. No exact-source eight-shard full-regression green can be claimed. A later descendant [#38900429370](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429370) was **IN_PROGRESS** when this checkpoint was written; inspect all four Node and four Chromium shard results, especially `halftime_fatigue_spotlight_browser_qa.py`, to complete certification. The earlier baseline [171/171 full regression #38898721461](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38898721461) predates this feature.

**Hosted game:** recent descendant [Pages build/deployment #38900441679](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900441679) **SUCCESS**. [Live desktop/emulated-touch smoke #38891468528 (attempt 5)](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) was **running** at report time; prior attempts passed. The generic live check verifies menus, team selection, kickoff, active match and +20% field in desktop/touch Chromium, not physical mobile devices or this new halftime display specifically.

**Open integration gaps:** pending all-shard post-feature census, fresh hosted smoke and physical handset/browser/PWA restarts. The separate national-data workflow trigger issue [#2](https://github.com/saeedsai/SuperMagicFootball/issues/2) belongs to the **actively held release-infra** lock; concept graphics similarly has an active graphics/rendering claim. Do not alter these other owners' files or delete historical QA/artifacts.

**End-of-batch handover:** release the `ui-controls` claim under owner `ui-halftime-fatigue-20261016-gpt6-session8` with this document. Next chat begins by refreshing `AGENTS.md`, coordination registry and claims, then checks the newer Full Regression Census and only claims a further unfinished UI requirement if the lock is free.
