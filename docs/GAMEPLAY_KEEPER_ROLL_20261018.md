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
