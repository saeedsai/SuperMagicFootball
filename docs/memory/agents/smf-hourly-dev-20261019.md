# SuperMagicFootball — smf-hourly-dev-20261019
**Updated:** 2026-11-23

## Mission
Deliver real player-facing gameplay first, then existing-player graphics/animation, goalkeeper, Player Studio and Career/Cup. Never substitute audits or test-only iterations. Preserve four actions, canonical rosters, compatible saves and offline play.

## Current candidate — 0.12.81.231
- AI-CUTBACK-SPECIALIST-RECEIVER-PRESERVATION-01: fixed a confirmed .230 gameplay regression. A safe cutback receiver that is also the ordinary support-run candidate is no longer excluded from the cutback PASS when the generic forward-support check rejects it.
- AI-LOFTED-PASS-JUMP-INTERCEPT-01: the second CPU defender uses the existing JUMP action only when a targeted lofted pass crosses a reachable window after the difficulty reaction delay; low/untargeted/late/unreachable passes do not trigger. Primary presser continues chasing the ball.
- Focused Node and real-engine desktop/simulated-touch Chromium regressions added. Exact-head CI pending; no local test claim because github.com DNS failed.

## Previous gate diagnosis
- .230 Modular QA #45193483047 and Census #45193483239 both failed ai_cutback_pass.test.cjs: the safe cutback runner was also excluded by unsafeSupportReceiver, causing fallback to jp3 instead of jp1. .230 is not certified/promoted.
- .229 had a pre-certification scope bug; .228 had a stale Euclidean-vs-longitudinal test assertion; .227 browser fixture used invalid lineup slot 6. These candidates were superseded.
- .225 remains the latest deployed main: SHA 91adea9bad06524c3022e7ee60a8ece58fb16142; Pages #45165193079 and main Census #45165206483 passed.

## Exact branch baseline before .231
- Dev: 93a89cda08c3c3f031149231e75d35e21223cf5c (.230)
- Main: 91adea9bad06524c3022e7ee60a8ece58fb16142 (.225)
- Main protection remains disabled; issue #87 open. Render #86 and physical two-phone #48 remain open. Do not claim hosted online service or device certification.

## Next smallest action
Observe .231 Modular QA and all four Node/four Chromium Census shards at the exact dev SHA. Fix confirmed failures, then let only the green exact head use the QA-gated promotion pipeline. Verify Pages, independent main Census and hosted-byte smoke separately. Continue with counterable football AI, existing-player Studio art, goalkeeper and Career/Cup.

## Invariants
Preserve 223 teams, 2,676 players, ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No new concept heroes or copied art. Edit only this checkpoint; keep it below 4 KiB.
