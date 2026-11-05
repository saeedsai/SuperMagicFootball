# Candidate 0.12.81.63 — Custom League and match-ball material

## Scope

The Cups menu now opens a playable local Custom League for 4–16 existing teams. It creates a double round-robin schedule, handles odd-team byes, advances player and deterministic CPU fixtures, updates a league table and season history, and saves its campaign under a separate local key. Career and Cup save keys and schemas remain unchanged. Saves include team identity references, stale-tab write detection, corrupt-data protection, and a session-only fallback when browser storage is unavailable.

The existing match-ball renderer also paints a fixed, deterministic, low-contrast leather-grain finish for each of the five ball models. Browser canvases are cached with a 24-surface bound. The finish changes no ball physics, radius, rotation, or persisted options.

## Local validation

- `npm run test:node` passed the production fixture build, all **2,337/2,337** Node tests, and the Club26/FC27 executable. Final build output: **5,267,847 JS / 5,391,143 HTML characters**.
- Focused Custom League, Custom Cup, and ball-surface tests passed **24/24**.
- `tests/custom_league_browser_qa.py` passed desktop and simulated-touch setup, 5-team bye, save/reload/resume, matchday result/history flow, cross-tab stale-write protection, and denied-storage session-only fallback.
- `tests/ux101_later_nav_contrast_browser_qa.py` passed desktop and simulated-touch route checks after its Cups assertion was updated to expect the now-active Custom League destination; planned-entry contrast checks remain enabled for other routes.
- `tests/game_ball_cosmetic_quality_browser_qa.py` passed **60** production-renderer samples (five ball models × three rotations × four travel headings). Grain is deterministic; at 17px gameplay radius each model changed at least 44 pixels; the maximum projected ball radius remained 18.18; simulation state was unchanged. Browser errors, failed requests, and HTTP 4xx/5xx responses were zero. Visual captures: [ball grain gallery](evidence/browser/candidate_012863/ball_leather_grain_012863.png), [desktop Custom League](evidence/browser/candidate_012863/custom_league_matchday_desktop.png), and [simulated-touch Custom League](evidence/browser/candidate_012863/custom_league_matchday_simulated-touch.png).
- `git diff --check` passed after removing trailing whitespace from the Custom League page renderer.

## Known limitation

The current match engine assigns the human-controlled club to its home engine side. A scheduled away fixture is identified and scored in scheduled orientation, but the match presentation remains player-home. Correct away-side visual orientation is still open and is not claimed as complete. The generated browser fixture also reports missing optional `online-config.js` and Home hero image requests; the Custom League assertions completed with no uncaught page errors. This local mode requires no online server and remains playable offline.

## Release gates

The first exact-head Full Regression Census (`42092192244`) caught one obsolete navigation-browser assertion that required every Cups page to contain a deferred menu entry. Candidate `.63` replaces it with an assertion for the playable Custom League route; the amended navigation suite passes desktop and simulated-touch checks.

Final commit `1cafb06502b061adf16967dd6502d751b3506a67` passed exact-head Full Regression Census [`42094663215`](https://github.com/saeedsai/SuperMagicFootball/actions/runs/42094663215) and Modular Game Dev QA [`42094663075`](https://github.com/saeedsai/SuperMagicFootball/actions/runs/42094663075). The protected promotion job fast-forwarded `main` to that exact SHA. GitHub Pages deployment [`42096036857`](https://github.com/saeedsai/SuperMagicFootball/actions/runs/42096036857) passed; main Full Regression Census [`42096037883`](https://github.com/saeedsai/SuperMagicFootball/actions/runs/42096037883), including hosted Pages smoke, passed. The game is deployed at [SuperMagicFootball on GitHub Pages](https://saeedsai.github.io/SuperMagicFootball/).

Owner visual/gameplay review and physical-device acceptance remain separate open gates. The local Custom League requires no online server. This release does not certify authenticated online-service hosting, PostgreSQL provisioning, or real two-device multiplayer.
