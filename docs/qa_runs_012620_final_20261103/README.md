# Candidate 0.12.62 Chromium census attempt — 3 November 2026

## Result

**Not accepted as a full browser census.** The four portable-Chromium shards could not complete cleanly in this local environment. Multiple unrelated existing browser scripts timed out while loading the same large `play.html` fixture: Playwright `Page.set_content` or `Page.goto` exceeded its 30-second page-load timeout. One script also hit the runner's 90-second per-script cap during the initial four-shard run. Lowering concurrency and increasing the runner cap did not eliminate the load timeouts. The incomplete batches were stopped; they are not a 200-test acceptance result.

Examples observed during the attempts included `ai_browser_qa.py`, `abilities_browser_qa.py`, `art102_mace_sweep_visual_browser_qa.py`, `art102_spin_bumper_pose_browser_qa.py`, `career_backup_restart_browser_qa.py`, `halftime_tactics_return_browser_qa.py`, `magic_lightning_ai_counter_browser_qa.py`, `magic_mud_trick_browser_qa.py`, `magic_scream_ai_counter_browser_qa.py`, `master_ui_contracts.py`, and `penalty_area_foul_browser_qa.py`. The reported failure stage was page setup/load rather than a gameplay assertion.

`dribble_styles_browser_qa.py` initially missed its Rainbow double-tap event during the four-shard run. The same script passed when rerun alone with `browser_runner_compat.py`, including desktop keyboard and simulated Android touch, four-button UI, style selection, and rendered game screen. This supports a load-sensitive test failure for that case; it does not convert the incomplete shard run into a full acceptance pass.

## Other candidate validation

- Full local Node suite: **1,809/1,809 passed**, followed by the club fixture.
- Data validation: **223 teams, 2,676 players, 84 avatar presets; zero errors**.
- Focused shot recovery Canvas QA: nine distinct launch/down/get-up/confusion/reduced-flash phase renders, no page errors, and unchanged player/ball physics.
- Focused reduced-motion weather Canvas QA: **10 scenarios passed**, with moving normal-mode Rain/Wind/lightning and visible pixel-stable reduced-motion cues.
- Focused keeper roll-release Canvas QA: both directions rendered at least four distinct character-only phases per side, with four controls, roster identities, and gameplay unchanged.
- Focused Career suite: **177/177 passed**; 83-club Career scenario passed.
- Versioning contract: **16/16 passed**.

Rerun the complete four-shard portable-Chromium census when the local page-load bottleneck is resolved. No hosted deployment, physical-device, screen-reader hardware, or owner visual acceptance is claimed here.
