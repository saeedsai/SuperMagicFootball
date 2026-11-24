# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.252 — AI-MAGIC-TRICK-SCREEN-SKILL-CONTEST-01:** the existing second-defender READ! counter for named Magic Tricks now weighs defender Defence against carrier Dribbling. Dribbling 50 preserves the previous 7–24% defender-based chance; low skill raises it by up to 5.9 percentage points, elite skill lowers it by up to 6, and the final chance is bounded to 4–28%. Only a valid exposed-ball forward screen during the pressured first-touch window is affected.
- Focused Node coverage checks low/neutral/elite profiles, 4%/28% probability boundaries, mirrored actual-engine counter results, unchanged cooldown/fatigue/possession and ordinary Dribble Style separation. Desktop/simulated-touch Chromium checks the same actual engine.
- **0.12.81.251 main-promoted and Pages deployed:** Modular QA #45328041721 and exact-head Census #45328041706 passed on SHA `4353f36d12fb24f46cb74ce9ed6ca071a2b509ee`; QA-gated promotion succeeded. Pages #45329263712 and independent main Census #45329277069 passed, including hosted-pages smoke and all four Node/Chromium shards.

## Next smallest action
Inspect exact-head .252 Modular QA and Full Regression Census. Fix any confirmed source or fixture failure, then allow only the green exact SHA through the existing QA-gated promotion pipeline. Independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical #48, Render drift #86 and main protection #87 remain open. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .251 dev Census: preflight, preview, four Node shards and four Chromium shards passed; promotion succeeded.
- .251 main Census: preflight, preview, hosted-pages smoke, four Node shards and four Chromium shards passed.
- .252 source and focused regressions are committed; exact-head CI results pending.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Do not read/edit another agent's private checkpoint. Never bypass CI, security or QA promotion.
