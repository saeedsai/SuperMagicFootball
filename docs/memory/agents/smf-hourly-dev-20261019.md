# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 15:00 CET

## Mission
Continue one bounded roadmap increment per run on existing `dev` despite pending CI/release. Only `dev` and `main`; no security bypass, force-push or uncertified promotion.

## Current checkpoint
About-only dev candidate `0.9.41.9`, certified main `0.9.41.8`. Run-start main `6b5d6adef4dff53eb02c4ba3a833473e3500cce5`, dev `95c1677b248e693dbf64e94ad02262b07dd96aff` (76 ahead/0 behind). LAN host TTL fix `d58f36a25da5d5575f98caee32ed157a445a1c4d`, test `85d405220f1a67a98d921ce6bb573ee1d25a0081`: one safe timestamp for receive/prune/expiry, preventing clock drift from extending pending joins. Central log updated. LAN consent remains client-side only, not authenticated signaling or actual two-client discovery.

## Next smallest action
Integrate authenticated LAN-scoped signaling with sender-to-request binding and host consent; connect Create Game / Find Games UI. Continue independent Player Studio/tricks/graphics increments if release is blocked. Fetch exact heads before edits.

## Ownership and exclusions
Only `smf-hourly-dev-20261019` writes this checkpoint. Do not read/edit other agents' private memory. Preserve 223 teams/2676 players, 6 formations, 4 buttons, 10 Career/Cup slots, SD09, saves and offline behavior.

## Evidence
Actual committed source passed 10/10 focused isolated V8 assertions; test file parsed. Not Node CI. Local git remote blocked by DNS `Could not resolve host: github.com`. Older runs #40183086173 (Full preflight) and #40183086171 (Modular source-and-data) failed missing `## Next smallest action` on an earlier SHA; this checkpoint retains the heading. Current exact-head full 4 Node+4 Chromium, Modular QA, graphics, physical LAN, main promotion and Pages smoke **not verified**.

## Cleanup
Keep hourly development; inspect and repair actual CI failures. Promote only exact green dev through protected workflow; verify main SHA, Pages and hosted bytes separately. Keep checkpoint <4 KiB.
