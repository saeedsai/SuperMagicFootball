# SuperMagicFootball — sole hourly developer checkpoint
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-10-25 20:00 CET

## Mission
Never pause development on existing `dev` because CI/release is pending; diagnose blockers, commit small safe tested increments, never bypass protections. Only `dev` and `main` permitted. Preserve 223 teams/2676 players, six formations, four buttons, ten save slots, SD09 and offline/save compatibility.

## Current candidate and history
Installed About-only candidate 0.9.42.1 (not certified). `main=84f8bae589f0675ea1e4cd8525a802ef0a643a92`; previous `dev=bca2d92cb6c0402cf52ffe310cb7084ecf172060` (41 ahead, 0 behind) before documentation commits. Prior certified baseline was 2e92165a with Modular #40205918022 and Full 4+4 #40205918023, NOT evidence for current dev.

LAN groundwork already on dev: local room discovery, host consent, automatic WebRTC signaling, guest leave/release, timeout cleanup, pending queue/room caps, origin-scoped opt-in hosted signaling, socket message rate/IP connection caps, single guest seat, idempotent same-room host re-registration. No hosted public signaling service, TURN or certified physical two-client LAN.

## Latest increment
- `bcad53df`: enforce one host/guest role per socket. Registering host releases previous guest seat/pending requests; hosting sockets cannot request a guest seat in another room.
- `bca2d92c`: update stale host registration test (prior implementation made it idempotent) and add role-transition regression contract.
- V8 source-backed focused checks 6/6 passed, including real execution of guest-release helper against two rooms and pending joins. No full Node/Chromium/Modular/visual certification.
- Repaired second stale single-seat regex in `tests/lan_signal_policy.test.cjs` (`d3a7e30a`). Actual focused test bodies from two LAN suites executed via V8 with Node test/assert/fs and URL shims: **18/18 PASS**. This is not native Node CI. Central log updated `5c17861a`. No player-facing bundle changes/version bump.

## Evidence and blockers
Combined commit statuses returned [] and commit-workflow lookup returned [] (PR-only lookup, cannot infer green). Container git clone failed DNS resolution for github.com; GitHub connector commits work. Full Node 4 + Chromium 4, Modular QA, real two-client LAN, screenshot graphics, protected promotion and Pages hosted-byte smoke are UNVERIFIED. Do not promote an unverified head.


## 2026-10-25 approval queue guard
Server one pending request/room to match single approval UI (0d254b32), source contract updated (67ff82b2). Full exact-head CI, visual and physical QA unverified. Server-only; no version bump.


## 2026-10-25 synchronous join expiry
Host decision now rejects requests older than 30 seconds immediately (12b00407); source regression 1022e266. No player-facing change. Exact-head CI and physical QA unverified; do not promote without gates.

## Next five actions
1. Inspect exact current dev/main and actual CI; repair red jobs, no green inference.
2. Improve LAN multi-request approval/queue UX and add behavioral integration tests.
3. Exercise real two-client WebRTC sync, disconnect/retry, room visibility.
4. Improve Player Studio/counterable four-button Tricks and Concept Royals directional art with screenshot QA.
5. Once exact combined dev head is fully green, use protected main promotion and verify Pages bytes.

## Ownership
Only edit this agent checkpoint and central log, not other agents' memories. Read AGENTS.md, version policy and shared memory each run. Preserve checkpoint below 4 KiB.
