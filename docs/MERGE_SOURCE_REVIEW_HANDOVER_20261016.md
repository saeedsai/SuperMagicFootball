# Source-sensitive player review flags — integration tooling checkpoint

**Date:** 16 October 2026. **Exclusive claim:** `integration-tooling`, owner `merge-source-review-20261016-1507-gpt6`. Feature `MERGE-SOURCE-REVIEW-FLAGS`.

## Baseline and scope

- Live dev base at claim: `abe1fff31bd47fdcd37d2097ef65c6dc5ac525ae`. Verified the remote active claim before code changes.
- New code in `scripts/parallel_data_merge.py` only; regression additions in `tests/test_parallel_data_merge.py`. Guide `docs/PARALLEL_DATA_MERGE_GUIDE.md` updated.
- No modifications to data/players, player values/ratings/ages, graphics/art, playable engine, UI, mechanics JSON, saved games, CI workflows or the PWA service worker.
- No historical data, valid tests, artwork, templates or QA documents deleted; none of the candidate files was demonstrably unused or safe to remove while agents are actively integrating.

## Requirement delivered

**Before:** The three-way merge already refused overlapping writes to one JSON field, stable team-index changes, roster membership/order changes and dangling artwork references. A change to a player's age, rating, height, nation, number or FC27 fields could nevertheless merge successfully with no explicit reminder to verify its source.

**Now:** The CLI result and optional `--report` include `sourceReview` with a total changed-player count and up to 25 stable-ID-scoped review entries, plus a truncation flag. Entries identify the sensitive player fields that actually changed in the merged result, and separately indicate which provenance/verification annotation fields also changed.

This is deliberately **advisory**, not a new conflict and not evidence the supplied source was authenticated. It cannot validate FC27 scores or real-world height, birthplace, club, age, lineup, or licensing. Non-sensitive presentation edits are ignored, and merge conflict handling is unchanged. A normal `--check` still stages no JSON.

## Implementation and tests

| Item | GitHub |
|---|---|
| Source feature | [`b9b5c875`](https://github.com/saeedsai/SuperMagicFootball/commit/b9b5c875de516bf09daf6bd7b251487e70e3d70d) |
| Three new Python tests | [`727f6abe`](https://github.com/saeedsai/SuperMagicFootball/commit/727f6abe0cc5a2f1d06dd19bd8804f0ca0c14ffc) |
| Guide and example | [`d7a2acc6`](https://github.com/saeedsai/SuperMagicFootball/commit/d7a2acc6e73aea11b2feceedf2d300b6e550fdfe) |

Test cases cover: independently edited FC27-style rating and height with source metadata changed on one side; unproven rating changes versus cosmetic `shotName` edits; and preserving a 30-record total with 25 example entries and a truncation flag.

**Verified CI:** [Modular Game Dev QA #38903009633](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38903009633) on `727f6abe` **SUCCESS**, with **20/20 Python merge contracts**, **10/10 Python feature-claim contracts**, **116/116 active Node contracts**, 165-club / 1,980-slot roster/history validations, JSON source validation, generated test-only fixture and Python browser compilation all passing. [Modular QA #38903065570](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38903065570) on documented code+guide `d7a2acc6` **SUCCESS**.

**Full Regression Census:** [#38903065643](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38903065643) was pending when its status was read. This exact source commit is not certified as an eight-shard green run. Concurrent integration means later successful jobs are distinct SHAs and should not be conflated.

**Attempted additional CLI test:** a follow-on update to the already edited Python suite was rejected by GitHub's compare-and-update guard after concurrent branch movement. No overwrite or force-push was attempted; the three primary tests already landed and passed. A future isolated batch can add a CLI `--report` end-to-end assertion.

**Playability:** the public entry remains https://saeedsai.github.io/SuperMagicFootball/ . Live Pages retrieval did not succeed from the web tool. Existing GitHub-hosted desktop/simulated-touch Quick Match smoke ([#38891468528](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528)) is prior-code evidence; exact new-source hosted match and physical phones were not independently verified. Runtime behavior was unchanged in this batch.

## Risks / open requirements

- Editors still must check *actual EA FC27 official ratings and trusted fallback information* and record provenance, not merely add a URL or flag.
- The current source-review signal is limited to source-sensitive edits with preserved player IDs; another QA batch could make separate provenance rules for moved/unavailable source IDs or tighten source-age calculation.
- Full historical browser census and exact live-hosted smoke are still separate release gates.
- Historical original-game parity, exhaustive FC27 review across all teams, physical Android/iOS/Safari, PWA/offline/restart persistence and multiplayer remain open and are deliberately untouched.
- Concurrent owners hold gameplay, UI, release and Arsenal roster scopes; do not modify their files.

## Next five bounded iterations (check claims before each)

1. **Full release evidence:** Inspect current eight-shard census on exact source SHA and rerun failures; separately verify public Pages desktop/simulated-touch match after deployment.
2. **Merge/source review correctness:** Add the end-to-end dry-run CLI `sourceReview` contract and consider an audit report for editing FC27 review metadata *without* changing factual fields.
3. **Next sourced team batch:** Under an unclaimed *single team roster* key, validate 2–3 player attributes from official club/league/EA records, retaining IDs and editorial rating distinctions.
4. **Goalkeeper fairness and graphics:** Once their separate owner keys are available, calibrate real AI mirrored save/corner outcomes and finish eight-direction glove grip/release art.
5. **Career/tactics/first-touch polish:** Separately claim UI or graphics to improve substitution feedback and passing/reception visuals without altering saves/controls.

Handover: release `integration-tooling` after publishing this checkpoint and leave the full eight-shard run pending if it has not completed.

### Full regression intermediate evidence

[Full Regression Census #38903065643](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38903065643) has completed its data preflight and all **four Node script shards PASS: 117/117** (30+29+29+29), with no failure, timeout, error or nonexecution. The four independent Chromium shards were still running when this checkpoint was finalized, so the **eight-shard aggregate is not yet certified**. This run is tied to source/guide commit `d7a2acc6e73aea11b2feceedf2d300b6e550fdfe`, not the latest concurrently advancing dev commit.
