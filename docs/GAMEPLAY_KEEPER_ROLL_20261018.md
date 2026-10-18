# GAMEPLAY-KEEPER-QUICK-ROLL — Controlled goalkeeper low roll

**Date:** 18 October 2026. **Owner:** `gameplay-keeper-roll-20261018-gpt6-chatpk-r8`. **Claim:** `docs/agent_coordination/claims/gameplay-engine.json`. **Base:** `82d51013d7ba033ec77aae0a60616365bd6df825` on latest `dev` when claimed.

## What players can do now

When a human-controlled team goalkeeper **holds a collected ball**, press the existing **DRIBBLE** button to roll it along the ground toward the nearest **open, short-range, forward teammate**. The goalkeeper checks the live defensive passing corridor before releasing. This adds a deliberate back-line build-out alternative to the existing **PASS = keeper throw** and **SHOOT = long punt**; it does not add a fifth action button or change player remapping.

- Validity: only `matchState === 'play'`, `ball.owner === keeper`, keeper not stunned, controlling human team. Local Versus supports **both home and away** sides; CPU goalkeeper routines are unchanged.
- Target: on-field teammate, not stunned or airborne, at least 120 world units away, under 920 away, advancing at least 70 world units toward the opposition goal. The existing `keeperPassingLane` must mark its interception corridor and receiving end clear. Prefer nearest clear target.
- Release: real `freeBall()` low pass at z=10, vz=0 and speed scaled by goalkeeper passing, with `ball.passTarget`, `ball.passTeam`, `passFrom` and a 1.25-second manual switch grace. Reuses the established keeper throw animation and emits real `keeperDistribution(mode:'roll')` and `passIntent(loft:'ground')` events. No additional sample/art assets.
- Unsafe lane: **no release, no fake success event, no ball loss**, and the existing goalkeeper can still use other distribution options. Outfield DRIBBLE stays the original skill action and its stats.
- No change to saves, score, penalty goalkeeper, catch/save contact, AI substitution/tactics, rosters, formations, controls, graphics, music, UI version, PWA or gameplay constants outside this mechanic.

## Committed files and reproducible tests

- [Source change `182ed739`](https://github.com/saeedsai/SuperMagicFootball/commit/182ed739097619a7c3aaacc68a0b4d57b7537741): `src/modules/engine.js` only — added bounded `rollKeeper(p)` and DRIBBLE dispatch conditional on team-owned keeper catch.
- [Nine source-derived Node contracts `0a84dd4f`](https://github.com/saeedsai/SuperMagicFootball/commit/0a84dd4f8fb0e70f5f6219e6345dde911919072a): `tests/keeper_roll_distribution.test.cjs` — mirror, target safety and exclusion, own ball, unsafe lane, ordinary dribble, original four command branches and AI auto-distribution contract.
- [Desktop/simulated-touch browser acceptance `cc872e22`](https://github.com/saeedsai/SuperMagicFootball/commit/cc872e2276e106ab8bbb2399d3647d1aa149f804): `tests/keeper_roll_distribution_browser_qa.py` — starts real local Versus from live production game UI, invokes real goalkeeper catch + dribble command for home and away, verifies safe target and blocked lane, four buttons, team/roster IDs and score unchanged. [Scoped team-identity assertion correction `b97b07f8`](https://github.com/saeedsai/SuperMagicFootball/commit/b97b07f856080545db4269ee4c7b45014387689c).
- This specialist handover and **only this chat's own** `docs/memory/agents/gameplay-pk-20261016.md`.

```sh
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/keeper_roll_distribution.test.cjs
node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs
node --test tests/*.test.cjs
python3 tests/keeper_roll_distribution_browser_qa.py
python3 tests/penalty_keeper_control_browser_qa.py
```

## Honest test status / blockers

The [first feature-containing Modular QA run #39105885635](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39105885635) ran **277 active Node tests: 264 PASS / 13 FAIL**, **all nine keeper-roll tests PASS**. The failures are in *other actively owned scopes*: eleven Career bench-advice Node assertions and the separate `tests/career_opponent_scout.test.cjs` syntax error (`Unexpected token 'function'`) under `ui-controls`, plus one graphics renderer test `new face paints below hair only after safe image loading` under `graphics-renderer`. This is **not** a green overall QA claim; do not change those tests or their owners' files. Historical [.github 4+4 census #39105885618](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39105885618) stopped on preflight failure and cannot certify new Chromium acceptance. Later source runs and their outcome should supersede this checkpoint only when observed.

The browser test source was committed, **but its real Chromium execution remained unverified at the checkpoint** because the full regression is preflight-gated by the separate UI/graphics failures. It does not prove actual phone audio or real hardware. Do not weaken production safety checks or create a fake passing test to clear unrelated regressions. The original keeper distribution, catch and two-human PK browser scripts remain in history.

## Version, Pages, cleanup and ongoing gaps

About already retrieves a unique current GitHub `dev` SHA whenever Credits/About is opened, independent of bundled semantic version. This is the required per-commit development identifier; it is **not** the currently deployed Pages asset revision. Game URL: https://saeedsai.github.io/SuperMagicFootball/ . A green Pages workflow confirms static file publication, **not** actual current desktop/mobile UI interaction or physical hardware. Avoid claiming hosted keeper-roll browser pass until the real script passes.

No old/template files were deleted: the historical tests, editable graphics, source provenance records and legacy engine review documents are still relevant or have active owners. No save schema, assets, scripts or CI config were changed outside the feature scope.

## Five next bounded iterations

1. **P0:** UI owner repair `career_opponent_scout.test.cjs` extraction and Career bench QA assertions, graphics owner finish face-paint test; rerun exact-source Modular QA and all 4×Node/4×Chromium shards, including keeper-roll browser script. Preserve green About tests.
2. **P0:** Confirm public Pages source-containing deploy and actual desktop/simulated-touch keeper quick roll (both sides, blocked routes and standard GK long punt), then physical devices.
3. **P0:** Reproduce the intermittent [Android rapid rainbow-dribble issue #3](https://github.com/saeedsai/SuperMagicFootball/issues/3) under separate gameplay/input ownership using realistic possession; resolve only when event traces identify cause.
4. **P1:** Verify two-human [penalty keeper issue #5](https://github.com/saeedsai/SuperMagicFootball/issues/5) and pressure-aware first touch across 30/60/120fps, keeper fairness and CPU halftime tactics with seeded balance cohorts.
5. **P1:** One bounded Career/tactics feature, graphics keeper release/first-touch pose, About **deployed** SHA and offline PWA sound/cache with their respective ownership claims; preserve stable saves and all four buttons.

**Coordination:** This owned slice can be released after the source, tests, report and small own-memory checkpoint are all written. Never edit other agents' active claims, shared roadmap or memory. Mark full regression failure as an integration blocker, not a defect conclusively attributed to keeper roll.

## Green integrated source acceptance (supersedes historical red QA in preceding section)

The unrelated Career and graphics validation failures from the initial commit were corrected by their owners. On source-containing commit `a32ce9ccb9314b02ffcaf4b76c1335fda802beae`, [**Modular Game Dev QA #39106042725**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106042725) completed **SUCCESS — 283/283 active Node PASS, zero failures**, all nine `keeper_roll_distribution.test.cjs` cases green, 20 Python merge contracts PASS, 10 ownership/claim contracts PASS and source validation/roster/fixture compilation passed. Existing About/versioning contract tests are included in the full Node gate. This supersedes the earlier 264/277 red snapshot but does **not** retroactively make that original run green.

[Full 4×Node + 4×Chromium Census #39106016620](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106016620) on containing source SHA `c179b69fd5175df5fbbfefc4662da52b238fab98` passed **preflight and all four Node shards**. At this checkpoint its four browser shards were still running. Full Chromium browser QA and exact target script `keeper_roll_distribution_browser_qa.py` must be read from actual final CI logs before claiming end-to-end acceptance. Other newer descendant censuses may be cancelled by continuous GitHub concurrent pushes; prefer the oldest source-containing run that completes for a reliable regression signal.

The source change is deployed only when a verified Pages workflow on a descendant SHA completes. The historical public Pages URL is linked above; do not confuse GitHub's successful static upload with actual device gameplay/gesture acceptance.

## Focused Chromium regression triage — keeper-roll browser setup

[Full Regression Census #39106016620](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106016620) on SHA `c179b69fd5175df5fbbfefc4662da52b238fab98` completed **FAILURE**, with preflight and **all 4 historical Node shards PASS** and **3 of 4 Chromium shards PASS**. Browser shard 1 passed 20 scripts and failed only `keeper_roll_distribution_browser_qa.py` (2.80s). In the real Versus browser, **the home safe quick roll passed** (target ID and ground pass were correct). The test's follow-up blocked-lane assertion failed, reporting `blocked:false` without individual lane/possession diagnostics. This was a new-test failure and **does not prove a production blocked-lane bug**: the original test only moved one possibly stunned defender. Other 84 Chromium scripts passed (22+21+20+21 = 84), so the aggregate was **84/85 script PASS**.

Scoped follow-up [browser test fix `df22a6eb`](https://github.com/saeedsai/SuperMagicFootball/commit/df22a6eb520a834369ed29edb975fb885d522dfe) marks **all real opponent outfield players active and positioned along the blocked corridor** and records `keeperPassingLane.clear`, actual catch ownership and emitted event names. It still fails the acceptance if a pass is released or a phantom action occurs, instead of hiding failures. [Engine comment-only `4bfa93b3`](https://github.com/saeedsai/SuperMagicFootball/commit/4bfa93b3b6cbeb8e2f64a46e61f4d4f93a41399e) documents the fail-closed mechanic and triggers a new complete census because the `release-infra` claim is held by a graphics agent and cannot be edited to add this standalone browser file to workflow push filters. **The engine algorithm was not changed** by this comment.

[New full regression #39106391207](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106391207) was queued at this evidence checkpoint. This report does not call the updated real-browser script green until its logs confirm so. Modular QA [#39106348188](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106348188) on the updated browser-test SHA completed **SUCCESS**. All nine keeper-roll unit tests remain green.

## Hosted PC/touch smoke on feature-containing source

[Verify Deployed PC and Touch Game #39106391162](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106391162) completed **SUCCESS** against the production GitHub Pages URL, source-trigger revision `4bfa93b3b6cbeb8e2f64a46e61f4d4f93a41399e`. This validates actual desktop and emulated-touch loading, menu navigation, team selection and Quick Match kickoff; the smoke does **not** press the new goalkeeper DRIBBLE route. [Pages build/deploy #39105994538](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39105994538) completed **SUCCESS** on containing SHA `d1187f8ec5207f9138a5d4cabd2584e1a75a0384`. Commit ancestry verifies it includes source `182ed739`; its static deployment does **not** establish exact asset version or physical device behavior. Direct external website fetch in this session was unavailable.

The corrected exact source [full regression #39106391207](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106391207) passed **preflight and four Node shards**, but all four Chromium shards remained **in progress** at the final ownership handover checkpoint. Do not use the green hosted smoke alone to close this browser regression. The previous failed full regression and its explicit blocked-lane diagnostic remain linked above.

## Corrected browser acceptance now verified

On the exact corrected-source [Full Regression Census #39106391207](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106391207), **the new `keeper_roll_distribution_browser_qa.py` itself PASSED in Chromium shard 1 (3.46s)**. Shard 1 **21 PASS, 0 FAIL**; other completed browser shards 2 and 3 **21 PASS each**, Node shards 0–3 **37 PASS each (148/148 total)** and preflight PASS. At this handover checkpoint Chromium shard 0 was **still in progress**; a completed green 4+4 aggregate cannot yet be asserted. The original failed first browser test is superseded for this feature-specific acceptance by the corrected pass. No production mechanics were loosened to achieve the result.

[Targeted Node / source QA #39106042725](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106042725) remains **283/283 active Node PASS** and includes all nine goalkeeper-roll contracts. [Hosted desktop/touch #39106391162](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39106391162) also remains green; it covers public site kickoff rather than goalkeeper DRIBBLE.
