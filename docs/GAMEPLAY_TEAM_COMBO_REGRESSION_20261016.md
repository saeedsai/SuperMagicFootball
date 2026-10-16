# GAMEPLAY-TEAM-COMBO-REGRESSION — Four-button browser regression checkpoint

Date: 16 October 2026. Owner: `gameplay-teamcombo-20261016-1430-gpt6`. Exclusive lock: `gameplay-engine`.

## Intent and baseline

We reviewed current `AGENTS.md`, `docs/agent_coordination/README.md`, all live claims and the current `dev` HEAD before reserving this small task. Base before claiming: `955bfbefee06cfee465ceb0f922bfe8e97de2917`.

The [Full Regression Census #38899003690](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38899003690) on prior SHA `a85530023a4883fb751c44b466ebcf6f5522d10d` ran preflight and all Node shards, but failed Chromium browser shard 2 on `team_combos_browser_qa.py` with `noLaunch:false`, `cross:false`, `kicks:0`. Chromium shard 3 independently failed to install the runner's Ubuntu Chromium package. The latter is an external CI/environment issue under `release-infra`, not a game-code regression, and this agent has not edited its workflow.

## Small scoped fix — stable, independent browser test sequences

Updated only `tests/team_combos_browser_qa.py`. The historical test combined two input-order sequences on one mutable player/ball/controller state. It did not clear persisted `jumpTapPending`, `queuedPass`, held action state, or accumulated events between cases, so a failure could not distinguish stale test setup from a real four-button problem.

The updated script starts an independent match and explicit human control for **each of three actionable sequences**:

1. **Simultaneous Pass+Jump:** does not trigger obsolete human teammate `teamLaunch`, does not create an unwanted kick, and retains ball possession before release.
2. **Pass first, then Jump:** cannot create an aerial cross; releasing Pass creates exactly one ordinary pass.
3. **Jump tap, release to become airborne, then Pass:** triggers exactly one lofted `cross` (ball vertical speed at least 240), and zero teammate launches.

Each case clears game events, controller edges, pending pass/jump state, player cooldown/stun, and isolates competing players. Failure messages include player/ball ownership, action, airborne height, launch/kick counters, pass-intent loft, controller and input data, making a real regression actionable. Each device context (desktop 1280x720 and simulated touch 844x390) runs all three cases; neither changes gameplay code or saves. The test remains automatically discovered in the historical Chromium census. The six formations, four action buttons, keeper logic, physics, IDs and JSON assets remain unchanged.

**Do not describe this QA test stabilization as an implemented game mechanic or as proof that the browser defect is resolved until the exact new Chromium script passes.** We intentionally made no unmeasured adjustments to gameplay formulas.

## Exact-code QA evidence

| Check | Result |
|---|---|
| New source/test checkpoint | [Commit `78b48056`](https://github.com/saeedsai/SuperMagicFootball/commit/78b48056e25108d1039cb4aeca326bfcd5935187) |
| Modular Game Dev QA on that SHA | [Run #38900429410](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429410) **SUCCESS**: 104/104 active Node tests; 17/17 Python parallel merge tests; 8/8 feature-claim tests; data, 165-club roster, fixture build and Python syntax checks passed |
| Full historical 4×Node + 4×Chromium census | [Run #38900429370](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429370) triggered for exact SHA; **PENDING** at checkpoint; no passed Chromium assertion claimed |
| Local full test suite | Not executed locally: public git clone unavailable in this container; exact-code GitHub Actions above is authoritative |
| Public game / Pages deployment | https://saeedsai.github.io/SuperMagicFootball/ — production URL; live site web retrieval was not available from this session. Latest prior [hosted desktop + simulated-touch interactive verification #38891468528](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) passed on an earlier SHA, **not this exact release**. GitHub Pages deployment and physical-device playability on the current commit remain unverified |

### Integration guard and failure follow-up

Only the named test file changed; gameplay `src/modules/engine.js`, shared UI, graphics/art, roster shards, release/CI workflows, service worker, source/fixture build, and QA runner were untouched. Existing archived evidence/scripts must be retained: no tracked scratch, backup or template file was proved safe to delete under this ownership. Transient `play.html`, `tests/.generated/`, `__pycache__/`, and browser screenshots are already covered by `.gitignore`.

If the pending census fails **this exact test**: inspect the new full state snapshot first; claim a new bounded `gameplay-engine` batch before changing actual controls, or release this claim with a failure handover. A failure during Chromium package install or an unrelated graphics/UI browser test is an owner-specific issue, not permission to edit the other group's files.

## Remaining gaps and next five iterations

1. **Regression certification:** inspect all 8 shards on one exact integration SHA, rerun any failed or cancelled job and independently audit the shard manifests. Resolve actual Pass/Jump gameplay defects only if the isolated test still reproduces them.
2. **Goalkeeper outcome fairness:** run authentic seeded AI-vs-AI normal/Super shots across both goal directions and fatigue bands, with the existing shot-level telemetry; adjust physical keeper movement only after mirrored goal/corner evidence.
3. **Illustrated keeper glove/release animation:** finish eight-direction grip, catch, held-ball and distribution poses under `graphics-renderer` ownership.
4. **Reception, passes and data provenance:** refine directional first touch/follow-through in a separately claimed graphics batch; independently extend ID-aware roster/graphics source conflict review.
5. **Halftime and squad usability:** complete read-only substitution/fatigue/tactical advice under UI ownership and prove save-key compatibility.

Long-term/open: full classic-mode parity and original character likeness, physical Android/iOS and PWA/offline/process-restart certification, complete FC27 world source validation, Super Defense/Tricks and multiplayer.

**Handover:** read the exact linked full census results when its queue clears. Preserve other agents' active claims. Do not modify the shared `docs/NEXT_MILESTONES.md` during the separately active `ui-controls` documentation claim; this bounded feature record contains the current next-five plan instead.

## Latest regression checkpoint (same exact source SHA)

At release checkpoint, [Full Regression Census #38900429370](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429370) on `78b48056e25108d1039cb4aeca326bfcd5935187` had completed its preflight and **all four Node shards green: 113/113 script executions PASS** (29 + 28 + 28 + 28, zero FAIL/TIMEOUT/ERROR/NOT_RUN). All **four Chromium shards were still in progress**; the new 3-sequence browser test was *not yet proven to pass*. It is necessary for the next agent to inspect those exact browser shard logs, resolve or document the result, and then run the [cross-shard artifact auditor](../tests/audit_regression_shards.py). The fully passing prior [Full Regression Census #38899003690](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38899003690) finished after reruns and refers to an earlier commit, so is a historic baseline only.

The same test-only change does not modify hosted gameplay. Direct public Pages retrieval was unavailable through the session; do not equate success of a repository push with physical phone or real hosted interaction. The active GitHub ownership lock must be released as a checkpoint to allow another gameplay developer to proceed without accidental scope conflicts.

## Final completed exact-code regression certification

**Status: PASS for implemented source commit `78b48056e25108d1039cb4aeca326bfcd5935187`.** [Full Regression Census run #38900429370](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429370) completed **SUCCESS** across all nine GitHub jobs (preflight, four Node shards, four Chromium shards).

| Executed suite | Script PASS | FAIL | TIMEOUT | NOT_RUN |
|---|---:|---:|---:|---:|
| Node shards (29 + 28 + 28 + 28) | **113** | 0 | 0 | 0 |
| Chromium shards (16 + 16 + 15 + 15) | **62** | 0 | 0 | 0 |
| **Combined script-level census** | **175** | **0** | **0** | **0** |

The affected `tests/team_combos_browser_qa.py` **PASS** in [Chromium shard 0 log](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429370) (4.54 seconds). It ran all isolated Pass+Jump input-order sequences against the generated portable browser game; there were no Python assertion failures. The associated legacy `combo_priority_browser_qa.py` and AI-only combo scripts also passed. This closes the **reproduced browser-test failure** at the exact source revision without changing game physics, input mappings, team/player data, or UI.

The matching [Modular QA #38900429410](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38900429410) completed **SUCCESS** on the same source SHA: **104/104 active Node**, **17 Python merge contracts** and **8 claim tests**; data, roster, build and syntax checks passed.

The earlier sections were written while Chromium jobs were running. This **final exact-SHA gate supersedes their pending status**. Later commits from concurrent agents are distinct revisions and require their own full acceptance before release claims are inherited.

### Deployment / device verification still separate

The production URL remains https://saeedsai.github.io/SuperMagicFootball/ . The Pages build/deployment system has successful runs for intervening `dev` commits, and earlier hosted desktop/simulated-touch interactive Quick Match smoke passed ([run #38891468528](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528)), but no **fresh, exact-commit live interactive** smoke was established for `78b48056` because the public Pages URL could not be opened from this session. Physical Android/iOS, offline/restart persistence, PWA install, graphics frame fidelity on hardware and multiplayer remain NOT TESTED. Do not convert a passing CI suite into claims of physical-device certification.

**Ownership release:** the narrow original gameplay QA claim was released with checkpoint commit `e67f1086`. A separate, docs-only final-certification claim added these passing CI details; release that second lock immediately after verification. No historical tests or old assets were deleted: their references and future regression value remain relevant.
