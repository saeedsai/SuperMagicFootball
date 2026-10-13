from pathlib import Path
import csv
p=Path(__file__).resolve().parents[1];docs=p/'docs'
road=docs/'NEXT_MILESTONES.md';s=road.read_text()
s=s.replace('| 0.7.1 | Stamina refinement and substitutions | v0.6.2 foundation exists; finish full action-cost model, pre/post-match fitness persistence, AI tactics & substitutions, fitness-driven injuries, visual panting, balance test | PLANNED |',
'''| **0.7.1** | Stamina refinement and substitutions | Action-specific costs + recovery; 3 permanent substitutions/team; halftime CPU swap; 12-player fitness ledger; captain/tactics continuity; post-match career fitness and fatigue-related injury exposure; panting; unit & desktop/mobile QA | **DONE / PARTIAL GAPS** — balance and physical-device tests remain |''')
s=s.replace('## Next action: milestone 0.7.1, after completed 0.7.0', '## Next action: milestone 0.7.2, after completed 0.7.1')
pos=s.find('The v0.7.0 command center uses team-ID keyed plans,')
end=s.find('## Requested player attribute backlog',pos)
assert pos>0 and end>pos
s=s[:pos]+'''v0.7.1 shipped an action-dependent player exertion curve and a **maximum of three substitutions per team per match**, with no re-entry for substituted-off players. Team formation changes involving the same six players remain unlimited at stoppages. Each of the 12 players has a persistent in-match fatigue ledger. CPU teams in solo matches can automatically replace a tired field player at halftime. Speed, shot power, accuracy, pass dispersion, tackle force and goalkeeper coverage react to fatigue; visible panting appears when exhausted. Manager Career now receives a fatigue/participation-based condition report and limited deterministic risk of short injury. This is a **balance prototype**, not medical or licensed competition-rule simulation. See `TEST_REPORT_v071.md` and `FITNESS_AND_SUBSTITUTIONS_SPEC_v071.md`.

**Next bounded release: v0.7.2** — pre-match and halftime morale decisions, characters crying after conceding, different celebrations and funny recovery reactions. Keep true real-world tactical/AI balance, player creator, and special defensive abilities separate to avoid turning a milestone into an untested redesign. Do not conflate v0.7.1 completion with original 1993 game parity.

Known remaining gaps: no formal injuries during an active match; injured career players still need automatic exclusion from prematch lineups, real medical/rest management; substitute entry animations and physical referee stoppages are absent. The national flag SVG work and official crests remain unresolved from v0.7.0.

'''+s[end:]
road.write_text(s)

csvfile=docs/'FEATURE_MATRIX_124_ITEMS.csv';with_rows=list(csv.DictReader(csvfile.open(newline='')))
changes={
'42':('Partial','v0.7.1: all running + sprinting + jump, shot, pass, super and tackle actions spend rated stamina; CPU pressing also affects load; automated tests passed','Add tactical running-load telemetry, balance and dedicated aerial animation costs'),
'43':('Partial','v0.7.1: tired players lose movement, shot power and precision, tackle strength, pass accuracy and keeper reach; career match report affects next-match condition and can flag injuries','Prevent injured career players from starting; add in-match injuries, balancing and physical-device testing'),
'44':('Done','v0.7.1: 12-person fatigue ledger persists across goals, halftime, tactics changes, substitutions and CPU automatic halftime replacements; tests passed','Long-form human gameplay balancing remains'),
'46':('Partial','v0.7.1: six starters from twelve, 3 match substitutions maximum, no reentry, exhausted bench/starter identities preserved, UI displays remaining changes','Injury-enforced starters, match stoppage animation, official substitution windows and career lineup continuity'),
'52':('Partial','v0.7.1: paused/halftime changes include validated nonreversible substitutions and fatigue readouts; formation changes without changing players remain unlimited','Referee-driven substitution stoppages, tactical assistant AI and physical controller QA'),
'91':('Partial','v0.7.1: stamina capacity governs continuous + action costs and recovery; shot, goalkeeper and tackling performance affected; fitness shown in roster/HUD','Human balance pass, advanced move costs, injury restrictions, 60-FPS mobile acceptance')
}
for row in with_rows:
 if row['id'] in changes:row['status'],row['evidence'],row['next_step']=changes[row['id']]
with csvfile.open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=with_rows[0].keys());w.writeheader();w.writerows(with_rows)
assert len(with_rows)==124
(docs/'CHANGELOG_v071.md').write_text('''# Nekketsu Legends HD v0.7.1 Alpha — Stamina and substitutions

Date: 2026-10-13. Incrementally developed from v0.7.0. Original v0.7.0 files were not overwritten.

## Implemented

- **One consistent fitness model:** twelve tracked players per side; ongoing drain affected by individual Stamina stat and sprint/running intensity. Sprint, jump, tackle, slide tackle, ordinary shot, pass and signature super shot have different action costs. Idle players recover gradually. Halftime recovers some energy for both starters and the bench, without resetting the stored fatigue.
- **Gameplay effects:** lower effective sprint/running speed, shot power/accuracy, tackle force, pass accuracy and goalkeeper reach. An overexerted character displays a panting cue. Existing dynamic HUD stamina bar remains.
- **Substitution rules:** maximum 3 *per team per match*, no re-entry after substitution, injury weeks block bench entry, changes only while paused/halftime. Swapping formation/positions without swapping players does not charge a substitution. Invalid changes are refused without updating saved team plans.
- **Solo CPU:** a tired AI field player can be swapped at halftime for an eligible rested bench player. In local 2P Versus, both sides retain human management.
- **Manager career:** played players receive condition changes according to their fatigue and playing time; unused bench players recover slightly. High fatigue/low condition can produce a deterministic low-probability short injury, stored as `injuryWeeks`.
- **Compatibility:** team database remains 216 and all 12-player roster arrays remain intact. No save-schema rewrite, no removal of tactical systems, clubs, local controls or championship modes.

## Explicit outstanding gaps

- A career player's injury is reported and visible but the UI does not yet automatically replace injured starters before kickoff; no in-match injury animation or stoppages. Avoid claiming a complete injury system.
- Injury risk and cost/effort curves require human balance playtesting; no league-specific substitution or substitution-window rules.
- No physical Android/iOS gamepad tests or multi-browser performance measurements. Browser QA is headless Chromium and simulated mobile.
- Exact Famicom original mechanics remain incomplete: morale, crying, funny goals, defense-specific powers and historical roster fidelity.
''')
(docs/'FITNESS_AND_SUBSTITUTIONS_SPEC_v071.md').write_text('''# Fitness, fatigue and substitution specification — v0.7.1

## Model

All ratings and costs are gameplay design parameters, not physiological or medical facts. Player stat `stamina` (1–100) determines capacity. Runtime `fatigue` is 0 (fresh) to 1 (exhausted), stored in `GameEngine.fatigueLedger[side][playerId]` for **all twelve players**, including the bench.

Per second fatigue step (clamped to [0,1]):

`cost = (.0011 + .010 * intensity) * (120 - stamina) / 65`, minus recovery `.00165` when near idle and `.00018` otherwise. Intensity: sprint 1.0; running .45; CPU pressing .69; idle 0. Extra action costs (multiplied by `(120 - stamina)/65`): jump .008, pass .004, ordinary shot .012, tackle .019, slide tackle .029, super shot .045. Halftime deducts .13 fatigue; bench fatigue is remembered. Existing `endurance` slows player speed as fatigue rises.

The shoot, pass, strength and keeper effects use preexisting independent numeric attributes with additional fatigue adjustments in v0.7.1. The game has **five CPU difficulty levels** unaffected by the stamina update.

## Substitutions

3 maximum per team (arcade rule), only when the match is paused or halftime, no return of a substituted-off player. Tactical repositioning of the same six on-field players is free. A player with `injuryWeeks > 0` cannot be *brought on* from bench in this release. A queued CPU replacement at halftime selects the highest-net-benefit rested field player; no coach AI while the match is running. There is no official substitution window limit or stoppage replay.

## Career integration

After a played career fixture `recordMatchFitness(career,game.getFitnessReport(0))` updates individual condition with fatigue/seconds of match. Unused bench players recover +2 condition. Low-condition/high-fatigue participants can receive 1–2 match-weeks of injury (deterministic seed per player/season/week). Existing career weekly condition modifier still applies after result registration. No real-world medical inference.

## Acceptance evidence

`tests/fitness_substitutions.mjs` (action costs, stamina and speed, 3-sub cap, no reentry, halftime, CPU, career), `tests/fitness_browser_qa.py` (desktop and mobile simulated screens), and entire earlier suites. Offline bundle compiled by `tests/build.py`. See `TEST_REPORT_v071.md`.
''')
(docs/'TEST_REPORT_v071.md').write_text('''# Test report — v0.7.1 Alpha

**Date:** 2026-10-13. **Platform tested:** Node.js 22 + headless Chromium desktop and simulated mobile 844×390. **Baseline:** v0.7.0 Alpha.

## Results

1. `npm test` **PASS** — prior identity/tactics, home/away uniforms, speed/agility, simulation, career, all six continental cup simulations (151 entries), all 5 AI difficulty profiles and 216×12 stat assertions. New `fitness_substitutions.mjs` **PASS** for action costs, fatigue/halftime/kickoff, 3-sub limits, rejected substitutions, no re-entry, CPU replacement and career match condition.
2. `npm run qa` **PASS** — desktop and simulated mobile tactical management, teams and menus, original browser QA, and new fatigue/substitution screen: UI shows FIT + remaining substitution count, uses a bench substitute, preserves pause and no page errors.
3. `npm run build` **PASS** — modular source compiled into a self-contained `play.html`, requiring no ROM/emulator. JavaScript syntax and browser initialization checked.
4. Captured screen evidence: `tests/fitness_substitutions_desktop.png` and `tests/fitness_substitutions_mobile.png`.

## Limitations and unfinished verification

- Browser storage was mocked in standard UI regressions. A separately attempted real local HTTP host test could not connect because this execution environment blocks the loopback server; **cross-reload localStorage persistence is not newly verified**. The older save UI regression covers a mocked roundtrip only.
- No tests on real Android/iOS hardware, USB/Bluetooth gamepads, WebKit/Safari or Firefox; no formal performance/60 FPS checks.
- The more complex career roster lifecycle still needs in-game injury/starting-lineup restrictions; injuries currently affect metadata/condition, not live match availability at kickoff.
- Professional balance, authentic Famicom timing, and physical controller UX need human play sessions.

## Known risks

Players may tire too fast or recover too slowly in longer matches; the action-cost formula requires real-play tuning. Three substitutions is this game's arcade rule, not an assertion of current IFAB limits. Match fitness across completed fixtures is implemented for Manager Career, not World League or other exhibition modes.
''')
(docs/'MASTER_DEVELOPMENT_PLAN.md').write_text((docs/'MASTER_DEVELOPMENT_PLAN.md').read_text()+'''\n\n## v0.7.1 implementation update — 2026-10-13\nCompleted bounded stamina and substitution milestone. Full change log in `CHANGELOG_v071.md`, model in `FITNESS_AND_SUBSTITUTIONS_SPEC_v071.md`, test evidence in `TEST_REPORT_v071.md`. Next is v0.7.2 emotional reactions and morale/team talks; do not start full player creator and online systems in same step.\n''')
(docs/'AUDIT_AND_MASTER_PLAN_UPDATED.md').write_text((docs/'AUDIT_AND_MASTER_PLAN_UPDATED.md').read_text()+'''\n\n## Audit delta: v0.7.1 (13 October 2026)\nSince the v0.6 historical audit, the updated 124-item tracker records v0.7 command center and v0.7.1 fatigue/substitution work. Players now have a 12-person fatigue ledger, action-rated exertion, partial halftime recovery, three-substitution limit/no reentry, CPU halftime replacements and manager condition updates. **Still incomplete:** injury enforcement on starting lineups, complete licensed teams/portraits, the original Nintendo morale/gifts/crying mechanics, exact defensive abilities and online multiplayer. See specific changelog/test report and keep strict acceptance statuses for partially completed systems.\n''')
(p/'README.md').write_text('''# Nekketsu Legends HD v0.7.1 Alpha — Fitness and Substitutions\n\nAn independent editable HTML5 soccer game, **not an NES emulator**. Game development is ongoing; original Nintendo play parity, professional-grade portraits, official rosters and online multiplayer are not complete.\n\n## This bounded release\n\n- Action-dependent stamina, movement fatigue, partial halftime rest, persistent per-player exhaustion for all twelve roster members; sweat/panting, speed/skill penalties.\n- Three substitutions maximum per side, irreversible bench changes during pauses and halftime, CPU automatic halftime replacement when a player is much more fatigued.\n- Manager-career post-match condition progression based on individual match exertion, with limited low-probability short injury metadata. Injured starter exclusion is not complete.\n- Updated `docs/NEXT_MILESTONES.md`, 124-item tracker, changelog, model specification, and test report.\n\n## Usage\n\nOpen `play.html` offline, or host `index.html` from the project folder. Before a match use **HOME TACTICS**; mid-match use **Pause → HOME TACTICS**, replacing up to three starters with available bench players. Stamina shows during matches and each player's fitness appears in the command-center roster.\n\n`npm test`: JavaScript game/regression tests. `npm run qa`: headless Chromium desktop/simulated-mobile controls and UI regression tests. `npm run build`: rebuild portable HTML from editable source. Some test scripts use the local Python Playwright package and the Chromium executable.\n\nNext milestone: **v0.7.2 — player morale and distinctive humorous reactions**. The larger 20-face/20-hair full creator, special defending and goalkeeping powers, and server-based multiplayer remain separately staged.\n''')
print('Updated docs and 124-row feature tracker')
