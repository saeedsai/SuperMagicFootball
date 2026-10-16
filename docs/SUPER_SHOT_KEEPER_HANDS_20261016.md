# Super Shot fairness + keeper hand possession — 16 October 2026

**Source base:** `dbbfb2013957be24f312d63aa9f882753b8f07f3`, with newer small commits preserving that ancestry and later agent changes if present. This is an incremental update to the current modular game, not a rewrite.

## Features added
1. **Super Shot fairness:** `data/mechanics/gameplay.json → physicsTuning.superShot.speedMultiplier = 0.96` (allowed inclusive range 0.85–1.00) and `fatigueMultiplier = 1.08` (1.00–1.35). Actual `shoot(p,true)` launch speeds are reduced 4% at the same player stats, stamina, shot type and level. Both normal Super Shot and combo-Super nominal action fatigue are 8% higher through the existing stamina formula. Normal pass and shot velocity, legacy save schema and fixed-team rosters are unchanged.
2. **Goalkeeper hand possession:** real keeper possession anchors ball to `x=p.x+8*face`, `y=p.y+8`, `z=p.z+82`, versus earlier foot-level carrier behavior. A clean catch preserves the normal `keeperCatch` / `keeperDiveCatch` animation, then enters a `keeperHold` state. Lower-pressure CPU keepers can carry briefly (up to 1.35 seconds or ~0.95 seconds at an AI decision); they can distribute after 0.28 seconds when a pressing opponent is within 210 world units. Existing `distributeKeeper` still releases a legal pass/clearance. No extra buttons or saved player fields.
3. **CI and tests:** bounded live JSON validation; two new Node behavior/source checks; a new Playwright browser test checks actual Super Shot velocity/fatigue ratios versus an injected prior-coefficient baseline and checks catch/hold/throw on desktop and simulated touch. Historical service-worker cache assertions have been synchronized to `smf-082535-super-keeper-hold-v1`.

## Executable gates
```
python3 scripts/validate_data.py
python3 scripts/build.py
node --test tests/*.test.cjs
python3 tests/super_keeper_balance_browser_qa.py
```

GitHub `Modular Game Dev QA` and `Full Regression Census` remain mandatory. The full regression runner discovers old and new Node/Chromium scripts and retains exact-commit artifacts. The separate GitHub Pages deployment checks hosting, and `Verify Deployed PC and Touch Game` exercises actual browser match boot. **GitHub Actions outcome for the newest commit must be inspected before claiming release certification.**

## Risks and open gap
The owner also requested **more active autonomous goalkeeper dives**. This has **not been implemented** in the first patch; adding artificial early contact can reintroduce previously resolved off-plane goalkeeper blocks. Next: measure and increase proper approach-phase dive attempts with matching seeded replay and corner scoring checks. Also refine the hand-holding glove animation across all eight art views and review unpressured distribution timing. Physical-phone, offline/PWA, and restart/save persistence remain deferred by the existing owner-approved scope.
