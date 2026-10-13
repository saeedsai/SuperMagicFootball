# v0.6 Independent HD Soccer — Feature-Gap Audit

Audit date: 2026-10-13. **This is an alpha status document**, not a claim that all requested features are fully completed. Three states: DONE = usable in this build; PARTIAL = working foundation, incomplete quality/fidelity/depth; NOT BUILT = requires new major development.

| Area | Status | Implementation/remaining gap | Concrete next fix | Priority |
|---|---|---|---|---|
| Independent cross-platform web game | DONE | HTML5 Canvas, source code, portable `play.html`, desktop/mobile touch path | Real device Safari/Android matrix, CI build | P1 |
| 216 total selectable teams | DONE | Six confederations plus existing base; no duplicated named club entries; 12 slots each | Regression validation for additions and aliases | P1 |
| European UEFA league-phase 36 | DONE catalog / PARTIAL mechanics | 2026/27 36 team catalog, eight league matches, playoff and KO | Official opponent draws, tie breakers, home/away rules and authentic dates | P1 |
| AFC Champions League Elite 32 | DONE catalog / PARTIAL mechanics | 32 listed club entries, two regions and simulated league/KO | Correct east/west assignment, official formats and brackets, reliable final participant verification | P1 |
| CAF Champions League | DONE last confirmed / OPEN new season | Last confirmed **2025/26 group stage** 16 clubs; 2026/27 not yet final | Data refresh after official 2026/27 group-stage confirmation | P1 |
| CONCACAF Champions Cup | DONE catalog / PARTIAL mechanics | 27 clubs and knockout byes; one-leg arcade simulation | Authentic home/away two-leg ties and seed/draw rules | P1 |
| Copa Libertadores | DONE catalog / PARTIAL mechanics | 32 clubs, groups/KO, simulated scoring | Exact groups, second legs and away/home pairing | P1 |
| OFC Champions League | DONE catalog / PARTIAL mechanics | 8 club groups/knockout | Official draw and qualification/performance rules | P1 |
| Six featured clubs per continent | DONE | Featured selectors on each confederation card | Verify annual rankings and update roster attributes | P2 |
| Complete 2026/27 club member data | PARTIAL | Named players for some clubs; many 12-slot squads filled with explicitly fictional academy members | Data import pipeline, club-specific 2026/27 official squad verification and source provenance per player; avoid invented certainty | **P0** |
| Cartoon identities for everyone | PARTIAL | Name-stable procedural faces and limited hand tuned star presets | Sprite sheet and portrait variants: eyebrows, nose, eyes, mouth, hair, scar, skin + per-player human review | **P0** |
| Recognizable faces | PARTIAL | Some hand curated celebrity presets; broad procedural resemblance limited | Artist-produced caricature sheets or licensed reference-based drawings with consistency QA; style art direction bible | **P0** |
| Full Nintendo-fidelity gameplay | PARTIAL | Original-inspired arcade movements, combat, weather, special shots; not frame accurate | Instrument reference animation timing, tune contact physics and shot travel per character; recording/test harness | **P0** |
| Special shot transformations | PARTIAL | 23 programmable themed effects + moving shots; many are not historically faithful | Unique keyframe art, hit boxes, ball path and GK interaction per shot | **P0** |
| Field size and slower pace | DONE tune / PARTIAL feel | Expanded world and reduced ball/player speeds, pace setting | Playtester balance sessions, dynamic difficulty, momentum and turn radius | P0 |
| Input by possession | DONE | SHOOT↔SLIDE, PASS↔CHASE, jump/special/sprint and swap | Reliable held tackle, slide timing and full controller mapping panel | P1 |
| After-goal celebrations | DONE initial | Timed comic scene, animated text, particles; pauses until kickoff | Character-based distinct animations, emotes and skips | P2 |
| Tactical match AI | PARTIAL | Basic positioning, chase and goalkeeper routines | Team shape, marking, tactical profiles, contact prediction and goalkeeper decision tree | **P0** |
| Six-on-six with 12-slot squad | DONE | Six in play, 12 roster players with editor | In-match manual substitutions, injury cards/energy and role constraints | P1 |
| Career club options worldwide | DONE initial | All modern/continental club teams start a career, global transfers | Actual national leagues with correct numbers/clubs, relegation, qualification routes and foreign rules | P1 |
| Manager finances/training/facilities | PARTIAL | Player XP, fitness recovery, contracts, youth academy, sponsors, transfers, 8-team league & cup | Realistic financial wages/contracts, scouting attributes, injuries/suspensions, fans, seasonal balancing | P1 |
| Career Champions League qualification | PARTIAL | Manager can launch cups directly for catalog entrants, not earned by domestic results | Domestic qualification slots per confederation, season scheduler, club international records and trophy cabinet | P1 |
| Official logos/kits and likeness licenses | NOT BUILT | Generic kit colors, no licensed crests | Obtain permission or ship original fictional alternatives | P1 (for commercial use) |
| True international network multiplayer | NOT BUILT | Offline/local two-player only | Deterministic state sync or rollback, authoritative relay/server matchmaking, latency tests, anti-cheat, account system | **P0** (online release) |
| Browser-to-browser cloud saves | NOT BUILT | JSON manual export/import, browser localStorage | Authenticated backend profile sync and conflict merge | P2 |
| Console-quality audio | PARTIAL | Simple synthesized audio events | Original royalty-free track pack, layered SFX, mixer and per-stage ambience | P2 |
| Physical controller and iOS Safari QA | PARTIAL | Implemented input route and Chromium mobile simulator tests | Physical Android/desktop Bluetooth gamepads and real Safari instrumentation | P1 |
| Accessibility | PARTIAL | Scalable UI and button labels | Remapping, large-print controls, reduced motion/colorblind mode, assist toggles, screen-reader menu | P2 |
| Save import integrity and version migration | PARTIAL | Product marker, size check, limited schema, v0.5 custom migration | Strict nested schema validation and safe versioned migrations, import preview, backup/rollback | P1 |
| Long-run endurance / game economy | PARTIAL | Season simulation tests and current Chromium smoke tests | Hundreds-of-match balancing, memory leak profiling, test with corrupt saves and full disk quota | P1 |

## Delivery decisions

1. Keep the **independent game engine**; do not switch back to emulation. This allows club editing, new modes, custom physics and online netcode.
2. Maintain separate `playerID`, `clubID`, `season` and `source` records, so a real footballer has the same face across national/club teams and team data can be updated without breaking saves.
3. Prioritize **mechanics and rendering fidelity** next: player movement/animations, controlled goalkeeper, character-specific shot handling, AI. Improve on-field feel before spending the majority of effort on 2500+ portraits.
4. Build a **verified roster import pipeline** with an explicit `verified`, `editorial`, `academy-filler` flag per player. Keep current placeholders until a license-compatible source exists.
5. Replace fixture approximations with **competition-rule modules per confederation** (groups, league-table tie breaks, bracket legs, seeding, qualification). The display must label the season and provenance.
6. For an online version, make match simulation deterministic and host state synchronization in a backend; browser-only peer-to-peer play is not sufficiently robust for a production manager multiplayer game.
7. Add CI acceptance gates covering physics regression tests, network determinism, all tournaments (one finalist per bracket), clubs with twelve distinct IDs, transfer economy conservation, menu interaction, and cross-device save schema.

## Data-provenance risk

The gameplay ratings and monetary values are **fictional balance data**. Named teams/players do not imply affiliation or licensing. Incorrect or outdated 2026/27 membership and identity details must be corrected using season-specific official sources before describing a real-world roster as verified.
