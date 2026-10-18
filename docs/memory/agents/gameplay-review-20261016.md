# Gameplay / career feature chat checkpoint

**Agent ID:** `gameplay-review-20261016`  
**Updated:** 2026-10-18

## Mission

Improve playable gameplay and major game modes in small, exclusive, regression-backed `dev` batches. Preserve four controls, formations, exact player IDs, save format, art and other agents' changes.

## Current checkpoint

**Delivered UI-CAREER-BENCH-READINESS:** The Manager Career next-fixture opponent scout now shows **starting-six same-role reserve recommendations** for injured and below-60%-fit starters. Injuries take priority; only healthy unselected role-matched bench options are recommended, without duplicates; missing options are explicitly labelled. Advice only, no automatic substitutions, saved career or team plan writes. Escapes names, caps warnings to three, maintains 12-player identities.

**Source:** [`3319e264`](https://github.com/saeedsai/SuperMagicFootball/commit/3319e2648958abc6243ff32fafc2bcad1fe813f5); [11 new Node cases `853dcd13`](https://github.com/saeedsai/SuperMagicFootball/commit/853dcd13b49ee6e9a4bc65628a82ac62698a57cb), [browser acceptance `7cf85e15`](https://github.com/saeedsai/SuperMagicFootball/commit/7cf85e15572041c7b8351101eeb8aee2fd0e30f6). Test harness integration corrections [`9d437ed1`](https://github.com/saeedsai/SuperMagicFootball/commit/9d437ed172027c4cc2b1ac2f9851831a35b5101d), [`90cf1058`](https://github.com/saeedsai/SuperMagicFootball/commit/90cf1058bd73654f5241d911bfb28d0f84225a0c), [`c179b69f`](https://github.com/saeedsai/SuperMagicFootball/commit/c179b69fd5175df5fbbfefc4662da52b238fab98); [handover](../../CAREER_BENCH_READINESS_20261018.md), [roadmap](../../NEXT_MILESTONES.md).

Prior: two-human penalty goalkeeper controls, opponent scout and solo CPU score-aware halftime tactics already completed; retain their specialist reports.

## Next smallest action

Read current GitHub `dev`, active claims and **this file only**; never read/edit another chat's memory. [Modular QA #39106052005](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106052005) **283/283 Node PASS** including 11 new cases, About revision and previous scouting. [Full Census #39106016620](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106016620) completed **4/4 Node shards PASS; 84/85 browser PASS**: `career_bench_readiness_browser_qa.py` desktop/simulated touch **PASS 4.36s**. Sole fail unrelated keeper-roll `blocked:false` in [issue #38](https://github.com/saeedsai/SuperMagicFootball/issues/38), owned by another `gameplay-engine` agent. Later #39106045586 repeated this; newer #39106207590 was still running. Do not change another owner's engine/roll tests. [Pages #39105994538](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39105994538) SUCCESS at a GitHub-verified feature-descendant SHA. Physical Android/iOS and external live interactive click-through not certified.

Next feature only after locks: opt-in lineup substitution, first-touch/GK calibration, Android dribble double-tap #3, classic competition/PWA.

## Ownership and exclusions

Own `ui-controls` exclusive key `gameplay-review-20261018-gpt6-career-bench-r8` **release with handover**. Edited only `src/modules/ui.js`, new tests, prior same-chat scouting VM extractor and own specialist/roadmap/memory. Never touch active `gameplay-engine`, audio, art, data, another memory, shared QA, CI or service worker. About shows dynamic current `dev` SHA (distinct game bundle `0.8.25.32-integrated`).

## Evidence

[Run #39106052005](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106052005) Node green; [run #39106016620](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106016620) feature browser green; [issue #38](https://github.com/saeedsai/SuperMagicFootball/issues/38) independent full-census blocker.

## Cleanup

Checked current tracked source for generated/cache files; no safe stale files identified. Preserve historical QA/art provenance and keep this note below 4 KiB.
