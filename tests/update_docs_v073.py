from pathlib import Path
import csv,datetime,re
r=Path(__file__).resolve().parents[1]
d=r/'docs'
# 126 baseline entries remain: this milestone implements previously tracked requests, not 6 new ones.
p=d/'FEATURE_MATRIX_126_ITEMS.csv'
with p.open(newline='',encoding='utf-8') as f:
 rows=list(csv.DictReader(f));fields=list(rows[0])
updates={
 17:('Partial','v0.7.3: five selectable scripted celebration captions/movement rhythms linked to scoring; confetti and cheering effects','Character-specific combo/teammate comedy animations and real illustrated cutscenes are unfinished'),
 18:('Partial','v0.7.3: conceding field players enter cry state with animated facial tears and body shaking for goal sequence','More expressive personality-dependent crying, goalkeeper and bench cutscenes remain'),
 29:('Partial','Existing stun/hurt timing plus v0.7.3 comic stun sparkle effects','Character-specific recovery and knockback animation/audio still required'),
 54:('Partial','v0.7.3: all players assigned a reproducible four-style personality for team talks','Manual-verified original Japanese traits/preferences and detailed personality behavior missing'),
 55:('Partial','v0.7.3: 0–100 morale ledger persists through goals and substitutions; affects speed, shot strength/precision and tackle outcomes','Not the exact historic 0–15 mood model; deeper AI/teamwork and morale carryover to league/career missing'),
 56:('Partial','v0.7.3: pregame team talk choice with personality-specific good/backfire effects','Private one-on-one conversations and original scripted dialogues/items missing'),
 59:('Partial','v0.7.3: pregame team talks and once-per-side halftime pep talks with personality reactions and status','Halftime talk character cutscenes, full individual dialogue and manager interaction depth missing'),
}
for row in rows:
 try:i=int(row['id'])
 except:continue
 if i in updates:
  a,b,c=updates[i];row['status']=a;row['evidence']=b;row['next_step']=c
with p.open('w',newline='',encoding='utf-8') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
assert len(rows)==126, len(rows)
road=d/'NEXT_MILESTONES.md';s=road.read_text()
s=s.replace('| 0.7.3 | Original-style emotion/morale | Scored-on crying, stunned expressions, variable funny celebrations; pre-match/halftime speeches with good/bad outcomes | PLANNED |', '| **0.7.3** | Morale and comic goal reactions | Personality-sensitive speeches, 0–100 match morale affecting physics; crying reactions, several celebration variants; dedicated Node + browser QA | **DONE / PARTIAL GAPS** — gifts and manual-original mood parity missing |')
s=s.replace('## Next action: milestone 0.7.3, after completed 0.7.2','## Next action: v0.8.0 — first goalkeeper/defensive special abilities')
s=s.replace('**Next bounded release: v0.7.3** — pre-match and halftime morale decisions, characters crying after conceding, different celebrations and funny recovery reactions. Keep true real-world tactical/AI balance, player creator, and special defensive abilities separate to avoid turning a milestone into an untested redesign.', '**v0.7.3 DONE (bounded scope):** Pre-match/halftime team talk choices, player-specific deterministic personality reactions (including backfires), 0–100 match morale influencing running, shooting and tackle contests, animated tears and comic stun sparkle, five celebration captions/motion variants. Goal and substitution persistence tested; no claim of exact 1993 0–15 mood, gifts, phone calls, or fully bespoke cutscenes. **Next bounded milestone: v0.8.0 — first character-specific defensive and goalkeeper super abilities**, implemented with engine mechanics, visuals and exhaustive regressions before any further moves.')
s=s.replace('**Now next: v0.7.3 morale and funny reactions.** Keep each feature batch bounded, run `npm test`, `npm run qa`, and `python tests/fullscreen_brand_qa.py` after every release.', '**v0.7.3 morale and funny reactions: implemented and regression-tested.** Next: v0.8.0 targeted defensive/GK super abilities; keep remaining original Nintendo parity tasks and player creator separate. Tests `npm test`, browser desktop/mobile suites and fullscreen regression continue every release.')
road.write_text(s)
# add concise current state at top
add='''## Release checkpoint: v0.7.3 (13 October 2026)

- Team morale ledger now covers all active and bench players; personality styles are deterministic identity hashes (not verified original historical personality data).
- Menu offers five pregame choices per side; halftime allows one talk per controlled side. One player's morale may rise while another's falls from the same speech.
- Morale modifies speed, shooting velocity/error and tackle contest. Goals raise scorer morale and reduce conceding morale; visual crying/celebration states trigger.
- Existing 216 teams, 12 players each, continental campaigns, manager saves and phone fullscreen are retained; browser tests and Node regression suite pass.
- **Not completed:** original-character-specific gifts, calls to Misako, original 0–15 mood scale/choices, lengthy reaction cutscenes, halftime morale carryover to subsequent career matches, physical-device QA.

'''
road.write_text(road.read_text().replace('## Delivery principles',add+'## Delivery principles',1))
(d/'CHANGELOG_v073.md').write_text('''# Supermagic Football — v0.7.3 changelog (13 October 2026)

## Scope of this single milestone

1. New independent `src/morale.js`: five manager talk options, four stable personality reactions, reproducible positive and backfire results, bounded mood updates, and gameplay scaling.
2. Match engine: per-player 0–100 morale, stored across on-field/bench changes; goals affect both teams; morale changes speed, shooting and physical clashes. Pregame/halftime talks may occur once per team per phase.
3. Pre-match setup choices, halftime decision controls, talk-result feedback and live HUD morale descriptions.
4. HD renderer: conceding players shake and cry visibly, hit players show sparkles, and scoring teams use five varied celebratory motions/captions; goal banners take priority over temporary status toast messages.
5. Offline single-file build, modular PWA dependency list and cache version updated; old browser save prefixes and legacy imports unchanged. Saves exported from this release carry version 0.7.3.
6. Bounded milestone documentation, 126-item feature tracker and dedicated Node+Chromium desktop/mobile QA added.

## Deliberately deferred

- Gift favorites/dislikes, telephone calls, one-to-one character dialogues and exact original Nintendo mood values remain **missing**.
- Signature animations for each of 2,592 players and more involved manager interactions remain **unfinished**.
- 100-point morale is a new mechanic inspired by the original; it is **not** a reproduction of the authentic 0–15 mood logic.
- Player creator, real-world roster replacement, rare goalkeeper defensive moves and network play remain in subsequent milestones.
''')
(d/'MORALE_SPEC_v073.md').write_text('''# Match Morale & Comedy — v0.7.3 design spec

## Data model

- `GameEngine.moraleLedger[team][playerId]`: 0–100 numeric, defaults to 55; includes 12 players per team.
- `GameEngine.talksUsed[team].pregame / halftime`: once per team/period, reset only by a new match.
- `personalityOf(src)`: stable hash derived from player ID/name: sensitive, bold, playful, disciplined. This is procedural fiction, **not** a verified original player-profile archive.
- `player.morale` mirrors ledger for the active six. After substitutions, kickoff and bench swaps, the ledger restores emotional state.
- `reactToTalk`: matching personality choice +13, strongly disliked choice -10, other choices +2/+4/+5. Halftime deltas scaled to 75% and rounded; results bounded 0–100. No reroll exploit.
- `goalMorale`: scorer +11, conceder -13; applies to active and bench; resets only when a new match starts.

## Gameplay effects

`moraleFactor(M) = 0.82 + 0.003*M`, for M in [0,100], multiplier 0.82–1.12.

- Running top speed multiplies by `moraleFactor` in addition to fatigue/terrain/Speed.
- Normal and transforming shooting velocity multiply by morale. Aiming spread divides by morale.
- Knockdown contest attacker chance scales by `moraleFactor(attacker) / moraleFactor(defender)`, bounded 0.96.
- Morale changes do not override fatigue and do not make a team immune to knockdowns.

## Match user experience

Before kick-off choose: no talk, encouragement, challenge, joke, focus. Each player reacts according to personality, sometimes negatively. At halftime choose another talk before resuming. During a goal sequence the losing team visibly cries for 3.3 seconds and the scoring team performs a varied celebration. Character-specific jokes/animation sheets remain future work.

## Known differences from the Nintendo original

The original has character-specific dialogues, gifts, phone calls and a historic mood system. v0.7.3 only delivers a new data-driven foundation and light comedy, not full mechanics parity. Versioned sources and tests are authoritative on delivered scope.
''')
(d/'TEST_REPORT_v073.md').write_text('''# v0.7.3 validation report — 13 October 2026

## Automated gameplay suite — PASS

Run `npm test`: 9 individual Node tests passed: tactical plans/identities, home/away kits, simulation shots+goals+PK, manager career, all 151 continental competition entries, five AI difficulties, 2,592 player stats, fatigue/substitution restrictions, new morale goal/reaction tests.

Morale tests: stable personality outcomes, positive/negative talk reactions in the same team, no repeat talks, persistence over a goal kickoff, speed response to high/low morale, physical scoring changing both sides, losing player crying state, five defined celebration styles, legality of halftime talk phase.

## Browser regression — PASS on Chromium desktop and emulated mobile

- `tactics_browser_qa.py`: desktop/mobile PASS.
- `kits_browser_qa.py`: desktop/mobile PASS.
- `v060_qa.py`: desktop/mobile PASS.
- `manager_v060.py`: desktop/mobile PASS.
- `save_filter_v060.py`: desktop/mobile PASS (new export version and save compatibility).
- `ai_browser_qa.py`: desktop/mobile PASS.
- `stats_browser_qa.py`: desktop/mobile PASS.
- `fitness_browser_qa.py`: desktop/mobile PASS (rerun separately due initial combined timeout).
- `morale_browser_qa.py`: desktop/mobile PASS (pregame talk, halftime talk, duplicate guard, goal/cry renderer).
- `fullscreen_brand_qa.py`: desktop and simulated Android landscape PASS; unsupported fullscreen fallback and old save imports PASS.

## Validation boundaries / honest limitations

These tests are automated smoke and game-logic regressions, **not exhaustive coverage of all 126 historical requests**. An existing feature marked Partial or Missing remains incomplete even if its applicable regression passes. Physical Android/iOS devices and Bluetooth controllers have not been tested. Browser persistence across actual app updates still requires extended integration testing. We have not profiled 60fps across target GPUs and have not achieved original 1993 NES game-mechanics fidelity.
''')
# Keep an audit addendum but do not rewrite historical baseline evidence.
audit=d/'AUDIT_AND_MASTER_PLAN_UPDATED.md'
audit.write_text(audit.read_text()+'''\n\n## v0.7.3 addendum (13 October 2026) — later development, not part of original v0.6 audit\n\nThis historical document describes the read-only v0.6 audit. v0.7.3 now adds 0–100 procedural personality/morale, pre-match and halftime talks, movement/shooting/tackle morale influence, conceder crying, comic hit sparkles and celebration variations. Corresponding feature tracker rows 17, 18, 29, 54, 55, 56 and 59 are now Partial, not complete; original 0–15 moods, Misako calls, gifts, authentic specific roster personalities, character cutscenes and 4-player original mode remain unresolved. See `CHANGELOG_v073.md`, `MORALE_SPEC_v073.md` and `TEST_REPORT_v073.md`.\n''')
(r/'README.md').write_text('''# Supermagic Football — v0.7.3 Alpha

Independent high-definition HTML5 arcade football, not an emulator. 216 selectable teams (12 players each), club/national modes, continental tournaments, a preliminary manager career, full keyboard/touch/gamepad APIs and a landscape fullscreen option.

## This incremental release: Team morale and comic reactions

- Pre-match manager team talks: encouragement, challenge, joke, focus, or no talk. Players have stable personalities, so one talk may help some and upset others.
- Half-time motivational talk once per controlled team, with visible results.
- Each player's 0–100 morale affects match running speed, shooting accuracy/velocity and tackling. Scoring, conceding, substitutions and kickoffs affect/preserve morale.
- Losing players cry after a goal; winners use five varied celebration styles; knocked-down players display comic stars.
- This is **not** authentic original 0–15 mood parity, and individual gifts, phone calls, and exact original cutscene logic remain unimplemented.

## Play, deploy and test

For a single-file offline desktop launch open `play.html`. For Android/iPhone and PWA deployment, serve the **whole folder** (HTTPS or `python -m http.server 8080`) and open `index.html`; on Android use FULLSCREEN / rotate to landscape; on iPhone use Safari → Share → Add to Home Screen if standard fullscreen is unavailable. Physical-device support is not yet certified.

Edit `src/*.js`, styles in `style.css`, source HTML in `index.html`. Run `npm run build` to regenerate the portable HTML; `npm test` for Node simulations; `npm run qa` for desktop/mobile Chromium UI tests, plus `python tests/fullscreen_brand_qa.py`. Existing `legend_*` local storage and old save imports are deliberately preserved.

Latest documents: `docs/NEXT_MILESTONES.md`, `docs/FEATURE_MATRIX_126_ITEMS.csv`, `docs/CHANGELOG_v073.md`, `docs/MORALE_SPEC_v073.md`, `docs/TEST_REPORT_v073.md`.

Next bounded milestone: v0.8.0 **rare defensive and goalkeeper super abilities**. Do not interpret a passing smoke test as parity for the still-incomplete Nintendo mechanics.
''')
print('docs updated',len(rows),'tracked requirements')
