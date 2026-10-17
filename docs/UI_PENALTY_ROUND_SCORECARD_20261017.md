# Live penalty round scorecard — UI-PK-LIVE-ROUND-SCORECARD

**Date:** 17 October 2026. **Exclusive lock:** `ui-controls`. **Owner:** `gameplay-pk-scorecard-20261017-gpt6-s17`.
**Base:** live `dev` `f9c47bb9f21f8f65fc0bb7e143c1fb01ff3e1b16`.

## New playable feature and bug fix

The PAUSED menu of a real penalty shootout now displays a compact, accessible **PENALTY SHOOTOUT** scorecard from the *engine-authoritative* `game.pk.kicks[0/1]` booleans:
- Home and away goal totals and number of attempts, completed-kick goal (●) and stopped/missed (○) markers, and the next shooter (or the current shooter if the ball is mid-flight).
- Final regular Quick/Versus penalty outcome shows each side's completed kick history, exact penalty tally and the winner from `finished.winner`. The match result's subtitle now correctly says VICTORY/DEFEAT **ON PENALTIES** even when regulation ended level, rather than the former misleading **DRAW MATCH ON PENALTIES**.
- All long sudden-death totals include every completed kick, while the visual history shows only the latest 12 attempts per side with an earlier-count label. The region is labelled and politely announced for assistive technology.
- Ordinary match pauses and full-time results never show a penalty scorecard. A malformed `pk.kicks` payload is ignored; non-boolean results cannot fabricate goals. The helper does not write to match state, player identities, rosters, input, saves or localStorage.

**Scope boundary:** `src/modules/ui.js` isolated `penaltyRoundScorecard()` helper, Pause and ordinary Full-Time integrations only; new dedicated `tests/penalty_round_scorecard.test.cjs` and `tests/penalty_round_scorecard_browser_qa.py`, this report and **this chat's own** memory file. No engine, GK dive behavior, AI, input mapping, shot chances, graphics, local squad composition, CI workflows, remote backend, stadium rendering or stored progress modified. The existing four actions remain unchanged. Career/continental results use different existing dedicated UI branches and are not changed.

## Commits and acceptance

- [UI scorecard and accurate result heading](https://github.com/saeedsai/SuperMagicFootball/commit/aca62bf67707f98a1ab7e9ce264553873c77f356) (`aca62bf6`).
- [Eight new pure Node scorecard unit/contract tests](https://github.com/saeedsai/SuperMagicFootball/commit/b0d6436fdc25253bec1ea2350d36e811ab4e2cc7) (`b0d6436f`).
- [Corrected the displayed-vs-overall sudden-death test count](https://github.com/saeedsai/SuperMagicFootball/commit/d5a3d4155899654d6cbce0c0b60fecdf4a21d680) (`d5a3d415`).
- [Real Quick Match Chromium acceptance on desktop and simulated touch](https://github.com/saeedsai/SuperMagicFootball/commit/44545a0ed00a1e44a920d463b97f89c18f9bdaab) (`44545a0e`).
- [Accessible live-region follow-up](https://github.com/saeedsai/SuperMagicFootball/commit/7549aeca8393e966e0b5c115e3e9dcdc83285417) (`7549aeca`), same feature with the new browser test already present.

### Test strategy

```sh
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/penalty_round_scorecard.test.cjs
node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs
node --test tests/*.test.cjs
python3 tests/penalty_round_scorecard_browser_qa.py
# The existing CI full census runs 4 Node + 4 real Chromium shards after src/modules/ui.js changes.
```

The Node tests execute the *actual* extracted UI helper, verifying the read-only contract, score and kick markers, valid 5-kick/sudden-death results, malformed data, capped history, side labels and final event winner. The browser acceptance first starts the production **Quick Match**, asserts a normal game pause has no penalty scorecard, enters the engine's real shootout, verifies intermediate round markers in the PAUSED screen, resumes, settles a genuine sixth-pair sudden-death kick through `updatePK`, and checks the Full-Time heading, penalty winner, intact tied regulation score, original team/player IDs and four touch actions on **both desktop and simulated-touch Chromium**. It stubs no engine physics and does not invent a final screen.

**Accepted Node QA at first source containing browser script:** [Modular Game Dev QA #39025352960](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025352960) **SUCCESS**, 250/250 active Node tests including all eight new ones, 20/20 Python merge and 10/10 claim protocol cases, full club roster history and fixture compilation.

**Final feature-containing census trigger:** [Full Regression Census #39025423889](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39025423889) on `7549aeca8393e966e0b5c115e3e9dcdc83285417` was **queued/pending when the handover was written**. Do not infer any 4×Node/4×Chromium PASS or deployed end-to-end success before examining exact logs. Similarly verify the new `penalty_round_scorecard_browser_qa.py` itself rather than relying on prior desktop smoke.

**About revision:** The Credits/About screen already fetches the latest online GitHub `dev` SHA on each view as a per-commit identifier, separate from the game bundle version. The workflow does not bump stable semantic version for documentation-only commits. Public deployment URL is https://saeedsai.github.io/SuperMagicFootball/ . Direct retrieval from web browsing was unavailable; Pages workflow and hosted desktop/touch browser CI must be checked separately. No actual Android/iOS hardware tested.

## Remaining requirements and next five iterations

1. **P0:** verify the exact `#39025423889` 8-shard Node/Chromium census; resolve any browser setup bug in the dedicated scorecard test before calling it green.
2. **P0:** verify production GitHub Pages build and live desktop/touch Quick Match + in-shootout scorecard interaction once a descendant deployment completes; check About fetched `dev` SHA independently of deployed bundle.
3. **P1:** under engine owner's release, review CPU halftime tactical response, pressure-first-touch balance and two-human PK goalkeeper controls across 30/60/120fps, with seeded tests.
4. **P1:** reproduce Android rainbow-dribble missing event (#3) with reliable pointer-down/up/cancel timing and real game browser telemetry; improve gameplay only with an exclusive engine/input claim.
5. **P1:** separately owned keeper/pass animation and Career coaching updates; finish offline/PWA cache refresh, physical Android/iPhone save/gesture/audio and classic-mode/multiplayer planning.

**Cleanup:** no historical QA, character illustration, sourced roster, archive or template file was proven redundant. No tracked file removed; this batch introduced only two focused tests and one specialist handover. Release the `ui-controls` claim with exact CI evidence when the bounded work is checked.
