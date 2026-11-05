# Candidate 0.12.81.61 validation

**Status: promoted to main; Pages deployment and main regression are pending.** Existing procedural players now counter-swing each arm against the corresponding same-side leg during a run. The direction is mirrored across team/facing sides and bounded to the current gait amplitude; it changes only drawing, never movement, collision, input, hitboxes, results or saves. This is a focused gait correction, not a replacement player-art system.

## Acceptance criteria

- Arm movement counters the same-side leg through both run phases and mirrors between sides.
- The cue remains bounded and returns to neutral at stride rest.
- Existing source identity, player movement, collision, action timing and the four-button controls remain unchanged.

## Validation

- `node --test tests/characterart_run_foot_articulation.test.cjs`: **4/4 passed**, including mirrored counter-swing, finite/bounded behavior, ankle-pivot footwear, planted-sole stability and frozen player/options.
- Production renderer browser QA sampled **64** actual-renderer run/cut/stop/relaunch frames: 16 distinct frames per transition; minimum 5,019 painted pixels; live player/ball state unchanged; **0 page errors**. Capture: [player arm counter-swing](evidence/browser/player_arm_counter_swing_20261105.png).
- `npm run test:node` passed the full build and Node suite: **2,325/2,325**, including all **16/16** version-policy checks and the Club26/FC27 runtime/data parity executable. The built browser fixture is **5,237,825 JS / 5,361,121 HTML characters**. `node --check src/modules/characterart.js` passed.
- Commit `dde79c35b5096bcc782e618e81706d73d91681d0` is pushed to `dev`. Modular QA `42074560131` and Census `42074560236` passed; protected promotion to main succeeded. Pages deployment `42076154200` and main Census `42076154150` both completed successfully. Separate Current Player Graphics QA `42074560135` and Modular concept preview `42074560133` were cancelled; Concept Hero QA `42074560130` failed and is outside the owner's requested scope. No owner visual approval or physical-device acceptance is claimed.

## Limits

This improves run-cycle anatomy in existing procedural art. It does not create new source sprites or replace the existing renderer, and the automated capture is not owner visual approval or physical-device acceptance.
