# Celebration player-pose polish — 3 November 2026

## Change

Twenty goal-call styles now give procedural outfield players distinct arm silhouettes: Champion Dance, Human Pyramid, Victory Lap, Superstar Pose, Goal Party, Team Wave Parade, Victory V, Fan Parade, Respectful Bow, and Kickoff Spin. Each uses a distinct arm/hand arrangement. When a goal is scored, each scorer-side player receives a deterministic offset of the selected style based on the existing player index. Teammates therefore use a varied three-or-more pose group. Opponents now have ten deterministic disappointment arm poses—hands to head, dropped shoulders, wiping tears, palms up, folded arms, turning away, frustrated clapping, pointing down, covering the face, and protesting—alongside the existing tear and crying-face artwork. Positions, physics, celebration timing, controls, saves and style selection remain unchanged.

## Validation

- `node --test tests/celebration_player_pose.test.cjs tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs`: **28/28 passed** with the final twenty celebration and ten disappointment poses.
- `python -X utf8 scripts/build.py`: game bundle build.
- `python -X utf8 tests/celebration_player_pose_browser_qa.py`: real game Canvas draws all twenty styles in all eight directional headings (160 samples), checks three distinct teammate poses for each style, verifies the poses are visible/in-bounds, and confirms the preview does not mutate player or ball state; no browser errors.
- Contact sheet: `evidence/browser/celebration_player_poses.png`.
- The contact sheets were visually inspected at full render size. All twenty celebration and ten disappointment silhouettes remain distinct through all eight facing projections.

## Limits

This improves the existing procedural fallback only. It does not create authored modular animation frames, animate face or secondary motion, implement physical stacking choreography, or satisfy owner visual approval or physical-device acceptance. Human Pyramid remains a safe braced group pose with no collision or gameplay changes.

## Validation update — ten disappointment reactions

- `python -X utf8 tests/celebration_player_pose_browser_qa.py`: 160 celebration view/style renders and 80 disappointment view/style renders across all eight directions; all twenty celebration and ten defeat poses remain individually distinct per view, fit the sampled bounds, and do not mutate player/ball state. The run completed with no browser page errors.
- Reaction contact sheet: `evidence/browser/disappointment_reaction_poses.png`; visually inspected at player scale.
- GR24 remains partial: the procedural pose library meets the lower numeric target of twenty celebrations and ten reactions but lacks authored modular animation, eligibility, and cancel/recovery acceptance; owner/device approval remains open.

## Twenty-style extension

The match selects one of twenty styles deterministically, and teammates cycle across that same twenty-style set. Updated browser gallery covers 160 celebration and 80 disappointment style/view samples plus three distinct teammate renders per celebration style. Visual contact sheets: `evidence/browser/celebration_player_poses.png` and `evidence/browser/disappointment_reaction_poses.png`. GR24 remains partial: this is a procedural pose library; authored animation, eligibility, cancel/recovery and owner/device acceptance remain open.


## GR24 deterministic pose expansion — 3 November 2026

The existing procedural renderer now cycles through 25 celebration arm poses and 15 opponent disappointment arm poses. Five celebration additions are Side Shuffle, Salute to Fans, Cross-Chest Fist, Sideline Point and Victory Spread. Five opponent additions are Clutch Chest, Disbelief Spread, Hands on Hips, One-Arm Shrug and Temple Press. All changes are bounded arm joint positions; the existing direction projection, body artwork, crying face and root motion remain in place. Match style selection and teammate indexing are deterministic, with their range extended to 25. No player/ball physics, match state, controls, saves, or recovery behavior changed.

- Focused Node contracts: `node --test tests/celebration_player_pose.test.cjs tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **28/28 passed**.
- Browser fixture: `python -X utf8 scripts/build.py` completed successfully.
- Actual renderer Chromium gallery: `python -X utf8 tests/browser_runner_compat.py tests/celebration_player_pose_browser_qa.py` — 200 celebration style/view renders and 120 disappointment style/view renders; each of the eight headings has 25/25 and 15/15 unique render hashes; all 25 teammate groups had three distinct poses; bounds checks passed; player and ball state remained unchanged; no browser page errors.
- Full contact sheets inspected: `evidence/browser/celebration_player_poses.png` and `evidence/browser/disappointment_reaction_poses.png`. All new arm silhouettes remain inside the sample cells and visibly distinct through front, quarter, side and rear headings.

This extends only the deterministic procedural fallback. It does not provide authored animation frames, new facial animation, eligibility/cancel/recovery handling, owner visual approval or physical-device acceptance; GR24 remains partial on those gates.
