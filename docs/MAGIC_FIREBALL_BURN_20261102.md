# Fireball temporary burn cue

Date: 2026-11-02  
Plan item: `TRICK-STAR-01` / `TRICK-FAIR-01`  
Source contract: [`SUPER_DEFENSE_AND_TRICKS_BACKLOG_v08241.md`](SUPER_DEFENSE_AND_TRICKS_BACKLOG_v08241.md)

## Change

An in-range Fireball hit now adds a **0.48 second visual-only cartoon burn cue**
to the existing short stagger. The cue is drawn as a steady orange outline and
three small flames, then fades by match elapsed time. It does not add damage,
stun, possession effects, player control changes or save fields. It does not
flash or shake the screen, so reduced-flash settings retain the same readable
cue.

Existing counterplay remains: jump above the strike, slide underneath it, or
have a strong defender approach while facing the carrier. A countered cast
does not apply the cue. The caster's existing fatigue and cooldown remain the
same; controls stay Pass, Shoot, Dribble and Jump.

## Validation

- `node --test tests/magic_fireball_burn.test.cjs tests/magic_fireball_slide_counter.test.cjs tests/magic_fireball_jump_counter.test.cjs tests/magic_scream_slide_counter.test.cjs tests/magic_freeze_slide_counter.test.cjs tests/magic_bat_slide_counter.test.cjs` — **26/26 passed**.
- `python3 scripts/build.py` — browser fixture generated successfully.
- `python3 tests/browser_runner_compat.py tests/magic_fireball_slide_browser_qa.py` — Fireball counter browser QA passed on desktop and simulated touch.
- `python3 tests/browser_runner_compat.py tests/magic_fireball_burn_browser_qa.py` — desktop and simulated-touch Chromium both confirmed the 0.48s timer, unchanged 0.32s stagger, a painted cue (328 orange pixels versus 18 without the cue), no page errors, and exactly four action buttons.

The cue's duration is a new cosmetic-only choice; its value does not set a new
gameplay damage or balance threshold. Physical-device acceptance remains
separate.
