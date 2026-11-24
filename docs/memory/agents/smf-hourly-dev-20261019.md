# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-24

## Mission
Deliver real player-facing football gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current checkpoint
- **0.12.81.251 — AI-FIRST-TOUCH-DRIBBLING-CUT-01:** CPU pressured first-touch escape now scales its diagonal settling geometry with the receiver's Dribbling rating. Neutral 50 preserves 72-forward/78-lateral; low skill favors 78/66 and elite skill 66/90. Human direction and existing first-touch timing remain unchanged.
- **0.12.81.250 main-promoted:** strong-clearance straight-forward pressure escape, with diagonal/slide safety retained. Modular QA #45325809560 passed 2,838/2,838; exact-head Census #45325809486 passed all four Node and four Chromium shards. Main SHA is 35536ed236246ef682f7ea492c489fd89fe337d6; Pages #45327024959 succeeded; independent main Census #45327033894 is still running.
- .251 adds mirrored helper, actual GameEngine.take and desktop/simulated-touch Chromium regressions for both teams, low/neutral/high ratings and missing/invalid fallback.
- .247 was the previous verified main release; .250 is now the latest deployed release.

## Next smallest action
Inspect exact-head .251 Modular QA and Full Regression Census. Fix any confirmed failures, then allow only a green exact SHA through the existing QA-gated promotion pipeline. Independently verify main Census, hosted bytes and deployment after promotion.

## Ownership and exclusions
Edit only this checkpoint. Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No concept heroes or copied graphics. Physical #48, Render drift #86 and main protection #87 remain open. Authenticated online hosting requires owner resources. Never expose Git SHA in player UI.

## Evidence
- .250 Modular QA #45325809560 passed 2,838/2,838 Node tests. Dev Census #45325809486 passed preflight, preview and all four Node/four Chromium shards; QA-gated promotion and Pages deployment succeeded.
- .251 exact-head Modular QA #45327863441 and Full Regression Census #45327863488 were in progress at last observation; no .251 test result is claimed yet.
- Independent .250 main Census #45327033894 passed preflight, preview and hosted-pages smoke; two Node and four Chromium shards were still running at last observation.

## Cleanup
Keep this file below 4 KiB with all required headings and exact Agent ID. Do not read/edit another agent's private checkpoint. Never bypass CI, security or QA promotion.
