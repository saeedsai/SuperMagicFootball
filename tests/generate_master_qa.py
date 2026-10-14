#!/usr/bin/env python3
"""Deterministic complete requirements QA catalog (does not claim execution).
Every one of 218 historical + active backlog requirements receives a durable test ID.
Additional safety-critical scenarios are explicitly enumerated and executable tests are indexed.
"""
from pathlib import Path
import csv,json,collections,re
ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs'
OUT=DOC/'MASTER_QA_TEST_CASES_v08221.csv'
HEADERS=['test_id','requirement_id','area','requirement','requirement_status','priority','test_type','automation_status','preconditions','steps','expected_result','related_automated_scripts','execution_status','notes']

def area_plan(area,feature):
 a=area.lower(); f=feature.lower()
 if any(k in a for k in ['controls','input']):
  return ('Game running on desktop keyboard and touch; player possession and non-possession scenarios available',
   '1. Open controls and map all four buttons. 2. Set up the possession/action scenario described in the requirement. 3. Tap, hold, release and overlap the relevant buttons in both orders. 4. Repeat at 60 FPS, throttled frames, and touch.',
   f'Exactly the requested behavior occurs for: {feature}; no duplicate actions, stuck buttons, unintended jump, fifth action button or order ambiguity.')
 if any(k in a for k in ['graphics','character','creator','art','interface','kits','team identity']):
  return ('Home menu, player/team preview, match and mobile-size viewport available',
   '1. Open the screen where this feature is visible. 2. Select at least three distinct player/team examples. 3. Check the preview and match renderer. 4. Resize to phone landscape and check keyboard/touch readability.',
   f'Visual/UI requirement is met: {feature}. No overlaps, blank images, incorrect labels, lost settings or unreadable touch targets.')
 if any(k in a for k in ['career','management','roster','player attributes','bpw','content','national','data architecture']):
  return ('Fresh game profile; deterministic roster fixture and saved profile; verified data fixture where relevant',
   '1. Locate the relevant squad/player or Career screen. 2. Exercise setup, edit, save, reload, and team selection. 3. Validate roster/attribute constraints and provenance. 4. Replay after save import.',
   f'{feature} behaves as specified, retains player identity and valid 12-player squads, respects position and saved-data compatibility where applicable.')
 if any(k in a for k in ['goalkeeper','abilities','defense','super','penalt','ai','game balance']):
  return ('Seeded match with controlled players and ball vectors; mirrored home/away goal setup',
   '1. Construct representative ordinary, borderline and elite stat cases. 2. Activate or provoke the named action. 3. Repeat both attacking directions. 4. Assert output, cooldown, counterplay and no invincibility.',
   f'{feature} works for both teams with deterministic outcomes under controlled seeds, and no impossible saves, exploits or broken standard controls.')
 if any(k in a for k in ['mode','network','foundation','quality','release practice']):
  return ('Clean profile, packaged offline HTML, local server and supported desktop/mobile browsers',
   '1. Run the mode/feature end-to-end from menus. 2. Exercise its primary positive and failure paths. 3. Test persistence, offline behavior and a second device/browser where supported. 4. Collect screenshots and console errors.',
   f'{feature} satisfies the declared mode/quality objective with no uncaught exception or data loss; unsupported hardware is recorded as not verified.')
 return ('Seeded match and clean user profile available',
   '1. Create the specific gameplay situation. 2. Trigger the requested behavior. 3. Test success, failure and edge conditions. 4. Repeat both sides at varied frame rates.',
   f'{feature} occurs only under appropriate conditions, is visually observable and does not regress related movement, scoring or match flow.')

# Descriptive links to already-existing scripts, not proof that a given requirement is fully covered.
SCRIPT_HINTS={
 'Controls':'four_button_controls.mjs;combo_priority.mjs;input_buffer.mjs;control_reliability.mjs;four_button_browser_qa.py',
 'Gameplay':'simulation.mjs;player_collisions.mjs;fixing_issues.mjs',
 'Career':'career.mjs;manager_v060.py',
 'Player Attributes':'player_stats.mjs;v08195_overall.mjs',
 'Team Management':'tactics_identity.mjs;v08193_ui_navigation.mjs',
 'Goalkeepers':'v0819_goalkeeper.mjs;v08196_keeper_prediction.mjs;v08197_keeper_sessions.mjs',
 'Super shots':'super_shot_reset.mjs;special_levels.mjs',
 'Roster integrity':'v08203_roster_inventory.mjs;v08203_bayern_psg_verified.mjs',
 'AI':'ai_difficulty.mjs;ai_team_combos.mjs',
 'Penalties':'penalty_controls.mjs;penalty_controls_browser_qa.py',
 'Graphics':'character_art.mjs;character_art_browser_qa.py',
 'Team Kits':'kits_agility.mjs;kits_browser_qa.py',
 'Game balance':'v08194_keeper_balance.mjs',
 'Modes':'continental.mjs;career.mjs',
 'BPW eras':'',
 'Foundation':'simulation.mjs;v08193_input_stress.mjs',
 'Rosters':'roster_reconciliation.mjs;v08203_roster_inventory.mjs',
 'Player Creator':'cartoon_identities.mjs;character_art.mjs',
 'Abilities':'defensive_abilities.mjs',
}
rows=[]
with (DOC/'FEATURE_MATRIX_218_ITEMS.csv').open(newline='') as f:
 for r in csv.DictReader(f):
  pre,steps,expected=area_plan(r['area'],r['feature'])
  status=r['status']
  rows.append(dict(test_id=f"REQ-{int(r['id']):03d}",requirement_id=f"LEGACY-{int(r['id']):03d}",area=r['area'],requirement=r['feature'],requirement_status=status,priority=('P0' if r['area'] in ['Controls','Quality','Roster integrity','Goalkeepers'] else 'P1'),test_type='functional + boundary + regression',automation_status='RELATED_SCRIPT_ONLY' if SCRIPT_HINTS.get(r['area']) else 'MANUAL_REQUIRED',preconditions=pre,steps=steps,expected_result=expected,related_automated_scripts=SCRIPT_HINTS.get(r['area'],''),execution_status='NOT_EXECUTED_INDIVIDUALLY',notes=f"Historical {status}. Trace evidence: {r['evidence'][:220]}. Next step: {r['next_step'][:220]}"))
with (DOC/'FEATURE_BACKLOG_ACTIVE_v08203.csv').open(newline='') as f:
 for r in csv.DictReader(f):
  pre,steps,expected=area_plan(r['workstream'],r['requirement'])
  rows.append(dict(test_id='FUT-'+r['id'],requirement_id=r['id'],area=r['workstream'],requirement=r['requirement'],requirement_status=r['status'],priority=r['priority'],test_type='future acceptance / boundary',automation_status='FUTURE_TEST_NOT_IMPLEMENTED',preconditions=pre,steps=steps,expected_result=r['acceptance_criteria'],related_automated_scripts='',execution_status='NOT_APPLICABLE_FEATURE_NOT_SHIPPED',notes='Backlog-only requirement; add executable cases before enabling feature. '+steps))
# Precision cases: concrete enough for human testers, with deterministic input and expected behavior.
critical=[
 ('CTRL-01','Possession short Pass','Have ball; tap Pass 40 ms','Exactly one short pass, no charged long pass or dribble'),
 ('CTRL-02','Possession held Pass','Have ball; hold Pass 0.6s; release','High long pass after release, not before'),
 ('CTRL-03','Cross ordered Jump then Pass','Have ball; tap Jump; while airborne tap Pass','Exactly one cross; player airborne before Pass'),
 ('CTRL-04','Reverse order Pass then Jump','Have ball; hold Pass then tap Jump','No cross and no teammate launch'),
 ('CTRL-05','Simultaneous Pass and Jump','Have ball; keydown together without prior airborne state','No cross'),
 ('CTRL-06','Tap Shoot normal','Have ball; tap Shoot quickly','One regular shot'),
 ('CTRL-07','Hold Shoot charged','Have ball; hold Shoot >0.5s then release','One charged shot, not repeated while held'),
 ('CTRL-08','Jump and Shoot','Have ball; Jump into air then Shoot','Airborne shot and no duplicate jump'),
 ('CTRL-09','Double jump then Shoot','Have ball; Jump, jump while airborne, Shoot','Super aerial shot under eligible conditions'),
 ('CTRL-10','Dribble tap','Have ball; tap Dribble','One dash'),
 ('CTRL-11','Dribble double-tap','Have ball; double-tap Dribble','Personal trick where eligible in current engine'),
 ('CTRL-12','Jump and Dribble','Have ball; press Jump+Dribble within combo window','One bicycle action without a second normal jump'),
 ('CTRL-13','Jump hold sprint','Have ball and moving; hold Jump 1s','Sprint and no unintended jump on release'),
 ('CTRL-14','No ball Pass tap','Defending; tap Pass','Standing tackle'),
 ('CTRL-15','No ball Pass hold','Defending; hold Pass','Chase the ball carrier'),
 ('CTRL-16','No ball Shoot tap','Defending; tap Shoot','Travelling slide tackle; longer reach while running'),
 ('CTRL-17','No ball Dribble','Defending; tap Dribble','Swap to next appropriate teammate'),
 ('CTRL-18','No ball Jump hold','Defending; hold Jump+direction','Defensive run with no phantom jump'),
 ('CTRL-19','Defensive Jump+Shoot','Defending; Jump then Shoot in air','Flying defensive kick or contextual move'),
 ('CTRL-20','Defensive double-Jump+Shoot','Defending; double jump then Shoot','Defensive bicycle kick'),
 ('CTRL-21','Rapid keyboard event queue','Press+release Pass 8 times between polls','Exactly eight pulses, in order, without extras'),
 ('CTRL-22','Burst limiting','Press+release Pass 30 times between polls','Queue bounded; no stale actions after long stall'),
 ('CTRL-23','Touch cancellation','Start charged Pass/Shoot; trigger pointercancel','Charge canceled, no unintended shot or pass'),
 ('CTRL-24','Tab hidden','Hold Jump and change document visibility to hidden','Held input and queued presses cleared; no action on resume'),
 ('CTRL-25','Input gamepad disconnect','Hold keyboard Jump and disconnect gamepad','No duplicate keyboard Jump action'),
 ('CTRL-26','Action priority Shoot over Pass','Overlap Shoot+Pass before release','One Shoot, no later Pass'),
 ('CTRL-27','Action priority Shoot over Dribble','Overlap Shoot+Dribble','One Shoot, no extra Dribble'),
 ('CTRL-28','Action priority Pass over Dribble','Overlap Pass+Dribble','One Pass, no extra dribble'),
 ('CTRL-29','Only four action buttons','Inspect game controls, remap menu, touch/gamepad mappings','Exactly Pass Shoot Dribble Jump; no Special/Switch/Sprint fifth action'),
 ('CTRL-30','Remapping validation','Save invalid conflicting remap then valid remap','Reject duplicates and protect player 2 bindings; valid remap persists'),
 ('GK-01','Automatic dive both teams','Send reachable shots toward both goals with keeper present','Both automatically attempt save without a keeper button'),
 ('GK-02','Unreachable fast shot','Target far unobstructed corner with fast high shot','Keeper does not teleport; shot can score'),
 ('GK-03','Nonlinear prediction','Launch curved, zigzag and homing specials to both goals','Bounded anticipation, no instant teleport or invincibility'),
 ('GK-04','Catch and hold','Direct catchable low-power shot to keeper','Catch and short secure possession before distribution'),
 ('GK-05','Safe goalkeeper throw','Keeper holds ball with free passing lane','Throw to unmarked teammate, not nearest opponent'),
 ('GK-06','Blocked keeper passing lane','Keeper holds ball with opponents near every teammate','Punt long into safer corridor'),
 ('GK-07','High-power parry','Fire shot beyond catch threshold within dive reach','Parry rather than impossible clean catch'),
 ('GK-08','Save skill and fatigue','Compare rookie, elite, fatigued elite with fixed shots','Skill improves coverage; fatigue degrades it'),
 ('GK-09','Save cooldown','Repeat shots immediately after a diving save','Keeper recovery time within configured bounds'),
 ('GK-10','GK Diving stat migration','Import pre-0.8.19.6 player data containing gkJump','Preserve value as gkDiving; no displayed GK Jump label'),
 ('GAME-01','Goal detection and scoring','Move ball fully over both goal lines inside posts','Correct team score once and kickoff resets'),
 ('GAME-02','Outside the posts','Shoot outside posts at goal line','No goal'),
 ('GAME-03','Shot accuracy spread','Compare many seeded shots at low versus high accuracy','High accuracy targets uncovered goal areas with less dispersion; low can miss'),
 ('GAME-04','Stoppage-time maximum','Carry ball near goal at end of match','Brief attacking extension but bounded by hard maximum'),
 ('GAME-05','Strength-dependent tackled stun','Tackle weak and strong players with identical tackles','Weak player remains stunned longer; both recover'),
 ('GAME-06','Super-shot impact','Hit field players with low/high-level special shots','Higher impact increases knockback chance; Strength resists harm'),
 ('GAME-07','Match flow halftime','Play through first half with clock progression','Half-time occurs correctly; no stuck scoreboard'),
 ('GAME-08','Penalty match resolution','Resolve tied match via penalty mode','Penalty turn sequence ends with correct winner'),
 ('TEAM-01','Formation 2-1-2','Select and start formation 2-1-2','1 GK+5 field players, valid pitches and roster'),
 ('TEAM-02','Formation 1-2-2','Select and start formation 1-2-2','Correct five field positions'),
 ('TEAM-03','Formation 2-2-1','Select and start formation 2-2-1','Correct five field positions'),
 ('TEAM-04','Formation 1-3-1','Select and start formation 1-3-1','Correct five field positions'),
 ('TEAM-05','Formation 1-1-3','Select and start formation 1-1-3','Correct five field positions'),
 ('TEAM-06','Formation 3-1-1','Select and start formation 3-1-1','Correct five field positions'),
 ('TEAM-07','Formation face/OVR','View formation pitch and change starter','Face, name, slot-specific OVR update immediately'),
 ('TEAM-08','Roster quotas','Audit all teams','222 12-player squads with 2 GK, 3 DF, 4 MF, 3 FW where required'),
 ('TEAM-09','Career geographic filter','Select continent, country and club','Club selection narrows correctly; team has visible crest/flag'),
 ('TEAM-10','Quick/cup team identity','Browse Quick Match and Cup selections','Flags/crests rendered beside selectable team'),
 ('TEAM-11','OVR formula role-specific','Calculate OVR on known fixture for GK DF MF FW','Rounded equal mean of six relevant attributes per assigned slot'),
 ('TEAM-12','OVR non-mutating','Calculate all role OVRs and inspect original player stats','Stored rating and transfer economics remain unchanged'),
 ('TEAM-13','Save/import compatibility','Create Career, change formation, export, import','Custom team plans, roster IDs and Career data restored'),
 ('TEAM-14','Club provenance','Inspect eight researched full club squads and three additional LAFC records','99 club/role/DOB slots source checked; other 2493 not falsely certified'),
 ('TEAM-15','Roster placeholder gap','Audit current 222-team database','Fictional entries counted; no false certification'),
 ('RELEASE-01','Standalone browser build','Build portable play.html and open offline Chromium','No network dependency, fatal JS error or missing UI'),
 ('RELEASE-02','ZIP bundle parity','Compare play.html in ZIP and separate deliverable','Byte-for-byte identical'),
 ('RELEASE-03','PWA cache/version','Read service worker, package, UI and save version','All represent release 0.8.22.1'),
 ('RELEASE-04','New feature test gate','Simulate addition of a feature to backlog','New requirement gets QA ID and remains unexecuted until implemented'),
 ('RELEASE-05','Accessibility/visual','Open core menus desktop and mobile simulated','No overlay labels, tiny unreadable targets or missing graphics'),
 ('RELEASE-06','Hardware QA','Connect real Android/iOS and USB/Bluetooth gamepad','Document latency, fast taps, multi-touch, disconnect; not certified in CI'),
]
for tid,title,steps,expected in critical:
 category=tid.split('-')[0]; mode='hardware' if tid=='RELEASE-06' else 'mixed'
 links={
 'CTRL':'four_button_controls.mjs;combo_priority.mjs;v08193_input_stress.mjs',
 'GK':'v08197_keeper_sessions.mjs;v08196_keeper_prediction.mjs',
 'GAME':'simulation.mjs;fixing_issues.mjs;v0818_regressions.mjs',
 'TEAM':'tactics_identity.mjs;v08195_overall.mjs;v08203_roster_inventory.mjs',
 'RELEASE':'tests/build.py;tests/master_contracts.mjs'}[category]
 rows.append(dict(test_id=tid,requirement_id='CROSSCUT-'+category,area=category,requirement=title,requirement_status='Active' if tid!='RELEASE-06' else 'Hardware pending',priority='P0',test_type='boundary / integration / regression',automation_status='RELATED_SCRIPT_ONLY' if mode!='hardware' else 'MANUAL_HARDWARE_ONLY',preconditions='Game build, keyboard+touch test surface and seeded fixture (or release artifact for RELEASE scenarios)',steps='1. Establish fixture. 2. '+steps+'. 3. Verify result. 4. Repeat after restart.',expected_result=expected,related_automated_scripts=links,execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='Explicit acceptance scenario; related script is not a claim of fully covering this particular case.'))
# Dated new roster contracts, extending but never replacing the 315 historical cases.
for tid,club in [('ROSTER-2026-MCI','Manchester City'),('ROSTER-2026-LIV','Liverpool')]:
 rows.append(dict(test_id=tid,requirement_id='LEGACY-ROSTER-PROVENANCE',area='Roster integrity',requirement=club+' sourced 2026/27 squad',requirement_status='Partial',priority='P0',test_type='source-backed + integration + browser',automation_status='AUTOMATED_SOURCE_AND_BROWSER',preconditions='Official league 2026/27 source and curated game roster',steps='1. Check twelve real players, roles, shirt numbers, DOB/ages and unique stable IDs. 2. Confirm 2 GK / 3 DF / 4 MF / 3 FW. 3. Test tactics validation and simulated match boot. 4. Check UI and portraits on desktop and simulated Android.',expected_result='All identities and dates match cited sources; save IDs preserved; no numerical ratings or appearances falsely claimed verified.',related_automated_scripts='v08205_manchester_liverpool_verified.mjs;v08205_rosters_browser_qa.py',execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='Executable scripted evidence does not certify physical devices.'))
# v0.8.20.6 canonical identity gates — deliberately do not assume homonyms are the same person.
for tid,title,steps,expected in [
 ('DATA-ID-01','Verified birth-date identity','Check verified club/role + valid birth date, accents and same-player repeats','Identical verified name+DOB yields one canonical person ID, while save-slot IDs remain unchanged'),
 ('DATA-ID-02','Do not merge unverified names','Use same name in a verified club, an unverified nation, and a fictional Academy Prospect slot','Unverified rows get no canonical person ID; placeholders remain independent; review candidates are logged'),
 ('DATA-ID-03','Role-conflict provenance triage','Audit all 216 teams and group repeated names by placeholder status and role','Real-name role mismatches and fictional placeholder collisions are reported separately without overwriting roles')]:
 rows.append(dict(test_id=tid,requirement_id='LEGACY-CANONICAL-IDENTITY',area='Roster integrity',requirement=title,requirement_status='Partial',priority='P0',test_type='unit + full-data + browser',automation_status='AUTOMATED_PARTIAL_CONTRACT',preconditions='216-team populated data and birth-date verified club records',steps=steps,expected_result=expected,related_automated_scripts='v08206_canonical_identity.mjs;v08206_identity_audit.mjs;v08206_identity_browser_qa.py',execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='Identity candidate flags are not proof of a person match or a corrected role.'))
for tid,title,steps,expected,script in [
 ('ROSTER-2026-LAFC','LAFC 2026 goalkeeper/forward correction','Verify Son forward, Thomas Hasal GK, Hugo Lloris GK, shirts and DOB and unchanged save IDs','Correct identities; fixed 12-player quotas; no falsely verified numeric stats','v08206_lafc_roles.mjs;v08206_identity_browser_qa.py'),
 ('TEAM-GK-ORDER','Default lineup does not assume roster order','Run formation initialization with outfield player at roster index 0 and GKs elsewhere','Keeper at formation slot 0; no duplicate lineup IDs; user saved plans retained if valid','v08206_lafc_roles.mjs;v08206_identity_browser_qa.py')]:
 rows.append(dict(test_id=tid,requirement_id='LEGACY-ROSTER-PLAYABILITY',area='Roster integrity',requirement=title,requirement_status='Partial',priority='P0',test_type='source + runtime + UI',automation_status='AUTOMATED_PARTIAL_CONTRACT',preconditions='Official MLS 2026 player profiles, 12 player squad and existing save file IDs',steps=steps,expected_result=expected,related_automated_scripts=script,execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='Stats/art remain unverified, physical devices not certified.'))
# New v0.8.21 acceptance gates for the deliberate two-stage four-button gesture.
for tid,title,steps,expected,kind in [
 ('CTRL-LIFT-01','Held Dribble followed by Jump','Possess ball; hold Dribble >260ms, press Jump while held','Ball rises; player remains grounded; no ordinary bicycle or teammate launch','automated'),
 ('CTRL-LIFT-02','Short simultaneous combination remains ordinary','Possess ball; press Dribble and Jump together for <200ms','Existing ordinary bicycle is not reinterpreted as stationary lift','automated'),
 ('CTRL-LIFT-03','Second Jump then Shoot executes super bicycle','Lift ball; release Dribble/Jump; Jump again then double tap Dribble near airborne ball','Legacy follow-up replaced: new Super Bicycle requires two Dribble taps; eligible player receives transformed Super Shot ball','automated'),
 ('CTRL-LIFT-04','Both pitch directions','Repeat held-lift and follow-up on teams 0 and 1 in local co-op','Shot travels towards opponent goal for either side, never opposite','automated'),
 ('CTRL-LIFT-05','Lift interrupted by possession change','Lift ball then give possession to an opponent','Cancel primed combo; cannot remotely launch ball','automated'),
 ('CTRL-LIFT-06','Lift expires safely','Lift ball then leave it untouched beyond configured window','Follow-up is refused and original actions recover normally','automated'),
 ('CTRL-LIFT-07','Bicycle repeat/charge conflict','Hold Shoot after a valid super bicycle, overlap Pass/Dribble and repeat inputs','Exactly one unified super bicycle, no phantom pass/extra shot/stuck input','automated'),
 ('CTRL-LIFT-08','Desktop and mobile browser','Open packaged HTML with touch and desktop settings; verify help and simulated combo','Four action buttons, new help instructions and working move on both layouts','browser')]:
 rows.append(dict(test_id=tid,requirement_id='LEGACY-BALL-LIFT-SUPER-BICYCLE',area='Controls',requirement=title,requirement_status='Implemented',priority='P1',test_type='integration + boundary + regression',automation_status='AUTOMATED_PARTIAL_CONTRACT',preconditions='v0.8.21 gameplay; four-button controller; ball carrier available',steps=steps,expected_result=expected,related_automated_scripts='v0821_ball_lift_super_bicycle.mjs;v0821_ball_lift_browser_qa.py',execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='Relevant script evidence does not certify every physical device or all 330 cases.'))
# v0.8.22 input hardening and restrained Super Bicycle acceptance cases.
for tid,title,steps,expected,scripts in [
 ('CTRL-RELIABILITY-01','Mixed-source release must not end hold','Hold keyboard Pass; press and release touch Pass','Pass remains held without release until keyboard keyup','v08211_control_cancellation_balance.mjs;v08211_input_cancel_browser_qa.py'),
 ('CTRL-RELIABILITY-02','Aborted charged Shoot must not fire','Start charging Shoot; lose touch capture or cancel pointer','Charge cleared; no released shot, phantom kick or ball possession loss','v08211_control_cancellation_balance.mjs;v08211_input_cancel_browser_qa.py'),
 ('CTRL-RELIABILITY-03','Aborted long Pass must not fire','Hold Pass; cancel pointer or lose capture','No pass or tackle occurs and Pass hold state resets','v08211_control_cancellation_balance.mjs;v08211_input_cancel_browser_qa.py'),
 ('CTRL-RELIABILITY-04','Backgrounding aborts buffered actions','Charge action then hide mobile tab; resume game','Pending hold is canceled; no ghost shot/pass; fresh input works','v08211_control_cancellation_balance.mjs'),
 ('GAME-SUPER-BICYCLE-BALANCE','Super Bicycle cost and velocity bounded','Compare bicycle fatigue with Super Bicycle and run strong shot with high-power player','Unified Super Bicycle uses identical Super Shot power and transformation; fatigue cost higher than ordinary bicycle','v08211_control_cancellation_balance.mjs;v0821_ball_lift_super_bicycle.mjs')]:
 rows.append(dict(test_id=tid,requirement_id='LEGACY-CONTROL-BALANCE',area='Controls',requirement=title,requirement_status='Implemented',priority='P0',test_type='automated + browser',automation_status='AUTOMATED_PARTIAL_CONTRACT',preconditions='Two input sources or active four-button match fixture',steps=steps,expected_result=expected,related_automated_scripts=scripts,execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='Physical mobile/gamepad testing remains open; scripted passing does not mean full catalog certification.'))
# v0.8.22 World Cup BPW all-star squad acceptance and regressions.
for tid,title,steps,expected in [
 ('BPW-01','Six exact tournament-year squads','Open BPW category','Exactly BPW World Cup 1998, 2002, 2006, 2010, 2014, 2018 appear'),
 ('BPW-02','Mixed nations within each team','Audit nationality metadata','Each squad has players from four or more national teams, no single-country legends masquerading as BPW'),
 ('BPW-03','Exactly 12 per World Cup','Inspect all 6 team management rosters','Two GK, three DF, four MF and three FW per edition'),
 ('BPW-04','No historical player repeats','Compare historical person keys across 72 roster slots','Exactly 72 distinct real people with no repeats across years'),
 ('BPW-05','No guesses presented as FIFA game ratings','Inspect all 72 player provenance records','Editorial arcade gameplay ratings explicit; no claimed EA FC accuracy or verified DOB'),
 ('BPW-06','Historical original team identities','Browse team picker flags and emblems','BPW has its own distinct themed original crests, not a national flag'),
 ('BPW-07','Historical slot IDs and save compatibility','Reload pre-0.8.22 custom clubs and select BPW team','Original base and existing user-club indexes stay unchanged; BPW slots unique'),
 ('BPW-08','BPW match engine both sides','Play home and away match versus arcade team','Twelve-player rosters, actual keeper in slot zero, no JS fatal errors'),
 ('BPW-09','BPW formation face and OVR','Select BPW 2014, open formation manager','Six portraits, 12 player roster faces, role OVR and elite names'),
 ('BPW-10','Original controls after new category','Play BPW on desktop and simulated Android','Only Pass Shoot Dribble Jump; previous input combos continue working')]:
 rows.append(dict(test_id=tid,requirement_id='LEGACY-BPW-WC-SIX',area='Historical BPW',requirement=title,requirement_status='Implemented',priority='P1',test_type='integration + unit + browser',automation_status='AUTOMATED_PARTIAL_CONTRACT',preconditions='Install six World Cup BPW squads after existing teams and saved clubs',steps=steps,expected_result=expected,related_automated_scripts='v0822_bpw_world_cups.mjs;v0822_bpw_world_cups_browser_qa.py',execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='Some historical selections editorial; individual ages/appearance/EA ratings not independently verified. Hardware QA remains outstanding.'))
# v0.8.22.1 priority rework — explicit Jump-first aerial sequence and unified special effects.
for tid,title,steps,expected in [
 ('AERIAL-REWORK-01','One Shoot after airborne Jump','Loose aerial ball near player; Jump, tap Shoot once, wait double-tap window','Ordinary heading shot, no transformed ball'),
 ('AERIAL-REWORK-02','Two Shoot taps after airborne Jump','Loose aerial ball; Jump, tap Shoot twice within 320ms','Super Header; same power and transformation behavior as Super Shot'),
 ('AERIAL-REWORK-03','One Dribble after airborne Jump','Loose aerial ball; Jump, tap Dribble once, allow window to expire','Ordinary bicycle shot, without team swap'),
 ('AERIAL-REWORK-04','Two Dribble taps after airborne Jump','Loose aerial ball; Jump, tap Dribble twice within 320ms','Super Bicycle; same power and transformation behavior as Super Shot'),
 ('AERIAL-REWORK-05','Ball lift feeds any aerial combo','Hold Dribble 260ms then Jump to loft; release; Jump, double tap Dribble','Super Bicycle without old mandatory Jump plus Shoot chord'),
 ('AERIAL-REWORK-06','First Jump then Shoot while carrying','Possess ball; jump once; press Shoot after becoming airborne','Elevated ordinary shot with no transformation'),
 ('AERIAL-REWORK-07','Double Jump then Shoot while carrying','Possess ball; jump, jump again while airborne, then press Shoot','Super Shot with standard transformation for eligible shooter'),
 ('AERIAL-REWORK-08','Equal special strike physics','Same player and RNG; compare ground Super Shot / Super Header / Super Bicycle','Equal speed and impact power, identical shot ID, animation parameters and duration'),
 ('AERIAL-REWORK-09','Non-specialist stronger ordinary fallback','Remove shooter special ability, repeat all three super sequences','All are stronger plain kicks; shot metadata null, no transformations'),
 ('AERIAL-REWORK-10','Both home/away directions','Repeat both double-tap aerial types for team 0 and 1','Attacks always travel toward opponent goal'),
 ('AERIAL-REWORK-11','Single vs double tap non duplication','One tap, wait, or double tap fast; hold button after shot','One ordinary or one super strike only, never both'),
 ('AERIAL-REWORK-12','Safety on ball loss or leaving reach','Prime first tap; lose ball, move out of reach or become stunned','Pending tap canceled; no long-distance shot or delayed phantom move')]:
 rows.append(dict(test_id=tid,requirement_id='PRIORITY-SUPER-SHOT-GRAMMAR',area='Aerial Super Shot Rework',requirement=title,requirement_status='Implemented',priority='P0',test_type='unit + browser + regression',automation_status='AUTOMATED_PARTIAL_CONTRACT',preconditions='v0.8.22.1 four-button match; source-controlled input and nearby aerial ball',steps=steps,expected_result=expected,related_automated_scripts='v08221_aerial_super_rework.mjs;v08221_aerial_super_browser_qa.py',execution_status='NOT_EXECUTED_INDIVIDUALLY',notes='The automated scripts verify representative assertions, not human-device hardware certification.'))
ids=[r['test_id'] for r in rows]
assert len(ids)==len(set(ids)), 'duplicate QA IDs'
assert len([r for r in rows if r['test_id'].startswith('REQ-')])==218
assert len([r for r in rows if r['test_id'].startswith('FUT-')])==28
with OUT.open('w',newline='') as f:
 w=csv.DictWriter(f,HEADERS);w.writeheader();w.writerows(rows)
meta={'total':len(rows),'historical':218,'backlog':28,'crosscutting':len(critical),'new_verified_roster_cases':2,'new_identity_cases':3,'new_ball_lift_cases':8,'new_control_balance_cases':5,'new_worldcup_bpw_cases':10,'new_aerial_rework_cases':12,'by_area':dict(collections.Counter(x['area'] for x in rows)), 'by_execution':dict(collections.Counter(x['execution_status'] for x in rows)), 'meaning':'Cataloged != executed; RELATED_SCRIPT_ONLY indicates discoverability, not certified requirement coverage.'}
(DOC/'MASTER_QA_CATALOG_SUMMARY_v08221.json').write_text(json.dumps(meta,indent=2)+'\n')
print('QA catalog generated',meta)
