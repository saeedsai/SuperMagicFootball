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
