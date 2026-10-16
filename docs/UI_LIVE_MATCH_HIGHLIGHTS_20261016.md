# Read-only live match moments — feature and QA handover

**Date:** 2026-10-16  
**Owner:** `ui-match-highlights-20261016-gpt6-session14`  
**Exclusive lock:** `ui-controls`  
**Feature:** `UI-LIVE-MATCH-EVENTS`

## User-visible feature

The actual playable **PAUSED**, **HALF TIME**, and ordinary Quick/Versus **FULL TIME** menus now include **MATCH EVENTS**, a compact, read-only last-five-major-events timeline sourced from the engine's existing `game.events` stream. It displays recent home/away goals (recorded score), keeper saves, dribble tricks and results, genuine substitutions, and team talks. Events are shown latest first; unrelated high-volume engine telemetry is excluded. An empty match shows a clear no-events message.

Engine `emit()` already records the event objects. This feature does not invent a separate telemetry system, mutate event records, change match physics, AI, substitutions, lineup, team talk, scores, or persistent saves. User-provided player/hero/technique strings are HTML escaped. Style-only tactical changes that historically emitted `substitution` with `count:0` are deliberately **not** represented as player substitutions; their underlying semantic issue [#7](https://github.com/saeedsai/SuperMagicFootball/issues/7) belongs exclusively to the active gameplay-engine owner.

Only standard full-time results show this panel; Continental and Manager Career branches retain their existing result flow, rewards and saves. Historical event timestamps were never recorded, so no fabricated minute/time is shown. Scope does not add gameplay buttons: original Pass, Shoot, Dribble and Jump remain four.

## Bounded changed paths

- `src/modules/ui.js`: pure `matchHighlightsPanel(game)`, wired into Pause, Half-Time, standard Full-Time screens only.
- `tests/match_highlights.test.cjs`: six contracts for order/limit, empty state, type selection, side labels, zero-count filtering, malicious names and read-only wiring.
- `tests/match_highlights_browser_qa.py`: actual modular Quick Match + 2-player Versus in desktop Chromium and simulated touch, seeded existing engine events through real `game.emit`, real menus, HTML escape, expected event order/count, no impact on teams/score/plan/subs/talks/saves/controls, and in-game screenshot captures.
- `docs/NEXT_MILESTONES.md`: micro-iteration and next-five plan; this document for source QA checkpoint.

No engine, keeper, input system, generated graphics, data shards, CI release workflows, shared test runners, save migrations or gameplay button layouts were edited. No old art/tests/provenance evidence deleted without proof of safe removal.

## Integration, test and deployment gates

Use current `dev` base with SHA-checked exclusive lock. Run source Node test, all active Node tests, Python merge and coordination safeguards, complete Full Regression Census 4 Node + 4 Chromium shards, and hosted GitHub Pages PC/simulated-touch smoke. Report exact tested commits and separate browser vs physical mobile evidence. The new browser acceptance produces four in-game screenshots inside the CI runner, not hand-drawn marketing art. Link run results below after integration.

## Next five iterations

1. Verify this feature's exact-source all-shard Chromium regression and hosted PC/touch smoke, fixing only reproducible owned-scope issues.
2. Complete separately owned tactical-event semantic fix [#7](https://github.com/saeedsai/SuperMagicFootball/issues/7) so a style change no longer logs a zero-player substitution.
3. Add short pressure-aware first-touch reception/buffering as an isolated engine mechanic with hard limits and keeper exclusions when gameplay lock is free.
4. Finish editable directional ball reception, pass follow-through and keeper glove/ball animations under graphics ownership.
5. Expand save-safe career progression/tactical match guidance, with independent local two-human and actual handset tests.

**Full regression and deployment evidence / final commit:** to be appended after CI.

## Delivered commit and integrated CI checkpoint

**Gameplay UI source and acceptance committed directly to latest moving `dev` (non-force; no conflicting paths):**
- [`f0858269`](https://github.com/saeedsai/SuperMagicFootball/commit/f0858269cf8cf1419b8b78d25f0d7be21798eda1) — live menus and safe engine-event chronology.
- [`1fdb59af`](https://github.com/saeedsai/SuperMagicFootball/commit/1fdb59afb41a810fc585a89980fbf7a4efe76d78) — six pure Node contract tests.
- [`38287041`](https://github.com/saeedsai/SuperMagicFootball/commit/3828704182db9c7c8c0e6ddbe2f0ea417a8ff0d7) — actual Quick/Versus playable Chromium desktop and simulated-touch tests and screenshots.
- [`931373fc`](https://github.com/saeedsai/SuperMagicFootball/commit/931373fc064cde2f5d0ddcea06d55342e3cc9e5e) — next-milestones plan; documentation format corrected in [`7b9c4b2b`](https://github.com/saeedsai/SuperMagicFootball/commit/7b9c4b2ba0f3573be7e59384d240d1cd3a9038e6).

**Verification:** manually executed six standalone cases using the exact extracted live helper with real escape logic (empty, goal, save, zero-count filtering, hostile skill name, talk) — 6/6 passed with no mutation. In [Modular Game Dev QA #38915344073](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915344073), descendant `34604826`, source/data and test build **SUCCESS**: **171/171 active Node tests**, including all six new test cases; 20/20 merge tests and 10/10 coordination tests also passed. Earlier integrated runs failed unrelated `club26_2` source/runtime metadata consistency and then [memory identity Issue #8](https://github.com/saeedsai/SuperMagicFootball/issues/8). Both were separate-agent scopes; subsequent 171-green QA confirms they no longer block that source.

**Historical full regression:** [run #38915344074](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915344074) on descendant `34604826`, checked to contain the new feature AND Chromium script, was **IN_PROGRESS** when this report was written. Preflight and four Node shards passed; four browser shards remained in progress. Do **not** claim that `match_highlights_browser_qa.py` or the complete 8-shard census passed until jobs finish. Browser screenshot outputs are produced only when its test runs.

**Hosted phone/PC:** [GitHub Pages](https://saeedsai.github.io/SuperMagicFootball/) is publicly linked and had a successful descendant Pages deployment [#38915464957](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915464957). Fresh live desktop + simulated-touch interaction re-run [#38891468528](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) attempt **11**, **IN_PROGRESS** at report time. This generic hosted smoke checks menus, team selection, kickoff and live match, but **not the new Match Events panel specifically**; its explicit device/browser test is in the full census. Physical Android/iOS and offline/PWA reinstallation are not certified.

**Owner handover and remaining gate:** Release `ui-controls` only after saving this exact code/QA report. For follow-up, inspect the complete Chromium shard result and fix a reproducible owned UI/browser-test error under a fresh claim; preserve unrelated engine Issue #7, roster identity changes, graphics and release files.

## Final integrated certification — 201/201 historical scripts PASS

- [**Full Regression Census #38915344074**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915344074) **COMPLETED SUCCESS**, source `34604826aa552e493885c12870cdbf9bc6b662cf`, confirmed descendant of the new UI code/test commits. **All eight shards passed**: four historical Node scripts (33 + 33 + 32 + 32 = **130/130**) and four Chromium scripts (18 + 18 + 18 + 17 = **71/71**), **201/201 total**, zero failing, errored, timed-out or not-run scripts.
- Crucially, Chromium shard 2 executed **`match_highlights_browser_qa.py` PASS in 10.41 s**. This checks actual Quick and two-human Versus matches in desktop and simulated-touch Chromium, real engine `emit` events, rendered Pause/Half-Time/Full-Time panels, zero-count exclusion, escaped edited names, original four action controls, unmodified game score/lineups/plays and no save writes; it captures four actual in-game screenshots in the CI workspace. Node shard 3 **`match_highlights.test.cjs` PASS**, all six feature subtests.
- [**Modular Game Dev QA #38915344073**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915344073) **SUCCESS** on the same integrated source: **171/171 active Node subtests**, 20 Python merge tests and 10 coordination tests, build/data validation.
- [**Pages deployment #38915464957**](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38915464957) **SUCCESS** at descendant `6fe94405` containing the UI feature. [Public game](https://saeedsai.github.io/SuperMagicFootball/) remains available for PC and mobile browsers. [Hosted desktop/touch smoke #38891468528](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38891468528) **attempt 11 succeeded** after deployment, checking HTTP 200, team selection, kickoff and active match. This generic smoke does not test highlights; the real in-game Match Events acceptance above does. Physical mobile devices/Safari/PWA restarts remain unverified.
- **Earlier CI blockers were external to this feature:** concurrent roster source/runtime drift and memory identity [#8](https://github.com/saeedsai/SuperMagicFootball/issues/8) briefly failed active QA before other owners' fixes; subsequent exact-source 201/201 census confirms the integrated project is green. No roster or other chat memory was edited for this feature. No historically referenced QA/art files were deleted.

**Status:** implemented, fully certified on actual desktop and simulated touch; no engine/gameplay state mutation and no persistent save schema change. Release the `ui-controls` claim with this handover. Next chat must reacquire a fresh lock and confirm newest `dev` before any more UI edits.
