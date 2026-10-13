# Supermagic Football — Historical Requirements, Original-NES Parity and v0.6.0 Independent Audit

**Audit date:** 13 October 2026  
**Audited build:** `Nekketsu_Legends_HD_v0.6.0_Play.html` / `nekketsu_hd_v060/src/*.js`  
**Audit mode:** Inspection and read-only tests. **No feature implementation or product-source modifications were made in this audit.**  
**Scope:** User requests visible in the project conversation from the first Nintendo game identification to the latest flags/tactics/stamina/morale request; source code and screenshots; documented 1993 Famicom manual and contemporary guides.

## Executive decision

The game has real playable infrastructure but is not complete, nor is it an accurate recreation of the complete 1993 game. v0.6 combines a large club catalog with an early arcade physics engine, missing tactical preparation, morale, strong player identity, original defensive skills, fouls/free kicks and 4-player goalkeeper versus. Complete *game behavior* before building additional breadth. Preserve two gameplay profiles: **CLASSIC 1993** (documented movement/control/mode behavior), and **EXPANDED** (modern stamina, career, global clubs, editable formations, online).

### What 'complete' means for this report

- **Done** = implemented, inspected and supported by reproducible unit/browser evidence for the narrow feature listed; may still need broader production QA.
- **Partial** = implemented foundation, but one or more mandatory mechanics/quality/verification pieces missing.
- **Missing** = not implemented as a functional feature, even if a string/menu placeholder exists.
- Counts are **checklist counts, not percentage of development effort**, and split combined requests into testable requirements. No credible single software completion percentage can be derived from them without weighting/time estimates.

## 1. Chronological reconstruction of every user feature-request turn

Below is a faithful *summary of feature requests*, not a claim to reproduce verbatim text or unseen conversation prompts.

1. **Identify Nintendo game from screenshot.** Target is *Kunio-kun no Nekketsu Soccer League* (1993 Famicom), not generic arcade soccer.
2. **Rebuild every original mode, team, player, gameplay mechanic, options and controls**, playable on PC and phone, keyboard and gamepad, preferably through a browser.
3. **Research original mechanics and rosters** rather than inventing them. Include every original Japanese player's special transforming ball shot and a signature shot for every original opponent (fish, birds, banana and other comic transformations).
4. **Reject emulator as product**: retain original Nintendo-style gameplay and presentation but use newly coded independent simulation, new HD graphics, editable source, and a platform for future changes.
5. **Visual overhaul**: larger world field relative to characters, exaggerated funny Kunio-like faces, genuine HD redraw and greatly improved menus/gameplay fidelity.
6. **Gameplay v0.5 request**: unique faces per player, noticeably slower movement and ball, funny post-goal celebrations, context-sensitive possession buttons (shoot↔slide, pass↔chase/tackle), 32 top-2026 nations, 32 major clubs, six iconic 1996–2016 teams; 12 members per team, recognizable cartoon caricatures, customization, club manager career, transfers, league/cups and player development.
7. **Worldwide v0.6 expansion**: include all participating UEFA Champions League clubs and continental flagship competitions in other confederations, six featured top clubs per continent; finish remaining items and test them.
8. **Latest request, October 13**: every national team needs a graphical national flag and every club an identifiable flag/crest; before kickoff AND during matches offer formation, starting six, substitutes, captain, set-piece takers, attacking and defensive styles; true stamina that decreases with movement/actions; audit all original user requests and original Nintendo content; funny celebrations, stuns, losing-team crying, distinctive team personalities, defensive and offensive special abilities, mood/morale and risky talk/phone/item choices. **Deliver audit and plan now; continue building after user reviews.**

## 2. Verified current-build inventory

| Metric | Measured value | Evidence |
|---|---:|---|
| Total registered teams | 216 | Engine team database construction |
| Classic teams | 13 | `src/data.js` |
| Modern national teams | 32 | `src/expanded.js` |
| Featured modern clubs | 32 | `src/expanded.js` |
| Historical/legend teams | 6 | `src/expanded.js` |
| Additional continental clubs | 133 | `src/continental.js` |
| Combined 12-player roster slots | 2592 | Programmatic team inventory |
| Fictional/academy player slots | 1786 (68.9%) | Roster inventory |
| Teams containing fictional/academy members | 171 | Roster inventory |
| Teams missing 12 entries | 0 | Automated source check |
| Teams without a GK-role member | 0 | Automated source check |
| Duplicate player IDs within a team | 0 | Automated source check |
| Invalid shot IDs on roster | 0 | Automated source check |
| Actual flag/crest asset coverage | 0/216 | Current game displays string codes and kit colors instead |

## 3. Additional original-Nintendo discoveries (not yet included in prior plans)

The original manual, translated move list and screenshot gallery expose a much deeper game than the v0.6 prototype:

**A. Dressing room / locker room:** Team meeting is central: formation, player roles, AI passing/shooting/defensive aggression, goalkeeper roaming, mood, gifts, personal conversations, telephone calls (including Misako), captain stats, weather forecast and music selection. Each Japanese character has a known personality, likes and dislikes. Mood changes visibly alter facial expressions and can modify team behavior. The historical guide documents a **0–15 mood index**; talking sometimes backfires, and particular gifts/calls help or harm particular characters. This is precisely the system the user remembers.

**B. Input/action depth:** Beyond pass/shoot/slide: walk, dash, hyper dash, jump, aerial pass, directional header, overhead/backflip shot, ball floats, dribble feint, diving header, rolling/crawling, teammate stacking, double-team flip kicks, and conditional teammate orders. One-player League controls the MF captain and can assign player two to the goalkeeper; Versus supports 3rd/4th controllers assigned to goalkeepers. The current automatic player swapping is a new-system convenience, not Classic parity.

**C. Offensive AND defensive specials:** Timed peak-of-jump character-specific transforming shots; a shared alternate aerial shot; special dribbles, swallow returns, explosive strikes, drill attacks, triple acceleration, tornado kicks and goalkeeper tornado punches. Storing the attack name or making every special a one-press projectile does not reproduce the mechanics.

**D. Contact and unpredictable environment:** Strong goalkeepers can throw players away or be overwhelmed by shots. Lightning can electrify the ball; tornadoes lift players and the ball; wet spots affect velocity and visual ball color. The Japanese manual also explicitly mentions **foul/penalty decisions and free kicks**. These need design validation against in-game capture because some unofficial guides concentrate on no-standard-soccer-rule brawling.

**E. Competitions and presentation:** Original League has 12 opposing countries organized as four regional groups, up to three meetings per opponent (36 total), qualification at >=16 wins and >=70 points, then four playoff matches culminating with Italy. Original game has 2-minute halves, penalties, music selection, and password-based progression. Screenshots show detailed bottom player HUD, facial indicators of role suitability, mud/rain, peculiar goalkeeper moves and post-match winner reactions.

**F. Personalities/team styles:** The Nintendo manual calls out national-team strengths and differences (e.g., Thai Muay Thai style, Mongolian defensive orientation, Brazil's individual technique, Germany's tough defenders), and distinguishes Japan's players by personality and gift preferences. Current v0.6 largely selects between global AI styles and inferred strength ratings; it does not implement these characteristic AI behaviors.

**Original-source caution:** Some historical English shot translations conflict, and the uploaded `Twin Shot (Hack).nes` may contain hack-only behaviors. A reference-capture ledger must separate documented 1993 behavior from modifications in this hack. The requested **crying specifically after conceding a goal** is supported as a user recollection and should be implemented, but its exact original appearance should be confirmed with footage, not described as verified from a static source.

### Visual/screenshot comparison

| Original visual evidence | Current v0.6 | Gap to resolve |
|---|---|---|
| Famicom field/combat screenshot: large chibi heads, varied distressed faces, bottom player portraits+mini-map | Vector heads/body characters, top scoreboard, minimap at bottom | Match cartoon proportions and facial-action library, authentic-optional HUD |
| Original formation screen: role positions, facial suitability indicators | Six HTML dropdowns with numerical stats | Drag/drop formation positions, faces reflecting role fit and mood |
| Original locker-room/management screenshot | No interactive meeting/dialogue/gift screen | Full character conversations and consequences |
| Original winning/losing and comic cutscenes | One generic celebration with particles | Per-person celebration, tears, fighting/embraces/sulking and match context |
| Dynamic water/mud, storm and shot transformation | Basic weather sprites, abstract effects | Frame-trace shot and weather variants with distinct collisions |

Reference screenshot galleries: https://www.mobygames.com/game/25090/kunio-kun-no-nekketsu-soccer-league/screenshots/ ; https://retro.gg/game/kunio-kun-no-nekketsu-soccer-league/1225 ; https://gamecola.net/2014/09/localization-anxiety-kunio-kun-no-nekketsu-soccer-league/ .

## 4. New-request deep audit and product design

### Flags and club emblems

**Today:** all 216 teams expose a string `flag` property (e.g., `JP`, `BRA`, `ENG`) but v0.6 renders the raw code rather than flag artwork. Many club entries treat nationality code as their only identity. **Required fix:** each team gets `countryCode`, `nationalFlagAsset`, `clubBadgeAsset` (clubs) and optional rectangular match flag/banner; use local SVG/PNG atlases and offline caching, fallback procedurally generated identity badge, test every 216 previews, match HUD, league table and trophy screen. England's national flag should be the St George cross rather than a UK flag; never mistake a club's country flag for its club emblem. Official club emblems/logos may require permission for public distribution; use original designed substitutes otherwise.

### Complete tactical match room

**UI contract:** `MATCH SETUP → TEAM MANAGEMENT → KICKOFF`, and `PAUSE or HALFTIME → TEAM MANAGEMENT → APPLY & RESUME`. The same editing module must work for both teams (player-owned), with country/club selection remembered. Panels: (1) Formation map and positions; (2) Starting six/bench six with drag/drop, role fit and fatigue; (3) Captain/vice-captain; (4) Penalty/free-kick/corner taker plus backup; (5) Attack style and parameter sliders (pass tendency, shoot tendency, width, run support); (6) Defense style (aggression, pressure, line depth, GK roaming); (7) Team morale, pep talk, personalities and items; (8) Shot/defense-ability assignments and input help. Save a `TeamTactics` object per team/season; match runtime references the same object so actual AI changes within seconds of applying tactics. A swap must retain stamina/mood/knockdowns, not replace `src` records alone.

### Stamina, fitness and morale separation

- **Stamina:** continuous in-match 0–100 energy per player; drain from movement, speed, sprint, jumps, tackles, hits, shots and specials, with low activity recovery; AI and human players use the same formulas. Scale acceleration, max speed, shot precision, tackle recovery and GK dives. Substitute brings own stamina and keeps outgoing player's drained stamina. Goals do not reset physical energy; halftime may recover a bounded amount. Stamina HUD and visual panting frames are required. Proposed balancing numbers are *new game design*, not claims about 1993 internals.
- **Season fitness:** persistent across career fixtures, affected by recovery facilities, travel and injury. Separate from match stamina and personal 'power' stat in original Japanese manual.
- **Morale:** personality-specific 0–15 mood, positive/negative talk probabilities, preferred gifts and calls; modify willingness to follow teammate instructions, formation discipline and reactions. Mood persists across kickoffs and matches. Any random outcome should be seeded/testable.
- **Visual emotions:** wide mood/pose atlas: excited, smug, laughing, stunned, crying, angry, terrified, embarrassed, proud, sulking, sleepy, panting; player-specific animation choice.

### Existing implementation defects with precise reproduction

1. `player.fatigue` increases only when the **human controlled player** moves; AI `driveAI()` has no equivalent energy drain. Setting `fatigue=1` leaves `playerSpeed()` unchanged (measured delta: **0**).
2. `resetKickoff()` calls `spawnPlayers()`, resetting `fatigue`, `mood`, `stun`, `action` and most runtime personality state for everyone. A player who sprinted before a goal becomes fresh immediately after the goal.
3. Pre-match `showSetup()` has no entry to full squad/tactics; `showSquad()` lives in a separate main-menu/pause workflow. The default team formation can be edited after pausing, but there's no captain, set-piece or defensive plan in that menu.
4. `start()` applies customized saved lineup only when **home team is classic Japan** in non-career mode; other clubs begin with fixed indices 0–5. A global saved formation is used for home while away formation defaults to 2-1-2.
5. In-pause lineup edit changes player `src` and home positions but does not construct a full substitute transaction with preserved stamina, match statistics and role suitability.
6. The `skill` field holds named special defense/movement skills, but the engine never dispatches their character-specific actions. Generic tackles exist instead.
7. Player `mood` starts at 9 but no treatment/dialogue alters it and there is no morale multiplier in AI, interactions or UI. Crying state is absent.
8. Match result does not include a referee free-kick subsystem, authentic NPC goalkeeping control, or 3rd/4th goalkeeper ownership.

## 5. Test report: executed on this audit date

**Commands:** `npm test`, `npm run qa` in `nekketsu_hd_v060`, plus `source_checks.mjs`, `stress_sim.mjs` and `browser_audit.py` in this audit folder.

| Test | Executed | Result | Boundaries |
|---|---|---|---|
| Match baseline | 12 Japan shots, all 13 originals, basic goal + PK | PASS | Does not compare special physics to original footage |
| Career baseline | 83 legacy base teams, 12-player squads, 14 league and 3 cup rounds, transfers | PASS | Simplified economy and schedules |
| Six continental campaigns | 36+32+16+27+32+8 = 151 club entry campaigns | PASS | Simplified tournament rules; scripted simulated results |
| Desktop Chromium menus | Championship run, manager scouting/contracts, settings/save round-trip | PASS | Chromium, simulated interactions |
| Mobile Chromium viewport | Same flows at 844x390 and emulated touch | PASS | Not real phone, not iOS Safari |
| Source integrity inventory | 216 teams/2592 roster slots and unique IDs/roles/shot references | PASS | Does not validate true named-player roles, teams or likeness |
| Player stamina effectiveness | Human vs AI stamina, speed penalty, score resets | FAIL (feature gap) | Human fatigue rises, AI does not; no speed effect; reset on kickoff |
| Flag and management UI | 216 team labels, set piece/captain/flag art/stamina indicators | FAIL (feature gap) | Raw 2–3 letter codes, no visual badges, no captain/takers |
| Continuous short-game physics stress | 216 different team-vs-team fixtures, 51,840 frames, 5 weather presets | PASS | 3.84 simulated seconds/fixture only; no real 4-minute continuous full match |
| Crash/JS exceptions on selected UI flows | Desktop and mobile browser | PASS | Does not cover every screen, all gamepads or long-term session |

**Interpretation:** all existing documented regression tests pass. New audit tests uncover *missing implementation*, not new crashes. Real original-vs-HD animation/physics parity tests, in-person usability, physical gamepads, device FPS/heat/battery, and large multi-season/failure-recovery endurance remain **not executed**. Future reports must not refer to the current test run as 'fully tested' or 'all features working'.

## 6. Prioritized architecture and development milestones

### Phase 0 — protect the current build (first)

Freeze v0.6 source; add CI, one feature-flagged Classic/Expanded switch, strict test fixtures and a backup format. Fix out-of-date master tracker so code and claims match; establish measurable acceptance gates. No new teams until current mechanics stabilized.

### Phase 1 — identity + professional team management (next requested release)

Flag/crest atlas for **every 216**; authentic national flags and generated/licensed club emblems; tactical preparation reachable from match setup and pause; formation diagram, six starters/bench, goalkeeper/captain/vice-captain and set piece assignments, two-side strategy, saved substitutions. Runtime changes must affect match decisions immediately, and all team screens must display identity art. This is the highest priority because you explicitly asked for these before further development.

### Phase 2 — stamina, mood, personality and funny events

Separate match stamina from career fitness and original power stat; add AI-equivalent drains, performance penalties, persistence and fatigue UI; restore team meeting system (12 original Japan personalities, talk/items/calls, +/- impacts), expressive reactions, crying on goals, taunts, injury/knockdown. This introduces an events pipeline for goals, tackles, referee decisions, weather and context character reactions.

### Phase 3 — 1993 Classic gameplay parity and defensive specials

Instrument original screenshot/video/ROM traces to build a behavior reference table. Rebuild A/B context controls, aerial timing, hyper dash, headers, trick moves, doubleteam flips, goalkeeper actions, original defense skills and character-specific transformations. Add free-kick/penalty referee system. Use controlled comparison scenarios for travel velocity, collision and stun duration. Tune slow play experience with feedback-based acceptance.

### Phase 4 — original content and visuals

Complete original opponent character identities, strengths and country styles, personalities, advanced goal celebrations, HD hand-designed body/face/action atlases, environment interactions, opening/title/dressing-room/victory scenes, synthesizer replacement audio assets and soundtrack chooser. Classic League and 1–4P formats fully reproduced. Mark historic uncertainties instead of inventing data.

### Phase 5 — modern rosters and deeper world football

Remove or clearly retain every `academy` placeholder until verified real 2026/27 squads are entered. Maintain persistent identity IDs across national+club squads; use a club-country/logo schema, correct player primary/secondary positions, individual base stats, and player growth. Rebuild UEFA/AFC/CAF/CONCACAF/CONMEBOL/OFC competition rules and official-fixture data, including correct home/away tie logic, group draws and champion qualification.

### Phase 6 — career and clubs

Full domestic league structures, multi-year calendar, qualified Champions League access, realistic transfer budgets, contracts, wage bill, youth scouting, injuries, staff, club-building and fan/stadium systems; trophy cabinet and training that affects match stats.

### Phase 7 — online and production polish

Refactor to fixed-step seeded deterministic game state, network-authoritative server or carefully tested rollback approach, accounts, matchmaking, reconnection, anti-cheat, spectator/replay mode and cloud saves. Finish real-device QA, cross-browser/performance tests, accessibility and commercial licensing review.

### Suggested playable-next-release acceptance criteria

1. Every one of the 216 selectable teams displays an actual image-based identity badge, appropriate national flag and, for clubs, a distinct club crest, on team selection, scoreboards and career menus. No raw code-only HUD flags.
2. From match setup, user can select starting six, bench, captain, set piece takers, formation and attack/defense plans before kickoff; these selections are used by the simulator for all team types.
3. Pause and halftime expose the **same** usable tactics UI; changing any legal setting visibly changes on-field AI, and true substitutions preserve fatigue and match state.
4. AI and controlled players both drain stamina from measured actions; tired players demonstrably run/tackle/shoot differently; halftime and post-goal stamina is correctly preserved or partly recovered.
5. Mood-driven interactions include at least one beneficial and one harmful dialogue/gift outcome for each original Japan character, including an interpretable face change and in-match behavior impact.
6. Scorers celebrate while conceded-team players can cry, get angry or sulk in varied character-specific scenes; tackle knockdowns and recovery are visible.
7. All existing tests and new invariant checks pass; add five real-device input/playtest sessions before calling the release approved. **No milestone is marked 'complete' on menu presence alone.**

## 7. Reference material and provenance

1. Contemporary/near-original instruction manual transcription, Japanese, includes fouls/free kicks and individual characters: https://setsumei.cloudfree.jp/famicom/nekketsusoccerleague/nekketsusoccerleague.html
2. 2008 original mechanics, moves, 12 Japan profiles, item & phone mood interaction matrices: https://gamefaqs.gamespot.com/nes/570716-kunio-kun-no-nekketsu-soccer-league/faqs/53977
3. RCREX 2004 walkthrough / opposing strengths and defensive moves: https://gamefaqs.gamespot.com/nes/570716-kunio-kun-no-nekketsu-soccer-league/faqs/30061
4. Screenshots of formations, postgame and management, MobyGames: https://www.mobygames.com/game/25090/kunio-kun-no-nekketsu-soccer-league/screenshots/
5. Screenshot/rules commentary: https://gamecola.net/2014/09/localization-anxiety-kunio-kun-no-nekketsu-soccer-league/
6. Publisher-era catalog summary: https://gamecatalog.net/kunio-kun-no-nekketsu-soccer-league/
7. Game source: locally supplied `nekketsu_hd_v060` (modules and build scripts). ROM reference `Kunio Kun no Nekketsu Soccer League Twin Shot (Hack).nes` was **not executed or compared frame-by-frame** in this audit.

**Rights boundary:** Mechanic recreation/new art is distinct from distributing the original Nintendo sprites and copyrighted soundtrack. Using exact character likenesses, historical/modern player images and club marks for a public release requires an appropriate rights review; development should preserve original-asset substitutions.

## 8. Every testable feature: full evidence matrix

For machine-filterable evidence and future work allocation, use accompanying `feature_matrix.csv`. Current status counts:

| Status | Items | Share of checklist |
|---|---:|---:|
| Done | 5 | 6% |
| Partial | 53 | 60% |
| Missing | 31 | 35% |
| **Total** | **89** | **100%** |

**These are counts, not project-effort completion percentages.** Detailed status by subsystem:

| Subsystem | Done | Partial | Missing | Total |
|---|---:|---:|---:|---:|
| Foundation | 2 | 6 | 0 | 8 |
| Graphics | 0 | 8 | 4 | 12 |
| Gameplay | 0 | 16 | 8 | 24 |
| Team Management | 0 | 6 | 10 | 16 |
| Modes | 0 | 3 | 2 | 5 |
| Content | 2 | 7 | 1 | 10 |
| Career | 1 | 5 | 2 | 8 |
| Network | 0 | 0 | 2 | 2 |
| Quality | 0 | 2 | 2 | 4 |

### Detailed 89-feature checklist

| ID | Origin | Category | Feature | Status | Next step |
|---|---|---|---|---|---|
| 1 | B | Foundation | Independent game engine, not NES emulator | Done | Keep migration-ready architecture |
| 2 | U | Foundation | Playable PC browsers | Partial | Firefox, Edge, Safari and GPU matrix |
| 3 | U | Foundation | Playable phones via browser | Partial | Real Android/iOS landscape and multi-touch QA |
| 4 | U | Foundation | Keyboard control | Done | Add binding editor |
| 5 | U | Foundation | Gamepad control | Partial | Physical Bluetooth/USB controller matrix |
| 6 | U | Foundation | Touch virtual controller | Partial | Portrait/landscape comfort, latency and multitouch checks |
| 7 | U | Foundation | Offline/PWA, browser saves | Partial | PWA install/device migration regression |
| 8 | U | Foundation | Professional settings and full options menu | Partial | Complete graphics/audio/control/accessibility settings |
| 9 | B | Graphics | Genuine HD redraw, not ROM upscaling | Partial | Artist-authored per-action sprite atlases and polish |
| 10 | B | Graphics | Kunio style exaggerated giant heads | Partial | Hand designed authentic-style silhouettes and motion |
| 11 | U | Graphics | Every player unique face | Partial | Art-direct + audit every 2592 roster entry |
| 12 | U | Graphics | Recognizable faces for real players/legends | Partial | Hand-tuned stylized identity silhouettes and quality reviews |
| 13 | U | Graphics | Large field, correct player-to-field ratio | Partial | Frame-based reference and real-device scale tuning |
| 14 | U | Graphics | National flag artwork for all teams | Missing | Flag assets for nations, including England-specific treatment |
| 15 | U | Graphics | Club emblem/flag for all club teams | Missing | Separate licensed/fictional club badge and country flag |
| 16 | O | Graphics | Original HUD character portraits+mini field | Partial | HD layout based on documented screenshots |
| 17 | B | Graphics | Funny custom goal celebrations | Partial | Per-player/per-team character animations and cutscenes |
| 18 | B | Graphics | Conceding-team crying/sadness | Missing | Losing animations, tear effects, situational expressions |
| 19 | O | Graphics | Funny referee/crowd/character reaction scenes | Missing | Character-driven contextual reaction library |
| 20 | U | Graphics | Visual kit, hairstyle and player customization | Partial | Save preview, jersey numbers, signature faces and portraits |
| 21 | B | Gameplay | 6 vs 6 players, ball physics, goals | Partial | Deep physical/play-feel and exploit tests |
| 22 | U | Gameplay | Proper slower run and ball speed | Partial | Match pacing reference and user playtesting |
| 23 | B | Gameplay | Context shoot/pass/tackle/chase/commands | Partial | Accurate original A/B teammate/counterattack context matrix |
| 24 | O | Gameplay | Walk, double dash, hustle, eight-way motion | Partial | Original mechanics state machine |
| 25 | O | Gameplay | Jump, ball float, aerial headers, flip kicks | Partial | Airborne context states/trigger tests |
| 26 | O | Gameplay | Team stacking, cooperative flip kicks, ball riding | Missing | State-based team interaction and collision tests |
| 27 | O | Gameplay | Diving headers, dribble feints, rolling crawl | Missing | Attack/movement animation and collision system |
| 28 | O | Gameplay | Shoulder tackles, slides, strikes and knockback | Partial | Hitboxes, clash and original contextual combinations |
| 29 | B | Gameplay | Stunned knocked-down players recover | Partial | Recovery animation, immunity/stagger damage and emotion |
| 30 | O | Gameplay | Player-specific defensive special abilities | Missing | Implement drill, explosive, triple accel, tornado punch, etc. |
| 31 | O | Gameplay | Goalkeeper catch, punch, dive, retaliation | Partial | Keeper timing, collision, special moves, controls |
| 32 | O | Gameplay | Free kicks, referee penalties/fouls | Missing | Rule event system and set piece placement |
| 33 | B | Gameplay | Penalties and post-draw shootouts | Partial | Keeper/special timing and original mode rules |
| 34 | O | Gameplay | 2 x 2 minute halves / kickoff/halftime | Partial | Break time strategy and emotion setup |
| 35 | B | Gameplay | Special shot for all Japan 12 | Partial | Capture animation+paths+damage+timing |
| 36 | B | Gameplay | Special shot for each opposing classic team | Partial | Reference original shot name/movement for each team |
| 37 | O | Gameplay | Timed apex aerial shot and common alternate shot | Missing | Classic precise time-window shot model |
| 38 | O | Gameplay | Weather wind, lightning, tornado, rain | Partial | Electrified ball, field modifiers and authentic weather forecast |
| 39 | O | Gameplay | Grass/dirt/sand/wet patches, unique speed type D | Partial | Per-patch mud, dirty-ball behavior, 4WD D speed type |
| 40 | O | Gameplay | Individual opponent personality/team strengths | Missing | Nation-specific captain, temperaments, combat abilities |
| 41 | B | Gameplay | Smart tactical offensive and defensive AI | Partial | Dedicated tactics+role brain, formation marks, reaction quality |
| 42 | U | Gameplay | Player stamina drains when acting | Partial | Energy drain by action and recovery per simulation tick |
| 43 | U | Gameplay | Stamina impacts pace, accuracy, injury | Missing | Modifiers + low-energy animation/AI responses |
| 44 | U | Gameplay | Persistent stamina through goals/halftime | Missing | Player runtime state persistent between kickoffs |
| 45 | B | Team Management | Team formation from multiple presets | Partial | Tactical shape presets and drag/drop positioning for both |
| 46 | B | Team Management | Starting six chosen from 12 subs | Partial | Unified before/during menu with actual swaps and costs |
| 47 | U | Team Management | Select captain and assistant | Missing | Captain picker; mood influence and pitch leadership |
| 48 | U | Team Management | Choose corner, free kick and penalty takers | Missing | Saved per-team primary+backup takers |
| 49 | B | Team Management | Offensive style: pass/shoot/build-up | Partial | Per-team passing/shooting parameters + AI decisions |
| 50 | B | Team Management | Defensive style: tackle/press/keeper roaming | Missing | Press line, tackling aggressiveness and goalkeeper area |
| 51 | U | Team Management | Change full management before game starts | Partial | Match ready room with validated lineup and tactics |
| 52 | U | Team Management | Change full management while game paused/halftime | Partial | Full shared tactics panel and both teams rules |
| 53 | O | Team Management | Position suitability shown by facial expression | Missing | Role fit and mood expression logic |
| 54 | O | Team Management | Player personality/likes/dislikes | Missing | Personality entries for Japan 12 using manual |
| 55 | O | Team Management | Mood 0–15 with gameplay effects | Missing | Mood change rules, teamwork/AI multipliers |
| 56 | O | Team Management | Talk to player, risky morale outcome | Missing | Personality-based dialogue choice and consequences |
| 57 | O | Team Management | Give items with positive/negative character effects | Missing | Historical item favorites/reaction matrix |
| 58 | O | Team Management | Phone Misako and others to affect squad | Missing | Team-level calls, effects and dialogue |
| 59 | B | Team Management | Bench talks / halftime pep talks | Missing | Pep-talk scenes and personality reactions |
| 60 | O | Team Management | Weather forecast / music selection / captain profile | Partial | Pre-match clubhouse UI |
| 61 | O | Modes | Original Nekketsu League 12 countries / 36 matches | Partial | Max 3 matches/opponent, historic conditions and milestones |
| 62 | O | Modes | Original 4-match Technos Cup Italy final | Partial | Bracket and accurate opponents/rewards |
| 63 | O | Modes | Original two to four player versus and GK support | Missing | 3rd/4th goalie owners with mixed input and parity |
| 64 | O | Modes | Original 1–2 player standalone PK mode | Partial | Authentic goalie handling and rules |
| 65 | O | Modes | Original music selection, passwords, endings | Missing | Licensed original alternatives, cutscene and archive-style code |
| 66 | U | Content | 32 top modern national teams (2026) | Partial | Verify source and correct country selection and squads |
| 67 | U | Content | 32 leading modern clubs (2026) | Partial | Season-specific official roster and crest verification |
| 68 | U | Content | Six iconic 1996–2016 squads | Partial | Verify exact season and likeness and roles |
| 69 | U | Content | All 13 classic Nintendo countries and 12 Japan players | Partial | Recreate unique opponent identities and character behavior |
| 70 | U | Content | 12 players on every selectable team | Done | Maintain roster constraints in schemas |
| 71 | U | Content | Complete actual roster identities | Missing | Roster ingestion + provenance + licensing plan |
| 72 | U | Content | All UEFA Champions League clubs | Partial | Real fixtures/squads and yearly update |
| 73 | U | Content | All five other continental champion fields | Partial | Reliable annual data sync, exact rules + qualification |
| 74 | U | Content | Top six highlighted clubs per continent | Done | Review annual rankings and regional selection |
| 75 | U | Content | Club builder and team customization | Partial | Identity/logo editor and full roster formation |
| 76 | U | Career | Choose any modern/continental club to manage | Done | Verify real league assignments and deep club modes |
| 77 | U | Career | Transfers and buying players | Partial | Contracts/depth, transfer windows, advanced transfers |
| 78 | U | Career | Player growth/XP/training | Partial | Potential, progression profiles, archetypes and aging |
| 79 | U | Career | League/cup seasons and season rollover | Partial | All domestic leagues, season calendar and promotions |
| 80 | U | Career | Scouting/youth academy/facilities/sponsors | Partial | Meaningful economy, style and player development effects |
| 81 | U | Career | European & other continental qualification from domestic finishes | Missing | Domestic season-to-continental competition integration |
| 82 | U | Career | Continental tournament campaigns finishable | Partial | Full draw and match regulations home/away |
| 83 | U | Career | Stadium/team building/advanced governance | Missing | Club facilities, staff, fan bases and infrastructure |
| 84 | U | Network | Online multiplayer and matchmaking | Missing | Deterministic simulation, server, matches and reconnection |
| 85 | U | Network | Online rankings, seasons and cloud saves | Missing | Account service, rankings, privacy and sync |
| 86 | U | Quality | Extensive match and UI regression testing | Partial | Continuous test suite, recorded gameplay and reference golden tests |
| 87 | U | Quality | Source-editable extensible architecture | Partial | TypeScript+data validation+asset bundle separation |
| 88 | U | Quality | Commercial-quality character/audio assets | Missing | Art/music production and licensing pipeline |
| 89 | U | Quality | Graphics/performance at 60 fps on target devices | Missing | FPS/memory/resource checks on actual devices |

**Origin legend:** U = explicit user requirement, O = documented original game requirement, B = both. Evidence per item, source paths and caveats are in `feature_matrix.csv`.


---

## Addendum — 13 October 2026, Increment v0.6.1 (AI difficulty)

- **New requirement #90: Five distinct CPU AI difficulty levels** — implemented and tested.
- **Bug resolved:** difficulty `0`/Rookie no longer falls back to Normal via `||2`.
- **Behavior differentiated:** movement speed, reaction intervals, target anticipation, attacking decisions, pressure radius, pass tendency, tackle likelihood, shot spread and keeper anticipation, including penalty challenges.
- **UI:** difficulty selectable globally, before Quick Match/Versus/Training kick-off, and live from pause menu. Selection stores in browser options. Other game modes use the global difficulty; dedicated per-tournament UI remains future work.
- **Scope limitation:** these are CPU heuristics, not trainable reinforcement-learning agents; teammates remain at Normal assistance by design; difficulty balance has not been measured against actual human players.
- **Testing:** Node simulation, career, all-six-continent campaign completion, AI unit tests, desktop/mobile Chromium UI tests all pass. Chromium is headless and mobile is emulated. Local browser storage was shimmed because local HTTP navigation was disallowed in the test environment; actual disk persistence remains unverified in that test.
- **Unchanged:** the 89-item baseline is retained. New row #90 appended in `FEATURE_MATRIX_90_ITEMS.csv`.


---
## v0.6.2 addendum — Player attributes (2026-10-13)

**Source baseline:** v0.6.1. **Change type:** backward-compatible numerical stat layer and live match effects. A new 14-item user request is tracked as rows 91–104 in `FEATURE_MATRIX_104_ITEMS.csv`, bringing the inventory to **104**. The previous audit remains a historical snapshot and does not describe the new code.

**Implemented this iteration:** 12 independent numeric 1–100 player attributes, computed deterministically for older/fictional squads without claiming official ratings; optional typed `superAbility` and `gkSuperAbility` data; fatigue drain for human/CPU, partial recovery, speed/shot impact, across-goal persistence; tackle aggression/strength contests; shot accuracy, pass/cross differences, header contribution and GK jumping/handling. HUD displays controlled-player energy. All 216 teams remain eligible.

**Gaps kept open:** explicit heading and crossing inputs, unique defense or GK super abilities as gameplay actions, match-to-match stamina persistence, advanced substitutes, injury/referee, tactics, reference-perfect attacks, physical device and full-match difficulty balance. These are NOT reported as complete in strict acceptance.

**Testing:** `npm test`, `tests/stats_browser_qa.py` on headless desktop/mobile Chromium, and compatibility build. See `TEST_REPORT_v062.md`.

**Next:** v0.7.0 flags and live shared team-management, then v0.7.1 stamina-substitution/fitness integration.


## 2026-10-13 incremental audit update (v0.6.3)

Twenty new user requirements are tracked as #105–124. Kit variants and pregame kit choice are fully functioning procedural art systems. Running speed and agility are separate gameplay stats and tested on CPU/player locomotion. All other requested player-creation details remain partial or missing and are subdivided into 0.9.x milestones; see `PLAYER_CREATOR_SPEC_v063.md`. **Tracking total: 124 requirements**. The current game is still an alpha with historical, player-art and real-world data gaps.

---

## 2026-10-13 — Incremental progress checkpoint v0.7.0

**New milestone:** club/national identity and tactics command center. Delivered as `Nekketsu_Legends_HD_v0.7.0_Play.html` and editable source ZIP.

- Added offline, original procedurally generated club badges and ISO country-emoji flags for all 216 prebuilt team identities (flag glyph appearance depends on platform). No claim of official club crests.
- Added stable per-team formation, 6/12 squad selection, captain, penalty/free-kick/corner takers, attacking and defensive instructions. Available before kickoff or while paused / halftime. Tactics now alter AI movement/pressing/pass and shooting bias; captain affects pass quality; penalty taker affects penalties.
- Live lineup replacements retain score/clock and player fatigue. Formations validate one active goalkeeper and unique starting players. Free-kick/corner takers are stored only; their gameplay is not implemented.
- **Regression:** `npm test` and `npm run qa` pass, including pre-existing league/career/continental and desktop/simulated mobile flows. Explicit test evidence: `docs/TEST_REPORT_v070.md`.
- **Next:** v0.7.1 refined stamina/substitution rules. Keep original Nintendo morale, celebrations, goalkeeper defensive moves, and full player creator in subsequent focused milestones; do not claim complete original parity.

Tracking: `docs/FEATURE_MATRIX_124_ITEMS.csv` contains all 124 requirements with revised factual statuses.


## Audit delta: v0.7.1 (13 October 2026)
Since the v0.6 historical audit, the updated 124-item tracker records v0.7 command center and v0.7.1 fatigue/substitution work. Players now have a 12-person fatigue ledger, action-rated exertion, partial halftime recovery, three-substitution limit/no reentry, CPU halftime replacements and manager condition updates. **Still incomplete:** injury enforcement on starting lineups, complete licensed teams/portraits, the original Nintendo morale/gifts/crying mechanics, exact defensive abilities and online multiplayer. See specific changelog/test report and keep strict acceptance statuses for partially completed systems.


## Brand and mobile display delta (v0.7.2, 2026-10-13)
Supermagic Football is the new **provisional** project name. UI, docs, app metadata and packages updated; original Nintendo reference names retained only as historical research. Live browser fullscreen tested for desktop and emulated Android landscape; iOS Add-to-Home-Screen instructions added. Native iOS and legal clearance remain gaps. Morale now targeted at v0.7.3. See `TEST_REPORT_v072.md`.


## v0.7.3 addendum (13 October 2026) — later development, not part of original v0.6 audit

This historical document describes the read-only v0.6 audit. v0.7.3 now adds 0–100 procedural personality/morale, pre-match and halftime talks, movement/shooting/tackle morale influence, conceder crying, comic hit sparkles and celebration variations. Corresponding feature tracker rows 17, 18, 29, 54, 55, 56 and 59 are now Partial, not complete; original 0–15 moods, Misako calls, gifts, authentic specific roster personalities, character cutscenes and 4-player original mode remain unresolved. See `CHANGELOG_v073.md`, `MORALE_SPEC_v073.md` and `TEST_REPORT_v073.md`.


## Release update — v0.8.0 (13 October 2026)

Implemented the first **four** rare defensive/goalkeeper super moves in the independent game engine. Integrated Special button and CPU choice, action hit/stun/save mechanics, energy/cooldown and comic rings; preserved legacy transforming shots and prior systems. Details in `SUPER_ABILITIES_SPEC_v080.md` and `TEST_REPORT_v080.md`. Classic-game move fidelity and rare moves for all national teams remain **partial**. Next scope v0.8.1: diving, jump timing, aerial combo and hyperdash; maintain backward compatibility.


## Incremental checkpoint v0.8.1 — 13 October 2026
Completed a limited hyperdash / timed airborne header / ordinary GK dive subsystem. It reuses the existing engine, fitness and NPC logic, keeps older save compatibility and rare moves, and passes dedicated Node + Chromium desktop/phone-emulated tests. Team stacking and original apex-shot timing remain open; next milestone v0.8.2. Full results: `docs/TEST_REPORT_v081.md`.


## 2026-10-13 v0.8.2 checkpoint — Supermagic Football

Added a bounded two-player cooperative launch, normal flip kick, timed airborne transforming combo shot, and landing knockdown. Actions are wired to Pass+Jump / Shoot / Special with rated stamina and cooldown; no new controller button required. Exact original Nintendo stacking, ball riding and 1993 timing remain unverified. All 126 tracked requirements were preserved; rows 25, 26 and 37 have updated partial statuses. Development next proceeds to teammate AI/fidelity and then the staged player creation system. Release acceptance: 12 Node gameplay suites, Chromium keyboard/touch and regression tests (see v0.8.2 report).


## Addendum 2026-10-13 — v0.8.4 input migration

- Migrated mobile gameplay UI to a cross/diamond of four actions, with contextual ownership-dependent actions.
- Added goalkeeper-aware aim, low-accuracy randomness, delayed passive player switching and pop-up-free special shots.
- Baseline backlog extended from 126 to **152 requirements**. See `FEATURE_MATRIX_152_ITEMS.csv` and `INPUT_REDESIGN_SPEC_v084.md`.
- Next bounded milestone: v0.8.5 player collision resolution (symmetric knockbacks, brief stun, no overlap) and, only if robust, dribble-type schema. Separate versions for the 10 unique dribble animations/tricks and custom controls.
- Test evidence and known limitations: `TEST_REPORT_v084.md`. Do not mark collisions, double Dribble tricks or remapping as complete.


## Current checkpoint v0.8.5
Player collision added and collision/generic regressions repeated. The tracker now has 180 entries including the latest user additions; this is not a claim that 180 features are implemented. The active roadmap is `NEXT_MILESTONES.md`.


## v0.8.6 incremental audit update
New features #181–184 added to the canonical tracker: organized UI/menus, iconography, cartoon team flags and crests, and expressive detailed cartoon characters. They are scheduled **after** the remaining four-button milestones. v0.8.6 includes only bounded control and AI changes. See `NEXT_MILESTONES.md` and `TEST_REPORT_v086.md`.


## v0.8.10 addendum — cartoon team identities (13 October 2026)

All 216 current teams have offline vector identity artwork. 165 receive original club shields, 51 receive stylized flag artwork; symbols show in setup, standings, scoreboard, club lists. This is a partial completion of interface requirements, not verified official flags or crests. Roster/BPW corrections remain deferred. See `NEXT_MILESTONES.md` and `TEST_REPORT_v0810.md`.
