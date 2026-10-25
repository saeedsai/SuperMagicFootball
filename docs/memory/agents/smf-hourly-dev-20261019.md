# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 23:00 CET

## Mission
Develop hourly on existing `dev` regardless of release blockers. Never create branches, bypass GitHub security/CI, or force-push. Preserve 223 teams/2676 players, six formations, four action buttons, ten Career/Cup slots, SD09, offline and save compatibility.

## Current checkpoint
- Before this run: `dev=ec8ecce1a65b9d97558051c647b56f1cebec78c1`, `main=84f8bae589f0675ea1e4cd8525a802ef0a643a92`. About-only `0.10.0.0` is a LAN candidate, **not certified**. Companion server supports LAN discovery, host consent and WebRTC signaling; physical two-device match is unverified.
- New server-only feature: bound queued WebSocket signaling at 512 KiB (including UTF-8 frame), terminate stalled peers to invoke normal cleanup. Focused isolated Node v22.16.0 mirror tests 4/4 passed; full repository CI not yet observed.
- Root cause of dev Modular #40236580431 and Full #40236580440 failure: own memory exceeded 4096 bytes (1 of 801 Node tests failed); full 4+4 did not start. This file is compacted with six mandatory headings.

## Latest run — 2026-10-25 23:25 CET
- `main=dev=e667fe42` verified; Full Regression #40238388569: preflight, four Node, four Chromium, preview and protected promotion all success. Hosted byte smoke not independently verified.
- `6f68c72c` prevents closed guest taking approved LAN room seat; `347b0302` adds source regression. Exact new-head CI and physical LAN/graphics pending. Continue coding dev while release pipeline runs.

## LAN UI priority — 2026-10-25
- Pages mounts manual SDP because auto discovery needs same-origin local companion. Added public Pages private-IP gateway to `http://HOST-IP:8000/`, preserving existing local Host Game/Find Games lobby. Version 0.10.1.0 candidate synchronized across package, release, README and SW. Source-contract tests committed; exact-head CI and physical two-device LAN remain pending. No protected main promotion yet.

## Latest run — 2026-10-25 mobile Host/Find UI
- `46932463` makes Host/Find first-class on Pages/phones; `11bffb41` allows secure WSS signaling endpoint config; `b6b23063` truthful service error; `b420d429` updates test. Version 0.10.2.0 candidate aligned. **No hosted signaling backend provisioned**, so functional discovery/join unverified/unavailable. Full QA, protected promotion and Pages verification pending. Next: deploy secure signaling service, configure endpoint, full two-browser + phone QA, exact-head CI.

## Next smallest action
1. Inspect fresh dev/main heads and exact-head CI failures; repair red steps.
2. Obtain uninterrupted green Modular QA and 4 Node + 4 Chromium shards.
3. Run two-tab LAN host/guest browser acceptance, WebRTC game sync and graphics.
4. Test two physical LAN devices, disconnect/rejoin and offline regression.
5. Allow protected exact-head promotion only when green; verify Pages bytes and hosted smoke.

## Ownership and exclusions
Sole developer `smf-hourly-dev-20261019`. Only this agent checkpoint and central `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md` are writable memory; never read/edit other agents' notes. No new branches or direct development on main.

## Evidence
Failing Modular: https://github.com/saeedsai/SuperMagicFootball/actions/runs/40236580431 ; Full: https://github.com/saeedsai/SuperMagicFootball/actions/runs/40236580440 . Both show `smf-hourly-dev-20261019 exceeds 4 KiB`. Isolated 4/4 queue tests PASS, but exact-head CI, physical LAN, visual QA and Pages smoke remain **unverified**.

## Cleanup
Keep checkpoint under 4 KiB and full history in central log. Preserve About-only version; never call candidate a certified release or close LAN #48 prematurely.
