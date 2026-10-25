# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 23:00 CET

## Mission
Develop hourly on existing `dev` regardless of release blockers. Never create branches, bypass GitHub security/CI, or force-push. Preserve 223 teams/2676 players, six formations, four action buttons, ten Career/Cup slots, SD09, offline and save compatibility.

## Current checkpoint
- dev development candidate 0.10.2.0; main production remains older. Exact-head QA required; no hosted signaling service or physical LAN certification.

## Latest run — 2026-10-25 23:25 CET
- `main=dev=e667fe42` verified; Full Regression #40238388569: preflight, four Node, four Chromium, preview and protected promotion all success. Hosted byte smoke not independently verified.
- `6f68c72c` prevents closed guest taking approved LAN room seat; `347b0302` adds source regression. Exact new-head CI and physical LAN/graphics pending. Continue coding dev while release pipeline runs.

## LAN UI priority — 2026-10-25
- Pages mounts manual SDP because auto discovery needs same-origin local companion. Added public Pages private-IP gateway to `http://HOST-IP:8000/`, preserving existing local Host Game/Find Games lobby. Version 0.10.1.0 candidate synchronized across package, release, README and SW. Source-contract tests committed; exact-head CI and physical two-device LAN remain pending. No protected main promotion yet.

## Latest run — 2026-10-25 mobile Host/Find UI
- `46932463` makes Host/Find first-class on Pages/phones; `11bffb41` allows secure WSS signaling endpoint config; `b6b23063` truthful service error; `b420d429` updates test. Version 0.10.2.0 candidate aligned. **No hosted signaling backend provisioned**, so functional discovery/join unverified/unavailable. Full QA, protected promotion and Pages verification pending. Next: deploy secure signaling service, configure endpoint, full two-browser + phone QA, exact-head CI.

## Current fix — 2026-10-25
- `bffe3e5b` removes obsolete manual Pages IP/CMD gateway (regression blocker); `110174ec` fails fast with unconfigured WSS on public Pages; `6bb6e4c0` test. Seven source checks passed; full CI not verified. Signaling service is not deployed; real phone LAN remains blocked. Candidate 0.10.2.0 not certified; do not promote without exact-head green.

## Latest — 2026-10-25
- `cc16e0ab` blocks misleading Host/Find when discovery is unconfigured; `a796a58b` source regression. Version 0.10.2.0 candidate unchanged. Hosted signaling service unprovisioned; physical LAN and full CI unverified. Only promote exact green dev head.

## Latest test — 2026-10-25
- `e7325f79` adds executed Node runtime test for GitHub Pages with missing signaling endpoint (no socket, unconfigured state, no host send). Test execution/full CI not yet confirmed. Candidate remains unpromoted; no signaling service or physical LAN QA.

## Next smallest action
1. Inspect fresh dev/main heads and exact-head CI failures; repair red steps.
2. Obtain uninterrupted green Modular QA and 4 Node + 4 Chromium shards.
3. Run two-tab LAN host/guest browser acceptance, WebRTC game sync and graphics.
4. Test two physical LAN devices, disconnect/rejoin and offline regression.
5. Allow protected exact-head promotion only when green; verify Pages bytes and hosted smoke.

## Ownership and exclusions
Sole developer `smf-hourly-dev-20261019`. Only this agent checkpoint and central `docs/DEVELOPMENT_LOG_SINGLE_OWNER.md` are writable memory; never read/edit other agents' notes. No new branches or direct development on main.

## Evidence

## Cleanup
- Preserve two branches only; verify CI and hosted release, leave checkpoint under 4096 bytes.
