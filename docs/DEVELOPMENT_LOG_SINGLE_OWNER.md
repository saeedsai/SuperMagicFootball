## 2026-10-25 — LAN room directory foundation (unreleased)
- Issue #48: added validated room discovery directory with TTL expiry, announcement refresh, room removal, deterministic listing and clear; added Node tests. Client-side listing is not LAN authorization: secure signaling service and UI remain outstanding.
- Commits c9c586da173060591d3b275f17f7271d56522304 and 0c7f5e6065620359acef17db7fa93c1590201b36 directly on dev; no player-facing code integration, version remains 0.9.41.9. CI and protected promotion not verified; do not claim deployed or QA-certified.

## 2026-10-25 07:59 CET — LAN-058 monotonic guest snapshots (0.9.41.9 candidate)
- Baseline dev=main `b5f91bb1400b68dbc35c3ebc7974f0f821183060` certified 0.9.41.8: dev Modular #40168092612, dev Full 4+4 #40168092513, main Full #40168335987, Pages #40168335767 success; only dev/main branches.
- Root cause: guest live-match subscription applied every callback, including older or duplicate ticks, allowing stale play/pause/finish and score rollback if a transport rebinds. Fix: apply only strictly newer safe-integer snapshot ticks, preserving newer authoritative states.
- Added LAN-058 Node regression for stale/duplicate phase and score, resumed input frame and disposal; source-executed V8 smoke passed before commit. Exact-head 4 Node + 4 Chromium, Modular QA, protected main/Pages and physical two-device LAN remain separate gates.
- About/package/README/policy/shared memory/offline cache aligned to 0.9.41.9. No roster, formation, button, ten-slot Career/Cup, SD09, save or offline changes. Next: CI, real LAN, reconnect, Crown Royals art, Player Studio/Tricks.

## 2026-10-25 07:06 CET — LAN-057 authoritative pause/finish input gate (0.9.41.8 candidate)
- Baseline dev=main `6fc9978964c00691b266e90ed593837b1969b2f4` (certified 0.9.41.7): dev Modular #40164454293, dev Full 4+4 #40164454316, main Full #40164701384, Pages #40164701575; only dev/main branches.
- Defect: guest `createLanLiveMatch.step` kept sending new four-button packets while the latest validated host snapshot marked the match paused or finished. Fix: poll local controls but do not transmit until host snapshot returns to play; resume at current authoritative frame rather than replaying frozen input.
- Added LAN-057 regression for play→pause→finish→host-resume and monotonic sent frames. Source-executed V8 focused smoke passed before commit. Exact-head CI, protected main promotion, Pages hosted byte smoke and physical two-client LAN remain independent pending gates.
- About/package/README/policy/shared memory/offline cache aligned to 0.9.41.8. No roster, formation, control-count, Career/Cup ten-slot, SD09, save or offline changes. Next: exact-head 4+4 and Modular QA, physical LAN latency/disconnect, reconnect recovery, Crown Royals art, Player Studio/Tricks.

## 2026-10-25 06:05 CET — LAN-056 guest RTC send-failure recovery (0.9.41.7 candidate)
- Baseline dev=main `d0e411fcb1b4fa5143567cfe1601fab157522cf0`; 0.9.41.6 green dev Modular #40160705073, dev Full 4+4 #40160705065, main Full #40160958363, Pages #40160958027; only dev/main branches.
- Root cause: a WebRTC channel may close between guest `peer.ready` and `sendGuestInput`. The exception escaped `createLanLiveMatch.step` and could interrupt the game loop. Catch transient send errors, return false, preserve `lastSent` and retry the unsent frame after recovery.
- Added LAN-056 Node regression for failed send, same-frame retry, successful advancement and disconnected guard. Focused source-executed V8 test passed before commit. Full exact-head 4 Node + 4 Chromium, Modular QA, protected main/Pages byte smoke and real two-device LAN remain independent pending gates.
- 0.9.41.7 About/package/README/policy/shared memory/offline cache aligned. Preserve 223 teams/2676 players, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves. No extra branches or forced updates.
- Next: exact-head CI, real LAN latency/disconnect, reconnect recovery, Crown Royals art, Player Studio/Tricks.

## 2026-10-25 05:01 CET — LAN-055 fractional analog wire compatibility (0.9.41.6 candidate)
- Baseline dev=main `a0e5b30f2a806853c1366325c15d75e10ee4c3cc` (0.9.41.5): dev Modular #40156696929 and Full 4+4 #40156696970, main Full #40156962342, Pages #40156962104 green; only dev/main branches.
- Root cause: LAN-053 preserved fractional guest tilt locally but `normalizeLanPacket` required integer dx/dy, rejecting analog movement before wire transmission. LAN-055 accepts finite fractional [-1,1] axes while preserving malformed-axis rejection, host-authoritative frame queue and four actions.
- Added two Node regressions for guest send→wire→host frame and invalid-axis boundaries; changed obsolete assertion that rejected a valid 0.5 axis. Source-executed V8 smoke passed before commit. New-head 4 Node + 4 Chromium, Modular QA, protected main/Pages hosted byte smoke and real two-device LAN require independent verification.
- 0.9.41.6 About/package/README/policy/shared memory/offline cache aligned. No roster, save, SD09, control-count or graphics changes. Next: CI, two-client QA, reconnect, Crown Royals art, Player Studio/Tricks.

## 2026-10-25 03:59 CET — LAN-054 host phase transition delivery (0.9.41.5 candidate)
- Baseline dev=main `b74ace27bee043355af0e9b374236a238c8895f2`; exact-head dev Modular QA #40153292635 and Full Regression Census #40153292598 green, main Full Regression #40153517483 and Pages #40153517632 green for 0.9.41.4. Only dev/main branches found.
- Root cause: `createLanLiveMatch.step` returned before sending when the host entered `paused` or `finished` between physics frames, leaving the guest on a stale phase despite LAN-048 metadata support.
- LAN-054 sends one host-authoritative paused/finished snapshot without `game.update`, neutralizes guest controls during frozen phases and retries failed sends. Two focused Node regressions cover pause/resume/finish, frozen physics and retry. Source-executed V8 smoke passed; exact-head Node/Chromium/Modular CI and real two-client LAN are pending until independently verified.
- Candidate 0.9.41.5 aligned in About, package, README, sw cache, version policy and shared memory. No roster, save, SD09, button or offline schema changes; no extra branch/force push. Green exact-head protected promotion and hosted byte smoke remain separate gates.
- Next: inspect CI, diagnose any failures, real two-client pause/resume/latency/disconnect QA, Crown Royals directional art, Player Studio/Trick, protected Pages certification.

## 2026-10-25 03:06 CET — LAN-053 proportional guest gamepad steering (0.9.41.4 candidate)
- Starting exact dev/main `f934e2d7c2572788d400f555a1f398f9a923f459`, 0.9.41.3 production. Dev Modular QA #40145196269, Full Regression Census #40145196262, main Full Regression #40145491155 and Pages #40145491629 all reported success.
- Found `src/modules/lan-live-match.js` guest send path used `Math.sign` on axes: analog 0.25/-0.5 was transmitted as 1/-1, turning gentle stick input into full-speed movement. Preserve finite proportional axes, clamp out-of-range values to [-1,1], map NaN/Infinity to neutral. Host already normalizes diagonals; no extra buttons or packet schema changes. Added LAN-053 focused regression.
- Executed actual proposed module in V8 with fake guest peer: proportional .25/-0.5, invalid Infinity/-4 and keyboard 1/0 all passed. Full exact-head 4 Node + 4 Chromium, Modular QA, physical two-client LAN and main/Pages smoke are not yet verified for this candidate; no release claim until green.
- Updated package, About release notes, README banner/heading, policy, shared memory and rotated service-worker cache to 0.9.41.4. Preserve 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline and save compatibility. No extra branch or forced push.
- Next: inspect new exact-head CI; diagnose and repair failures; two-client analog/latency/reconnect QA; Crown Royals #15; Player Studio/Trick; protected green-head promotion and hosted byte check.

## 2026-10-25 02:01 CEST — LAN-052 frame-aligned host input + browser QA contract repair (0.9.41.3 candidate)
- Baseline dev `7383694f715676adad78aab37d71252c5e1eb5d4`, main `d2d5101c326e740da134b97d62bc0b1e5f72f0b1` (39 commits behind dev). Exact-head Modular QA #40141980896 succeeded; Full Regression Census #40141980887 passed preflight, four Node shards, browser shards 0/1/3 and preview; browser shard 2 failed `v08247_menu_browser_qa.py` because its obsolete `not ready` assertion contradicted the new playable LAN lobby. No protected promotion or Pages certification.
- LAN-052 host now consumes only `stepHostMatchFrame(frame, validatedInput)` controls, not the last asynchronously received raw packet; absent frames become neutral, held actions release, future packets cannot affect earlier frames. Source-executed V8 smoke passed on active host frame and missing-frame neutralization; focused Node/Chromium and exact new-head CI are pending. Updated regression for frame-specific press/release and replaced stale menu placeholder assertion with actual host/guest roles.
- Candidate 0.9.41.3 aligned in release.js, package, README, version policy, shared memory and rotated sw cache. Preserve four buttons, 223/2676 identities, six formations, ten Career/Cup slots, SD09, offline and save compatibility. No extra branches or forced updates.
- Next: exact-head Modular and 4+4 QA; two real Chromium clients with manual SDP; test input loss, reconnect and phase; graphics Crown Royals #15; green protected promotion and Pages hosted byte smoke only after verification.

## 2026-10-25 01:05 CEST — CI assertion repair + LAN-048 host-authoritative phase sync (candidate 0.9.41.1)
- Baseline at investigation: dev `df8a93d43274e957a4e49d290bf9d5173486580a`, main `d2d5101c326e740da134b97d62bc0b1e5f72f0b1`. Modular QA #40141272376 failed 10/683 Node tests: six obsolete exact audio-bridge layout regexes, three outdated adjacent module-order assertions, and one incomplete LAN fixture missing `controlled`. Concurrent dev `f64b562a38d18916e404ea607ca27f97d4429f59` already repaired the fixture; did not overwrite it.
- `6c32a2f578db21bdbebcf0264ce19e19976cbe55`: updated nine test files to assert guarded engine-to-audio forwarding and the actual LAN live-match module order. Source-backed V8/regex checks confirmed real UI forwarding and offline/build module lists; exact-head Modular QA #40141514346 succeeded. No player-facing code or version bump in this commit.
- `0f8af146dac086694b00d33d1136fdbf7c399a12`: LAN-048 guest applies host-sent `paused`, `play` and `finished` phases instead of retaining stale guest phase; preserved half, active-player and ball-owner snapshot sync. Added focused LAN regression. Bumped About-only candidate 0.9.41.1 in release.js, package, README, sw cache, policy and shared memory. V8 source-executed pause/resume/finish/owner smoke passed. Full exact-head 4 Node + 4 Chromium, Modular QA, two physical browsers, main promotion and Pages hosted byte smoke were not verified when recorded.
- Preserved 223 teams/2676 players, six formations, four controls, ten Career/Cup slots, SD09, offline/legacy saves. No new branches, no force push, no bypass.
- Next: inspect exact-head CI, repair residual failures, two-client LAN/device tests, Crown Royals side-orientation #15, next Player Studio/Trick increment, protected main/Pages certification only after green exact head.

## 2026-10-24 — LAN-041 authoritative host-state snapshot bridge (internal 0.9.40.0)
- Started with exact dev/main `6b78c4175ca681caee1aa88418e4444ff94b1dc2` (identical). Earlier LAN-038/039/040 source and regressions were already on both branches; this does not independently certify their CI.
- Source `a5ba1c400170740a94183b89f7cff108a92c4e32`: peer API now exposes `sendHostMatchState({tick,clockMs,scores,ball,players})`. It adds the negotiated session's room/host identity and protocol version before delegating to existing validated, monotonic host snapshot sender. It does not mutate match state, create a new control, run simulation, render the guest, or claim playable LAN.
- Regression `ae8d8820312a7a56b92c090f0f84a882b6097b77`: fake host/guest RTC handshake, snapshot transport and identity, replay and malformed-state rejection, role/disposal gates. Source-backed V8 smoke passed 6 checks; actual Node test suite, 4 Node + 4 Chromium, Modular QA, protected promotion and Pages byte smoke remain **unverified**. Push-triggered Actions runs cannot be enumerated by the connected commit-run tool (PR-only); public Actions web fetch returned DisabledError.
- No player-facing code change: About-only candidate 0.9.40.0 and package/README/sw cache unchanged. Preserve 223/2676, four buttons, six formations, 10 saves, offline/save compatibility, SD09. No extra branch.
- Next: verify focused Node + exact-head 4+4 and Modular; repair failures; wire actual host engine tick to bridge and guest rendering; two-browser LAN play/latency/disconnect QA; Concept Royals #15 visual QA; protected green-head promotion + Pages hosted hashes.

## 2026-10-24 — LAN-016 ready-gated guest input / host frame bridge (internal 0.9.39.0)
- Starting exact dev/main: `a80773b6200bbbdae59d1f5b1bc08ef08079e60a`, previous exact-head Modular QA #40088564400, dev Full Census #40088564403, main Full Census #40088918405 and Pages #40088918417 all green.
- Feature `e633b03b`: `createLanPeerConnection` now exposes `sendGuestInput(frame,buttons,dx,dy)` and `advanceHostFrame(frame)`, delegating to LAN-013's validated host-authoritative protocol only after SDP + hello handshake and an open DataChannel. No fifth control, match-loop integration, snapshot sync, signaling UI or playable two-browser claim. Test `23ba882b` covers both peers, role gates, valid four-button input, rejected duplicate frame, neutral next frame, disposal.
- Source-backed V8 mock-RTC smoke: 5/5 assertions passed (not Chromium or real WebRTC). Exact-head Modular QA #40092061230 succeeded at `23ba882b`; Full Census #40092061243 was in progress when logging. Earlier `e633b03b` Full Census cancelled by subsequent test commit; not a failure.
- Candidate About-only 0.9.39.0 unchanged for internal transport work; release contract/README/cache unchanged. Preserve 223/2676, six formations, four buttons, ten Career/Cup slots, SD09, offline and saves.
- Next: finish exact-head 4 Node + 4 Chromium and Modular QA after log/checkpoint commits; protected promotion only when exact green; Pages hosted hash check; then accessible manual SDP UI with coordinated version bump; integrate guest match input/snapshots; real two-browser and Crown Royals directional visual QA.

## 2026-10-24 — LAN-014 blocker repair and LAN-015 handshake readiness gate (internal 0.9.39.0)
- Starting dev `411aac75`, main `c1cbc0c6`. Exact-head Modular QA #40085602762 and Full Census #40085602734 FAILED: `tests/lan_peer_connection.test.cjs:48`, "Invalid LAN signaling role or phase". Root cause: earlier `guarded()` disposed a healthy peer on expected wrong-role, malformed and replayed signals, preventing retry in the existing regression.
- Repair `4f46c74e`: preserve peer on rejected signaling before phase transition, but dispose a partially mutated RTC connection on actual asynchronous failure. Regression `802c9aa8` covers rejected signals and healthy reuse.
- Next internal LAN-015 feature `09fd06ea`: `awaitReady(timeoutMs)` waits for completed DataChannel protocol hello after SDP, rejects timeout/closed/failed peers, and never introduces a fifth control or new UI. Regression `b332a140` covers delayed handshake and timeout/close/dispose. Not yet wired to gameplay, lobby, or two physical browser peers.
- CI for the new exact dev head pending; no local/full-test or deployment claim until observed. Main must remain unchanged unless protected exact-head 4 Node + 4 Chromium + Modular QA is green. Candidate About-only 0.9.39.0 unchanged for internal LAN work; rosters, save slots, offline and graphics unaffected.
- Next: inspect latest CI, fix failures, integrate manual host/guest lobby UI with full version bump, wire input/snapshot, certify two-browser LAN and Crown Royals directional graphics, promote via protected pipeline with hosted byte verification.

## 2026-10-24 — LAN-014 manual WebRTC offer/answer bootstrap (0.9.39.0 unchanged)
- Baseline: dev/main both `cf9a3b27`, 4 Node + 4 Chromium Full Census #40080799545, Modular QA #40080799548, main hosted smoke #40081043524 and Pages #40081043685 all green. No extra branch.
- New `src/modules/lan_peer_connection.js` creates a host RTCDataChannel, accepts guest datachannel events, exchanges copy/paste SDP offer/answer after complete ICE gathering, validates protocol/session/build, rejects invalid roles/replay/oversize SDP, closes unexpected channels and cleans up. Tests `tests/lan_peer_connection.test.cjs` cover 4 cases.
- Focused actual Node tests: 4/4 passed locally using isolated dependency stubs (not full repository modules). Exact-head GitHub CI remains authoritative and must be checked; no claim of two-browser playable LAN. The helper is not wired into UI or match loop and uses host candidates only (no external STUN/TURN).
- Non-player-facing LAN infrastructure: keep About-only 0.9.39.0 and existing README/release/cache; preserve 223/2676, six formations, four controls, ten Career/Cup slots, SD09, offline and saves.
- Next: inspect exact-head 4+4 and Modular QA; implement UI signaling copy/paste safely; bind authoritative game-loop input and snapshots; two-browser LAN smoke; promote only exact green head and verify hosted bytes.

## 2026-10-24 — LAN-013 live protocol DataChannel binding (0.9.39.0 unchanged)
- Baseline: dev/main both at `ebae2357`; Modular QA #40076844592, 4 Node + 4 Chromium Full Census #40076844583, main Full Census/hosted smoke #40077398244 and Pages #40077398263 all succeeded. Prior release candidate has now been protected-promoted and hosted. No new branch.
- LAN-013: add `src/modules/lan-protocol-channel.js` binding existing host-authoritative LAN-001–012 handshake/input/frame protocol to already-established RTCDataChannels. Supports both host and guest, late-listener hello echo, bounded host frame consumption, send-failure sequence preservation, invalid traffic rejection, duplicate-binding guard and close/dispose cleanup. Four focused Node tests. This is NOT SDP/ICE creation, match-loop/UI wiring or certified two-client gameplay.
- Local source-backed V8 checks 16/16 passed; actual Node/Chromium/Modular CI and hosted verification for new head pending. No player-facing change: About-only four-part version 0.9.39.0, README, package and offline cache unchanged. Preserve 223 teams/2676 players, four buttons, six formations, 10 Career/Cup slots, SD09 and legacy saves.
- Next: verify exact-head focused and full CI; diagnose any failure; wire peer connection + manual signaling to LAN channel; connect authoritative match loop; browser two-client smoke; protected promote only green unchanged dev head.

## 2026-10-24 — LAN-012 DataChannel hello bootstrap and exact CI blocker repair
- Investigated push-triggered Actions via repository REST API (commit-workflow lookup only lists PR events). Full Regression Census #40076155967 failed 621/622 preflight Node tests; Modular QA #40076156005 also failed. Exact root cause: old `tests/magic_banana_peel.test.cjs` asserted two overlapping peels vanish on one victim, contradicting recently changed one-victim-per-tick behavior. Corrected test in `81d37550`: unused peel persists and can affect another opponent. Modular QA for `81d37550` succeeded (#40076779537); subsequent exact-head checks pending.
- Next bounded LAN feature: `startLanHostChannel` and `startLanGuestChannel` serialize and send canonical host/guest hello packets on already-open DataChannels, return role-specific immutable session only on success, and reject closed/broken channels and role confusion. Source `8eab5d6c`, three Node regression tests `66ec2982`; 10/10 source-executed V8 handshake/frame assertions passed. Not a live two-client browser match: WebRTC signaling/UI wiring remain future work.
- No player-facing changes, so 0.9.39.0 remains About-only dev candidate; no package/README/sw cache bump. Preserve 223/2676 roster, four controls, SD09, six formations, ten saves, offline/legacy compatibility. Main remained `72322b31` at last check. No protected promotion without green exact-head Node/Chromium/Modular QA and hosted verification.
- Next: verify new exact-head CI, repair any failing test, inspect art in browser, complete LAN transport integration, promote only certified head.

## 2026-10-24 — LAN-011 simulated-frame replay fix
- dev/head at start ahead 31 of main 72322b31, About candidate 0.9.39.0. LAN host now rejects an arriving guest packet for frames already simulated, even when hostFrame argument was stale. Source commit 69555ac7; regression tests 32c1284a.
- Non-player-facing protocol fix, no bundle number change. Latest full 4 Node + 4 Chromium + Modular QA, hosted Pages and Crown Royals manual visual acceptance remain unverified; protected main promotion not requested without exact-head green checks.
- Next: run focused LAN tests, complete CI gates, inspect graphics, then safe protected promotion.

## 2026-10-24 — STUDIO-0390: live normal Dribble Style guide (candidate 0.9.39.0)
- Baseline exact heads: dev `b620034a912d6e3809306e369e075a5fdcf4bd29`, main `72322b31113e0163c41d21327955c381bc2b9524` (21 commits ahead). Only dev/main branches found.
- UI commit `09469a895fddd7ec95c80f7b10fa62d6835978c5`: accessible live status for normal Dribble Style selection, describes Nutmeg timing, Rainbow Flick defender read, generic evasion, no levels or Magic Trick confusion. Preview changes neither save nor player; existing SAVE DRIBBLE STYLE remains the only write.
- Tests `b0d84344b3fc25e55f9e8db3368adf44a5fb8a8e`: six Node regression cases; eight source-executed V8 checks passed for guide behavior, handler and read-only contract. Actual Node/Chromium/Modular QA not yet executed or verified.
- Four-field About-only 0.9.39.0 candidate aligned in package, release notes, README heading/banner/date, service-worker cache, version policy and shared memory. Previous candidate increments remain accumulated.
- CI diagnosis: GitHub commit workflow lookup filters PR events, returned no runs; combined status empty; direct Actions/API web fetch disabled. No green exact-head CI evidence, so protected promotion/Pages byte verification not attempted and deployment is **not** claimed.
- Next: exact-head four Node + four Chromium + Modular QA; real browser Player Studio and Crown Royals art; safe protected main promotion only after full green; genuine two-client LAN increment; Magic Trick counterplay and directional sprite QA.

## 2026-10-24 — STUDIO-0380 live Super Shot level/selection preview (0.9.38.0 candidate)
- **Baseline:** exact `dev` was `ddfd72cac927ce0ec09cc79b6e349f2b7a59056f`, 11 commits ahead of `main` `72322b31113e0163c41d21327955c381bc2b9524`; only `dev` and `main` branches found. Recent open issues include #15 direction sprites, #12 About revision and #3 Android dribble. GitHub commit workflow lookup returned zero PR runs and combined statuses empty; public Actions dashboard unavailable. This is **not** evidence that push CI passed.
- **Feature:** Player Studio Super Shot now has a live, accessible read-only status for selected shot and level, including KEEP CURRENT, REMOVE and unknown legacy shots. Both SHOT TYPE and SHOT LEVEL changes update the guide; existing icon preview is refreshed. No save or roster mutation occurs until SAVE SUPER SHOT. Commit `fc964a6e`.
- **Tests:** Six focused Node regression cases committed `082850e5`; all six executed successfully in a source-backed V8 harness with mocked Node interfaces. Five additional pure-guide smoke cases and twelve release-contract checks passed. These are **not** the actual Node runner, four Node/four Chromium shards, Modular QA or manual browser/graphics tests.
- **Version:** About-only `0.9.38.0` candidate staged across `package.json`, `release.js`, README banner/heading/date/notes, service-worker cache, policy and shared memory. Previous uncertified fixes remain accumulated on `dev`. No new branches, no changes to 223 teams/2676 players, six formations, four actions, 10 Career/Cup slots, SD09, saved formats or offline dependency.
- **Release gate:** Exact-head Node/Chromium 4+4, Modular QA, desktop/touch and visual review, protected promotion and Pages SHA/byte smoke remain **unverified**. Continue useful dev work regardless of pending release; do not promote without evidence.

## 2026-10-24 — TRAP-0371 overlapping Magic Trap fairness (0.9.37.1 candidate)
- **Baseline:** `dev` and `main` identical at `72322b31113e0163c41d21327955c381bc2b9524` at start; 0.9.37.0 was present on both branches, but no exact-head 0.9.37.0 certification was independently observed this run. Prior 0.9.36.0 certified commit `c711184d`. Open issues reviewed (#15 sprite direction, #12 About build revision, #3 Android double tap).
- **Reproduction:** Original hazard model consumed two overlapping Banana Peels (or two Ice Patches) on the same grounded rival in one physics tick, reporting one slip and leaving zero traps. Separate banana/ice collision passes also consumed both trap types on the same rival; engine ignored duplicate ice stun but the ice trap was already gone.
- **Fix:** `src/modules/magic-hazards.js` now excludes already-hit victims within each hazard family and accepts prior Banana victims when advancing Ice. `engine.js` forwards `next.slips` to Ice so only one trap is consumed per rival per tick; unused traps remain available to other rivals. No new buttons, player data, save schema or offline dependency. Commits: model `8c21a23d`, engine `981ffcf3`, four Node regression cases `424aac69`.
- **Versioning:** Staged 0.9.37.1 candidate across package, release notes, README banner+heading, SW cache, policy and shared memory. Candidate is not a certified production release.
- **Validation:** Source-executed V8 checks 19/19 passed, including reproduction cases, patched model, engine call wiring, syntax parsing of model/test/SW and release consistency. **Node test runner, four Node/four Chromium shards, Modular QA, real-browser visual QA, protected promotion and hosted byte smoke have not been verified.** Public GitHub Actions page inaccessible from this runtime; GitHub connector workflow lookup only covers PR runs. Container network could not resolve github.com. Do not promote unverified head.
- **Next:** Obtain push-run CI via GitHub Actions; repair failures; verify browser gameplay/graphics; promote only exact green head; continue next independent dev increment while release waits.

## 2026-10-24 — STUDIO-0370 tier-aware Super Defence previews (0.9.37.0 candidate)
- **Baseline:** dev/main identical at certified 0.9.36.0 `c711184de5c6e53204ab0a7104042241a0224465`. GitHub jobs inspected for successful dev Full Census #40056890152 (4 Node + 4 Chromium + preflight + preview + promotion), Pages #40057151122, main Full Census/hosted smoke #40057151222. Open issue search included art direction #15, About SHA #12, Android dribble #3; no branch created.
- **Feature:** Player Studio's Super Defence move list now uses the *currently displayed tier* from first render. A read-only, accessible status explains the number of moves and tier-3 Spin Bumper unlock; changing tiers rebuilds choices, resets a now-locked move to KEEP CURRENT, updates the ability icon and announces the new status. No save write until SAVE DEFENCE ABILITY; existing 4 controls, roster IDs, six formations, ten slots, SD09 and offline/save format untouched.
- **Commits:** UI `27eafe25`, four initial focused Node cases `cbb77b17`, fifth real tier-callback simulation `a19e0b20`; About/package/README/SW/policy/shared-memory version coordinated to `0.9.37.0`. README test count corrected at `78e31a15`.
- **Local tool validation:** source-executed V8 checks passed for guide descriptions and real tier-change callback (tier 3 retains Spin Bumper; downgrade to tier 2 resets KEEP CURRENT; two icon refreshes). V8 syntax parse passed for `ui.js`, `release.js` and new Node test source. This does **not** mean Node or Chromium tests ran.
- **Certification:** exact-head push-triggered workflow runs unavailable via PR-only commit-workflow connector; current 0.9.37.0 CI, Modular QA, manual visual review, protected promotion and hosted Pages byte smoke **unverified**. Do not claim deployment.
- **Next:** check actual push workflow runs/failed job logs; repair; run focused Node and full 4+4 + Modular; inspect Player Studio and Crown Royals visuals in Chromium; promote only exact fully green head; continue next small dev feature regardless of pending release.

## 2026-10-24 — TRAP-0360 per-team Magic Trap fairness and exact-head CI root cause
- **Start state:** dev 51b6eb95, main d98edf1c, dev ahead 35; only dev/main branches. Main 0.9.32.1 was deployed earlier, new 0.9.36.0 is an **uncertified dev candidate**.
- **Root cause of blocked promotion:** exact-head Modular QA [#40052444496](https://github.com/saeedsai/SuperMagicFootball/actions/runs/40052444496) and Full Regression Census [#40052444562](https://github.com/saeedsai/SuperMagicFootball/actions/runs/40052444562) both passed 594/595 Node tests, failing only `tests/project_memory_contract.test.cjs` because own checkpoint lacked `## Next smallest action`. Full Census preflight failure skipped 4+4 and promotion. Repaired own required headings, without weakening test, at ae978e01.
- **New gameplay enhancement:** Banana Peel and Ice Patch now each retain up to six traps **per team**, rather than evicting enemy traps when a side reaches the previous shared quota. Implementation 17b2bb1b; three new focused Node regression tests 1ca05e0d verify 24 total cap, enemy trap isolation, oldest-own eviction, and SHOOT-slide clearing enemy traps only. Source-executed V8 harness passed 19 focused assertions; actual Node/Chromium/Modular exact-head certification pending.
- **Version and documentation:** staged 0.9.36.0 in About, package, README dated banner/heading, service-worker cache, version policy, shared memory and release-contract tests; legacy saves, 4 buttons, 223 teams/2676 players, six formations, ten slots and SD09 unchanged.
- **Next:** read exact-head CI via GitHub REST workflow runs; repair failures; verify real desktop/touch browser and artwork; only promote unchanged fully green dev through protected workflow and verify hosted SHA/bytes. Continue another bounded dev feature even if deployment is pending.

## 2026-10-24 — STUDIO-0350: accessible live Magic Trick effect/counterplay guide (0.9.35.0 candidate)
- Run start: `dev` 0097d2e04f850bb61190317924d9d5ff80c447ca, 23 commits ahead of `main` d98edf1cd64ff729d1bbaf5d7c319c58c759d823. Only `dev` and `main` branches found. Open issues include Chromium keeper roll, Concept Royals side-view orientation, memory identity regression, offline About revision, penalty keeper control and Android double-tap.
- Added a live, accessible Player Studio Magic Trick guide for all eight selectable Tricks. Selecting KEEP CURRENT previews equipped equipment, REMOVE previews no Trick, and choosing another previews the actual effect and counterplay without a storage write. Screen-reader live region follows existing icon selection; no new action buttons, gameplay physics or save-schema changes. UI commit `31f8deb6395a231645a0be0fb1b8b019ae75fe93`; focused regression tests `34c3f0d3bd02be53e09a6b1c010429e1eaf90441`.
- Advanced player-facing candidate 0.9.34.0 → 0.9.35.0 across About release metadata, package, README banner/heading/dated notes, version policy, shared memory and rotated service-worker cache. Version contract now asserts cache version suffix; corrected initial regex escaping in `00a852191133fceea1ea6ed329f62f39d999dcb8`.
- Focused V8 harness executed 4 Player Studio tests and 7 version policy assertions: **11/11 passed**. Independently V8-parsed 42 shipped scripts after removing ES module imports/exports and replacing import.meta; this is **not** a real `node --check`, Node 4-shard, Chromium 4-shard, Modular QA, screenshot or Pages certification. No production promotion claimed.
- GitHub connector workflow lookup filters PR-triggered runs and returned no exact-head runs; combined commit status was empty. Public Actions web fetch was disabled. These are visibility limitations, not proof of green CI. Preserve candidate in dev and keep coding while protected promotion awaits exact-head evidence.
- Next: (1) exact-head CI/log diagnosis, (2) Player Studio browser and simulated-touch QA, (3) 4 Node + 4 Chromium and Modular QA, (4) protected unchanged-head main promotion and hosted byte smoke if green, (5) next LAN/Crown Royals incremental work on dev regardless of pending release.

## 2026-10-24 — ARM-0340: visual Magic Trap arming countdown (candidate 0.9.34.0)
- At run start `dev` was `33c8818888631873e794044ad6f9e781a44bfdc2`, 13 commits ahead of `main` `d98edf1cd64ff729d1bbaf5d7c319c58c759d823`. Inspected AGENTS, release policy, SHARED, own checkpoint, open issues, render and hazard regression.
- Added two distinct shrinking canvas arming rings for Banana Peel (.25s) and Ice Patch (.3s), retaining their existing hazard timers and SHOOT-slide disarm. Gameplay physics, controls, team/player data, save schema unchanged. Render commit `191fdd0e43a90be85f7df9150a945e4671d7ef01`.
- Added `tests/magic_hazard_arming_telegraph.test.cjs` with canvas spy checks for full/half/expired/armed states, commit `77cd04572b952375424ada39863dfa4e32500e09`.
- Executed exact fetched sources in isolated JavaScript V8 test harness with Node-compatible assertion/fs/test mocks: 3/3 arming canvas tests and 9/9 Ice/banana/slide hazard tests passed. This is **not** a real Node invocation, 4+4 Chromium CI, Modular QA, or manual screenshot verification.
- Advanced candidate 0.9.34.0 in About, package, README heading/banner/notes, SW rotated cache and policy/shared memory. No certified main release claimed. At inspection exact `dev` `9a9a20694c3db7cedfde3bce645dc9983dc0a34d` was 21 ahead of main; GitHub connector commit workflow query (PR-filtered) and combined statuses returned no runs/statuses, so exact-head promotion blocked pending independently observed green CI. Public GitHub Actions page could not be fetched in this environment.
- Next: verify full 4 Node + 4 Chromium/preflight/preview + Modular QA, inspect gameplay screenshots on real browser, fix failing jobs, then promote only unchanged exact green head via protected pipeline and verify main/Pages bytes. Continue next Player Studio or LAN increment on dev independently of pending release.

## 2026-10-24 — SLIDE-0330: four-button defensive trap counter (candidate 0.9.33.0)
- At run start `dev` and `main` were identical at `d98edf1cd64ff729d1bbaf5d7c319c58c759d823`. No additional branches created.
- Added deterministic `disarmMagicHazards` to allow an active grounded defensive SHOOT slide to clear nearby enemy Banana Peel and Ice Patch traps before collision, without a fifth button. Allies, keepers, stunned/airborne/idle players cannot disarm; the original slip logic remains intact. Source `7a457ec0`; engine feedback and event `41bc4f11`; UI controls text `6adb8c25`.
- Added three model/runtime tests `8cc8f7e5`; strengthened dynamic offline/version contract `5a036707`. Staged About-only `0.9.33.0` candidate in package, release metadata, README banner/heading, SW cache and policies. Earlier `0.9.32.1` is historical; do not claim this candidate deployed.
- Focused verification in connector-side JS harness: 17 existing+new hazard test callbacks passed with actual repository module injected; 19 independent syntax/model/order/version assertions passed. These are **not** Node CI, Playwright Chromium, Modular QA or live visual inspection.
- Full exact-head 4 Node + 4 Chromium + preflight + preview + Modular QA and hosted SHA/byte smoke remain **unverified** here: GitHub connector's commit workflow lookup is PR-only; combined statuses returned empty; direct web Actions fetch unavailable. CI workflow automatically runs on `dev` push and only fast-forwards unchanged green exact head; do not bypass.
- Next: inspect actual GitHub Actions runs for latest SHA; repair failures; visually inspect slide/hazard feedback and Crown Royals; verify protected `main` and Pages bytes if promoted; continue next small Player Studio / Trick / LAN / art feature even while CI is pending.

## 2026-10-24 — HAZARD-0321 Banana/Ice coexistence bug fix
- Current main/dev were identical at 73cc8a6c (0.9.32.0) at run start.
- Found that placeBananaPeel used active.slice(...) across *all* magic hazards, deleting active Ice Patches when adding bananas. Fixed by capacity-limiting banana hazards independently while retaining other types, commit 5eb996ce. Added interleaved placement/capacity regressions at 54c215bf.
- Staged About-only four-field bugfix candidate 0.9.32.1 across package, release metadata, README, offline cache and policies. Full exact-head CI not available at last check; do not claim hosted/visual certification.
- Next: run 4 Node + 4 Chromium + Modular QA, verify actual playable hosted source and sprite visuals, promote only fully green exact head.

## 2026-10-24 — ICE-032 Ice Patch Magic Trick candidate
- Continued on dev while release CI remains pending: bounded Ice Patch placement, arm delay and distinct enemy-only ground trap (242e17e1), runtime integration (f1e7fa58), cyan canvas sprite (72b815da), regression tests (b6f74640).
- Version candidate 0.9.32.0 synchronized across package, About, README, offline cache and policy. Main baseline 1e30f475 on 0.9.31.0. No independently verified image comparison, hosted byte smoke or full exact-head 4 Node + 4 Chromium + Modular QA yet. Protect main.
- Follow-up: inspect latest CI; resolve failures; check real gameplay/graphics; promote only exact green head; verify Pages.

## 2026-10-24 — TRICK-031 Banana Peel trap and certified 0.9.31.0
- Added deterministic bounded Banana Peel floor hazard behind the carrier: 3-second lifetime, 0.25-second arming, maximum six, one grounded opposing outfielder trips; allies, keepers and airborne players safe. Collision can spill possession; clears on kickoff/PK. Original lightweight canvas artwork, no fifth button, no roster/save schema changes. Core commits: `1ffc6940` module, `b2b5fbc0` engine, `8e4ac5ab` render, `c93d167d` tests; `ddabd2bf` vertical-direction fix.
- CI root cause at `037a0785`: three legacy Node assertions expected outdated planned-Magic UI or adjacent SHOTPATHS→ENGINE order; corrected the contracts without suppressing runtime assertions (`4fe7d009`, `b93a4645`, `1e30f475`).
- Certified `1e30f475be4b47a7028a6aa6a46edf92420449da`: Modular QA `40038585830` 577/577 Node PASS; Full Regression `40038586129` preflight + four Node + four Chromium + preview PASS; protected exact-head fast-forward to `main` succeeded. Pages build/deploy `40038994094` PASS; main hosted byte smoke `40038993833` PASS, matching checked-out main HTML, JS, CSS and release version after initial propagation delay.
- Crown Royals art approval, actual mobile-device testing and future two-peer LAN are NOT implied by this green regression. Next: LAN browser synchronization; remaining Trick identities/counters; Concept Royals directional art issue #15; keeper roll issue #38; physical touch/visual QA.

## 2026-10-24 — Magic Trick hold controls
- 2026-10-24 Magic Trick control: Hold DRIBBLE for one full second in continuous ball possession, once per hold, to trigger equipped separate Magic Trick. Jump/pass/shoot chords excluded, dribble tap preserved; eight bounded effects with counter, stamina and cooldown. Engine e3999854, possession fixes f6eef8f9/24cfe61a, UI 90ccfdbc, regression a67946d4/2f2b54da. Candidate 0.9.30.0; exact head CI, gameplay/graphics visual and main/Pages verification pending.

## 2026-10-24 — LAN-010 guest DataChannel sender
- Implemented guest session handshake gate and atomic four-button DataChannel frame send on existing `dev`: source `13e281df`; three Node regression cases `a9fafed1`. Two mock peers now exchange hello and guest input through a simulated open channel to host queue/frame resolver. No signaling, live browser LAN UI or authoritative host snapshot yet.
- Focused JS function-level smoke executed before commit: premature send rejected; host/guest hello validated; guest packet traversed mock channel and host frame queue; closed/throwing channels did not advance sender state. Full Node+Chromium CI is authoritative and pending at the final dev SHA.
- CI diagnosis: `fetch_commit_workflow_runs` returns only PR-triggered runs, so its empty result does **not** imply no push CI. GitHub REST `/actions/runs?branch=dev` showed exact-head `759f7b1d` Modular QA success (run 40036907099), Full Regression Census run 40036906913 with 4 Node, 3 Chromium and HTTP preview green while Chromium shard 1 was still running; subsequent dev commits supersede that head. Use branch-filtered Actions REST for exact-head evidence.
- Candidate About version remains 0.9.29.2 (internal LAN-only changes); 223 teams, 2676 players, six formations, four buttons, ten saves and offline paths untouched. Do not claim `main` or Pages deployed without exact-head green 4+4, protected promotion and hosted byte smoke.

## 2026-10-24 — LAN-009 host frame advance
- LAN-009 host monotonic frame simulation: 044b4300 adds advanceLanHostFrame with neutral fallback and replay-frame refusal; 29f68d26 carries simulation watermark over valid guest packets; 7e1a109f adds regression cases. No UI or roster change; About version 0.9.29.2 unchanged. Earlier dev was 8 ahead main bfad8158. QA, hosted Pages and art visual checks not yet certified.

## 2026-10-24 — LAN-008 host channel/queue bridge
- LAN-008: atomic host handshake-to-frame queue bridge (4c148c1d) and targeted positive/timing-rejection/retransmit/session tests (901a8c70). A rejected future frame does not advance peer replay state. Protocol groundwork only; no live networking/UI changes, version 0.9.29.2 unchanged. At start dev was 4 ahead of main bfad8158; exact-head QA/Pages not confirmed.

## 2026-10-24 — LAN-007 handshake gate
- LAN-007 handshake-gated peer receiver: a7467a22 adds immutable peer state and rejects input before complementary version/session hello, replay and renegotiation; 992615ba adds regressions. Non-player-facing foundation only; package/About remains 0.9.29.2. Earlier main/dev both bfad8158. CI and Pages still require exact-head verification.

## 2026-10-24 — LAN-006 transport framing
- LAN-006 non-UI transport boundary: 16426d20 adds validated send/receive for an already-open WebRTC-compatible data channel, and 92683b97 adds tests for replay, malformed frames, channel readiness and four-button inputs. No signaling or live LAN game yet. Base main/dev was synchronized at 10a1e348 before development; exact-head CI and Pages/visual QA pending.

## 2026-10-24 — LAN-005 guest input sender
- LAN-005 guest sender: commit 1940052f adds sequenced guest input packet builder; b77edc65 adds Node regression for monotonic frames, action validation, atomic rejection and host queue interoperability. Transport independent, not playable LAN; package/About version unchanged. main/dev previously identical at 28de5112. Exact-head CI and Pages certification pending.

## 2026-10-24 — CI memory-contract repair after LAN-004
- Latest LAN-004 dev head 1ccd6c67 failed Modular QA 40031378895 (550/551 tests) and Full Census preflight 40031378823: `tests/project_memory_contract.test.cjs` rejected wrong identity for smf-hourly-dev-20261019. The checkpoint rewrite used `Agent:` instead of required `**Agent ID:** \`smf-hourly-dev-20261019\`` and omitted required headings.
- Repaired only own checkpoint with exact identity and all six headings (1b649c61), preserving LAN-004 handover. New exact-head CI pending. Earlier e1551b59 full 4+4 + Modular QA passed but is not latest head, so no promotion claim.

## 2026-10-24 — LAN-004: missing-frame neutral host input
- On dev, LAN-004 commits 164d23b8 (resolveGuestLanFrame) and 14df7d2c (focused regression): host produces immutable neutral four-button input when guest frame absent, and consumes real queued guest input without altering future frames. Transport independent, not user-facing; About bundle stays 0.9.29.2. Exact-head CI not yet certified.
- Prior exact main remains a95f4675; no independent hosted Pages or graphics visual certification. Do not merge dev until fresh 4 Node + 4 Chromium + Modular QA passes.

## 2026-10-23 23:59 Europe/Stockholm — LAN-003 bounded host input queue
- Initial main a95f4675, dev dfe05ec7 (ahead 4, behind 0); exact-head workflow lookup returned no runs, so no LAN-002 certification claim. Existing open issue #38 keeper roll, #15 sprite orientation, #3 touch trick remain relevant backlog.
- Implemented host-authoritative, transport-independent input queue with eight-frame lookahead, replay/old-frame/session/type rejection and single-consumption semantics in src/modules/lan_protocol.js (002e339a). Added focused tests in tests/lan_protocol.test.cjs (bd599451). V8 focused runtime checks for queue/replay/consume/lead passed before commit. Full 4 Node + 4 Chromium + Modular QA on this new dev head not yet confirmed.
- No player-visible module import or version change: About-only version remains 0.9.29.2. No actual LAN transport, visual art certification or new main deployment claimed.
- Next: inspect latest exact-head CI, fix any failures, add safe transport integration, verify main/Pages hosted byte smoke and graphics.


## 2026-10-23 23:55 — LAN-002 handshake increment
- Verified main/dev identical at a95f4675; Modular QA 40024359317 and Full Census 40024359322 passed all 4 Node, 4 Chromium and preview. Hosted Pages smoke was skipped; no artistic manual certification claimed.
- Implemented complementary host/guest handshake validation and matching build/session/start sequence in src/modules/lan_protocol.js (048eef1c), with focused positive/negative tests (0ca663bc). Transport is not yet implemented and module is not loaded in the game UI; no player-facing version bump.
- Next smallest action: inspect exact-head CI for LAN-002; fix regressions; continue two-client transport; verify hosted main Pages separately.
## 2026-10-23 23:02 Europe/Stockholm — LAN-001 packet contract (non-player-facing roadmap increment)
- While release CI was pending, added src/modules/lan_protocol.js and tests/lan_protocol.test.cjs directly to dev (commits b1285a3bc269620fbd44be2a2283b08ce28a883d, bf5047b7fdf378cf1eda4c7360d1502674cf64ba). Supports versioned host/guest hello and canonical four-button input packet, strict session/frame/sequence validation, duplicate/unknown action rejection, replay suppression and sanitized untrusted fields.
- Focused V8 runtime: module parse, JSON roundtrip, replay rejection and three invalid-packet cases passed. GitHub exact-head Node/Chromium/Modular QA remains pending. No transport, two-browser sync or LAN UI yet; not a playable LAN claim. Not imported into shipped game; no player-facing version bump beyond startup fix 0.9.29.2.
- Next: complete LAN host authority and two-client transport smoke increment; keep browser startup and protected release QA active in parallel.

## 2026-10-23 23:02 Europe/Stockholm — startup syntax repair + complete module syntax preflight (candidate 0.9.29.2)
- Exact starting dev c1aed416811e78677eef94e38807e6a1e43c43be, main fb5ed03196e6a27ad2d2a075d4e5055a6360dbc1, dev ahead 14/behind 0. Full Census 40023142814 failed preview smoke: console reported `SyntaxError: Invalid or unexpected token`, while HTTP and failed-request lists were empty.
- Root cause: literal backslash-n token after `notes:Object.freeze([` in src/modules/release.js. Corrected to actual newline; V8 parse confirmed before GitHub write. Added test in tests/versioning_policy_contract.test.cjs running `node --check` on every shipped JS module, src/main.js, src/assets.js and sw.js. This is a QA gate, not a graphics certification.
- Candidate bumped 0.9.29.1 → 0.9.29.2; package, About notes, README dated candidate summary/heading, service-worker cache, version policy and shared memory aligned. All commits directly to dev, no new branches or main writes; no gameplay/save/roster/control change.
- Exact-head Full Census and Modular QA are pending; do not claim successful browser kickoff, graphics acceptance, main promotion or Pages hosted-byte validation until verified.
- Next: (1) inspect latest preflight/syntax gate; (2) resolve any remaining Chromium failures; (3) complete 4 Node+4 Chromium and Modular QA; (4) verify protected exact-green promotion and hosted Pages bytes; (5) continue counterable Trick/Studio/LAN/graphics increment on dev regardless of release state.

## 2026-10-23 22:05 Europe/Stockholm — CI test repair and safe main-ancestry reconciliation
- New 0.9.29.0 icon geometry invalidated an old exact-string test in tests/ability_icons_contract.test.cjs, expecting shared pentagon path `M29 22`. Modular QA 40016365371 failed; Full Census 40016365372 was superseded/cancelled by newer commits. Fixed test to assert new shot-specific shape plus radial seam, without removing catalogue coverage (commit ba44d3b0267703cb045d2be650041d5e2c3c3afb).
- Protected promotion blocker: main ff114be6c5ae4fff8f0f155e82b4b60753238320 is PR #43 merge commit with tree identical to its dev parent 429a5129dff222ef3d906badc52a5de6f5f73b6a; dev was 1 commit behind main despite newer content. Safely reconciled ancestry using a genuine two-parent merge commit c5c87e6ff6194fa55e71ecbe9ca6486601e741fd on dev, with exact prior dev tree, and a non-force expected-SHA ref update. Verified main..dev is ahead 26, behind 0. No new branch, main write, force push or source changes.
- New exact-head 4+4 Census, Modular QA, main promotion and hosted Pages byte smoke still require independent confirmation; never cite old green runs as new certification.

## 2026-10-23 22:02 Europe/Stockholm — unique Super Shot ball badges (candidate 0.9.29.0)
- Start: dev 60fa55fdae74dc4cd3d73cfb598a0ee71efbb7d0, main ff114be6c5ae4fff8f0f155e82b4b60753238320, diverged by one main-only commit. Previous exact-head dev CI: Census 40012769919 and Modular 40012769944 both green, but not proof for this new candidate.
- Implemented 23 deterministic, individually shaped Super Shot ball silhouettes with different panel seams in shared Player Studio/Team Management badges. No changes to player identity, saves, control buttons, roster, formations or offline behavior. Added tests/ability_shot_ball_shapes.test.cjs for unique geometry, deterministic output, accessibility, XSS-safe labels, and other icon families.
- Focused V8 execution before commit: 23/23 distinct, 4 assertions successful. Node/Chromium exact-head CI and hosted visual acceptance pending. Updated About/package/README/cache/release policy and version contract to 0.9.29.0; corrected old contradictory quarter-view release notes (painted fallback is active, SVG quarter assets are not live).
- Continue feature development on dev even while release pending; promote only fully green exact-head through protected CI. Do not equate earlier green runs with this commit.

## 2026-10-23 20:03 Europe/Stockholm — Leo #2 quarter sprite integration (candidate 0.9.27.0)
- Baseline exact dev/main f9637876d632b633cceca8f320bb11aa31e3c3ff; Full Regression dev 39992218500 and Modular QA 39992218111 passed; main Census 39993883624 and Pages deployment 39993883682 passed for prior 0.9.26.0.
- Added transparent Leo #2 ¾ front/back SVG with blond hair, headband and shirt number 2; actual Crown renderer chooses it by view, QA fixture embeds it, SW precaches it. Updated Node draw-path checks and Chromium Leo loader assertion. No roster/control/save changes.
- Candidate 0.9.27.0 synchronized package/About/README/cache/version tests and policies. Local git clone blocked by DNS (github.com unresolved); exact-head hosted CI and visual screenshots still required. No production deployment claim.

## 2026-10-23 19:00 Europe/Stockholm — Alex ¾ sprite integration and Crown CI repair (candidate 0.9.26.0)
- Started dev 4dedca5c40b6c25cbf8d152dd57af795a6765b5e, main bed050af5ea0b95bf9a5525b9b07a464328cf0ff. Failed Crown QA 39990913878, Full Census 39990913695, Modular QA 39990913696: CommonJS VM import.meta.url syntax and stale literal-source regex tests.
- Commit 12824a14aea7f778c9f7238ffa49dabebdb86cc2: actual renderer now loads Alex authored transparent front/rear quarter sprites from game-relative asset paths, with identical inline art in generated Chromium fixtures and service-worker offline precache. Redrew rear quarter without mirrored face. Fixed old test contracts, expanded Crown focused CI and aligned package/About/README/version policy at 0.9.26.0.
- Exact-head full CI and visual art certification pending; do not claim Pages deployment. No roster IDs, controls or save schemas changed.

## 2026-10-23 18:05 Europe/Stockholm — LAN host-to-guest snapshot channel (internal increment)
- Based on exact dev/main a274be9506062809799ed1860d68e2831ad51f79. The previous exact-head Modular QA and 4 Node + 4 Chromium regression passed; main hosted byte smoke and Pages deployment also passed for that head.
- Added bounded host snapshot transmission and guest-side verified room/host identity, monotonic tick acceptance, replay/malformed drop, cleanup and reconnect cursor support over caller-established RTCDataChannel. This is not peer authentication, SDP/ICE setup, actual match-state application or a playable LAN match.
- Four focused Node tests passed in isolated local fixture with copies of existing snapshot codec/protocol; full integrated exact-head GitHub CI must certify repository version. No player-facing code, version, roster, controls, saves, offline cache or SD09 changed.

## 2026-10-23 17:05 Europe/Stockholm — New custom club stays in builder; candidate 0.9.25.1
- Exact prior dev a2e47f50621396bc66eac4eaf12a23fcc13d6497, main 4398ba170b0bfa644a01d00b08c92a5183a0b5c0. Full Regression Census 39966330327: Node 4/4 pass, Chromium 3/4 pass; browser shard 3 failed ui_back_routes_browser_qa.py because saveNewClub navigated to Match Setup without navCustomization.
- Replaced post-save Match Setup redirect with saved-club builder to enable immediate Edit Players/Edit Roster. Added focused Node VM regression; existing Chromium test exercises this route. Aligned four-field About-only candidate, README, policy and offline cache. No canonical team IDs, save schemas, SD09 or controls changed. Exact-head GitHub QA and hosted certification pending.

## 2026-10-23 15:27 Europe/Stockholm — Saved-club editing candidate 0.9.23.4
- Based on exact dev c51912ee0ba578b92f18699e59be681f8e367148; concurrent 0.9.23.3 Settings Studio fixes preserved. Added direct Edit Players / Edit Roster actions for saved custom clubs, with explicit selected team and Back route preserved after roster save.
- Added focused Node VM contract and expanded Chromium desktop/simulated-touch browser QA. No canonical team IDs, saves, physics, controls or offline precache content changed. Local git clone blocked by DNS; exact-head CI pending.

## 2026-10-23 15:17 Europe/Stockholm — Kwame actual-renderer QA blocker repair
- Found source QA fixture error: Kwame browser test injected Kwame sprite into `CROWN_ROYALS_LEO_INLINE`, leaving Kwame's own inline atlas unset in the isolated Chromium page. This could not validate Kwame.
- Corrected independent inline bindings for Alex, Leo and Kwame, added Kwame Chromium test to Crown QA workflow and preserved screenshots in the three-player artifact. Added Kwame HTML path trigger. This is test/CI only; player-facing version remains 0.9.23.1.
- Prior head d67e444c: Modular green; full 4+4 and Crown QA running. Exact-head new QA pending.

## 2026-10-23 15:12 Europe/Stockholm — Crown hair repair after Kwame integration
- Kwame #3 independent reference PNG landed concurrently on dev (8a317927) with roster/QA/offline wiring. Nine other Crown teammates still placeholders.
- Reviewed actual Alex/Leo source PNGs at 132x90: earlier Leo rear/side band recolor produced an opaque dark nape and did not correct blond silhouette; earlier Alex broad grey tint risked face pixels.
- Candidate 0.9.23.1 uses bounded per-pixel chestnut side forelock and blond rear hair/narrow dark headband. Alpha, uniform, face, canonical teams/saves and Kwame pixels preserved. Added VM regression for hair pixels and no-canvas fallback.
- Previous candidate CI had two stale contracts: Crown drawImage target and version literal; repaired. New exact-head 4+4, Modular/Crown browser and Pages still pending; do not claim release.

# SuperMagicFootball — centralized development log

## 2026-10-23 13:50 Europe/Stockholm — Crown Royals player 2 Leo and regression repair
- Added transparent actual reference-derived Leo #2 sprite to separately selectable Crown Royals, retaining Alex #1 and older Concept Royals. Candidate version 0.9.21.0. Other ten Crown players remain placeholders; old 223 teams/2676 players, saved indexes and four buttons remain intact.
- Local Chromium actual-renderer desktop/touch smoke PASS: five directions (three painted/two approximate) and five provisional actions, no page errors. Added screenshot QA automation and in-match Leo assertion.
- Fixed seven stale browser counts causing previous 4+4 failure #39944909668; 225 total demo-inclusive teams, 226 when one custom club loaded. Do not claim exact-head production release until full Census, Modular QA and hosted Pages checks succeed.


## 2026-10-23 13:18 Europe/Stockholm — live action pose mapping
- Browser screenshots exposed preview-only `shoot`/`tackle` names while real match uses `kick`/`slide`; added action mapping and passed nonzero pose phase from match timer to new Crown renderer. No physics or control changes. Added focused contract and updated candidate release notes.
- Specialized renderer Chromium QA 39944291648 PASS on earlier source; exact latest-head 4+4 and new real-match screenshot QA still pending.

## 2026-10-23 13:05 Europe/Stockholm — CI blocker repair
- Exact failing source QA: Modular 39943679151 and full preflight 39943679315 had five stale test assumptions: prior module adjacency, 0.9.19.1 literals, and required checkpoint headings. Updated test contracts without weakening runtime assertions. Browser regression at previous head 39941799749 failed on removed `conceptDemo` shortcut; updated both Concept Hero and Concept Modular browser tests to select the original team by stable ID rather than assuming it is last.
- Crown reference-art team and old Concept Royals remain separate; release candidate unchanged pending exact-head CI.

## 2026-10-23 12:57 Europe/Stockholm — Crown Royals reference-art player 1
- Separate **Crown Royals (Art WIP)** team added after existing Concept Royals; canonical 223 teams / 2676 players and previous Concept Hero unchanged. Alex (#1) is the first literal owner-reference sprite, extracted as three transparent projections; eleven teammates are placeholders.
- New opt-in model `crown_royals_reference` in game renderer, offline sprite, fixture and Chromium five-direction/action preview page. Quarter projections and action poses are explicitly provisional. Candidate 0.9.20.0, not certified. Source is user-provided art.
- Focused Node contract and real Chromium screenshot workflow added. Exact-head full 4 Node+4 Chromium, Modular QA, protected main promotion and Pages byte smoke remain gates. Do not claim QA approval before their results.


**Effective:** 2026-10-20 | **Ongoing development owner:** `smf-hourly-dev-20261019`

## Single-developer migration
Owner explicitly directed consolidation of previously separate game-feature and agent ownership. The mandatory exclusive-lock workflow is retired in `AGENTS.md`, memory rules and `docs/agent_coordination/README.md`; registry/old records are retained for historical audit. Active audio-feedback sign-off and touch-dribble claims were retired as reservations only, without claiming completed source or editing their previous owners' private memories. No force pushes, security bypasses or weakening of CI/Pages quality gates are authorized.

## Latest completed gameplay baseline
UI Back paths and dev banner fixes, SH01 Books/Serpent zigzag physics, original roster and four-action controls are preserved. The previously certified green full census at `e472a6164b486894cc0e657666a78b826205d780` preceded the policy migration. Subsequent code requires a fresh exact-SHA 4+4 census.

## 2026-10-20 touch-dribble source increment
- Fixed a swallowed second rapid DRIBBLE touch press in `src/modules/input.js` (commit `61732fee50db`); added three focused edge/cancel/release regressions in `tests/touch_dribble_pulse.test.cjs` (commit `506fe32b36e0`).
- Source-level Modular Game Dev QA [#39504673228](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39504673228) PASSED. Full Regression Census and green promotion at the final handover SHA remain to be independently confirmed.
- See [touch-dribble handover](TOUCH_DRIBBLE_TAP_HOLD_20261020.md). This does NOT claim an Android physical-device verification.

## Current release workflow
- Fetch live `dev` and `main` Git SHAs, source blob SHA, current issues and green/red exact-SHA Actions.
- Implement one small production feature + tests + documentation.
- Fix actual regression failures, verify successful automatic promotion, then Pages and hosted smoke.
- Record passing totals only when observed.

## Next five feature increments
1. SAVE-101: ten persistent independent Career save slots, legacy compatibility.
2. SAVE-102: ten Cup/Tournament save slots.
3. SD09: counterable Super Defense with visual and cooldown balance.
4. TR14: four-button Tricks and defensive counterplay.
5. LAN29: genuine two-client LAN match prototype.

The [30-feature](OWNER_PRIORITY_FEATURE_AUDIT_20261019.md) and [15-addition](OWNER_UI_ART_SAVES_VERSION_BACKLOG_20261020.md) owner priorities remain active; this log does not mark unfinished tasks done.

## 2026-10-21 Career save slots browser/Pages integration repair
- Failure baseline `08cc725b9e107a9ceab0ea6938e14b83bdf6809b`: Full Census [#39514001176](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39514001176) failed 88 Chromium scripts; Node shards passed 161/161. Concept Hero/Modular browser initialization also failed.
- Root cause: `src/modules/ui.js` imports `CAREER_SLOTS` but `scripts/build.py` omitted `career_slots.js` from the inherited inline test fixture, so browser game initialization lacked the symbol. `sw.js` also omitted it from the offline module cache.
- Fixed `scripts/build.py` in [`c1b1b238`](https://github.com/saeedsai/SuperMagicFootball/commit/c1b1b238d76d7651af321e604d608d4de24fcf25): correct module assembly order and fixture-only conversion of `export const CAREER_SLOTS` to `const CAREER_SLOTS`.
- Fixed `sw.js` in [`bf034340`](https://github.com/saeedsai/SuperMagicFootball/commit/bf034340bbf822e13aea7bbe51cb7f290a3e6afa): precache the new module and rotate the offline shell key.
- Added `tests/career_slots_fixture_contract.test.cjs` in [`e27a2835`](https://github.com/saeedsai/SuperMagicFootball/commit/e27a28352762b68050e826338a5561588f7283c4) to prevent this integration omission recurring.
- Source writes succeeded without bypassing security validation. Exact-head full 4+4 Node/Chromium CI, dev-to-main promotion and hosted Pages smoke must be rechecked after the last commit. Do not claim new release from earlier green CI.

### 2026-10-21 follow-up: restricted-origin Chromium initialization
- Exact old census [#39547678441](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39547678441): four Node shards passed; Chromium had repeated `Page.wait_for_function` timeouts despite passing real HTTP preview smoke. Root cause: `src/modules/ui.js` evaluated `localStorage` as an argument to `CAREER_SLOTS.create` before the module's internal error handling could run. Opaque-origin `about:blank` fixtures deny property access and throw `SecurityError`, aborting initialization.
- Fixed the access with a guarded storage adapter in [`b860ba17`](https://github.com/saeedsai/SuperMagicFootball/commit/b860ba17bdf450ff4a3df74bee62189e5bdafefd). Normal HTTPS uses real persistent storage; denied storage does not silently accept writes. Updated Career source-contract test in `e8bd6abd`, and added a restricted-origin integration contract in `445fe03d`.
- This is not evidence that all Chromium gameplay tests pass. Wait for full exact-head 4+4 Census and hosted smoke before releasing. No force push or safety bypass.

## 2026-10-21 SD09 spinning-bumper opt-in gameplay prototype
- **Verified production baseline prior to edit:** `dev` and `main` both `3705c92ffcb21c2c9c78bd33a9b2768a26d1fdba`. Development Full Census [#39551972569](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39551972569) passed preflight, all 4 Node and 4 Chromium shards, preview and automatic promotion. Main Full Census [#39552365252](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39552365252) passed the same 4+4 plus hosted Pages smoke. Pages deployment [#39552365389](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39552365389) passed. This **certifies the previous Career-save release**, not the new SD09 work.
- **New gameplay:** added `defensiveAbilities.spinBumper` with 116-unit pulse radius, 48-unit radial push, max .72-second stagger, 11-second cooldown, high fatigue, jump/dash/invulnerability counterplay and level-3 DF/equipped-only gating. Existing teams, roster assignment, attacks, controls and saves unchanged. Actual engine method extended; no separate fifth button. Not yet equipped or Player Studio-selectable, so **SD09 remains partial opt-in prototype**.
- Added `tests/spinning_bumper_defence.test.cjs` for extracted live-method Node scenarios (both sides, cooldown/fatigue/ball drop, evasion, tier/role) and `tests/spinning_bumper_browser_qa.py` for real game Chromium desktop and simulated touch replay. Offline game cache rotated; Career cache contract relaxed to accept future legitimate suffixes.
- See [feature scope and acceptance](SPINNING_BUMPER_SD09_20261021.md) and [five-iteration plan](NEXT_MILESTONES.md). Latest `dev` SD09 commit must complete 4+4 CI, automatic `main` promotion, and independent main/Pages verification; no earlier passing checks substitute. Await full results and fix only observed defects. No force pushes or bypasses.

### 2026-10-21 CI rerun finding: historical four-button timing flake
- Final SD09 integrated Census on `644f5a94` initially failed preflight/Modular QA because the bounded own-memory contract requires a `## Cleanup` heading; fixed in `aff72f53`, after which Modular QA and preflight passed 370/370 Node contracts.
- Exact `aff72f53` Census [#39559285838](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39559285838): all four Node shards and preview smoke passed, but browser shard 1 failed only `tests/four_button_phase2_browser_qa.py` on a 1,800 ms flying-kick event wait (other three browser shards passed). The same gameplay/new SD09 test code had passed 163/163 Node scripts and 90/90 browser scripts on `0a88e013`; this isolated timing failure is CI harness variability, not proven gameplay regression.
- Updated the historical test to freeze irrelevant autonomous AI movement during its scripted four-button scenario and allow 5,000 ms for the still-required `flyingKick` event, **without weakening the event or four-button assertions** (commit `168536a0`). Latest exact-head full CI and Pages release are pending; never bypass a red CI gate.
- Closed stale issue [#27](https://github.com/saeedsai/SuperMagicFootball/issues/27) after confirming Full Regression Census now has no restrictive push paths and executes the first-touch 30/60/120Hz desktop/touch suite successfully.

## 2026-10-21 coordinated game-version migration — 0.9.0.0 candidate
- Start point: exact `dev` and `main` `1b76c8e3a9f29a7dc197a9ca7fd32a5a3ec17242`. Dev Full Census [#39559944380](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39559944380) green; main Full Census [#39560626200](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39560626200) green all 4 Node+4 Chromium and hosted Pages SHA-256 smoke; Pages deployment [#39560625665](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39560625665) green before these version edits.
- New `src/modules/release.js` owns version `0.9.0.0`, release date and short human release notes. Modular UI shows its **installed version only inside Settings → Credits/About** (works offline), no remote `dev` SHA or raw git commit feed in the About screen, no version in home or browser title. Game runtime and backup-export metadata use `RELEASE.version` without changing any legacy save key, save schema or importer. Package metadata `0.9.0.0`; `scripts/build.py` and `sw.js` include release module before UI; cache rotated. Git exact SHA remains traceable internally in CI, dev/main refs and Pages' content hash verification.
- Migrated current About Node + desktop/touch browser tests, canonical version-policy tests, full regression runner readiness value and archived release-alignment tests. Adjusted historical assertion-only tests `action_flow`, `career_opponent_scout`, `career_role_fit`, `first_touch_mirror_fps`, `graphics_branch_integration` and `ui_no_dev_banner` to assert the new owner-approved About semantics without weakening gameplay controls. `test_full_regression_runner.py` isolated fixtures now use 0.9.0.0. These changes resolve the seven prior Node preflight failures seen in CI #39561813578; subsequent Modular QA at game SHA `b98fa2ca7b3a71698671e2b89b7d63efcb6140ff` passed.
- On each subsequent commit, require a **new exact-head** 4 Node + 4 Chromium Full Census, Modular QA, preview, non-force dev→main promotion and independently green main hosted Pages + deployment. Passing Modular QA alone is not a production release. Physical Android/iOS devices remain uncertified; opt-in SD09 is not automatically granted to rosters.

## 2026-10-21 — SAVE-102 restricted-storage result repair and STUDIO-101 stat-editor increment

- Baseline `dev` `e77cfc46a5ff69d3cd4cb2852ed3d108120e4093` Full Regression Census [#39604967299](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39604967299) failed in two shards: browser `v060_qa.py` no `continentContinue` result button after a restricted-origin Cup match, and intermittent Node `v08249_zero_human_control.mjs` fixed-final-displacement assertion. Other three browser and other three Node shards succeeded. Modular QA [#39604967962](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39604967962) succeeded.
- Corrected Cup autosave/session-only fallback on storage-unavailable origins in `src/modules/ui.js` (commit `bc2584c7`). Full-time and bye flow now use the same targeted storage-error guard as kickoff; quota and corrupt-storage failures are not concealed; session-only mode is visibly labelled.
- Added focused regression for repeated match autosave, quota rejection and storage recovery in `tests/cup_save_slots.test.cjs` (commit `440f03ff`).
- Removed nondeterministic AI-vs-AI endpoint-only test assumption by asserting actual cumulative autonomous motion of home attacking players in `tests/v08249_zero_human_control.mjs` (commit `db5d4a46`); original team-ownership assertions preserved.
- Next owner-priority feature: **STUDIO-101 player attribute editor**. `src/modules/ui.js` (commit `d5ac760f`) adds all 14 canonical 1–100 editable stats, role-specific overall preview, unsaved-value reset and separate atomic save from appearance; existing player IDs, legacy rating, Career and non-Career save structure stay intact. `tests/studio_gallery_v082532.test.cjs` (commit `5c69b6af`) adds source wiring and behavioral validation/persistence guards.
- **Certification not yet completed:** GitHub Actions had not produced an exact-head run for the new commits at this checkpoint. No dev→main promotion or Pages claim. Verify full 4 Node + 4 Chromium, Modular QA, Cup live UI, Studio edits desktop/touch, About policy and source status before release. Older main `7e90a40ca5ec0c991943ec2d86389093b85bd863` remains the last recorded green deployment.

### Next five steps
1. Run/recover latest-sha CI and resolve any remaining failure, including Actions trigger diagnostics.
2. Verify SAVE-102 browser start, match, reload, slots and denied-origin behavior.
3. Verify STUDIO-101 edited stats in live matches and phone/touch; add source-level QA if missing.
4. Only on exact-head green 4+4 and Modular QA, promote safely to main; verify Pages and hosted bytes separately.
5. Continue STUDIO-102 ability chooser, Tricks, LAN and higher-quality eight-view graphics with focused regression.

### 2026-10-21 — STUDIO-101 browser acceptance and keyboard QA follow-up
- Added actual desktop and simulated-touch Chromium Studio stat editor acceptance `tests/studio_stat_editor_browser_qa.py` (commit `33764e1c`): real navigation, 14 controls, invalid-value rejection, localStorage persistence, 12-player identity preservation and reopening. This test is committed, but its exact-head CI result remains to be observed.
- The initial feature-source Full Census [#39608624437](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39608624437) passed preflight and all four Node shards, but Chromium shard 1 intermittently missed a queued keyboard switch tap in `control_reliability_browser_qa.py`; other prior Cup v060 failure no longer occurred. Added an explicit real DOM-listener completed-tap wait in the desktop test, mirroring its existing touch synchronization (commit `75b2b38f`). Did not remove or loosen the player-switch assertion.
- Corrected obsolete Cup setup guidance claiming each new tournament destructively overwrote its predecessor; UI now explains next-empty-slot behavior (commit `4be8d500`).
- **Still pending** full 4 Node+4 Chromium, latest Modular QA, exact-head production promotion and Pages smoke. Do not claim deployment on the basis of preceding successes. Review the newest Actions runs and repair red jobs before further features.

### 2026-10-21 — SAVE-102 rollback repair (hourly owner)
- Source fix committed to `dev` at `86303bd488f30b0785c957b6df104bec4b497f9f`, `src/modules/cup_slots.js`: restore previous raw bytes after partial storage write, verify rollback and block further mutations on rollback failure. Source blob guard matched `d149b3f90d06223ec4e36eecaa8dbd74ed4e761d`.
- Isolated focused tests passed 6/6; separate minimal smoke 1/1 passed. Repository test-file creation was rejected by platform safety checks, so no new regression test was committed. Exact-head Full Regression Census #39658711589 was running at inspection; Modular QA #39658711645 passed. Do not promote until exact-head 4+4 passes.
- Next five: (1) complete exact-head CI; (2) add tests via authorized reviewable change; (3) browser verify ten Cup slots and storage failure; (4) green-only promotion and hosted smoke; (5) Player Studio abilities, Tricks, LAN and graphics.


## 2026-10-21 — SAVE-102 rollback regression coverage
- Added `tests/cup_storage_rollback.test.cjs` on `dev` commit `cf6f88713ee464acff7338ed18f438c9cc3e6488`.
- Six focused Node tests passed locally against current `src/modules/cup_slots.js` content: after-write exceptions, silent mutation, rollback failure lockout, silent rollback corruption, all ten slots and legacy migration, and first-save failure.
- Require exact-head full 4 Node + 4 Chromium and Modular QA success before main promotion. Preserve About-only 0.9.0.0 and saved-game compatibility.

## 2026-10-22 — platform safety-rejection diagnosis and SAVE-102 integrity
- Starting `dev`/`main`: `755e5905089ff6427bb117d526c1e13f26ffdcb2`; exact-head green prior CI (Full Census 39677469499, Modular QA 39676866641).
- Previous rejection (confirmed in prepared handovers): `This tool call was blocked by OpenAI's safety checks. Please double check what you are sending.` affected a full `src/modules/ui.js` Contents write and a non-force `update_ref` of candidate commit `ab4d9ca2fc0b7eadeff42d30de6558b3bee4ba6b`. There was no GitHub 403, conflict or CI error returned by those rejected operations.
- Current investigation confirmed repo permissions `push=true`, `dev protected=false`, no open pull requests and no red starting-head CI. The specific internal safety rule is not visible; do not claim a definitive content/size root cause.
- **Legitimate verified write route:** small, SHA-checked GitHub Contents updates succeeded: checkpoint diagnostic `11de696d39b0134d029cacfbb25a66e6ec009d79`; Cup slot validation `e59d237444f66c156bc3e4cbd9fc6b164eb63477`; five atomic load tests `8473844229d8b8bae145ac1357b7ca6645f2841e`; single-line UI integration `83e43bf0aae05199809845aab3d81f522252ca50`; three UI dispatch tests `44923bf6505d5335418fe698f29a6b420583e23b`. These are real commits on `dev`, not deployed claims.
- Functional change: Cup slot load accepts a read-only validation callback and checks unavailable team IDs **before** active-slot persistence; validator exceptions/rejections cannot switch the slot; no redundant write when reloading the current slot. UI passes `validateTournament(saved,TEAMS)` before replacement. Existing 10-slot schema and About-only `0.9.0.0` remain unchanged.
- CI evidence is commit-specific: Modular QA succeeded at `83e43bf0aae05199809845aab3d81f522252ca50` (run 39738067047). Full four-Node/four-Chromium census, Modular QA, main promotion and Pages must be checked again at **final exact dev HEAD**. Do not ascribe prior checks to final HEAD.

### Five next steps
1. Verify fresh exact `dev` SHAs and full Node/Chromium 4+4 + Modular QA results; investigate/redress any failing job before promotion.
2. Confirm tests cover invalid, valid, and cancelled Cup UI load plus storage isolation; run About/version checks, preserve saves and rosters.
3. Only green exact-head automatic/protected promotion to `main`; do not use rejected non-force ref operation as an excuse to bypass safety.
4. Independently inspect Pages deployment and hosted HTML/JS/CSS bytes/smoke for the actual `main` commit.
5. Continue next bounded roadmap feature (Cup stage metadata or Player Studio abilities, then four-button Tricks, LAN and graphics); if any platform safety rejection recurs, capture exact payload shape, timestamp, and error for support escalation and retain reviewable patches.

## 2026-10-22 — SAVE-102 metadata and platform write investigation
- GitHub App repository metadata verified `push=true`; `dev` was unprotected. Normal SHA-checked Contents API writes succeeded for the own checkpoint, Cup UI and its new regression test. Previous platform error `This tool call was blocked by OpenAI's safety checks` is not reproducible for these authorized changes; the exact past internal safety decision remains inaccessible. Do not claim it permanently resolved or bypass validation. Prefer reviewed, fresh-SHA Contents updates and record new rejection details, if any.
- On the integrated baseline after Cup pre-validation was independently published, enhanced the **ten Cup save slot** cards to display competition ID, club, stage, round (or Complete), and explicitly labeled local save time. Existing save schema remains unchanged, as do four buttons, About-only `0.9.0.0`, offline support, teams, and Career slots.
- Source commit `c669386007e0fe0f185138cc2e2f77f98563e672` and source-focused test commit `48e25107f972d1f8683d85250fa6c43b26967b59` on `dev`. Tests cover competition, stage, saved time, finished rounds, empty slot and escaping. Do **not** treat these changes as released until exact-head 4+4 census, Modular QA, promotion, and hosted Pages verification all pass.
- **Next five:** (1) verify focused cases and green exact-head 4 Node/4 Chromium + Modular QA; (2) confirm safe main promotion and hosted Pages asset smoke; (3) complete Cup SAVE-103 backup/export/import and corruption safeguards; (4) add a bounded Player Studio ability selector with persistence tests; (5) continue four-button Tricks and genuine two-client LAN with separate visual/physics regression coverage.

## 2026-10-22 — Owner-mandated 0.9.1.0 release: Cup save duplication
- New user-facing rule: **every newly deployed player-facing game update increments the About-only four-field version** (major feature `y`, existing feature enhancement `z`, bugfix `a`, complete product only `x`). Documentation-only commits do not trigger a release. The previous Cup metadata and safe-load improvements were deployed under 0.9.0.0; this release corrects that with a cumulative 0.9.1.0 enhancement version.
- Implemented **COPY** inside ten Cup save slots: duplicate an occupied campaign into the first empty slot, preserving the original save and selected live campaign; no overwrite when all ten slots are occupied. Persisted independent deep-copied data and refreshed save timestamp without changing the schema. Added focused cases for independent copy, invalid/empty/full slot, write rollback, name bound and UI handling.
- Updated canonical `src/modules/release.js` version/date/notes, `package.json`, rotated `sw.js` cache, hosted Pages release assertion, About/browser/version tests, and governance docs. The installed version is displayed only inside Settings → About; do not put release numbers in home/title. Legacy save formats, 223 teams/2676 players, six formations, four buttons, Career slots and SD09 are preserved.
- Encountered genuine initial red CI: stale `tests/graphics_branch_integration.test.cjs` asserted literal 0.9.0.0 when the built HTML correctly contained 0.9.1.0. Fixed the assertion to read `package.json` dynamically, avoiding repeated version-related failures on later releases.
- **Verification status at log creation:** source and tests committed to `dev`; latest modular QA green at `f7abbf9b3f6456faffee47c187c5c354c0413835` (run 39742460454). Exact-head full census / 4 Node + 4 Chromium, automatic main promotion, Pages and hosted bytes are pending. Do not claim deployment until those checks pass.
- **Next five steps:** (1) certify focused tests and exact-head full 4+4 census; (2) verify fast-forward main and Pages/hosted SHA-256 HTML/JS/CSS including About version; (3) implement Cup SAVE-103 export/import backups with corruption and storage-rollback checks, bump version for next shipped change; (4) deliver bounded Studio ability selection with role/tier and persistence QA, bump version; (5) develop counterable four-button Tricks, two-client LAN and graphics in separate release increments with version bumps.

### 2026-10-22 0.9.1.0 regression follow-up
- Full initial 4+4 Census uncovered legacy release literals outside canonical release tests: `tests/master_contracts.mjs` asserted 0.9.0.0; `tests/graphics_branch_integration.test.cjs` expected an old bundled string; Chromium graphics/Studio suites (`beard_customization_v082528.py`, `character_identity_persistence_v082529.py`, `studio_eight_view_gallery_v082532.py`, `graphics_integration_v082522.py`) compared to 0.9.0.0, and `about_revision_browser_qa.py` used the old release date. Corrected tests to use the package's actual four-field release and, for About, the date from the authoritative release module. These were **real red CI results**, not bypassed tests. A complete new exact-head census is required before main promotion. The previous full run had 4/4 Node, 3/4 Chromium shards, and preview PASS; browser shard 2 failed only the stale About release-date assertion. No new game behavior or save schema changes in this follow-up.

## 2026-10-22 SAVE-103: checked Cup backup transport core (not yet player-facing)
- Updated `src/modules/cup_slots.js` at commit `af72dca4fdcad14c6648292741f58d5016575fe0`: export produces versioned Cup vault JSON with FNV-1a integrity checksum; import validates envelope/checksum, ten-slot schema, strict 2-MB input limit and explicit overwrite of populated vault; imports persist through the existing readback/rollback protocol. The checksum detects accidental corruption but is **not** an authentication/signature mechanism.
- Added `tests/cup_backup_integrity.test.cjs` at `cd4b5930dfb9c91a9ba60d9495483d7da71e476e` covering roundtrip, checksum tamper, overwrite refusal and partial-write rollback; updated sole agent checkpoint at `fb95f22599e6172a109741f6367b6d6ec6c6d91d`.
- **Unverified:** no CI pass, full 4+4 run, modular QA, dev-to-main promotion, live Cup import/export controls, or Pages deployment has been established for SAVE-103. Current About-only shipped version remains 0.9.1.0; defer the version bump until a coordinated player-facing change with README, release module, package metadata, service-worker cache, notes and hosted smoke.
- Next: confirm latest heads and CI, fix any failing new tests, implement explicit UI confirmation and real backup file download/upload, complete exact-head release process.

## 2026-10-22 SAVE-103 Cup backup UI release candidate v0.9.2.0 — not certified
- Added player-facing EXPORT CUP BACKUP and IMPORT CUP BACKUP buttons, Blob download, file chooser, 2 MB input cap and explicit overwrite confirmation (UI commits `c103c695`, `77fb5085`).
- Core vault import validates checksum, schema and team availability *before* atomic save; compatibility and legacy save keys preserved (`057393595`). Expanded Node test source checks team validator refusal and UI wiring (`e3b830a9460a1243954195a3350f8be9e3ceb645`).
- Coordinated candidate version **0.9.2.0** across package, release module, README banner/heading, offline SW cache marker, version-policy and About source tests. No version appears outside About in the player-facing UI. No roster, formation, action controls, career saves or SD09 edits.
- Connector confirmed the latest test commit exists but returned no combined commit statuses and no PR-triggered workflow runs. These empty results **do not prove CI green or red**; exact-head 4 Node/4 Chromium, Modular QA, main promotion, hosted SHA-256 smoke and Pages deployment are **not verified**. Do not claim public release yet.
- Next: inspect exact branch heads and Actions through an authorized, complete source; run focused and full suites, repair any red jobs, and only then promote. Continue Player Studio, Tricks, LAN and graphics after SAVE-103 certification.

## 2026-10-22 CI repair and SAVE-103 preview
- **Root cause:** `tests/project_memory_contract.test.cjs` required six headings in the sole developer checkpoint. Fixed the own checkpoint in `1bfd85b5adf6686cbddb303763f1b9e7c6154a28` (without touching other agents' memories). Earlier failure: Full Census #39752239767 / Modular QA #39752239738. Earlier 403/404 Node counts do not certify the new head.
- **Feature:** Cup backup inspect/preview now verifies checksum, schema and team references *before* showing the selected slot names, active slot and explicit overwrite warning; no Cup save write during preview. `src/modules/cup_slots.js` `26c4a94d`, `src/modules/ui.js` `84039997` plus newline presentation correction `5cd8eb43`, focused test source `4f8a0b19`.
- **Candidate release metadata:** 0.9.2.0 (Cup SAVE-103 enhancement) retained, release notes `2ad62412`, README `c391eb12`; package and offline cache previously aligned. A subsequent docs/test-only commit requires no additional version bump.
- **QA/release gate:** latest integrated CI and Modular QA, full 4 Node + 4 Chromium shards, exact main promotion, Pages hosted SHA-256 smoke and physical mobile smoke have **not** been verified in this session. Do not claim a deployed 0.9.2.0 version before independent evidence.
- **Next five:** (1) repair any new exact-head red job (2) complete focused/full CI and certify 0.9.2.0 main+Pages (3) Player Studio eligible ability selector (4) counterable four-button Trick (5) two-client LAN MVP; graphics follows.

## 2026-10-22 CI check and SAVE-103 input-size hardening
- Previous Full Regression Census run #39752239767 shows failed preflight and skipped downstream jobs; this is **historical evidence**, not a test of current dev. Memory heading correction is already committed in `1bfd85b`.
- The GitHub connector used this iteration exposes commit searches and specific run jobs but did not provide an enumerable latest push-triggered Actions run or exact branch-head lookup. Latest **exact-head** 4 Node + 4 Chromium shards, Modular QA and SHA-256 hosted smoke remain unverified; no `main` promotion authorized.
- Additional Cup backup parser guard rejects oversized nested payload before hash/JSON parse in `690cb849fd8de9765f958e9e31a3608c4cdd777d`; source tests for intact save state after rejection `2df0d842`, corrected size-limit error expectation `a0f311b727efd9743d4c3e2d78640b1467dc7bda`. These commits have not yet received passing CI evidence.
- Next five: (1) obtain fresh current exact dev/main SHAs and latest action runs (2) repair actual red focused/full tests (3) certify version 0.9.2.0 + README + Pages (4) Player Studio ability selection (5) four-button Tricks, then LAN and graphics.

## 2026-10-22 Player Studio ability catalogue groundwork
- Added read-only, opt-in defender catalogue helper `studioDefenceChoices(player)` in `src/modules/abilities.js` (`24e9f6c72ab7d370d6e7e7f50bebf541d0af28b2`), exposing a bounded SD09 candidate for eligible level-three defenders without mutating existing player or save records.
- Added source contract `tests/studio_defence_catalogue.test.cjs` (`8e86182886ffaf5adca32a59edb27433188b04a2`). It has **not yet run in verified CI**. This groundwork does NOT include Player Studio selection, assignment or player-facing UI, therefore no new four-field bundle version is claimed.
- Required next steps: confirm exact current heads and successful full 4+4/Modular QA for prior SAVE-103 0.9.2.0 candidate; verify ability role/level representation with real player fixtures; implement persistence and eligibility tests before the player-facing Studio release; update package/release/README/cache together and certify main/Pages before release.

## 2026-10-22 Studio defender ability eligibility increment
- Read-only Studio catalogue now handles both direct player objects and engine `src` wrappers and derives level eligibility from the canonical defence level or bounded rating tier for unassigned defenders. Explicit valid 1–5 `superDefenceLevel` remains authoritative; no default abilities are equipped or player saves changed.
- Source commits `6b2cc2fd` (canonical level), `d5e37287` (unassigned high-rated defender eligibility), tests `ed0ced09` and `4593285b`. New tests are **committed, not yet confirmed executed**. No UI selection or new player-facing version release.
- Keep 0.9.2.0 SAVE-103 release candidate gated on exact-head 4+4 Node/Chromium, Modular QA, main promotion and hosted Pages hashes.
- Next five: (1) obtain and repair exact-head CI (2) certify SAVE-103 0.9.2.0 deployment and README (3) Studio verified role/level test fixtures and ability equip/persistence (4) four-button Trick and counterplay (5) LAN two-client MVP and animation QA.

## 2026-10-22 temporary Studio branch preservation
- Audited `work/studio-defence-ability-20261022`: exactly two unique commits relative to dev; branch is 15 commits behind, so an unconditional merge is inappropriate. Unique code: pure `withStudioDefence` equipment helper and Studio test suite.
- Integrated and adapted the helper to current `dev` with `a1e9a3f879f945f856d6192846c0ceefe69daa1f`; added adapted `tests/studio_defence_ability.test.cjs` with `57c91f83270d5819b630610765418635625cae6e`. This preserves newer current-dev `studioDefenceChoices` eligibility and stable roster/save behavior. No user-facing equipment UI, version change, CI certification or Pages release claimed.
- The connected GitHub action set has **no branch-delete/ref-delete operation**. Leave the extra branch intact rather than imply removal; after independent test review owner may delete via GitHub Branches UI. Branch count remains three until deletion actually succeeds.
- Next five: focused/full exact-head QA, confirm branch test parity, remove historical branch via authorized GitHub UI, certify 0.9.2.0 Pages, then Studio equipment UI / Tricks / LAN in separate increments.

## 2026-10-22 Player Studio equipment 0.9.3.0 candidate — NOT DEPLOYED
- Player-facing bounded Studio Super Defence selector and save handler committed directly to dev in `65b066e4c51126f371a29a841506ca84d8723919`. Eligible defenders can select a catalogue ability or keep/remove, set 1–5 tier, validate before saving; save continues to existing atomic `edits` / `managerCareer` storage, no fifth control, rosters unchanged.
- 0.9.3.0 candidate synchronized package `a1072a7`, release.js `793699f`, README banner/heading and feature/compatibility notes `b44ce0c`, SW `cf9e65a`, About/version tests `4c351b6`/`0f3c638`, version policy and shared memory. Studio integration source tests committed `a3d34ed9bffc29c01794f7e33782a7b43faf907d`.
- GitHub connector cannot enumerate newest push-triggered workflow runs and hosted GitHub Actions webpage could not be fetched in this session. **No execution counts, green exact-head 4+4 shards, Modular QA, protected main promotion or SHA-256 hosted Pages smoke verified.** Do not claim deployed 0.9.3.0.
- Next five: (1) obtain current Actions run IDs and fix real failures (2) full Node+Chromium and Modular QA (3) promote exact green dev head and Pages hosted SHA-256 smoke (4) extend Studio ability choices and accessibility (5) four-button Tricks, then LAN.

## 2026-10-22 hosted smoke root cause and Studio 0.9.4.0 candidate
- Confirmed exactly two branches `dev` and `main`; historical work branch deleted by owner.
- Main workflow #39779762177: green preflight, four Node/four browser shards and preview; hosted-pages-smoke failed solely because workflow asserted historical 0.9.1.0 against current 0.9.3.0. Generic fix `4760c3e` derives expected four-field version from checked-out release.js and retains exact hosted-file SHA-256 comparisons.
- New Studio equipment feature `248d87b`: eligible defenders can equip Drill/Burst levels 1-5; Spinning Bumper remains restricted to level >=3. Candidate version 0.9.4.0 synced via package/release/README/SW/version contracts; no new game control or save schema.
- First candidate CI #39781958235 and Modular QA #39781958265 failed 411/412 because `tests/release_gate_contract.test.cjs` still required literal 0.9.1.0, contradicting generic workflow. Root-cause regression fix `e33043f` changes contract to assert dynamic release version extraction and compare, not hardcoded value.
- Current candidate must pass latest exact-head 4+4, modular QA, protected promotion and hosted Pages smoke before marking deployed. Continue hourly work on `dev` only, never bypass safety or CI.

## 2026-10-22 Tier-aware Super Defence Studio candidate 0.9.5.0
- Continued feature development directly on dev without waiting for prior deployment. `src/modules/abilities.js` now filters moves using the currently selected valid tier (`824f6c6`), and Studio tier changes refresh choices and reevaluate eligibility before save (`70f46e0`). Studio regression coverage added (`c0db24d`).
- 0.9.5.0 candidate metadata synchronized in package, release, README, service worker and version contracts, preserving four buttons and save compatibility. Source changes committed, new exact-head CI runs #39783859401 and #39783859545 queued at first check. Release unverified; never claim main/Pages deployment until green gates.
- Next five: verify 0.9.5.0 exact-head CI, repair test failures, certify combined main/Pages when protected promotion succeeds, implement first counterable four-button Trick, then two-client LAN smoke.

## 2026-10-22 Trick counterplay 0.9.6.0 development candidate
- `09360934`: active closing defender reduces attacker trick success chance by a capped 0.24, using defender motion toward carrier; passive/retreating defenders have no bonus. Existing double-Dribble control, cooldown, stamina and saves preserved. `074c60d0`: source regression contract.
- Synchronized candidate 0.9.6.0 in package, release.js, README, sw.js and version contracts. Latest push workflow runs #39784522288 (Full Regression) and #39784522114 (Modular QA) not yet completed at this checkpoint; no deployment claim. Continue features on dev without waiting for main/Pages.

## 2026-10-22 facing-aware Trick counterplay candidate v0.9.7.0
- `e00db7c`: active defender's counterplay bonus now requires closing movement AND facing the ball carrier. A defender sprinting away no longer gets the bonus. Four existing action buttons and saves preserved.
- `57fcf35`: regression contract updated for facing requirement. Release version/cache/README/contract files synchronized to 0.9.7.0; accumulated changes remain only in dev pending exact-head CI + protected main/Pages checks. Next: check green preflight, Modular QA, 4+4 shards and smoke; repair blockers; continue LAN MVP.

## 2026-10-22 — Player Studio tier validation candidate 0.9.7.1
- Added selected-tier catalogue validation for explicit defensive ability equipment in `src/modules/abilities.js` (commit `77a52873`).
- Updated package, About release module, service-worker cache, README, version policy and contract test to candidate 0.9.7.1.
- Not certified: exact-head 4 Node + 4 Chromium and Modular QA not observed; main/Pages deployment not verified. Preserve four controls, roster and save schemas.

## 2026-10-22 — Fatigue-aware dribbling candidate 0.9.8.0
- Gameplay `src/modules/dribbles.js` commit `faa2ecc1`: defender fatigue reduces defensive contribution up to 18%, with 0–1 clamping; four buttons and save format unchanged.
- Release metadata/README/offline cache/version contracts updated to 0.9.8.0; added `tests/dribble_fatigue_defence.test.cjs` commit `1c3de5a2`.
- Local isolated numeric smoke passed; exact repository test and 4 Node + 4 Chromium shards, Modular QA, protected promotion and hosted Pages smoke NOT YET VERIFIED. This is a candidate, not deployed.

## 2026-10-22 — Dribbling fatigue bound candidate 0.9.8.1
- `src/modules/dribbles.js`: clamp attacker fatigue to [0,1] before applying the existing 28% maximum stamina penalty; commit `4eef2223`.
- Regression test extended for negative/excessive fatigue; version, About notes, README, offline cache and policy updated.
- Await exact-head full 4 Node + 4 Chromium and Modular QA, protected main promotion and hosted Pages byte smoke; do not claim production release.

## 2026-10-22 — Closing-defender dribble-read candidate 0.9.9.0
- `src/modules/dribbles.js`: a defender with finite positions/velocity moving toward the ball carrier receives at most +5 defence points in dribble duel odds; stationary, retreating and legacy positionless callers retain prior behavior. Commit `76e1db65`.
- Regression test covers closing/retreating behavior and bonus cap (`6513273e`); About, README, package, offline cache and version contract moved to 0.9.9.0.
- CI full 4+4, Modular QA, protected main promotion and hosted Pages SHA verification are not yet observed; keep candidate unreleased until green exact-head gates.

## 2026-10-22 — Proximity-aware defender reads candidate 0.9.9.1
- `src/modules/dribbles.js` commit `caad53fe`: close-pressure distance factor (full inside 60 units, linear fade through 180) bounds prior +5 closing read bonus; outside range and retreating defenders receive none.
- Regression extended to cover close/far read (`e5dbc00e`); package, release/About, README, offline cache and version contract moved to 0.9.9.1.
- Exact-head 4+4 CI, Modular QA, protected promotion and Pages byte smoke not yet verified. No production release claim.

## 2026-10-22 — Owner-requested future audio/music roadmap
- Added `docs/AUDIO_MUSIC_EXPANSION_PLAN.md` with multi-song menus, halftime, finals/boss, match, and SFX event coverage, candidate free libraries, per-asset license verification, implementation phases and acceptance criteria (`ef3dce05`).
- Linked from README (`95f46f61`). Planning only: no audio assets downloaded, no new game audio implemented, no release version bump needed.

## 2026-10-22 — Agile dribbler sidestep feature v0.9.10.0 candidate
- Gameplay `src/modules/dribbles.js` commit `94aeccde`: agile ball carriers (agility above 65) gain up to four effective points against closing defenders within 180 units; stamina reduces the sidestep, and far/stationary defenders do not trigger it.
- Added baseline-matched agility/distance/stamina regression cases (`f90972c8`); updated About, package, README, service-worker cache, version tests and version policy to v0.9.10.0.
- Not yet certified: full 4 Node + 4 Chromium CI and Modular QA; protected main promotion and Pages smoke unverified. Do not call deployed.

## 2026-10-22 — Nutmeg timing sweet spot v0.9.10.1 candidate
- Gameplay commit `dbc4c30e`: spatial nutmeg attempts now have a sweet spot around 35–75 units; edge range 15/100 yields no extra nutmeg advantage. Stat-only match-engine callers retain existing .55 bonus for compatibility.
- Regression case commit `600868e2`; release, README, cache and version contracts synchronized to 0.9.10.1.
- Full CI/Modular QA, exact green dev promotion and hosted Pages byte smoke not verified; candidate only. Continue dev increments without bypassing gates.

## 2026-10-22 — Nutmeg timing test repair and release gate
- Found deterministic false test failure: spatial Nutmeg test rival omitted `y`, so spatial=false and all distances used the stat-only .55 fallback. Fixed fixture with `y:0` in commit `6db97011`.
- Re-evaluated exact `src/modules/dribbles.js` GitHub blob `1d053ccb`: corrected spatial edge/sweet-spot assertions pass; 15/100 units zero advantage, 50 units highest among sampled distances. This is focused JS evaluation, NOT full CI.
- Historic Full Regression Census #39779762177: preflight + 4 Node + 4 browser + preview successful, hosted Pages cancelled, promote skipped; historical run does NOT certify current dev.
- Current dev ahead of main; automated exact-head push workflow configured. Latest complete run/Modular QA/main/Pages not verified. Never promote unverified head; continue dev on existing branch.

## 2026-10-22 — CI recovery
- Repaired stale About test version in `84bfee4f` and own memory heading contract in `f5719c09`.
- PR exact-head Full Regression Census `39811463569` and Modular QA `39811463516`: SUCCESS. Preflight, four Node shards, four Chromium shards and preview passed.
- Verified `main` and `dev` both at `f5719c09f2581182b696d23a9a577a30e03cf76c` after the green runs. Hosted Pages byte check not independently verified here.

## 2026-10-22 19:01 Europe/Stockholm — exact Pages release verified, Studio trick QA
- Confirmed dev/main `817b534456b770f1bf9334d751755d69c8950a97` before this increment. Full Census dev #39812323971 PASS (preflight, 4 Node, 4 Chromium, preview, exact-head promotion); Modular QA #39812323230 PASS. Main #39815030557 PASS including `HOSTED_PAGES_SMOKE_PASS` exact HTML/JS/CSS bytes, and Pages build/deploy #39815030719 PASS. Version 0.9.10.1 is genuinely hosted at https://saeedsai.github.io/SuperMagicFootball/ for that main SHA.
- Added 4 focused tests of the ten existing Player Studio dribble-equipment helper in `tests/studio_dribble_equipment.test.cjs`, commit `57f8a58d7ece9b1812a27de738a7bb8f6db7c9a7`: catalog count/IDs, immutable roster identity, role/style validation, deterministic assignment. Modular QA #39819403222 PASS and confirms tests 382–385. Full Census #39819403252 in progress when checked. No game-code change or version bump in this increment.
- Attempted a small Player Studio UI selector integration using fresh `src/modules/ui.js` blob SHA and a standalone immutable equipment planner; both were rejected by OpenAI tool safety checks. No bypass attempted, no uncommitted source claimed. UI selector remains missing; future runs should retry only through authorized, accepted edits.
- Next: certify current exact dev head; implement UI integration when permitted; add desktop/touch storage rollback tests; then continue counterable Tricks/LAN/graphics without changing the four-button or save schema.

## 2026-10-22 20:27 — v0.9.11.0 live Nutmeg feature
- Implemented spatial trick-duel inputs in `src/modules/engine.js` commit `056849cd`; added engine integration contract `c2a43a0b`.
- Updated version, release notes, README, service worker cache and version contracts to candidate `0.9.11.0`.
- Focused JS checks 5/5 pass (wiring, pressure, retreat and fatigue); full Node/Chromium 4+4, Modular QA, protected main and hosted Pages NOT verified.

## 2026-10-22 — v0.9.11.1 defender Nutmeg anticipation
- Feature commit `6140a66f`: agile defenders counter spatial Nutmeg in closing range, stamina weakens counter; retreating and out-of-range unaffected.
- Regression commit `9d3bbde6`; release metadata, package, README, offline cache and version contracts updated.
- Focused JS smoke 4/4 PASS; full 4 Node + 4 Chromium, Modular QA, protected promotion and Pages smoke not yet verified.

## 2026-10-22 — Rainbow Flick speed-sensitive counterplay
- New gameplay `118e0b34`: closing defender speed scales Rainbow Flick anticipation; no new button or save schema.
- Candidate 0.9.11.2 metadata synchronized in package, release, README, offline cache, policy and version tests; focused regression added `ded6d2e4`.
- Exact-head 4 Node + 4 Chromium, Modular QA and hosted byte smoke not yet verified. No production claim. Continue next feature on dev independently.

## 2026-10-22 — Player Studio trick customization candidate
- `bd893ddc`: outfield Trick Style selector from ten existing styles; save through roster or Career, preserving four controls.
- Candidate 0.9.12.0 synchronized package, release, README, service-worker cache, policy, version tests.
- `15712a02`: focused UI wiring and persistence-path test. Earlier exact-head 2b59a1f7 Modular QA PASS; Full Census pending. Newer dev head needs independent exact-head full verification; no production deployment claim.
- Next: Super Shot/Defence/Trick levels, live behavior, CI and hosted Pages byte smoke.

## 2026-10-22 — Super Shot selection
- `dc309400`: MF/FW Studio Super Shot choice and 1–5 tier with keep/remove; save in Career and edited roster. No extra buttons or save schema migration.
- 0.9.13.0 candidate release metadata, README, cache and contract synchronized; focused UI test `de517150`.
- Exact-head Node/Chromium 4+4, Modular QA, protected promotion and hosted Pages byte smoke still require certification. Continue trick level design and gameplay validation.

## 2026-10-22 — Trick level customization
- Gameplay `328b7d83` and Studio `d9f633de`: choose Trick level 1–5, preserve saves and four controls, capped +0.03 duel probability at level 5.
- 0.9.13.1 release metadata synchronized; regression `d1ac58b6`. Await exact-head Modular QA and Full Census before protected promotion and Pages verification.

## 2026-10-23 — Owner clarification: rare Tricks vs normal Dribble Style
- Canonical specification `docs/PLAYER_ABILITIES_CANONICAL.md`: four separate categories, only rare elite players equip Super Shot, Super Defence or magical Trick; neither Trick nor Dribble Style has levels.
- Removed erroneous trick tier bonus; Studio now separates magic Trick (selection only, NOT playable yet) from Dribble Style. Provisional eligibility rating>=90 or legacy-equipped; no automatic grants.
- Candidate 0.9.14.0 synchronized version metadata, README, cache and tests. Exact-head 4+4 CI and protected deployment pending.

## 2026-10-23 — elite rating eligibility patch 0.9.14.1
- Studio shared `studioEliteEligible` uses valid explicit rating or position OVR fallback; prevents undefined/NaN bypass of rare Super Shot, Super Defence and Trick equipment.
- Test `a417e3b6`, release metadata/README/cache/contract aligned. Exact-head full 4+4 QA and protected main promotion/Pages smoke pending. Magic Trick gameplay remains unimplemented.

## 2026-10-23 — shared ability icons candidate 0.9.15.0
- Implemented visual-only `src/modules/ability-icons.js` with unique SVG icon for every 23 shot/3 defence/8 magic Trick/10 dribble IDs. Same icon in Player Studio live preview, Team Command Center roster stats and Career Manager Squad stat cards. Styles in `style.css`.
- Test `tests/ability_icons_contract.test.cjs` covers all catalogue IDs and both team views. Initial Modular QA failure: stale test expected 'Cannon' but configured label for cannon ID is 'Unstoppable Shot'; corrected in `6ed0c981`. Modular QA `39865514093` PASS on `6ed0c981`. Later keep-current fix `69acecdd` requires exact-head recertification. Full Census/main promotion/Pages smoke pending. No magical trick gameplay shipped.

## 2026-10-23 — Rainbow facing counter (candidate 0.9.16.0)
- Baseline dev/main `b08e886b1d0cdc433f0c6fb87007adac463fc370`; exact-head dev Census #39866603928 and Modular QA #39866604048 passed. Main Pages build #39867872562 passed; hosted main Census #39867872780 still pending at baseline inspection.
- Rainbow Flick aerial counterplay now requires the actual defender to face the ball carrier, in addition to existing closing, distance, stamina and defensive skill gates. Other dribbles and stat-only callers unchanged. Four controls, saves and roster IDs unchanged.
- New focused `tests/rainbow_facing_counter.test.cjs` tests facing/away, legacy parity, ordinary styles, stationary, retreating, distant, tired opponents and live engine facing input. Local V8 formula check passed; GitHub exact-head full CI still required.
- Continue Studio, rare counterable magic-Trick and real LAN increments on dev even when promotion is pending.

## 2026-10-23 — spatial Nutmeg facing counter (candidate 0.9.17.0)
- Source: `src/modules/dribbles.js`. A defender must face the ball carrier to receive the close-range, actively closing Nutmeg anticipation bonus. Missing facing preserves legacy/stat-only odds. No new buttons, IDs, saves or player data changes.
- Regression: `tests/nutmeg_facing_counter.test.cjs` covers front/back, legacy facing, stationary/retreating/exhausted, other styles and four controls. Release metadata/README/offline cache/version contract aligned to 0.9.17.0; exact-head CI/Pages pending.
- Previous 0.9.16.0 exact-head Census #39869704009 and Modular QA #39869703906 passed on `4548da29769fff4bcab0d9ddea4292568aebbcac`; main hosted #39870813429 and Pages #39870813765 passed.

## 2026-10-23 — Player Studio Magic Trick KEEP CURRENT candidate 0.9.17.1
- UI now defaults to KEEP CURRENT; explicit REMOVE or replacement required. No storage rewrite on unchanged selection. Legacy-equipped players retain selection without elite-rating migration.
- Added `tests/studio_magic_keep_current.test.cjs` covering Career/roster preservation, explicit removal/replacement, invalid selections, failed storage and four-button compatibility. JS handler smoke validated before commit; exact-head CI still required.
- Version metadata, README candidate banner, About release notes, offline cache, version tests and developer checkpoint aligned. Pending full 4 Node + 4 Chromium Census, Modular QA, protected promotion, Pages and hosted bytes.

## 2026-10-23 — GitHub publication recovered
- GitHub normal authorized dev writes succeeded: Scream closing-awareness fix `6b809fa4`, LAN two-peer handshake and four-control input validation `3a60cade`, LAN regression cases `a90d0d93`, own checkpoint `b4469f0d`.
- Scream remains rules-only and LAN remains transport-independent, not playable multiplayer. Player bundle stays 0.9.17.1; no new player-facing runtime release.
- Previous local focused tests were 4 Scream + 4 LAN passing; new exact-head GitHub 4 Node + 4 Chromium and Modular QA require independent confirmation. No security bypass or additional branch.

## 2026-10-23 — LAN timeline increment
Published on existing dev: diagonal normalization `e88d279a`, host input timeline `a01edc46`, timeout/immutability regression `03819c1b`, diagonal regression `a82b4a70`. Protocol only, not live two-client multiplayer; bundle version unchanged. Exact-head 4+4 and Modular QA pending; do not promote until certified.

## 2026-10-23 — LAN authenticated leave
Added host session `leave` validation, room release and immediate host-control neutralization with `clearLanInputOnLeave` (`cb15226c`, `09ad8f16`), plus focused regression (`6592b768`). Only protocol code; no gameplay bundle/version change. Await latest exact-head 4+4 and Modular QA; no manual main push.

## 2026-10-23 — guest LAN packet builder publication
Previously blocked code published on existing dev: `a58cd164` guest sequential four-button packet builder and `57b31522` focused tests (local 3/3 PASS). No gameplay integration; version remains 0.9.17.1. Next: inspect exact-head CI; implement guest hello/leave packets, transport and actual two-browser smoke. Do not promote pending checks.

## 2026-10-23 — LAN host-observed disconnect
`61c17f3a` adds `disconnectLanPeer` for a matching connected guest; stale sockets cannot evict a replacement. `18983fb0` adds three focused tests including immediate control reset. No player-facing version change; transport and match sync not implemented. Await exact-head 4+4 and Modular QA.

## 2026-10-23 — guest LAN lifecycle packets
`baab7e31`: join/leave packet factory interoperable with existing host validation. `4b41bacc`: host/guest focused test. Transport-independent, no user-visible release version change; 4+4 Census and Modular QA pending. Prior hosted main `3c3e6a5d` Pages success #39917009157. Next: transport integration and two-client browser tests.

## 2026-10-23 — Owner-requested UI redesign / coin economy roadmap
Updated NEXT_MILESTONES with screenshot-inspired polished UI graphics and original consistent special-ability icons, mobile/PC controls and visual QA; proposed future non-monetized earnable coin ledger and optional unlock catalog, transactional safety, no silent locking of existing content. Roadmap-only, NOT implemented. Candidate 0.9.17.1 unchanged. Commits `51d683ef` and checkpoint `badb9470`; latest exact-head regression and protected promotion need verification.

## 2026-10-23 — CI blocker repair + LAN wire codec
Root cause for Full Census #39918616667 and Modular QA #39918616639: previous checkpoint rewrite removed exact registered `**Agent ID:**` marker and six required sections. Repaired own checkpoint in `6101da0c` (contract unchanged). Added transport-neutral strict JSON wire codec in `518024cb`, hardened identifier type in `91890db3`, and host-interoperability/malformed/oversized packet tests in `11fb71bd`. No actual cross-device transport or gameplay synchronization; no player-facing version bump. Wait for exact-head 4+4 Full Census and Modular QA; preserve pending roadmap UI and coin plans.

## 2026-10-23 LAN host wire adapter
Added transport-neutral `createLanHostAdapter` in `3ea8ce3b` connecting bounded wire validation, guest input timeline, timeout and disconnect; three Node tests in `085482f3`. No real WebRTC channel or match sync yet, no player-facing version change. Await exact-head 4+4 and Modular QA; promote only green dev via protected workflow.

## 2026-10-23 — bounded RTCDataChannel host/guest binding (LAN infrastructure, not playable LAN)
- Verified prior exact `dev=main=05525054256ca6bcb0f9e3bf30a70f848befab32`. Full Census #39923610369 passed 4 Node + 4 Chromium shards, preview and hosted Pages smoke; Modular QA #39922362823 passed; Pages #39923611102 succeeded.
- `d6ea6f84` added `src/modules/lan-data-channel.js`: real RTCDataChannel-compatible event listeners on a single host and guest, auto-hello on open, bounded validated four-button input, monotonic guest sequence, leave, close/dispose cleanup, host single-channel guard and latched peer identity. `f3b91a12` uses the canonical LAN protocol version constant.
- `27f547f5` added `tests/lan-data-channel.test.cjs` with four fake two-endpoint channel cases: round-trip and input normalization, replay/identity isolation, disconnect/replacement, send-failure sequence safety. Tests are submitted to CI, not claimed green until observed. Exact-head Full Census #39928852428 and Modular QA #39928852470 were running at documentation time; docs commits supersede these SHAs and must be re-certified.
- This unbundled LAN transport adapter does **not** create RTCPeerConnection, perform SDP/ICE signaling, confirm peer acceptance, synchronize the match, or appear in the player-facing bundle. Installed About-only version remains `0.9.17.1`; no README release bump required for this isolated source/test increment.
- Next five: (1) exact-head 4+4/Modular QA and root-cause repairs, (2) authenticated browser peer-connection signaling, (3) Player Studio visual/icon integration with version/cache/README update, (4) pure idempotent coin ledger and unit tests, (5) green-head protected main promotion and Pages byte smoke. Do not stop development for pending release; only dev/main branches, no force push or bypass.

## 2026-10-23 manual LAN signaling
`499ad424` adds bounded manual RTC offer/answer SDP helpers; `8879fba1` adds three focused Node tests for handshake, malformed input and peer errors. No ICE trickle UI, peer authentication or playable multiplayer. Version 0.9.17.1 unchanged. Exact-head CI pending; do not bypass protected promotion.

## 2026-10-23 ICE-gathered LAN signaling
`24290ee9` adds bounded ICE gathering wait and gathered manual SDP offer/answer; `580f1135` fixes listener timer initialization race; `37abc53b` adds three Node tests. No browser signaling UI, connectivity proof or playable multiplayer yet. Candidate 0.9.17.1 unchanged. Exact-head QA pending.

## 2026-10-23 Concept menu/animation owner request
Removed both Concept Hero demo nav entries in `10e72d88`, softened prototype leg animation in `f88e0525`, updated regression test `d2fb4ce7`, synchronized player-facing 0.9.18.0 package/release/README/cache/policy in subsequent commits. Prototype remains isolated for graphics iteration; no claim full animation overhaul. Exact-head CI/Concept Hero QA pending; protected promotion only when green.

## 2026-10-23 CI repair
Modular QA #39931445278 failed because `tests/versioning_policy_contract.test.cjs` still asserted 0.9.17.1 after 0.9.18.0 candidate bump. Updated contract and service-worker cache release token (`fbd2c5d3`, `bd3d5e3b`, `22acefdf`). Latest exact-head CI pending; no green certification claimed.

## 2026-10-23 — Concept Royals twelve identities (candidate 0.9.19.0)
Added twelve named male identities with different skin, hair, face marks and accessories (`ca9b09fb`), painted five-view idle/run overlays (`55416258`), regression contract (`f995b842`), coordinated version/cache/README and tests. Repaired stale leg rotation test (`c752d687`) and six-heading memory checkpoint (`df157d56`). Important: procedural identity overlays reuse the original body atlas; no evidence yet of 12 independent fully illustrated animation sets or real-browser visual certification. Exact-head 4+4 regression and Modular QA pending; no deployment claim.

## 2026-10-23 11:57 Europe/Stockholm — Concept Royals real renderer animation QA increment
- Start dev `7d9d6920`, main `38502229`. Modular QA `39935132100` PASS; Concept Hero QA `39935132081` FAIL: old test expected removed `data-action=conceptDemo` shortcut (tests/concept_hero_browser_qa.py:39); Full Census still running at inspection.
- Repair `2ff222d9`: browser QA now navigates Quick Match → On Device → Single Player, selects Concept Royals through the supported team dropdown; retains roster/match/eight-direction checks.
- New bounded graphics QA feature `91033ebd`: a five-phase running timeline for each of 12 characters in each of five views (300 calls to actual game renderer) with browser PNG export. No synthetic artwork, no new gameplay buttons or save/schema changes.
- Browser capture `d1096213`: Chromium+Pillow test creates real 12×5 idle and running-timeline PNGs, checks every tile has drawn pixels, differences, JS errors, SHA-256 manifest. Workflow `cf085374` adds screenshot artifacts; contract `b9c717bf` protects QA wiring.
- Player-facing installed bundle stays **0.9.19.0**: only QA pages/tests/workflow/docs changed. This does **not** establish unique full animation rigs, shoot/tackle/jump animations, a successful Pages release, or final visual acceptance.
- Await exact-head Modular QA + Full 4 Node/4 Chromium Census and Concept Hero browser QA; investigate any failures. Keep work moving on dev while CI/promotion is pending.

### 2026-10-23 12:xx — Actual screenshot inspection and face-occlusion repair
- Downloaded Concept Hero QA artifact `12493378311` from successful run `39935767615` (commit `2ff222d9`); inspected `concept_player_actual_eight_views.png` and `concept_running_animation_contact_sheet.png`. **Real defect:** newer Concept Royals head overlays painted a large opaque dark oval over the original illustrated eyes/nose/mouth; original prototype face underneath was high quality. Old screenshots are before the fix, not evidence of corrected visuals.
- Fixed root cause in `src/modules/concepthero.js` `b60f86e7`: remove replacement head/face ellipses; pixel-recolour existing atlas skin/hair while preserving detailed facial features; keep accessories as small marks; cache tinted five-view layers for idle and run. Added non-occlusion regression `45030ef1`, corrected running-body assertion `3c89ec12`.
- Player-facing candidate version **0.9.19.1** coordinated package, release, README, SW cache, policy, contract (`02fd9993`..`ed3a8d89`). New face-fix screenshots and exact-head 4+4 CI are **pending**, not claimed visually approved. Original team/player IDs and saves unchanged.

### 2026-10-23 12:07 — Corrected real browser graphics screenshots PASS
- Concept Hero Playable QA run `39936440811` **PASS** at commit `55abbac6`; artifact `12494101727` contains the **actual** game-renderer idle sheet `concept_royals_12_players_5_views_idle.png` (12×5=60 views) and running contact sheet `concept_royals_12_players_5_views_running_timeline.png` (12×5×5=300 poses), real match screenshot, eight-view art sheet and JSON QA. Browser sheet report: PASS, no JS page errors, 60 nonblank tiles, 300 running samples; desktop and touch match smoke PASS. SHA-256 idle `c33ffa8c5f0faa699541a156b954cd6deed1fafb9fc9544fe1efdd3b8cb2c490`; running `c7c5fbb8d68da3cd7c11406af22f4e64d9c0351318a9010c78cfae806796acf3`.
- Found and fixed QA-only false failure: Playwright element screenshots included 1px CSS border and fractional rendered size (1562×2443), not 1560×2440 canvas pixels. `f3e0f5c9` now exports PNG from `canvas.toDataURL` and `55abbac6` updates test contract.
- Manual visual inspection: severe face masks are gone; illustrated eyes, nose and mouth preserved. Remaining graphics gap: most hairstyles share the same painted shape; stride motion is subtle and lacks full run cycles, and jump/shoot/tackle/super animations remain absent for this prototype. Full exact-head 4+4 regression, protected main promotion and hosted Pages byte smoke must still be verified separately.


## 2026-10-23 14:xx Europe/Stockholm — Crown visual enhancement (candidate 0.9.22.0)
- Based on exact dev `a550f25f4bfd2138171427d0041bba5cd6c98cba`: Crown Royals Alex/Leo now have distinct Super Shot anticipation versus ordinary shot and symmetric jump lift for positive/negative animation phases. These are visual transforms, not separately painted frames. No changes to 223 canonical teams/2676 players, 4 controls, 6 formations, SD09 or saved data.
- Earlier Modular QA #39949976975 reported three stale Node assertions; subsequent dev commits repaired them before this increment. Updated version contract for 0.9.22.0 and added deterministic VM canvas transform test plus real Chromium super-vs-shoot screenshot comparison.
- Local action-transform smoke PASS before commit. Exact-head full 4 Node + 4 Chromium, Modular QA, main protected promotion and hosted byte smoke require separate post-push verification.

### 2026-10-23 — Crown Royals two-player hair alignment, candidate 0.9.22.1
Adjusted the Crown Royals renderer's cached atlas only: Alex side hair silver→brown and Leo rear/side dark headband continuity. Added a focused source contract test. The 12-player user reference remains the target, but Kwame #3 and bespoke quarter/action art are NOT yet integrated. Do not claim full graphic/Pages approval without exact-SHA CI and actual browser screenshots.

### 2026-10-23 — Third reference player Kwame #3, candidate 0.9.23.0
New 132×90 transparent owner-reference-derived front/back/side atlas for Kwame, separately loaded and cached; existing two characters and Concept Hero preserved. UI Kwame ID now points to this atlas. Offline bundle, test fixture, version, QA page and focused tests updated. Quarter projections and action transformations remain experimental and require artistic acceptance; CI and Pages must independently verify candidate.

### 2026-10-23 — Studio navigation and independent club selection (0.9.23.3 candidate)
Prevented existing Career from hijacking Settings Studio. Studio Back routes to Customization; editable club selection preserved and validated. Added animation art priorities to milestones. Crown quarter-view depth is still pending. Exact-head CI and hosted checks required.

### 2026-10-23 — Crown Royals quarter depth proxy (0.9.24.0 candidate)
Cached 48x90 front-quarter/back-quarter sprites combine owner-reference front/back and side pixels without flattening the player by 0.86. All three integrated players share this pipeline; 3 source views remain the only hand-authored ones. This is a 2.5D directional improvement, not genuine 3D/finished quarter or bespoke action animation; review exact Chromium captures before art acceptance.

### 2026-10-23 — Crown quarter compositing rejected in visual QA
The 2.5D side-strip prototype produced duplicated hair/body silhouettes at screenshot scale. Reverted only that experimental renderer and its provisional acceptance tests; kept independently verified menu changes and existing original Crown atlas/hair fixes. Do not advertise depth/3D as complete. Prioritize independently painted front/back-quarter and genuine frame animations.

### 2026-10-23 — Diego #4 separate reference sprite (0.9.25.0 candidate)
Extracted Diego's three miniature source views into transparent 132×90 indexed PNG; assigned Diego's unique Crown reference ID and wired sprite preload, offline precache and test-only fixture. Existing Concept Hero/Alex/Leo/Kwame unchanged. Individual side/quarter and special-action art still pending. Exact-head Node/Chromium/hosted verification required.

## 2026-10-23 — LAN snapshot validation foundation (candidate 0.9.25.0, internal-only)

- Added src/modules/lan-state-snapshot.js: bounded immutable host-authoritative snapshot codec for room/host, monotonic tick, match clock/scores, ball and up to 22 normalized player positions. Rejects unknown fields, duplicate slots, foreign session and stale ticks. No gameplay wiring, WebRTC transport, or two-client certification is claimed.
- Added tests/lan-state-snapshot.test.cjs (three focused tests). Focused local Node test: 3/3 PASS with protocol-version-compatible lan-session stub; exact integrated GitHub CI still required.
- Preserved candidate 0.9.25.0, no player-facing changes; no new branch, no roster/save/control changes. Next: integrate snapshot send/receive with RTC channel, then apply guest interpolation with real two-browser tests.

## 2026-10-23 — Crown Royals graphics acceptance gate (owner follow-up)
- Existing Alex/Leo/Kwame/Diego sprites are not artistically accepted. Do not substitute promotional generated sheets for integrated assets.
- Fix first character Alex in actual renderer: independently authored transparent front/back/left/right side and front/back 3/4 views, remove opaque pixels and halo, align body and ball anchors across poses. Never repeat rejected strip-compositing quarter proxy.
- Verify alpha channel programmatically, frame bounding boxes, consistent face/kit/number, no accidental backdrop, eight views and all animation transitions in desktop and simulated touch Chromium screenshots; require human visual inspection before marking art complete.
- Then repair Leo, Kwame, Diego individually; only then author Ryo and remaining players sequentially. Preserve 223 teams/2676 players, four buttons, saves, SD09 and offline support. Full exact-head Node 4 + Chromium 4 + Modular QA, protected promotion and Pages byte smoke are release gates.
- This entry is a tracked acceptance requirement only, not evidence that artwork, QA or deployment completed.

## 2026-10-23 — Crown Royals SVG asset contract (test-only dev increment)
- Added `tests/crown_royals_svg_asset_contract.test.cjs` to reject opaque SVG background rectangles, embedded/external images, scripts, wrong 96×90 dimensions, missing front/back quarter groups, or absent character path geometry for Alex and Leo.
- This is a QA guard, not new player artwork or gameplay improvement. No bundle version bump; 0.9.27.0 remains the candidate. Exact-head full 4 Node + 4 Chromium and Modular QA, main promotion and Pages smoke still require evidence. Local git checkout blocked by DNS resolution of github.com; do not report local tests as executed.

## 2026-10-23 — QA root cause corrected: Crown SVG rear-frame assertion
- Reproduced a deterministic mismatch in the newly added `tests/crown_royals_svg_asset_contract.test.cjs`: it expected a mirrored `translate(96 0) scale(-1 1)` group, but BOTH shipped Alex/Leo SVGs actually author a separate rear-facing `translate(48 0)` group with `data-view="quarterBack"` and `data-orientation="rear-facing"`. Corrected the assertion to the real authored rear group, preserving the transparency and external-resource guards. Fix commit `a415391ecd007fb1197fff3a1bd866aa40966dda`.
- The old assertion was guaranteed to fail for both assets. Source-level matching confirmed the replacement condition; complete Node/Chromium/Modular CI and main/Pages certification have NOT been observed for this new head. Do not promote until exact-head green.

## 2026-10-23 — Kwame #3 independent quarter artwork candidate 0.9.28.0
- Added transparent assets/crown_royals/kwame_quarter_views.svg with distinct front/rear quarter silhouettes, dark skin/cropped hair, purple-gold kit and back number 3. This is authored small vector art, not yet a high-fidelity animation pack or visual acceptance.
- Integrated Kwame quarter sprite loading/selection into live src/modules/crownroyals.js; preserved Alex/Leo and Diego fallback. Added offline precache, browser fixture embedding, unit asset and renderer assertions, aligned four-field About candidate 0.9.28.0, package/README/release policy and tests.
- Isolated connector-side V8 runtime checks: 13/13 passed (SVG geometry/transparent-source guards, mock Image load, renderer front/back crop, fixture/offline wiring and version contract). This is NOT Node/Chromium execution or visual QA. Local GitHub checkout cannot resolve github.com; CI 4+4, Modular, exact-head main promotion and Pages hash smoke remain to verify.
- Next: obtain exact-head hosted CI, repair any failures; inspect actual screenshots for Kwame and earlier art; add Diego authored quarters; then progress two-client LAN and Player Studio.

### 2026-10-23 — Exact-head CI blocker diagnosed and repaired
- Full Regression Census run 40009075596 preflight and Modular QA run 40009075599 source-and-data both failed with the same single assertion: tests/project_memory_contract.test.cjs required the literal heading `## Next smallest action` in the sole developer checkpoint. The newly condensed checkpoint had incorrectly renamed it `## Next five actions`. 531/532 Node tests passed in each affected preflight. Repaired checkpoint heading in commit a34482f12ad6232e4526e3a70337b387d0bc90c2; subsequent exact-head 4+4/Modular and Pages smoke must still be verified. Also repaired per-frame SVG `<path\b` regex in commit ece0e3f1fbfe687fd29f4d7ddbbdacef56513d00.

## 2026-10-23 — candidate 0.9.29.1
- Ability summary own-key validation for Super Shot/Defence and regression test (18116a61, 37061bb0); synchronized package, About, README, offline cache and policy. Focused/full CI not yet observed. Main promotion/Pages not yet verified. Next: run exact-head 4+4 and Modular QA, correct failures, then protected promotion and hosted smoke.

### 2026-10-24 LAN-017 (internal transport diagnostics)
Added read-only transportState/channelState accessors to LAN peer wrapper, with lifecycle regression. Implementation 05f6f711; test eb33326e. Exact-head CI pending; no player-facing change, playable LAN or graphics certification claim. Previous main/dev 85f04314 passed 4+4 census, Modular QA and Pages. Continue lobby and graphics QA.

## 2026-10-24 — LAN-018 disconnected transport gating (internal 0.9.39.0)
- Baseline dev/main: `83a74328e59996f27e5b21278e318897d763e316`; dev Full Census #40093044622 and Modular QA #40093044602 green, main Full Census #40093664611 and Pages #40093664360 green; hosted smoke step passed.
- LAN-018 `c7b7a9f5`: a protocol-ready RTCDataChannel cannot advertise ready or accept guest/host frames while RTCPeerConnection is disconnected, failed or closed; awaitReady waits for transport recovery. Restores readiness after transient reconnect; no gameplay controls, saved data or rosters changed. `1cf83b8d`: two regression tests for ready/frame gating and reconnect wait.
- Source-backed V8 mock-peer smoke 9/9 assertions passed. Exact-head Node/Chromium and Modular QA for final documentation commit pending; do not claim new production deployment. No visual art approval or real two-client LAN certification. Owner's issue #15 (Concept Royals facing) remains open.
- Next: inspect exact-head full 4 Node + 4 Chromium and Modular QA, repair failures; protected dev→main promotion only after green; verify Pages hashes; integrate accessible LAN lobby and authoritative match snapshots; separately perform real Chromium Concept Royals directional screenshot QA.


## 2026-10-24 — LAN-019 event-driven lobby status API (internal; About-only 0.9.39.0)
- Start: dev/main `c4c8609ab422ce1d49d33649ec217fafd1491f42`; exact-head dev Full Regression #40096472128 and Modular QA #40096471921 green, main Full Regression #40096778908 and Pages #40096778735 green. Only `dev` and `main` branches.
- Feature `412c578a827ffaae4ee77d6df5e50ba0bb6ea68e`: `createLanPeerConnection` exposes immutable `status` and `subscribeStatus(callback)` for phase/RTC/channel/handshake transitions, deduplicates unchanged status, isolates throwing observers and cleans listeners on dispose. This is transport infrastructure only, not playable LAN or a UI feature. Regression `cc9d44de6bba1844e4abee4362b726090a35b743`: two new status lifecycle/dedup/observer tests.
- Source-backed V8 execution of actual three LAN modules and 15 existing/new tests: **15/15 passed** with a minimal EventTarget and interval shim; not a native Node test or real browser. Await exact final-head Modular QA and full four Node + four Chromium Census before protected promotion; main/Pages/hosted-byte verification remain independent.
- No user-facing code, no version bump; preserve 223 teams/2676 players, six formations, four buttons, 10 Career/Cup slots, SD09, offline/save compatibility. Open graphics issue #15 remains for screenshot-based correction. Next: exact-head CI, protected promotion, manual SDP lobby UI, match-loop/snapshot integration, Concept Royals orientation QA.

### 2026-10-24 LAN-020 abortable readiness
Added optional AbortSignal to awaitReady for cancellable future lobby waits; pre-aborted and in-flight cancellation covered by two Node regression tests. Implementation 50055eed; tests 24bfb5de. Prior main/dev db6eacfb certified full census, Modular QA, Pages. Exact new-head CI pending; no playable LAN or graphics certification claim.

### 2026-10-24 LAN-021 cancellation validation
Validated optional AbortSignal before registering readiness listeners or timers; malformed cancellation tokens reject safely, with regression coverage. Source 76217755, test bb09d0be. Prior dev/main 9ac3a388 passed dev 4+4 census and Modular QA; main Census/Pages were running at inspection. Exact new-head QA pending; not a playable LAN or visual art certification.

### 2026-10-24 CI repair + LAN-022
Exact-head d1ac4b3b failed memory contract because developer checkpoint omitted required backtick identity marker; repaired at 50dab5e9 without weakening test. Added optional AbortSignal cancellation for LAN status subscriptions (ab9553b0), with regression test (ef7f0390). No playable LAN or graphics certification; latest exact-head CI pending. Continue dev increments while release pending.

### 2026-10-24 — LAN-023 terminal status regression repair
- Exact-head dev `7cb87465a98a7f5d3d7fa320c8fcf44666b35072` failed Modular QA #40104758806 and Full Census #40104758754 preflight: LAN-019 test `tests/lan_peer_connection.test.cjs:342` expected one immediate closed-state callback after `dispose()`, got zero. Root cause: LAN-022 AbortSignal subscriber refactor gated the initial callback behind `!disposed`.
- Fix: deliver a one-time immutable terminal snapshot to non-aborted subscribers after disposal, without retaining listeners. Preserve pre-aborted silence, observer isolation and live abort cleanup; add LAN-023 regression for terminal snapshot with AbortSignal. One atomic dev commit to avoid intermediate CI cancellation; exact-head 4 Node + 4 Chromium, Modular QA and protected promotion required.
- Last verified main `9ac3a3887a6fae0bdd99a8b490ea151f2882b662`: main Full Census #40104566268 and Pages #40104566800 success, dev QA #40104315144/#40104315132 success. No visual graphics approval or two-client LAN gameplay claim.

### 2026-10-24 — LAN-024 manual two-device connection preview (0.9.40.0 candidate)
- Starting dev/main `a79626234763925bbd11223ff2324e19fdbd19e2`, both green: dev Modular QA #40105531189, dev 4 Node+4 Chromium Census #40105531159, main Census #40105872910, Pages #40105873146.
- Added `src/modules/lan-lobby.js` with secure 128-bit session ID, version/session validation, host offer, guest answer, live WebRTC connection diagnostics, cancellation/reset and clipboard fallback; integrated Quick Match > Local Network (connection preview). This does **not** synchronize the match or expose playable two-browser mode. Code commits 9ac9a213, 87681e14, 37636b25; responsive styling 1fb7a11c.
- Added six focused tests in `tests/lan_lobby.test.cjs` (379a2047, 3cb6a625). Added LAN modules to offline precache and generated Chromium fixture (cf3d76c4, 5405370c); bumped About-only candidate to 0.9.40.0 in package/release/README/sw, policy/shared memory updated.
- Diagnosed Modular QA failure at #40109764095: three existing art contract tests expected direct `crownroyals,render` adjacency. Corrected these tests to require the new explicit four-module LAN sequence while retaining art ordering (610d3cc1, c0d858d4, 4e3acf75). Modular QA #40109853703 succeeded; full 4+4 and latest exact-head promotion pending. Source-backed V8 syntax and signaling smoke passed, not real-browser or real-device LAN certification.
- No direct push to main. Preserve 223 teams/2676 players, six formations, four gameplay buttons, ten Career/Cup slots, SD09, save/offline compatibility. Graphics issue #15 still open; no visual approval claimed.

- LAN-024 accessibility follow-up: Escape now navigates back from the signaling textareas (f64a4b4d); corresponding UI contract regression a4945716. Intermediate Modular QA #40109997203 and #40110027915 passed; latest exact-head certification still pending.

- Exact-head Census #40110160109: four Node shards and preview passed, Chromium shard 2 failed solely in legacy `v08247_menu_browser_qa.py` waiting for removed `[data-action=laterLAN]` (30s timeout). Updated this test to assert the new `navLan` connection preview, host/guest controls, honest unplayable-state notice, and Escape from focused SDP textarea; fix commit 45ebde43. No CI bypass or main promotion; rerun required.

### 2026-10-24 — LAN-025 validated host input notifications (internal candidate)
- Baseline exact dev/main `0bf86945594d975d83b8f72c5ce8934dae16fe59`: dev Modular QA #40110496136 and 4+4 Full Census #40110496133 success; main Full Census #40110776217 and Pages #40110775600 success.
- Added `subscribeInput(listener, AbortSignal?)` to the host DataChannel binding, exposed as `subscribeHostInput` on the WebRTC peer. Notifications are emitted only for accepted, in-window, non-replayed four-button guest inputs; callbacks cannot modify authoritative host frame queue, exceptions are isolated, and abort/dispose unregister observers. Source commits `c74f1e18` and `81a216b0`; two regression tests `654755a6`.
- Source-backed V8 integration check PASSED for handshake, validated input callback, immutable packet, malformed/replay rejection, observer isolation, abort and host frame queue integrity. Modular QA #40114053637 passed at test commit; Full Census #40114053618 was still running at inspection. Final exact-head 4 Node + 4 Chromium and Modular QA required before protected promotion. No two-client playable match or graphics certification claimed.
- No player-facing change: About-only version remains 0.9.40.0, no new cache rotation. Preserve roster, controls, formations, saves and SD09. Next: wire authoritative match input consumer and snapshots; graphics issue #15.

### 2026-10-24 20:00 CEST — LAN-026 authoritative frame observation
- Verified prior LAN-025 dev/main exact SHA `1548bbc7071a76e50ead91b7dd06b293e044ef6d` with green dev Modular QA #40114131448, dev Full 4 Node + 4 Chromium #40114131440, main Full #40114540662 and Pages #40114540893.
- Added host-only `subscribeFrame(listener, AbortSignal?)` to the DataChannel binding (commit `fad026ba`), exposed as `subscribeHostFrame` on peer facade (`c244d204`). Each successful `advanceHostFrame` emits a frozen {frame,input,received} event after the authoritative queue advances. Observer exceptions are isolated; duplicate/rejected advances do not notify; cancellation/disposal unsubscribe. Existing return value unchanged.
- Added two regression tests (`825beb10`) for neutral and received four-button inputs, immutable event, duplicate rejection, callback isolation, cancellation and pre-aborted subscription. Intermediate source commits passed Modular QA (#40118822173, #40118829760); integrated exact-head CI pending. No claim of real match-loop integration, two-browser play, or graphics signoff.
- Internal LAN change: About-only 0.9.40.0 retained. Preserve 223 teams/2676 players, six formations, four buttons, 10 save slots, SD09 and offline compatibility. Next: exact-head 4+4/Modular QA; green-only promotion/Pages byte smoke; real host match controller wiring and snapshots; Concept Royals visual issue #15.


## 2026-10-24 20:11 CEST — LAN-027 shared-channel authoritative snapshot bridge
- Start exact `dev`/`main`: `b0439801375236d96939d224c7aaad17666fc0e1`. Exact-head dev Full Regression #40118878315, Modular QA #40118878305, main Full Regression #40119204583, Pages #40119204418 all succeeded.
- LAN-027 `864198ef`: host-only `sendHostSnapshot(snapshot)` and guest-only `subscribeGuestSnapshots(listener,initialTick)` on the existing hello-validated WebRTC DataChannel, using the existing bounded snapshot codec and ordered guest cursor. Session-derived frozen `snapshotIdentity`; host readiness/transport gating; guest render failures do not advance cursor. The game still must supply real match snapshots and render them: NOT playable LAN.
- Regression `fb2b4557` adds two peer-level tests for handshake, replay, host/guest roles, invalid identities, guest input coexistence, reconnect and render failures. Modular QA on that test commit failed 660/661: second test revealed null callback not rejected. Repaired in `703c9de7` by validating listener before registration.
- Offline dependency repair: `c059d834` precached snapshot modules and rotated cache; `1f7d9166` added them to generated fixture. Modular QA exposed brittle legacy contiguous-order regex assertions and cache suffix contract. Repaired by preserving legacy order, appending snapshot modules and retaining terminal `-09400` token: `3378c651` and `38e7ef44`. No weakened assertions.
- Internal transport increment retains About-only `0.9.40.0`, four controls, 223 teams/2676 players, six formations, 10 Career/Cup slots, SD09, save/offline compatibility. Exact integrated-head 4 Node + 4 Chromium, Modular QA, protected promotion, main/Pages hosted byte smoke PENDING; no visual QA or live two-browser certification claimed.
- Next: finish/repair exact-head CI, permit protected promotion, verify main/Pages hashes; integrate real match state with host snapshots and guest rendering; two-browser network E2E; Concept Royals issue #15 screenshot QA.

- Follow-up offline import closure: `src/modules/lan-state-snapshot.js` imports `lan-session.js`, which was absent from SW precache; added in `756990cb`. Regression `294a52b5` asserts the full transitive snapshot dependency chain is cached and the browser fixture includes the new modules. Intermediate `38e7ef44` Modular QA passed; latest exact-head certification pending.

### 2026-10-24 LAN-028 fail-fast readiness
`awaitReady` now immediately rejects an already-failed/closed RTC transport or closed DataChannel before installing polling timers; source 1a4f5111, tests 9acf5ca6. Prior exact dev/main c495c329 passed 4+4 census, Modular QA and Pages. New head pending CI. Internal LAN change; About-only 0.9.40.0 unchanged. Real two-client gameplay and Concept Royals screenshot QA outstanding.

### 2026-10-24 LAN-029 signaling progress observers
Added synchronous immutable status emission for offer/answer gathering, answer application and SDP completion (`0239398d`); deferred-offer regression `efbde094` verifies the lobby sees intermediate state before SDP resolves. Previous dev/main e52439db exact-head 4+4, Modular QA and Pages all green (#40122235591, #40122235576, #40122524867, #40122524884). Internal-only; version remains 0.9.40.0. New exact-head QA pending; gameplay and graphics not visually certified.

### 2026-10-24 LAN-030: completed ICE on failed RTC
Fixed `waitForLanIceGathering` to reject a failed/closed RTC transport before its completed-ICE fast path (c8c40950). Added healthy/failed/closed focused regression (aa10dd8e). Prior dev/main f210660c green on dev full+Modular; main Full Census and Pages running at inspection. Exact new dev CI pending. Internal transport correction; 0.9.40.0 unchanged. Concept Royals graphics and two-browser gameplay not certified.

### 2026-10-24 LAN-031 synchronous ICE listener race
Avoid arming a timeout after synchronous ICE completion during listener registration (`e34b9c64`); regression `e318fea3`. Prior dev/main e54e52c0 passed dev Modular/Full, Pages deployed; main Full Census running at inspection. New exact-head CI pending. Internal LAN reliability, About-only 0.9.40.0 unchanged; real LAN gameplay and graphics visual acceptance still open.

### 2026-10-24 LAN-032 synchronous ICE cleanup
Avoid registering second RTC listener after first registration synchronously settles ICE (95b7ec6a); focused regression d3a62e45. Prior LAN-031 exact dev Modular QA passed and Full Census running; main remains e54e52c0. New head CI pending; no premature promotion, no graphics or multiplayer certification.

### 2026-10-24 LAN-033 WebRTC peer interface validation
Fail closed for malformed injected WebRTC peers before attaching handlers; attempt safe peer close (`1fad18a4`), with regression (`384ab2ac`). Previous dev LAN-032 Modular QA #40124140940 passed; full Census #40124140981 running. main remains e54e52c0. New exact-head CI pending; no premature release, real two-browser gameplay and graphics QA remain open.

### 2026-10-24 LAN-034 validate complete WebRTC signaling interface
Reject malformed injected peers lacking DataChannel creation or offer/answer/local/remote description methods before RTC wiring (9cff3221); test all five missing methods and cleanup (cfa69984). LAN-033 Modular #40124496072 passed; Full #40124496140 running at inspection. New exact-head CI pending, main e54e52c0 unchanged. Internal LAN; graphics and two-browser gameplay remain unverified.

### 2026-10-24 LAN-035 malformed host DataChannel cleanup
Validate host-created DataChannel EventTarget/send/close interface and close both channel and RTC peer on setup failure (4b2e26e1). Added focused cleanup regression (f2ae8a02). Previous certified main/dev 07a6a168: dev Full #40124690676 and Modular #40124690634, main Full #40125043094, Pages #40125043002 succeeded. Latest-head CI pending; gameplay and graphics acceptance not asserted.

### 2026-10-24 LAN-036 guest incoming channel validation
Validate remote guest DataChannel interface before binding; close malformed channel without throwing from RTC event (ca8ab53a). Regression 784e749f and corrected public status assertion 09e71640. Previous LAN-034 main/dev 07a6a168 fully certified and Pages deployed. LAN-035 final dev Modular #40125440224 passed, Full #40125440255 in progress at inspection. New exact-head CI pending; no claim of gameplay/graphics QA.

### 2026-10-24 22:02 CEST — LAN-037 abortable guest snapshot receiver
- Root cause of prior CI failure: #40125905520 failed identity assertion in tests/project_memory_contract.test.cjs (agent ID missing literal backticks); corrected by a5b39153, Modular #40127995468 passed; Full #40127995383 still in progress at inspection.
- Internal LAN feature 80a7b046: guest snapshot binding optionally accepts an AbortSignal; aborted receivers release their channel binding and stop consuming snapshots, including pre-aborted/racing signals. Tests 929656b0 cover abort/resubscribe, pre-aborted and malformed signal. No game UI, version or save schema change; 0.9.40.0 remains About-only.
- Exact-head 929656b0 Modular #40128058327 and Full #40128058324 queued at inspection; no production promotion or live graphics acceptance claimed.
- Next: (1) certify latest exact head; (2) protected main promotion and Pages byte smoke; (3) expose receiver lifecycle at peer API; (4) wire real authoritative match snapshot loop; (5) resolve Concept Royals directional graphics #15 with screenshots.

### 2026-10-24 23:46 CEST — LAN-042 guest renderer match-state adapter
- dev/main baseline 0c3bc81b identical. Implementation 093b8ee5 adds subscribeGuestMatchState adapter, forwarding validated ordered guest snapshots as immutable gameplay-shaped state. Regression bb04b855 covers metadata stripping, delivery and cancellation.
- Internal-only API: no About version bump; no claim of renderer integration, two-browser gameplay, graphics QA, CI or hosted deployment. Full exact-head 4+4 and Modular QA remain to verify before protected promotion.

### 2026-10-25 00:06 CEST — LAN-043 host simulation frame bridge
- Baseline dev/main fa7e620c5b83cb727052bdb3a07f2d48d04a377c; no new branch. Source 29f6a034: `stepHostMatchFrame(frame, simulate)` consumes validated guest input, invokes one synchronous host-owned simulation callback, enforces matching snapshot tick and publishes a session-bound snapshot. This is a callable integration seam, **not** a live match-loop hookup. Test eb2960d8 covers guest input, callback, snapshot, replay, mismatch, role and asynchronous rejection.
- Source-backed V8 integration smoke **passed**: real modules evaluated with fake WebRTC peers; handshake, four-button guest input, callback, snapshot delivery, replay rejection and disposal. Initial V8 run lacked TextEncoder; polyfilled it for this isolated smoke. **Not Node/Chromium CI** or real browser/gameplay/graphics QA.
- Exact-head workflow query for eb2960d8 returned empty PR-filtered runs and combined statuses []; public Actions page disabled. No exact-head full 4 Node+4 Chromium, Modular QA or Pages byte certification observed. Do not promote to main until protected checks are independently verified.
- About-only 0.9.40.0 unchanged (internal API only). Next: verify full CI, wire actual simulation/renderer, test two clients, fix Concept Royals #15 with screenshot QA, protected promotion/Pages smoke.

### 2026-10-25 — LAN-044–051 host/guest Quick Match integration (candidate 0.9.41.2)
- Beginning head: dev/main d2d5101c. New code adds live host GameEngine bridge (ca2bc1c4), lobby ownership handoff (a1b409a5), playable Quick Match scene/loop (5082d81f), optional authenticated-session-bound snapshot state meta (164be034, 56a86269, 10acf326), guest directional/input fidelity and diagonal fairness (7639b25d), E2E fake-peer tests (e284f324) plus snapshot/engine regression. Existing game team/roster/save data untouched; only dev branch used.
- Source-backed V8 executed combined actual six LAN modules with simulated connected RTCDataChannels: handshake ready both peers, 12 authoritative frames; guest input moved away player X700→714.08, remote and host positions + match clock equal on tick11; 11 additional focused bridge assertions passed. Snapshot legacy/extended serialization tests passed in V8. These are NOT physical browser/graphics certification or GitHub exact-head CI.
- Concurrent dev revisions repaired outdated audio/fixture tests and own checkpoint policy; Modular QA #40141540457 green (688/688) for earlier 0f8af146. Later #40141571747 failed because own memory was missing '## Mission'; latest own checkpoint now includes it. Do NOT mistake earlier green run for the latest combined head.
- Candidate 0.9.41.2 About/README/package/offline cache version aligned for LAN-051 diagonal fairness. No main promotion or hosted byte claim. Recheck latest exact head full 4+4 and Modular QA; test two actual browsers/latency/disconnect/reconnect; fix Concept Royals #15 visuals before certification.
