# Input and AI mechanics — v0.8.6

## Four-button attack and defense

- **Jump + Dribble with possession:** immediately launches an original arcing bicycle shot. Shot vector aims toward the opposite goal, with shot power, accuracy, fatigue, morale and game pace included. The ball remains an ordinary ball, not a supernatural shot.
- **Jump + Shoot without possession:** if no higher-priority header, GK save or assigned defensive special can activate, triggers a flying kick. Opponent selection is restricted to an eligible grounded defender within 100 world units. Stun depends on attack strength and target strength, with brief immunity. Falls back to an aerial kick without a hit when no target is nearby.
- **Double-tap Dribble with possession:** two taps within 300 ms provide a small evasive step, stamina cost, 1.8 s cooldown and a short action indicator. This is a basic trick **foundation**, not any of the ten requested dribble types.
- **Pass while GK owns ball:** controlled non-GK player can order a distribution; CPU GK releases automatically within roughly 0.65 s after cooldown. Chooses an on-field receiver in a forward-biased ranking or punts if none exists.
- **AI unstick:** if movement is repeatedly blocked near a target and another field player blocks its route, chooses a bounded detour. No guarantee of optimal pathfinding.

## Preserved behavior

On-ball shoot charge, long pass, cross, jump-run, double-jump super shot, flip kick, teammate-launch combo; without ball dribble switch, pass tackle/chase, shoot slide tackle, jumping, defensive ability when assigned. Physical four-button cross remains unchanged.

## Known limitations

- Full ten styles, defender double-jump bicycle, realistic GK animations, full controller remapping and dedicated gamepad test hardware remain backlog.
- Existing action/collision boxes are procedural and are not final Nintendo-accurate geometry.
- GK priority and shot timings need extended human playtesting and latency measurements on real mobile devices.
