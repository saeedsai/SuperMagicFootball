# Supermagic Football — 16 October 2026 gameplay checkpoint QA

## Scope and latest-relevant commit

New owner requirements added: slightly fairer Super Shot velocity and fatigue, increased goalkeeper diving activity (queued), and goalkeeper hand-held ball (initial capability delivered). The playable source edits are in [`7911065d13ca7bb78e13ee802c6b0494544e5f3c`](https://github.com/saeedsai/SuperMagicFootball/commit/7911065d13ca7bb78e13ee802c6b0494544e5f3c), built upon `dbbfb2013957be24f312d63aa9f882753b8f07f3`. Additional browser tests, cache-version fixes, and documentation are in descendant commits.

## Automated results (exact source/test commit `afdcec617ebc9e043c570da1337c6652c6d5c748`)

| Gate | Result | Evidence |
|---|---|---|
| Python JSON validator + fixture | PASS | [Modular Game Dev QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38876713370) |
| Node active test suite | PASS, 55/55 | [Modular QA](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38876713370) |
| All executable Node regression scripts | PASS, 91/91 (23+23+23+22) | [Full Regression Census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38876713344) |
| All Chromium regression scripts | PASS, 50/50 (12+13+12+13) | [Full Regression Census](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38876713344) |
| Full regression total | **141/141 PASS; FAIL 0; TIMEOUT 0; ERROR 0; NOT_RUN 0** | [Workflow success](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38876713344) |
| Published site | SUCCESS | [Pages deployment](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38876713209) |
| Hosted game menu/team/kickoff/active match | SUCCESS desktop + simulated touch | [Live smoke rerun](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38876461817) |

## Newly verified behavior

- `physicsTuning.superShot.speedMultiplier` and `fatigueMultiplier` are respectively `0.96` and `1.08` with strict finite bounds and reject-invalid unit tests.
- In real inline modular browser engine action, firing the same special shot with identical setup and stable RNG produces 4% lower launch speed and 8% higher action fatigue than the historical injected coefficient baseline.
- A goalkeeper can collect a live ball with the dive-catch path, keep possession at a height of 82 world units relative to his position, retain possession for a short interval, then release the ball via the established distribution pipeline. Browser tests passed desktop and simulated touch.
- Existing 223 static teams, 165 clubs/1,980 selected club players, legacy IDs/saves, +20% pitch, five menus/four action buttons, six formations and source-aware roster history are preserved.
- The older service-worker cache-rotation tests initially pinned the previous cache token; four historical assertions were aligned to the new token and Modular QA became green. This was a **test expectation mismatch**, not a source gameplay defect.

## Other concurrent work / incomplete requirements

Another agent's 2026 club metadata patch temporarily failed one Node test because `Ian Maatsen.age` was missing. The same agent followed it with a source-consistent correction; do not override their roster data. Newer concurrently added graphics and roster commits have separate CI lifecycles.

Still open: increased goalkeeper **dive attempt/activity** without off-plane contact, eight-direction grip/throw visuals, calibrated goal rates across Super Shot levels, subjective likeness and some third-party FC27 attribution. Physical Android/iOS browser/device, PWA/offline and exhaustive restart/persistence checks remain owner-deferred.

The latest `dev` commit may advance independently of this certified code SHA; verify per-commit checks before calling any later concurrent changes release certified. Hosted link: https://saeedsai.github.io/SuperMagicFootball/
