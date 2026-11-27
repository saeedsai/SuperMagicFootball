# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-27

## Mission
Prioritize responsive gameplay, intelligent passing/tackling and counterable Magic Tricks, then existing-player graphics, goalkeeper, Player Studio and Career/Cup. Preserve 223 teams, 2,676 players, exact ordering/ratios, six formations, four actions, saves and offline play.

## Current checkpoint
- **0.12.81.356 — AI-UNSETTLED-RECEIVER-PASS-READ-01:** CPU support-run and through-ball selection reject receivers with active or malformed `firstTouchControlTimer`; missing, null, zero and expired timers remain eligible. This avoids leading a pass to a teammate still settling a prior pressured reception.
- **Feature files:** `src/modules/ai.js`; mirrored Node coverage in `tests/ai_support_run_pass.test.cjs`; actual-engine desktop/simulated-touch acceptance in `tests/ai_through_ball_keeper_safety_browser_qa.py`.
- **Confirmed .355 CI repairs:** the receive-gaze source contract now checks the actual Character Art draw props, including carry-shield lean/side/strength and reduced-flash; this replaces a stale argument-order regex. This checkpoint now uses the indexed Agent ID's required code formatting.
- **.356 exact-head gates:** pending fresh Modular QA and Full Regression Census. Do not claim pass, promotion or deployment before observed results.

## Next smallest action
Complete .356 Modular QA and all four Node/four Chromium Census shards. Fix confirmed failures without weakening assertions. If green, allow the existing QA-gated main pipeline, then independently verify main Census, Pages deployment and hosted bytes. Continue with a distinct through-ball or defensive-tackle improvement.

## Ownership and exclusions
Read and update only this checkpoint. No new branches, force-push, history rewrite, security bypass, unapproved concept heroes, copied graphics, roster/stat edits, save-schema changes or fifth action. #87 main protection, #86 Render drift and #48 physical two-phone acceptance remain open. No physical LAN certification or authenticated online-hosting claim.

## Evidence
- .355 failed Modular QA #45948668313 and Census #45948668387: stale renderer forwarding assertion and checkpoint identity contract; both are repaired in .356.
- .354 Pages deployment #45946957553 succeeded; independent main Census #45946964587 failed. This is not a .356 deployment result.

## Cleanup
Keep this checkpoint below 4 KiB. Update only this file for this agent's handover; leave other checkpoints untouched.
