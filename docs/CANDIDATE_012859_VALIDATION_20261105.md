# Candidate 0.12.81.59 validation

**Status: local candidate.** A player hit by a shot now eases from the airborne impact into the existing grounded pose over .20 seconds instead of rotating directly to the final lying angle. Once down, the existing strength-based **0.5–3 second** hold is unchanged, followed by the existing .24-second braced get-up. The effect is renderer-only and mirrors with facing.

## Acceptance criteria

- Keep launch, down-hold, stun, weakness, and recovery durations owned by the existing engine timers.
- Ease into the same final downed angle over a bounded .20-second settle.
- Mirror the fall angle by player facing, with deterministic output and finite fallback behavior.
- Keep animation rendering-only: no player position, movement, collision, shot result, or save changes.
- Validate the eight-view player renderer, reduced-flash state, actual fall phases, and existing 30/60/120-Hz impact timing.

## Validation

- `npm run test:node` passed the final release-version build (**5,227,249 JS / 5,350,545 HTML characters**), Node **2,311/2,311**, and Club26/FC27 runtime/data parity.
- `python3 -X utf8 scripts/validate_data.py` passed: **223 teams**, **2,676 players**, all seven roster shards, and 84 avatar presets with no errors.
- `node --test tests/shot_impact_recovery_pose.test.cjs tests/super_shot_visuals.test.cjs tests/shot_impact_timing_rates.test.cjs`: **12/12 passed**. Covers stable final-angle and mirror sign, 30/60/120-Hz knockdown durations and stun thresholds, reduced-flash cues, and renderer wiring.
- `node --test tests/versioning_policy_contract.test.cjs`: **16/16 passed**; `git diff --check` passed.
- `python3 -X utf8 tests/shot_impact_weakness_browser_qa.py`: passed the production player renderer across eight views with **0 page errors** and no live simulation mutation. Five actual-renderer fall phases at 0/.05/.10/.20/.40 seconds changed **6,018 / 6,818 / 6,160 / 3,051** pixels between samples; the large changes show the body easing into the ground pose. Existing weakness cue is hidden during down/get-up phases and remains visible in reduced-flash mode.
- Preview: [shot-hit fall settle at five phases](evidence/browser/shot_impact_down_settle_012859.png).
- Full build/Node/data, release/version contracts, exact-head Census, Modular QA, protected promotion, Pages, hosted smoke and main regression are pending for the final candidate SHA.

## Limits

The scripted gallery verifies production-renderer phase change and simulation isolation, not owner visual approval or physical-device acceptance. Human play review remains open.
