# Lightning Trick CPU counterplay — 2026-11-02

## Behavior

The CPU now reacts to a Lightning Trick's existing `.32 s` marked warning with the existing Jump action. Reaction timing follows the selected difficulty profile. The response is limited to the named, live target, declines expired warnings, and leaves keepers, already airborne/jumping/sliding defenders, and stunned players alone. Higher CPU profiles can begin the jump early enough to reach Lightning's existing airborne counter; slower profiles retain their established reaction delay. The trick's range, damage/stun, costs, cooldown, player input, and save format are unchanged.

## Files

- `src/modules/engine.js` — targeted Lightning warning response and `driveAI` dispatch.
- `tests/magic_lightning_ai_counter.test.cjs`
- `tests/magic_lightning_ai_counter_browser_qa.py`

## Validation

- `node --test tests/magic_lightning_ai_counter.test.cjs` — **3 passed, 0 failed**. Covers both teams and 30/60/120 Hz across all five CPU profiles, expired/mismatched warnings and states that already evade or cannot act, and the four-action input contract.
- `python -X utf8 scripts/build.py` — passed; regenerated modular browser fixture.
- `python -X utf8 tests/magic_lightning_ai_counter_browser_qa.py` — passed on desktop and simulated touch, both sides at 30/60/120 Hz; the Hard reaction begins with 0.12–0.137 s remaining and reaches z≥20 before resolution, meeting the existing airborne counter. The visible action pad remains four buttons.
- Physical controller, physical touch, and owner visual review were not performed.
