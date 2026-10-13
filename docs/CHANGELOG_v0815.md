# Supermagic Football v0.8.15 — Active Football AI and Super-Shot Trajectories

- Added `defensivePressers()` coordination for AI teammates and opponents, excluding the human-controlled player from AI pressing assignments.
- Primary AI defender now actively tracks the current carrier/ball every frame and tries tackles in range; second designated defender supports the lane.
- Added explicit GK short distribution (Pass) to nearest teammate, long distribution (Shoot) to the most advanced teammate, and an automatic CPU choice based on distance and pressure.
- Fixed airborne transforming super shots and combo super shots staying too high by making them descend toward the goal mouth. Ordinary flip kicks still loft normally.
- Preserved the existing four-button input layout, 216 team rosters, career, competitions, stamina, morale, kit selection and save compatibility.
- Added 8 requests to the canonical matrix (now **216 total**) including **five-tier attacking and defending super abilities** and level-based stamina relief, explicitly **not yet implemented**.
- Updated the roadmap and gap register; added Node + desktop/simulated Android browser tests and ran all inherited suites.

**Deliberate test maintenance:** isolated the existing human defensive-chase test from CPU possession decisions, and updated the AI difficulty test to measure speed independently of direction; its keeper reaction-delay behavior is still tested separately. New pressing-specific tests exercise the formerly untested scenario.
