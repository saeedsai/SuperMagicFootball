# Gameplay: score-aware CPU tactics at halftime

**Date:** 17 October 2026  
**Feature:** `GAMEPLAY-CPU-HALFTIME-TACTICAL-RESPONSE`  
**Owner:** `gameplay-review-20261017-gpt6-cpu-halftime-r6`  
**Exclusive key:** `gameplay-engine`  
**Source:** `src/modules/engine.js` (`GameEngine.autoAdaptCpuHalftime()`; first-half clock transition)

## Gap and delivered feature

The solo CPU team could make an ordinary fatigue-driven halftime substitution but kept the same attack/defence approach whatever the score. This made opposing managers tactically static. This batch gives the CPU a **deterministic, role-preserving halftime tactical response**, once, using the existing game plans and validated `applyPlan` path.

| Half-time scoreboard (team 0 human, team 1 CPU) | CPU response |
|---|---|
| CPU trailing | Direct attack + High Press |
| CPU leading | Possession + Deep Block |
| Scores tied | Keep existing plan |
| Local two-player Versus | No automatic tactical management |
| Training mode | No change |
| Outside the actual first-half transition | No change |

The change runs **after** existing CPU substitutions and **before** the real halftime UI event. If a CPU plan already matches the correct attack/defence pair, it does nothing. Changes are performed through the same `applyPlan` validation as manual tactics and emit `cpuTacticalShift` with team, reason, chosen attack/defence and a score snapshot. The original `halftime` notification, team talks, stamina recovery, second-half kickoff, game score and all formations remain.

**Explicit exclusions:** neither human team's style nor any team's formation, lineup, roster, captain, set-piece roles or substitution quota is altered by this method. No additional controls/buttons, keeper/first-touch physics, AI difficulty settings, graphics, sounds, match data, browser storage, Career save format, or globally saved tactical presets changed. The ordinary single-player CPU does not gain reaction-time, shot-accuracy or stamina buffs.

## Source and acceptance

- `src/modules/engine.js` adds the bounded method and invokes it only at the existing real half transition.
- `tests/cpu_halftime_tactical_response.test.cjs` runs the **actual extracted engine method** in ten Node cases: trail/lead/tie, human Versus, training, stage/window guards, repeat/idempotence, already-correct plan, malformed score, no team/data mutation and actual source integration.
- `tests/cpu_halftime_tactical_response_browser_qa.py` enters real modular Quick Match and local Versus on desktop and simulated touch, advances through **the actual `GameEngine.update` half transition**, checks tactical behavior and preservation of score, stored team plans, 12-player squad IDs, four gameplay controls, role/formation/lineup/captain and successful second-half resume.
- Version policy: the About screen continues to fetch the newest GitHub `dev` SHA when opened; separate game bundle `0.8.25.32-integrated` deliberately remains unchanged. Run `tests/about_revision.test.cjs` and `tests/versioning_policy_contract.test.cjs`.

## Testing and CI checkpoint

Commands:

```sh
node --test tests/cpu_halftime_tactical_response.test.cjs tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs
node --test tests/*.test.cjs
python3 scripts/build.py
python3 tests/cpu_halftime_tactical_response_browser_qa.py
# GitHub: full Node preflight + 4 Node + 4 Chromium regression shards
```

Initial [Modular Game Dev QA #39025239552](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025239552) on source + browser test found **238/241 Node PASS, 3 FAIL**: two were unrelated concept-graphics contract expectations for a newly added C01 front collar/face prerequisite (under another active `graphics-renderer` owner), and one was an **incorrect test fixture created here**: the already-matched-plan example represented a leading CPU but used trailing styles. Corrected our case in [`6c89d15b`](https://github.com/saeedsai/SuperMagicFootball/commit/6c89d15be695701554767376a656c8760941b595). The separately owned graphics owner must reconcile its new layer/test expectations; do not edit another agent's art or tests.

**Do not assert complete green CI or desktop/touch acceptance until a corresponding workflow is observed.** The temporary unrelated art failure is not evidence of an engine crash. Record the latest integrated results and any outstanding browser shard in the own-agent checkpoint.

## Cleanup and documentation

Tracked game/source/QA art history is retained because it is referenced by ongoing independent graphics work; no cache, dist, local video or generated screenshots added. This feature touches only its claimed engine method, two new tests, this specialist handover, concise roadmap update and this chat's own memory. No bulk deletion or rebasing onto a stale `dev` base.

## Next five small iterations

1. Resolve the C01 source/test acceptance within the separate graphics claim; obtain all-green standard Node and 4+4 full regression, including real Quick Match CPU halftime desktop/touch cases.
2. Check goal-margin sensitivity and CPU tactic selection at high/low difficulty, formation combinations and goalkeeper substitutions without any saved-plan mutation.
3. Add modest in-match CPU tactical adaptation only at appropriate stoppages under a new engine claim; no hidden boosts and preserve human control.
4. Extend career coaching with healthy reserve suggestions and halftime scouting visibility under a separate UI claim.
5. Verify GitHub Pages after the exact accepted commit, real handset touch controls, offline PWA and original arcade parity; improve compatible graphics under the graphics owner.

## Integrated regression checkpoint (17 October 2026)

[Modular Game Dev QA #39025434117](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025434117), including the engine feature, new tests, specialist roadmap and memory checkpoint, completed **256/256 Node PASS, zero failures**. This includes the standard About `dev` revision contract. This supersedes the earlier 242/242 Node result and the initial unrelated C01 collar and own fixture transient failures.

[Full Regression Census #39025336514](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025336514) is on a **confirmed feature-descendant** source commit `b6408b7f5e`; preflight and **all four Node shards PASS**. The four Chromium shards were still **in progress at the last check**, so desktop/simulated-touch halftime gameplay and complete 4+4 acceptance must **not** be reported as certified until their per-script logs finish. An uncompleted later Pages deployment likewise cannot verify that the public PC/phone build includes this feature. The session's ordinary public web reader cannot open the public game, and physical Android/iOS hardware has not been tested.

The only early failure requiring this agent's change was its own inconsistent leading/trailing test expectation, corrected in `6c89d15b`; the C01 art team resolved its contract failures separately. No unowned test or gameplay source was edited.
