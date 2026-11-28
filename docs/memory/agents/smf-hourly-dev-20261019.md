# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
Updated: 2026-11-28

## Mission
Deliver player-facing football AI, counterable Magic Tricks, existing-player graphics, goalkeeper, Player Studio and Career/Cup improvements. Preserve 223 teams, 2,676 players/order/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- Candidate 0.12.81.417: KEEPER-HIGH-CROSS-LIVE-TURN-ARRIVAL-01. A CPU keeper evaluating a targeted high cross now projects live movement through the existing bounded Agility-limited turn before calculating the existing claim momentum bonus and cross-track penalty. A high-Agility keeper turning into the landing pocket can complete a marginal claim; turning away and low-Agility controls remain conservative. Neutral, invalid, slow, aligned and legacy movement preserve the previous calculation.
- Gameplay source: `src/modules/ai.js`, `keeperHighCrossClaimTarget`. Focused mirrored Node and actual-GameEngine desktop/simulated-touch Chromium regressions extend the existing high-cross claim suites.
- Run-start dev/main were both .416 SHA `5ba4790e989da11b30d61dfb3e077240918cf744`; .417 is a new dev-only candidate pending exact-head gates.

## Next smallest action
Inspect .417 Modular QA and Full Regression Census at the exact SHA. Verify both goal directions, turn-in/turn-away, high/low Agility and neutral/invalid fallback, plus existing high-cross airborne/grounded arrival, teammate handoff, catch/return and outfielder-priority cases. Fix only confirmed failures without weakening assertions. Promote only through the existing QA-gated main pipeline after a green exact head; independently verify main Census, Pages deployment and hosted bytes.

## Ownership and exclusions
Update only this checkpoint. No new branch, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. Keep #87 main protection, #86 Render drift and #48 physical two-phone acceptance open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Initial .417 Modular QA #46186009545 and Census #46186009751 preflight exposed one low-Agility fixture failure (3,090/3,091 passed). The production movement model was unchanged; the Node and actual-engine fixtures now use a wider keeper-to-landing gap so turn-in high Agility claims while turn-away and low Agility do not. New exact-head CI is pending.
- Run-start dev: `5ba4790e989da11b30d61dfb3e077240918cf744`; main: `5ba4790e989da11b30d61dfb3e077240918cf744`.
- .416 Modular QA #46182945892 passed; Full Regression Census #46182945873 passed all four Node and four Chromium shards and its promotion job. Pages deployment #46183800444 passed; main Census #46183806637 has preflight, preview, all four Node shards and browser shards 1/2 passed while browser shards 0/3 remain in progress.
- GitHub branches REST reports both `dev.protected=false` and `main.protected=false`; #87 remains open. #86, #48, #3, #10 and #12 remain open.
- Local github.com DNS resolution failed, so local Node/Chromium execution was not performed. .417 exact-head CI is pending.

## Cleanup
Keep this checkpoint below 4 KiB. Leave all other agent checkpoints untouched.
