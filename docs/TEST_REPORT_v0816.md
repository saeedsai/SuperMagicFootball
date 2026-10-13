# Supermagic Football v0.8.16 — Validation and Regression Test Report

**Scope:** five-tier special shot/defence/GK ability power, fatigue, rarity, old-save compatibility, browser gameplay and existing feature preservation.

## Test execution

| Test group | Result | Notes |
|---|---|---|
| Node game-logic suites (`npm test`) | **26 / 26 PASS** | 25 inherited suites + new `special_levels.mjs` |
| Tier-specific roster and mechanic validations | **PASS** | 216 teams, 2,592 records; 4 distinct level-5 and 11 level-4 names; custom override, strong/weak comparisons, slow transformed shot invariant |
| Inherited browser QA (`npm run qa` scripts) | **19 / 19 ultimately PASS** | Run in three batches due prior execution limits. One Android flying-kick failure under combined timing load passed isolated rerun. |
| New super-level browser QA | **Desktop + simulated Android PASS** | Game initialization, tier-5 super shot, 12-player roster, HUD label, zero JS exceptions |
| Additional browser suites | **Desktop + simulated Android PASS** | Active pressing, secondary controls, cartoon identities, character art; fullscreen + save migration passed |
| Roster browser QA | **Desktop + simulated Android PASS** | Featured clubs, GK starters, command center and kickoff |
| Build | **PASS** | `python tests/build.py` generates offline `play.html` with special-level module bundled |

## Legacy browser suite detail

The standard 19 scripts were run: tactics, kits, continental, manager, save export/import, AI difficulty, player stats, fitness, morale, super abilities, aerial mechanics, teammate combos, AI combos, four-button input, collisions, phase-2 controls, dribble styles, penalties and home dashboard.

- First six passed in sequence.
- Next seven passed in sequence.
- Final six: four-button layout and collisions passed; **simulated Android flying-kick** check in `four_button_phase2_browser_qa.py` initially failed to observe an event while desktop passed. Rerunning that script in isolation passed for desktop and Android. The last three scripts passed in sequence.
- This is recorded as an intermittent timing-sensitive test result, **not a clean first-pass full browser run**.

## Level-move acceptance details

- Level-5 default identities: Lionel Messi, Cristiano Ronaldo, Kylian Mbappé, Erling Haaland.
- Level-4: 11 distinct names in shipped rosters; only named editorial stars qualify by default.
- The power, defensive stun and goalkeeper clearance scale monotonically; tier-5 special fatigue is lower than tier-1.
- Fish/ghost-like slow shot velocity stays unchanged by tier; the earlier airborne-to-goal and timed transformation reset logic continues to pass inherited tests.
- Manual per-player level overrides are accepted only for integer values 1–5; invalid values fall back to defaults.
- Save export/import and earlier player records without level fields remain supported.

## Important limits

The milestone does **not** include skill/ability XP progression, 30–40 unique shots, 20 defensive moves, 10 GK rare moves, real-player official level ratings or complete real-world roster verification. Real Android/iPhone, Safari/Firefox, physical controllers, online play and long-session human gameplay balancing remain unverified.
