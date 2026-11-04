# Hide Ball CPU vision counterplay

Date: 2026-11-02  
Plan item: `TRICK-STAR-01` / `TRICK-FAIR-01`  
Source contract: [`SUPER_DEFENSE_AND_TRICKS_BACKLOG_v08241.md`](SUPER_DEFENSE_AND_TRICKS_BACKLOG_v08241.md)

## Change

While Hide Ball is active, opposing CPU players now use the carrier's position
captured when the trick began. Their pursuit and pressing assignments head to
that last-known point instead of following the carrier's moving live position.
The game simulation still keeps the authoritative ball owner and position, and
same-team AI and human players retain the normal view. The temporary position
is cleared as soon as the concealment expires or possession is lost.

The existing counterplay is unchanged: a nearby grounded defender can interrupt
the cast with a timed, facing PASS poke, and a strong defender moving toward and
facing the carrier can read it. The concealment timer, reveal cue, cooldown,
fatigue cost, and four-button controls are unchanged. The extra position is
runtime-only and adds no save field.

## Validation

- `node --test tests/hide_ball_ai_vision.test.cjs tests/tr16_hide_ball_stealth.test.cjs` — **9/9 passed** across CPU observation, same-team visibility, activation, PASS-poke counter, 30/60/120 Hz expiry, possession-loss reveal, and render contract.
- `python3 scripts/build.py` — generated the browser fixture.
- `python3 tests/browser_runner_compat.py tests/hide_ball_ai_vision_browser_qa.py` — desktop and simulated-touch Chromium both confirmed CPU pursuit to the last-known position, normal same-team sight, unchanged authoritative ball/carrier, reveal on possession loss, exactly four action buttons, and no page errors.
- `git diff --check` — clean.

This is local Chromium evidence; physical-device acceptance remains separate.
