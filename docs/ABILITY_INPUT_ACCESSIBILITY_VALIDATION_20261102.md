# Ability and Dribble Input Validation — 2 November 2026

## Scope

Validated the shipped Super Shot catalog, Super Defense activations, contextual tricks, and the ten selectable dribble styles against the existing four-action contract. The focus was whether the mechanics execute and can be reached through supported player input, not roster identity, assignment, or stat verification.

## Button access

| Feature | Existing action grammar | Validation |
|---|---|---|
| Super Shot | With possession: press Jump twice, then Shoot (second Jump followed by Shoot). Aerial Super Header and Super Bicycle use their documented double-tap sequences. | Real `Input` + `GameEngine` gamepad regression checks default and remapped Jump/Shoot buttons; existing aerial and four-action tests pass. |
| Field Super Defense | Contextual Jump + Shoot while controlling an eligible equipped defender. The move applies its cooldown, cost and configured effect. | New real-input path regression sends keyboard, simultaneous touch, and gamepad actions into the engine and checks the defense event/effect. |
| Goalkeeper Super Defense | Contextual keeper defense is reached through the same Jump + Shoot grammar; automatic keeper super checks are also exercised for eligible incoming transformed shots. | Keeper Node and desktop/simulated-touch browser checks pass. |
| Magic Tricks | Hold Dribble for one second while carrying the ball; ordinary Dribble remains available without the hold. | Trick hold/counter tests pass. Spin Bump now follows the verified Gold+ runtime gate used by Player Studio, and under-tier attempts leave possession/cost/cooldown untouched. |
| Dribble styles | Press the existing Dribble action; the equipped style changes the selected dribble move without adding a button. | Ten styles pass runtime profile/counter checks and Player Studio desktop/simulated-touch selection, save, reload and identity-preservation checks. |

Keyboard, touch and gamepad continue to map onto Pass, Shoot, Dribble and Jump; no fifth Special or Sprint action was added. Controls help and Player Studio guidance describe the hold/combo semantics.

## Validation run

- Focused Node run: **101/101 passed** across the four-action input matrix, Super Shot, trick catalog/counterplay, dribble styles, Super Defense/keeper, Studio equipment and input-path suites. End-to-end tests drive Super Shot through gamepad controls, Super Defense through keyboard/touch/gamepad, and the one-second Magic Trick hold through the real keyboard input and game engine.
- Candidate 0.12.51.0 integrated local Node gate: **1,731/1,731 passed**; the required club/roster fixture check also passed. Release/version and promotion-contract tests pass **23/23**.
- Browser checks passed on desktop Chromium and simulated touch for all ten Dribble Style choices and save/read-back, keeper Super Defense, Spin Bump, four defensive wall families, Supernova, Spin Bump cues, and Wind/Mud/Lightning tricks. Field defense/trick browser mechanics also passed at 30, 60 and 120 Hz where covered.
- `node --check src/modules/engine.js` passed before the focused checks.
- The Wind/Mud regression initially failed because its test extractor included the newly adjacent `updateFireballBurn` class method. The extractor boundary was corrected; both focused Wind/Mud suites then passed **13/13**.

## Limits and remaining follow-up

- Simulated touch and browser gamepad inputs are not physical-device acceptance; real phones/controllers and longer human balance sessions remain untested.
- Player Studio has backend keeper-special policy/save helpers, but no keeper Super Defense equipment selector. Current validation covers existing eligible assignments and in-match activation; equip-flow completion remains a separate UI backlog item.
- Tier-gated mechanics do not certify which canonical roster players are eligible. Player/team identity audits and stat tuning remain deferred per owner instruction.
- These results establish input reachability and bounded runtime behavior for the tested paths, not owner visual approval or full release acceptance.

## 3 November 2026 follow-up

Re-ran the TR14 Spin Bump renderer/lifecycle browser suite on the current modular build. Its earlier browser fixture omitted explicit verified tier inputs, so the correctly enforced Gold+ runtime gate rejected the synthetic caster. The fixture now supplies a synthetic verified DF with all six canonical DF OVR attributes at 85 and asserts it is Gold-eligible before activation; gameplay's tier gate was not weakened. The desktop and simulated-touch suites pass for both team sides at 30/60/120 Hz, with four actions intact, possession/cost/cooldown/stun preserved, cue recovery verified, and reduced-flash rendering steady. The focused Spin Bump Node contract passes **5/5**.
