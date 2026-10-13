# Cooperative aerial combinations — v0.8.2

## Inputs

- **Hold PASS then JUMP** near a grounded teammate (keyboard K + Space; gamepad B + Y; mobile PASS + JUMP). The selected player rises higher with a boost; field teammate performs the boosting pose.
- **SHOOT** near a loose airborne ball while high in the air performs a **flip kick**. Regular v0.8.1 header still works at lower altitude.
- **SPECIAL** after a teammate lift near the highest jump point triggers the player’s existing transforming shot. If attempted early/late while still in position to kick the ball, it becomes a normal flip kick.

## Gate / collision definitions

- Neither jumper nor helper may be goalkeeper or stunned; helper must be grounded, within 115 world units and available. Both need fatigue < 0.78. Jumper must not be carrying ball, already airborne, or on combo cooldown.
- Launch physics: starting height 48, vertical velocity 650; jumper cooldown 4.8s, helper action cooldown .9s, combo window 1.55s. Costs stamina for both. Windows reset on landing, and cooldown survives kickoff/substitution where identity persists.
- Flip-kick needs jumper z >=95, loose ball z>=55, world distance <=110, vertical alignment <=125, no action cooldown. Apex special additionally requires an assisted combo, jumper z>=145, |vz|<=260 and available special shot. Current engine converts it to player's documented in-game transforming shot profile; historical accuracy not yet verified.
- When a launched player lands within 60 world units of an eligible opponent, the opponent suffers a short stun and drops any held ball.

## Rendering

The existing HD cartoon renderer now draws supporting halo, boost/flip text, comic trails and a landing shock ring. This is procedural art; it is not a faithful animation capture from the Famicom original.

## Scope and limitations

- Gamepad inputs follow the existing mapping but were **not verified using a real controller**. Browser QA uses real keyboard and simulated mobile multi-touch.
- Solo CPU does not proactively set up a launch with another AI teammate. Ball riding, historical 1993 double-team input timing, referee collision rules, and hand-drawn flipping animation frames remain.
- No changes to career, 216 team IDs, team plans, saved data or existing super shot definitions.
