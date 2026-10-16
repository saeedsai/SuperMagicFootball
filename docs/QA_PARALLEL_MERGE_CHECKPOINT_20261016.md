# Supermagic Football — parallel merge safety checkpoint QA

**Date:** 2026-10-16
**Production runtime:** unchanged from the earlier modular game release.
**Code/test commit on dev:** [`e5f3b3bd3870aca8f776127e02320b3a09b4a461`](https://github.com/saeedsai/SuperMagicFootball/commit/e5f3b3bd3870aca8f776127e02320b3a09b4a461)
**Base:** `1587ab3ad0eac107a0acc881a7e46fae3b873415`.
No force push or roster/physics/graphics write.

## Delivered

1. A three-way `data/teams.json` merge now rejects changes to a team's numeric `index` even if its string `id` and roster order are stable. Identical invalid edits from both agent branches are also rejected, protecting indexed UI and save references.
2. Every merge CLI report includes `changeSummary` with `ours`, `theirs` and `merged` field-change counts, up to 25 stable-ID-scoped example paths, and `truncated` for omitted paths. `--check` does not write merged data.
3. Three new Python regression tests cover same-index protection, disjoint preview output, and 25-path truncation. The existing CLI-output test now checks `changeSummary`.
4. Merge guidance, active status, five-iteration plan, README and active/historical inventory are synchronized. No inherited tests or concurrent agent data were deleted.

## Exact-commit automated QA results

| Check | GitHub Actions evidence | Outcome |
|---|---|---|
| Python merge tests | [Modular Game Dev QA 38874249374](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38874249374) | 14/14 pass, zero fail |
| Active Node test suite | Same Modular QA and [Full Regression preflight](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38874249591) | 53/53 pass, zero fail |
| Immutable roster/history and JSON contracts | Same Modular QA | Pass: 165 clubs, 1,980 slots, 207 recorded replacements in five batches |
| Full regression, Node scripts | [Full Regression Census 38874249591](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38874249591) | 91/91 pass (23 + 23 + 23 + 22) |
| Full regression, Chromium scripts | Same Full Regression Census | 49/49 pass (13 + 12 + 12 + 12) |
| Total full regression | Same Full Regression Census | **140/140 PASS**, zero fail/error/timeout/not-run |
| GitHub Pages deployment | [Pages 38874248930](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38874248930) | Success for `e5f3b3b` |
| Actual hosted desktop and touch-emulated match boot | [Verify Deployed PC and Touch Game rerun 38862708843](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38862708843) | Success after new Pages deployment; both HTTP 200, menu navigation, team selection, kickoff and match active |

The live smoke job was rerun after deployment. It uses the existing workflow script checkout on an **earlier code commit** while opening the **current public Pages URL**. Its recorded 224 loaded runtime teams include the app's additional runtime-created entry; the static `data/teams.json` remains 223. Neither observation indicates a roster rewrite. This is robust current-site interaction evidence but is not device-by-device certification.

**Playable link:** https://saeedsai.github.io/SuperMagicFootball/

## Remaining gaps, constraints and next five iterations

- No user-facing gameplay animation was introduced by this small **tooling** checkpoint. Subsequent animation and eight-direction player art are still planned.
- Merge previews cannot prove real-world player names, club registration, FC27 ratings, photos/likeness, source provenance or agent authorship. Editor-specific provenance review and appearance preset validation are outstanding.
- Do not classify source-backed editorial ratings as official EA FC27 scores.
- Physical iOS/Android, device FPS/PWA/offline and exhaustive browser-restart/save migration checks remain owner-deferred; hosted Chromium with simulated touch is not physical-phone proof.
- v0.8.25.35: keeper/pass/first-touch animation polishing and browser/visual acceptance.
- v0.8.25.36: source-aware parallel editor dry-run review and graphics reference checks; the simple diff preview is already delivered.
- v0.8.25.37: safe substitution feedback, squad/career and tactics improvements.
- v0.8.25.38: named-player likeness/appearance overlap visual QA.
- v0.8.25.39: remaining configurable collision, goalkeeper and ball/shot parameters with default parity.

The major development priority is bounded, independently testable changes using the latest GitHub dev SHA, followed by exact-commit regression and live deployment checks.
