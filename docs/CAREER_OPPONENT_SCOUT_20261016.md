# Manager Career — next-opponent tactical scouting

**Date:** 16 October 2026  
**Feature / lock:** `UI-CAREER-OPPONENT-SCOUT` / `ui-controls`  
**Owner:** `gameplay-review-20261016-gpt6-career-scout-r5`  
**Entry:** `src/modules/ui.js` → `careerOpponentScoutPanel(c,fx)` in the live Manager screen

## Implemented game feature

Before the next playable Manager Career fixture, the manager sees a **read-only opponent scout panel**:

- The opponent's **projected six** comes from existing `planFor(opponent).lineup` and current roster, without adding or changing players.
- Separate game **positional OVR** averages for their FW attack, DF defence and goalkeeper; the highest-rated outfield starter is named. This is an in-game tactical estimate, **not** an official FC27 rating claim or precomputed probability of winning.
- For league fixtures, the existing persisted league table provides played/W-D-L; for cups or unplayed league opponents it honestly reports no recorded league results.
- A deterministic, bounded text recommendation: Deep Block/Possession versus stronger attack, Direct/High Press versus stronger defence, otherwise consider Possession.
- Your actual Manager Career roster's sub-60%-fitness or injured count appears as a pre-kickoff readiness warning.
- Advice is passive and safely escaped. **No** automatic plan edits, substitutions, roster transfers, money spent, save writes, randomness or new button/input surface; career match kickoff and twelve-player squad UI remain intact.

The scope also fixes an obsolete help statement: **normal-match** goalkeepers defend automatically; in **two-human shootouts** the defending player may steer and use the existing Jump to dive, without a fifth action.

## Files and tests

| Artifact | Description |
|---|---|
| `src/modules/ui.js` | Isolated pure scout renderer and existing career fixture embedding; updated goalkeeper control help copy |
| `tests/career_opponent_scout.test.cjs` | Six real-helper Node cases: absent fixtures, positional OVR/record, attacker-vs-defender advice, injury/fitness, HTML injection escaping, no save writes or broken About revision |
| `tests/career_opponent_scout_browser_qa.py` | Actual modular Manager Career creation + existing 12-player squad and next-match kickoff on desktop and simulated touch; report read-only, persisted state unchanged |
| `docs/NEXT_MILESTONES.md` | Bounded milestone + next five iterations |
| `docs/memory/agents/gameplay-review-20261016.md` | This chat's cleaned, current checkpoint |

## Regression acceptance and evidence

- [Feature commit `55810795`](https://github.com/saeedsai/SuperMagicFootball/commit/55810795b550f505bf16c1a3fe9be24406921a93).
- [Node test commit `0b9629a1`](https://github.com/saeedsai/SuperMagicFootball/commit/0b9629a1c398d672d24c594b6d72bd41ce4006af): [Modular Game Dev QA #38959871883](https://github.com/saeedsai/SuperMagicFootball/actions/runs/38959871883) **SUCCESS, 221/221 Node contracts PASS**, including the six new scout cases and About versioning.
- [Browser test commit `8f8f3b6c`](https://github.com/saeedsai/SuperMagicFootball/commit/8f8f3b6c29b2d5d4e7572b1ee05347495cec4612). Exact-source desktop and simulated-touch Chromium acceptance must be verified from the full census logs; mere code presence does not count as a pass.
- [Help text correction `d33410af`](https://github.com/saeedsai/SuperMagicFootball/commit/d33410af8306f493cfe72f04a244b18be16e702e).
- Per-commit revision is supplied by the preexisting live GitHub `dev` SHA lookup in About; this batch intentionally does not bump the bundle SemVer or modify `sw.js`. See `docs/VERSIONING_POLICY.md`.

Suggested local tests:

```sh
node --test tests/career_opponent_scout.test.cjs tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs
node --test tests/*.test.cjs
python3 scripts/build.py
python3 tests/career_opponent_scout_browser_qa.py
# CI: complete 4 Node + 4 Chromium regression shards on integrated dev SHA
```

**Mobile scope:** Simulated-touch Chromium is not a real Android/iOS handset; real device touch/PWA/offline and shared-touch two-player play remain separate requirements. GitHub Pages build success proves publication, not the fixture feature's input acceptance.

**Cleanup:** no archived QA history, provenance files, graphics assets, templates or unrelated directories deleted; no uniquely identified safe stale tracked file in this batch.

## Next five small iterations

1. Certify the new desktop/simulated-touch Manager scouting browser cohort, 4+4 full census and exact hosted Pages checkout.
2. Measure in-match first-touch control balance once the engine owner finishes, then add any necessary shot/pass fairness regression.
3. Expand career tactical readiness into safe reserve availability and captain advice without changing saves or automatic lineups.
4. Add proven direction-consistent keeper grip/release and first-touch animation under a fresh graphics claim.
5. Complete original arcade mechanic parity, Android touch gesture/physical handset testing and offline PWA upgrades under their own ownership.
