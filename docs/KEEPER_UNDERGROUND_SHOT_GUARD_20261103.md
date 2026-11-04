# Keeper Super Defence underground-shot guard — 3 November 2026

## Acceptance

An equipped goalkeeper's manual Jump+Shoot Super Defence must not intercept a transformed ball while its shot state marks it underground. Rejection must preserve the ball, cooldown, fatigue, and event stream. Above-ground activation remains covered by the existing keyboard, touch, and gamepad input-path checks.

## Change

The standalone and modular `keeperInReach` helpers now reject `ball.shot.underground`. Before the fix, an actual `GameEngine.requestKeeperSuper()` call succeeded for a buried Silver Carp, Dolphin, or Wave shot within the goalkeeper's horizontal reach; that let the manual keeper action bypass the special shot's subterranean evasion phase. The new real-engine regression covers both defending teams and all three underground transformation families, and checks that failure leaves the ball and keeper resources unchanged.

## Validation

`node --test tests/keeper_super_defence_underground_guard.test.cjs tests/keeper_super_defence_input_path.test.cjs tests/super_defence_input_path.test.cjs` passes **4/4**. This includes the actual-engine negative underground cases, standalone/modular helper parity, and the previously passing manual Jump+Shoot paths. `git diff --check` passes for the changed source and test files.

No input mapping, ability cost, cooldown, shot physics, save data, roster data, or player-facing UI changed. This is a gameplay fairness fix; it does not claim physical-device or human balance acceptance.
