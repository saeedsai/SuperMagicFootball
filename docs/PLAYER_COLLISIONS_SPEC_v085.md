# v0.8.5 physical collision specification

## Ground contact model

- After all player movement, before ball simulation, each player pair with both `z <= 22` is compared against a combined contact diameter of 50 world units.
- The overlap vector is resolved symmetrically, and each player moves by half the contact overlap plus a capped momentum-based push. Positions are clamped within field margins.
- Relative closing speed above 75 world units/second triggers a short stun and `hurt` pose for **both** players. Duration depends on impact strength and each player's Strength stat, with lighter impacts on teammate contact.
- An impact grants a shared 0.55-second contact cooldown. Fast enemy body impact above 260 world units/second releases the ball, applying a 0.24-second pickup delay.
- Up to 72 relaxation sweeps, exiting as soon as no contacts remain, spread players in extremely dense goalmouth crowds. Exact-coincident coordinates are resolved with a deterministic fallback vector.
- Airborne players are excluded from this ordinary contact system; special teammate-launch landing attacks remain separate.

## Limitations

Bodies are circles, not limb-specific capsules or authored animation hitboxes. There are no fouls, cards or referee advantage rules. Contact audio is not bespoke. Overlap at field edges and extreme zero-distance crowd piles may still be sub-pixel during a single simulation step; browser animation and real-device performance require future testing.
