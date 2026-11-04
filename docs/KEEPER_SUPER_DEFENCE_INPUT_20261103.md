# Keeper Super Defence input path — 3 November 2026

## Acceptance covered

Confirm a goalkeeper's already-equipped Super Defence can be triggered through the existing Jump+Shoot action path using keyboard, touch, default gamepad mapping, and a remapped gamepad. Verify the real modular engine executes the keeper save/clear action without adding a fifth control.

## Result

`node --test tests/keeper_super_defence_input_path.test.cjs` passes **1/1**. Each of the four input paths polls the actual `Input` module and calls the modular `GameEngine.update()` path. All produce the configured `keeperSuper` event, mark it as manual, apply the cooldown, change ball ownership attribution to the defending side, and clear the ball away from its goal. Default keyboard bindings and Player 2 bindings remain unchanged during the Player 1 gamepad remap case.

The test equips `megaPalm` only on an in-memory synthetic test player. It does not write or grant any ability to a canonical roster player, change tier policy, or modify saves. Tiered equipment entitlement remains enforced by the existing Player Studio/save policy.

## Scope limits

This is headless input/engine integration, not a physical-controller or touch-device acceptance run. Human timing, goalkeeper balance, visual art and owner review remain separate.
