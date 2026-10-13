# Supermagic Football v0.7.1 Alpha — Stamina and substitutions

Date: 2026-10-13. Incrementally developed from v0.7.0. Original v0.7.0 files were not overwritten.

## Implemented

- **One consistent fitness model:** twelve tracked players per side; ongoing drain affected by individual Stamina stat and sprint/running intensity. Sprint, jump, tackle, slide tackle, ordinary shot, pass and signature super shot have different action costs. Idle players recover gradually. Halftime recovers some energy for both starters and the bench, without resetting the stored fatigue.
- **Gameplay effects:** lower effective sprint/running speed, shot power/accuracy, tackle force, pass accuracy and goalkeeper reach. An overexerted character displays a panting cue. Existing dynamic HUD stamina bar remains.
- **Substitution rules:** maximum 3 *per team per match*, no re-entry after substitution, injury weeks block bench entry, changes only while paused/halftime. Swapping formation/positions without swapping players does not charge a substitution. Invalid changes are refused without updating saved team plans.
- **Solo CPU:** a tired AI field player can be swapped at halftime for an eligible rested bench player. In local 2P Versus, both sides retain human management.
- **Manager career:** played players receive condition changes according to their fatigue and playing time; unused bench players recover slightly. High fatigue/low condition can produce a deterministic low-probability short injury, stored as `injuryWeeks`.
- **Compatibility:** team database remains 216 and all 12-player roster arrays remain intact. No save-schema rewrite, no removal of tactical systems, clubs, local controls or championship modes.

## Explicit outstanding gaps

- A career player's injury is reported and visible but the UI does not yet automatically replace injured starters before kickoff; no in-match injury animation or stoppages. Avoid claiming a complete injury system.
- Injury risk and cost/effort curves require human balance playtesting; no league-specific substitution or substitution-window rules.
- No physical Android/iOS gamepad tests or multi-browser performance measurements. Browser QA is headless Chromium and simulated mobile.
- Exact Famicom original mechanics remain incomplete: morale, crying, funny goals, defense-specific powers and historical roster fidelity.
