# Supermagic Football — Aerial Mechanics v0.8.1

## Implementation boundary

### Hyperdash

Sprint + movement (greater than 0.52 input magnitude) held for >0.56 s **without carrying the ball** triggers a brief 0.62 s x1.7 dash multiplier on top of sprint; this uses a separate 4.3 s cooldown and a stamina action cost. Cannot start while stunned, air height above 45, exhaustion >78% or on cooldown. The acceleration still follows the agility model. Dash trail is rendered while active. This is a new controllable move; original NES double-tap timing is not verified.

### Aerial header

Requires player vertical height >=30, loose ball height >=30, horizontal gap <=92, ball/player head-height gap <=90, no stun and normal action cooldown elapsed. In midair SHOOT attempts a header before tackle logic. Heading, shooting accuracy, morale and fatigue contribute; header has a short action cooldown and stamina cost. Cannot chain another immediately. Computer-assisted header choices and teammate stacking are deferred.

### Goalkeeper dive

Ordinary keeper save is distinct from rare SUPER moves. Requires loose opponent ball moving toward the relevant goal with lateral/height separation within reach based on `gkJump`. Successful intercept can catch slow shots or deflect harder ones based on GK Skill and Jump. Player can request a dive using JUMP while the shot is in range; autonomous CPU keeper decisions use GK Skill and selected AI level. Cooldown = 2.4 s; player and ball effects are visible. No claim of fully animated motion capture or original-game timing.

## Interaction and persistence

All three mechanisms use the original Match Engine, not a second emulator or separate game mode. Fatigue is stored by player id, dash/dive cooldowns survive kickoff and paused tactical changes; old careers and saves need no data migration. Keyboard, gamepad-mapped actions and simulated phone touch input share the same control path.

## Next staged work

v0.8.2 should implement airborne teammate combination attacks and more accurate special-shot apex timing as a separate bounded release. Original four-player goalkeeper mode, rulebook penalties and more distinct player reactions remain tracked but unscheduled.
