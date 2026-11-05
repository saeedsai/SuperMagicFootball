# Candidate 0.12.81.43 — local validation (5 November 2026)

## Scope

- Fast ordinary shots use a smooth, two-layer wake drawn from existing ball-trail history. A short fallback covers newly launched balls. Reduced-flash mode uses a shorter, fainter, steady cue. The renderer does not modify ball state or shot physics.
- Archived Online Career standings now have a season-specific accessible table name, scoped column headers and scoped team row headers. Keyboard QA opens the archive and verifies the table semantics and representative team data.
- Online Career archive season IDs and standings/fixture projections are read inside one repeatable-read transaction, preventing one response from combining multiple season-progress snapshots.
- The existing four-button ability paths were audited across keyboard, touch, and default/remapped gamepad input. No defect reproduced, so no input-binding source change was made.

## Focused validation

- `node --test tests/game_ball_surface_render.test.cjs tests/ordinary_shot_wake.test.cjs`: **10/10 passed**. Full actual-renderer Chromium QA sampled six ordinary shots at match scale, including a below-threshold speed; trail intensity/length followed the expected hierarchy, the ball JSON state remained unchanged, and there were no page errors.
- `node --test tests/super_shot_gamepad_access.test.cjs tests/super_defence_input_path.test.cjs tests/magic_trick_input_path.test.cjs tests/dribble_input_paths.test.cjs tests/four_button_controls.mjs tests/ct19_gamepad_cancel_resume.test.cjs tests/ct19_gamepad_disconnect_reconnect.test.cjs`: **9/9 passed** across keyboard, touch, default and remapped gamepad routes. This is software input coverage, not physical-device or human balance acceptance.
- `node --test tests/online-career-service.test.cjs`: **13/13 passed**, including repeatable-read archive query boundaries.
- `python -X utf8 tests/online_account_ui_browser_qa.py`: passed mocked browser QA for keyboard-opening the archive and accessible standings table. This uses mocked API/auth boundaries; no hosted service or assistive-technology review was performed.
- After updating all release/version/cache metadata to .43, `npm run test:node` passed: build **5,171,581 JS / 5,294,593 HTML characters**, tracked Node suite **2,219/2,219**, and the Club26/FC27 executable passed. Release/version contracts passed **22/22** and `git diff --check` passed.
- `python -X utf8 tests/online_account_ui_browser_qa.py` passed the final bundle's mocked Career/UT flows, keyboard archive navigation and accessible standings-table checks. No assistive-technology device review was performed.

## Limits

Candidate .43 source `5162f995d32f8f85d15df3a794ff2772b4a0eff4` passed exact-head dev Census [41973054866](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41973054866) and Modular QA [41973054716](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41973054716), protected promotion, Pages deployment [41973977176](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41973977176), and main Census [41973977929](https://github.com/saeedsai/SuperMagicFootball/actions/runs/41973977929). The unrelated Concept Hero and Concept Modular workflows failed, but those scopes are explicitly deferred and are not the release gates.

UI and visual evidence is automated and does not establish owner approval, physical-device acceptance, or an assistive-technology review. The database work was validated with the service test harness, not a live PostgreSQL concurrency test. Authenticated public online service configuration remains unavailable, so server-backed online play is not live.
