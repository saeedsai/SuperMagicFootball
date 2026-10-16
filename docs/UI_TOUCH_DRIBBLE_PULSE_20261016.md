# Touch DRIBBLE rapid re-press input reliability — small UI-controls gameplay batch

**Date:** 2026-10-16  
**Feature ID:** `UI-TOUCH-DRIBBLE-PULSE-RELIABILITY`  
**Owner:** `ui-touch-rainbow-20261016-gpt6-chat11`  
**Exclusive lock:** `ui-controls`, verified live on `dev` before any implementation.  
**Base:** `06218cf3d2b6c34e93b6de2789da4689e57bd33e`  
**Reported issue:** [#3 — simulated Android rainbow-dribble double tap sometimes emits no trick](https://github.com/saeedsai/SuperMagicFootball/issues/3).

## User-facing mechanic improvement

In the four-action input system, a mobile player can release DRIBBLE and press it again entirely between two simulation/input polls. Previously the next poll still saw DRIBBLE as held from the previous poll, so its edge detector suppressed the second distinct `just('dribble')`. This is particularly visible in fast dribble combos/double taps on touchscreens when frame delivery is irregular.

**Fix:** `src/modules/input.js` now recognizes an actual DRIBBLE `pointerup` followed by a new `pointerdown` when both happened before the next poll and the new finger is still held. It sets **one new press edge** despite the previous frame's held state. Completed taps still follow the pre-existing bounded pulse queue. A continuously held touch or two fingers concurrently holding one button do **not** generate extra actions.

This is a narrowly scoped human-input reliability improvement, not a rebalance of dribble success probabilities or cooldowns. It does not change match AI, physics, player abilities, pass/shoot/jump controls, four-button layout, formations, team/roster IDs, graphics, saved settings, game menus, or network requests.

## Changes and test inventory

| Path | Change |
|---|---|
| `src/modules/input.js` | Distinguish actual rapid DRIBBLE release+repress from uninterrupted hold on player-one mobile touch |
| `tests/touch_dribble_pulse.test.cjs` | Four deterministic tests: release/re-press across a frame; double completed taps queued; two simultaneous fingers sharing DRIBBLE; touch cancellation/restart |
| `tests/touch_dribble_pulse_browser_qa.py` | Real Playwright Chromium keyboard and Android-emulated CDP touch input; explicitly poll in the frame gap and check four buttons and page errors |
| This document | Scope, exact-code tests, known gaps and next five work batches |

No source/runtime data or assets removed. Temporary generated fixture/screenshot artifacts stay ignored; historical tests and reference art remain valuable to other agents.

## Regression acceptance and exact-source results

- [Input source commit `0cd7d0a8`](https://github.com/saeedsai/SuperMagicFootball/commit/0cd7d0a8d61c19fae6db93b907d1f7ca14306341)
- [Four Node touch contracts `62c9790c`](https://github.com/saeedsai/SuperMagicFootball/commit/62c9790c7c2383dcbc2809b9625065a9293b3a52)
- [Chromium keyboard/mobile integration script `e4a63e41`](https://github.com/saeedsai/SuperMagicFootball/commit/e4a63e41c56e0b009846fb6696bf295b02e2bff5)

**Confirmed GitHub Actions checks:**

| Check | Status |
|---|---|
| Modular Game Dev QA [run #38904229679](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38904229679) at `e4a63e41` | **PASS** — 125/125 active Node tests; 20 Python merge tests; 10 claim protocol tests; club/JSON/fixture/Python compile validations |
| New deterministic touch edge tests | **4/4 PASS** as part of the above 125 |
| `tests/touch_dribble_pulse_browser_qa.py` execution in full Chromium census | **NOT YET VERIFIED** — workflow trigger path list omits `src/modules/input.js` and these new tests |
| Physical Android/iOS touch and high-latency browser rendering | **NOT TESTED** — Chromium simulated Android is not physical-device certification |
| Live Pages rendering of this exact `dev` source | **NOT YET VERIFIED** — Pages deployment and public interactive smoke are separate gates |

**Important:** [Issue #3](https://github.com/saeedsai/SuperMagicFootball/issues/3) is **not closed** solely on passing input-edge unit tests. The original rainbow trick event can still be affected by real match possession, defenders, gameplay cooldowns or an emulated-browser timing race. Check its `dribble_styles_browser_qa.py` alongside the new input suite on one complete exact-code census before closing; seek separate `gameplay-engine` ownership if the remaining failure is in the engine.

The `Full Regression Census` GitHub workflow currently has a narrowly enumerated push path filter that excludes `src/modules/input.js` and new generic touch tests. Do **not** alter that workflow while the separate `release-infra` lock is active. A release owner should add these paths later, or a concurrent eligible commit can provide a valid integrated full-census run. Never treat Modular QA or Pages publication as an eight-shard pass.

## Reproduce

```sh
node --test tests/touch_dribble_pulse.test.cjs
node --test tests/*.test.cjs
python3 scripts/validate_data.py
python3 scripts/build.py
python3 tests/touch_dribble_pulse_browser_qa.py
python3 tests/dribble_styles_browser_qa.py
```

For full historical coverage use the [Full Regression Census](https://github.com/saeedsai/SuperMagicFootball/actions/workflows/full-regression-census.yml), 4 Node + 4 Chromium shards, compare all artifacts by commit SHA and audit completeness with `tests/audit_regression_shards.py`. Repeat real desktop/simulated-touch public Pages Quick Match checks only after Pages deployment.

## Remaining gaps and next five small iterations

1. **Exact browser regression / close #3 when proven:** run existing rainbow-dribble and new touch edge suites in desktop and emulated Android three times; distinguish input dispatch from loss of ball possession; add the touch paths to full-census CI under released `release-infra` ownership.
2. **Goalkeeper match fairness:** review seeded live-AI near-corner, fatigue and zigzag Super Shot cohorts; pursue an actual mechanical adjustment only with measurements and an available `gameplay-engine` claim.
3. **Passing / first-touch:** add direction-safe first-touch, receiving and pass follow-through game animation under a `graphics-renderer` claim, with fallback and frame-rate regression.
4. **Tactics / coaching:** improve one bounded tactical decision / safe substitution mechanic or halftime feedback under `ui-controls` (and `gameplay-engine` if changing gameplay rules), preserving saved teams and four buttons.
5. **Device and delivery:** verify real-phone touch double taps, desktop keyboard/gamepad parity, offline/PWA restart save persistence and Pages deployed SHA; preserve ongoing FC27 metadata validation under per-team locks.

**Handover:** this was exclusively an input-layer patch under `ui-controls`, with an independent `gameplay-engine` specialist active concurrently. The immediate next step is the exact-current-source Chromium reproduction and issue #3 triage; do not change dribble physics through this claim. Release the claim after the docs/CI checkpoint is committed and verified.

## Exact descendant full-regression checkpoint and open defect

An independent graphics-agent commit triggered the enumerated [Full Regression Census #38904271767](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38904271767) on descendant SHA `22b67de184327bac6ef82b1a82b8b9043dbd8f85`. GitHub commit comparison verified this descends from the actual input/browser-test source `e4a63e41` with only unrelated graphic-reference test/doc changes.

**Verified actual browser acceptance:** `touch_dribble_pulse_browser_qa.py` **PASS** on Chromium browser shard 2 (4.70 seconds), including genuine Android CDP press/release/repress between explicit polls and desktop keyboard edges. The original `dribble_styles_browser_qa.py` in browser shard 3, however, **FAILS on simulated Android**, with `{'events': [], 'cooldown': 0, 'style': None, 'ballOwner': False, 'buttons': 4}` at line 29. The desktop branch passed. This is the same pre-existing open [issue #3](https://github.com/saeedsai/SuperMagicFootball/issues/3) and demonstrates that **the targeted input edge fix does not by itself resolve the complete live match rainbow-dribble regression**.

Four Node historical shards **PASS 120/120 scripts** (30 each). Chromium shards 0 and 2 **PASS 16/16 each**, shard 3 **15 PASS / 1 FAIL**, and shard 1 was still in progress at this documentation checkpoint. The overall regression cannot be marked green. Read its final exact-source run and failed job log for the remaining browser total before closing acceptance.

The failing test loses ball ownership during a pressured live match; whether that is a gameplay possession/timing race, missed engine action, or test setup variability is **not yet established**. Changing `src/modules/engine.js`, dribble skill odds or goalkeeper/AI movement requires a separately acquired `gameplay-engine` claim, currently held by another agent. Do not silence the failing assertion, artificially force success or close issue #3.

GitHub Pages [deployment #38903978245](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38903978245) **SUCCESS** for exact input-source commit `0cd7d0a8`, but a deployment job is not interactive hosted or physical-phone certification. The public game link remains https://saeedsai.github.io/SuperMagicFootball/; direct page access was unavailable through this session.

**Next handover action:** reproduce issue #3 with trace of per-frame `controlled[0]`, `input.just(0,'dribble')`, `ball.owner`, `p.cd`, `p.trickCd`, defender distance and first dribble event in both platforms; distinguish valid ball loss from missing input. A gameplay owner can then decide if actual mechanic needs protection against premature control loss or if the existing test setup is nondeterministic. Preserve this input-layer reliability improvement and its new passing Chromium test.
