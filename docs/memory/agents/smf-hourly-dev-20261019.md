# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** smf-hourly-dev-20261019
**Updated:** 2026-11-27

## Mission
Prioritize responsive football gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering and roster ratios, six formations, four actions, compatible saves and offline play.

## Current checkpoint
- **0.12.81.355 — CARRY-SHIELD-BRACE-01:** a held-DRIBBLE carrier with the owned ball close and an active nearby defender receives a bounded procedural torso brace and pressure-side arm extension. The pose fades with distance and ignores unavailable/downed/airborne/recovering opponents. No simulation or save state changes.
- **Feature files:** src/modules/artpose.js, src/modules/characterart.js, src/modules/render.js; focused Node and actual-renderer desktop/simulated-touch browser regressions; release metadata, backlog and this checkpoint.
- **Previous .354 exact-head validation:** Modular QA #45946055211 passed; Full Regression Census #45946055254 passed preflight, preview, all four Node shards and all four Chromium shards. QA-gated promotion succeeded and dev/main advanced to the same .354 SHA. Pages #45946957553 succeeded; independent main Census #45946964587 was still running at last inspection.
- **.355 validation:** feature commit triggers fresh exact-head Modular QA and Full Regression Census. Do not claim pass, promotion or deployment until observed. Browser screenshot QA is automated; no owner visual approval is claimed.

## Next smallest action
Complete .355 Modular QA and all four Node/four Chromium Census shards on the exact candidate SHA. Fix only confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline to promote, then independently verify main Census, Pages deployment and hosted bytes. Continue next with a distinct passing/through-ball or defensive-tackle gameplay increment, not another keeper-outlet change.

## Ownership and exclusions
- Read only this agent's checkpoint. Never overwrite another agent's memory or claim another agent's lock.
- No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth gameplay action.
- #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- Previous .354 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45946055211
- Previous .354 dev Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45946055254
- .354 Pages deployment: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45946957553
- .354 independent main Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45946964587

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
