# SD09 — Spinning Bumper Super Defense (21 October 2026)

**Status:** opt-in functional prototype in modular gameplay on `dev`. Existing teams and abilities are unchanged; it is **not yet exposed through the Player Studio ability picker**. The finished SD09 requirement (owner animation, tier progression UI and balance sign-off) remains **partial** until those are delivered.

## Mechanic
- Adds `defensiveAbilities.spinBumper` to `data/mechanics/gameplay.json`: radius 116 world units, push 48, stun capped at 0.72 seconds, cooldown 11 seconds, base action-fatigue cost 0.125, readiness reserve 0.13.
- Only a genuine outfield **DF** with a deliberate `superAbility:{type:'defence',id:'spinBumper'}` and `superDefenceLevel >= 3` can activate the move. The existing four-button **Jump + Shoot**, no-ball defense input routes through the same `activateDefence` method as Drill Attack/Shock Burst; no fifth control, bonus ability for normal players or roster overwrite.
- A nearby **grounded, non-dashing** opponent is pushed directly away in both attacking directions, briefly stunned and loses held-ball possession. Teammates and keepers are unaffected. A **jump**, active dash, existing invulnerability or moving beyond the 116-unit radius counters the pulse. If all opponents evade, activation consumes **no cooldown, fatigue or possession**.
- The existing defense VFX/event pipeline emits `defenceSuper` with `id:'spinBumper'`, a longer spin-like action interval and lavender burst. A distinctive authored eight-view spinning animation and advance telegraph are still required (ART-102). Tier levels do not grant unequipped abilities.
- Existing default defenders, shots, save schemas, 223 team and 2,676 player IDs, six formations and four action buttons are unchanged. To exercise this prototype, an eligible defender must be explicitly assigned the ability via source/setup/test; **no public UI selection is claimed**.

## Verification
- `tests/spinning_bumper_defence.test.cjs` extracts and executes the actual `activateDefence` method under Node VM, testing mirrored knockback, fatigue, cooldown, capped stun, loose-ball outcome, friendly-fire immunity, jumping, dashing, level/role gating, exhausted gating, data and four-button contract.
- `tests/spinning_bumper_browser_qa.py` runs the real modular fixture in Chromium for desktop and simulated touch, both sides, verifies collision, emission and jump/dash counters. The Full Regression Census automatically includes it.
- `sw.js` rotates the offline shell cache because mechanics data and engine bytes changed. The Career-slots contract permits newer suffixes while preserving its own required cache version.
- **Do not claim complete release** until the final exact dev commit passes preflight, all 4 Node and 4 Chromium shards and preview smoke, auto-promotes non-force to main and independently passes main Pages deployment + hosted SHA-byte smoke. Physical phones and actual controller devices remain untested.

## Next SD09 increment
Expose a safe ability chooser in Player Studio (without granting simultaneous shoot/defence specials), commission bespoke eight-view spin/push/recovery poses and a dodge telegraph, then run seeded human/CPU fairness calibration over five difficulty levels and 30/60/120 Hz.
