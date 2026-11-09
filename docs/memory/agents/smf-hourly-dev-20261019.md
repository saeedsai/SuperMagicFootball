# SuperMagicFootball — hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-09

## Mission
Develop bounded tested changes on dev; promote only verified exact-green head to main. Preserve 223 teams, 2676 players, six formations, Pass/Shoot/Dribble/Jump, offline saves, Career/Cup ten slots and SD09.

## Current checkpoint
- BREATH-WALK-THRESHOLD-01 and BREATH-DRIBBLE-LOW-DRAIN-01 are in candidate 0.12.81.67. Ordinary held-Dribble/ball carrying uses low Breath; sprint drains more; walking/idle recovery retained. Local selected-player-only Breath renderer and multiplayer selection regressions are present in the promoted tree.
- Exact dev head `dbaef1f30982134cf587e2ca09c22e1c909d6c92` passed Full Regression Census 42592377853 (4 Node, 4 Chromium, preflight, preview, promotion) and Modular QA 42592377871. Main was fast-forwarded to identical SHA. Pages deployment 42593593037 succeeded. Main Census 42593592712 hosted-pages-smoke passed exact HTML/JS/CSS bytes; remaining main regression jobs were still running at last check.
- Production Blueprints and Pages smoke triggers use main. Existing provisioned Render LAN signal service `srv-dbf8m6gm7kps7385tjo0` still reports branch=dev, autoDeploy=yes; dashboard branch correction and a real subsequent commit-trigger deploy remain unverified.
- GitHub main is currently unprotected. Issues #86 (Render drift), #87 (main protection), and physical two-phone #48 remain open. No physical LAN certification claimed.

## Next smallest action
Confirm completion of main Census 42593592712, and fix any failed shard. Inspect current dev/main before editing. Then select one small Player Studio / counterable Magic Trick / existing eight-view graphics / goalkeeper / Career increment, write focused Node and Chromium regressions, run 4+4 Census and Modular QA, and promote only via existing exact-green pipeline. Never reimplement routine LAN work without a verified regression.

## Ownership and exclusions
Only this agent checkpoint. No new branches, force push, direct main development, CI bypass, roster/name/stat audit, or unapproved concept-hero art.

## Evidence
https://github.com/saeedsai/SuperMagicFootball/actions/runs/42592377853
https://github.com/saeedsai/SuperMagicFootball/actions/runs/42592377871
https://github.com/saeedsai/SuperMagicFootball/actions/runs/42593593037
https://github.com/saeedsai/SuperMagicFootball/actions/runs/42593592712

## Cleanup
Checkpoint <4 KiB; no player-facing version bump for documentation-only correction.
