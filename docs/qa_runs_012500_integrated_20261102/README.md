# 0.12.50.0 integrated local acceptance

Date: 2 November 2026. Scope is the local uncommitted development candidate based on `dev`; this report records local validation and does not claim a protected release or deployment.

## Change

The Home screen's Online card now describes the playable network modes and opens an `ONLINE MATCHES` menu. Internet P2P with private invite/discovery and Local Network quick match are enabled there. When opened from this menu, either lobby returns to the Online menu; when opened from Quick Match, existing return behavior stays in Quick Match. Ultimate Team, Online Career, and Online Cup/League remain labeled as planned. Player Data Editor copy now accurately lists playable offline, Career, LAN and Online P2P modes. Match controls, offline play, saves, and LAN/Internet protocols are unchanged. No concept graphics were created.

## Local checks

- `npm run test:node` — **1,598/1,598 passed**; the FC27 roster parity step passed (32 clubs / 384 roster slots, data and runtime equal).
- `python scripts/validate_data.py` — **PASS**, 223 teams, 2,676 players, 84 avatar presets, zero errors.
- `tests/online_menu_routes_browser_qa.py` — **PASS** on desktop and simulated touch. It checks the Home Online action, both enabled submenu routes, Internet P2P/LAN host and find controls, parent-menu focus restoration, and accurate Player Data Editor mode copy; screenshots are under `tests/.generated/online_menu_routes/`.
- `tests/v08247_menu_browser_qa.py` — **PASS** on desktop, portrait and landscape; menu routes, placeholders, settings and no-page-error checks.
- `tests/v08247_menu_input_browser_qa.py` — **PASS** for keyboard Back/focus and simulated gamepad A/B while preserving a paused match.
- `tests/home_dashboard_browser_qa.py` — **PASS** on desktop and mobile for five home categories, navigation, Quick Match and Settings.
- Focused Node command covering `lan_lobby`, `action_flow`, and `arena_overhaul_visual_contract` — **26/26 passed**, including LAN menu contracts. Two additional Online route/editor content contract checks pass **2/2**.

## Visual evidence

- [Updated Home screen](online_menu_home.png)
- [Online Matches menu](online_menu_desktop.png)
- The desktop screenshots were visually checked for readable enabled/planned status and page composition; owner art/UI approval is still separate.
- Full Node output: [node.log](node.log); data validation: [data_validation.log](data_validation.log).

## Separate acceptance gates

The currently hosted Pages site and Render broker were not changed or redeployed. Exact-head CI/protected promotion, hosted Pages byte verification, exact-candidate hosted-broker deployment and real cross-network gameplay, two physical devices, assistive-technology review, and remaining owner visual/art acceptance are still open. See [hosted broker status and limits](../LAN_HOSTED_DEPLOYMENT.md).
