# Wide camera framing polish — 3 November 2026

## Change

The Graphics settings' **Wide** camera now scales the pitch view to 86% while retaining the same logical HUD and overlay scale. It shows 16.3% more world width at a fixed viewport. The camera follow target and clamp bounds use the expanded world viewport; penalty framing is centered using the selected view height. Follow retains its prior 1:1 framing and faster ease. Player/ball simulation, positions, hitboxes, pitch geometry, controls, and saves are unchanged.

## Validation

`tests/pitch_length_browser_qa.py` now exercises desktop (1280×720), landscape touch (844×390), and portrait touch (390×844) using installed Chrome/Edge discovery, and compares both camera modes on each viewport. All three checks pass: Wide reports 1.163× the Follow world-width, the camera tracks both pitch ends, kickoff formation invariants hold, and the browser reports no page errors. The full local Node suite passes 1,773/1,773 plus the club roster fixture; data validation passes (223 teams, 2,676 players, 84 presets). The portrait case is a renderer/framing harness check; the game continues to recommend landscape orientation.

Owner visual review, physical-device confirmation, exact-head CI and deployment remain separate acceptance gates.
