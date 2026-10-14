# Goalkeeper interaction specification — v0.8.19

## What ships now

1. **Goalkeepers are autonomous on both sides** (including the human's team). No new gameplay buttons or manual goalkeeper-dive key.
2. **Collect/catch:** ordinary loose-ball keeper contact, or a low-force incoming ball reached by an automatic dive, creates possession. Emits `keeperCatch` with `source: loose|dive`, resets `keeperHold` and briefly shows a catch pose/label. Successful ordinary-dive saves emit separate `save` events with `saveType: dive`; this avoids overwriting the top-level event type.
3. **Parry:** high-force reachable dive attempts deflect the ball out into play and emit `save` with `saveType: dive`, `deflected: true`. There is no automatic conversion of a hard-shot parry into possession.
4. **Short throw:** if goalkeeper holds the ball, is unpressured, and there is an unmarked receiver with a clear passing corridor, release a relatively flat/short throw. Emit `keeperDistribution.mode=short`; visually show THROW.
5. **Long punt:** if the keeper is pressured within 330 world units, the user explicitly asks for a long release, or no safe throw lane exists, use an elevated punt into an advancing open corridor. Score both teammate destinations and empty spaces, preferring distance from opponents. Emit `keeperDistribution.mode=long`; visually show PUNT. A punt can still be intercepted in a dynamic match; it is not guaranteed possession.
6. **Holding period:** AI keepers normally hold up to about 0.65 seconds, checking more rapidly when pressured, then distribute automatically. Both teams' keepers use this logic, including the player's team.
7. **Player control:** only PASS, SHOOT, DRIBBLE and JUMP exist as gameplay action buttons. PASS/SHOOT are context-sensitive if the goalkeeper has possession; the keeper is not manually selected.

## Edge-case / quality constraints

- Both direction signs tested (home GK clears right; away GK clears left).
- Catch resets stale hold state to prevent immediate release of freshly caught balls.
- Under nearby pressure, explicit short distribution requests are overridden to long punts.
- Blocked short lanes are disqualified, even if the goalkeeper is otherwise unpressured.
- Ball trajectory and animation differ for throw vs punt.
- Automatic keeper dive, catch and parry are distinct game events for future audio triggers.
- No guaranteed saves or guaranteed safe clearances: player stats, shot speed, distance, path and defender positions still matter.

## Not fully complete / next

- Keeper animation art (hands and ground handling), throw/punt follow-through and realistic catch physics remain cartoon placeholders.
- Moving-interceptor prediction and additional goalkeeping tactical styles still require balancing against real match samples.
- Statistical save rates and penalty scenarios should be tested with seeded multi-match samples, not only deterministic unit setups.
- No physical device certification has been performed; goalkeeper logic changes are covered with Node and Chromium simulated Android/desktop QA.

## Verification

`npm test` includes `tests/v0819_goalkeeper.mjs`. `python tests/v0819_browser_qa.py` covers the standalone executable in desktop Chromium and simulated Android touch contexts.


### v0.8.19.3 regression-only note
No goalkeeper physics/decision change in this release. Automatic diving, catching, throwing, punting and v0.8.19.2 shot-lane anticipation are preserved by the inherited and repeated browser tests. Seeded save-rate balancing remains on the v0.8.19.4 plan.
