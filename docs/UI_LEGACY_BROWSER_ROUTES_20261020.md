# FIX-UI-101 legacy Chromium Back-route compatibility — 20 October 2026

## Identified CI blocker

Full Regression Census run [#39485410157](https://github.com/saeedsai/SuperMagicFootball/actions/runs/39485410157) detected two obsolete test assumptions after the correct user-requested Back fix:
- `tests/stats_browser_qa.py`: a direct `[data-action="home"]` click from the Team Command Center timed out (browser shard 1).
- `tests/kits_browser_qa.py`: the same outdated direct-Home click timed out (browser shard 2).

The real game's team-customization Squad entry returns to **Player & Team Customization** as its parent; the next two visible Back controls lead to **Settings → Home**. Both historical tests now exercise this full hierarchy and assert the names of the intermediate screens. Neither test is removed, skipped or bypassed; all original stats, kit preview, kickoff, HUD and pause/resume behavior checks remain.

## Published changes

- `tests/stats_browser_qa.py`: commit `8c593af23b9c4963e25ae644cf257d7afaefb6cc`
- `tests/kits_browser_qa.py`: commit `22e96c060115c75ec34e94f195729e675bd77b90`

This correction changes **browser-test navigation only**, with no change to playable game code, team data, gameplay buttons, saves or About. Exact-head Modular QA and Full Regression Census including desktop and simulated touch must pass before promotion to main. GitHub Pages is a separate gate.

## Handover

Claim owner: `smf-hourly-dev-20261019`, lock: `ui-controls`. Both test scripts are now aligned with the P0 Back fix. Reopen only for a real navigational regression or failed browser result; retain positive screen-parent assertions.
