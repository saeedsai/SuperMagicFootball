# Candidate 0.12.81.19 validation — 4 November 2026

## Changes

- The in-match classic ball now has five connected inward-facing outer pentagons around its center panel. Existing spherical shading is composited over the panel artwork, so the completed surface reads as one lit ball. Ball radius, rotation, collision, physics, saved cosmetics, and no-gradient fallback remain unchanged. See [ball surface evidence](BALL_SURFACE_QUALITY_20261104.md).
- Added production-renderer QA for player transitions from run through a directional cut, stop and relaunch. This is a validation addition only; player art and gameplay behavior were not changed. See [motion transition evidence](PLAYER_MOTION_TRANSITIONS_20261104.md).
- The owner-supplied Home/menu character art remains unchanged.

## Validation

- `python -X utf8 scripts/build.py`: passed (4,993,519 bundled JS characters; 5,115,098 HTML characters).
- `node --test tests/*.test.cjs`: **1,958/1,958** passed.
- `node --test tests/release_gate_contract.test.cjs tests/versioning_policy_contract.test.cjs`: **21/21** passed.
- Focused `game_ball_surface_render`, `ability_shot_ball_shapes` and `shot_vfx_02_country_ball` tests: **16/16** passed.
- `python -X utf8 scripts/validate_data.py`: passed, 223 teams, 2,676 players and 84 avatar presets; no errors.
- `python tests/game_ball_surface_render_browser_qa.py`: passed; the actual renderer captured classic, selected cosmetic and 20-unit match-scale balls plus four airborne shadow heights, with radius 20 at match scale.
- `python tests/player_motion_transition_browser_qa.py`: passed; 64 actual-renderer samples, unchanged live match state and zero browser errors.
- `python tests/formation_starter_select_accessible_name_browser_qa.py`: passed for formation starter accessibility. Additional formation and Career lineup desktop/simulated-touch checks passed in the independent audit.
- `git diff --check`: passed (Git reported only the workspace's existing LF-to-CRLF notices).
- A four-shard Chromium attempt selected all 229 discovered scripts: 223 passed on first pass, five timed out at 55 seconds and one simulated-touch save-file import returned a transient file-read error. All six scripts passed when rerun individually, including the two UTF-8-sensitive scripts under `python -X utf8`. See [browser run and retry evidence](qa_runs_012819_browser_20261104/README.md); this is not a clean four-shard census artifact.

## Acceptance limits

The last audited clean four-shard Chromium census is candidate `.81.17` (228/228); candidate `.81.19`'s 229-script attempt was not a clean all-pass shard run, though its six failures/timeouts passed on isolated retry. Candidate `.81.18` provides current focused Career-browser evidence. AssetStudio character replacement art remains unapproved. Owner visual review, physical Android/iOS and screen-reader acceptance, two-device RTCDataChannel close/recreation, exact-head CI, hosted smoke, protected promotion and server readiness remain open.
