# FIX-UI-102 — remove confusing development banners (20 October 2026)

**Delivered source:** `src/modules/ui.js` commit `157100bd78431145354ed55cc267b4268109f1b8`.

The home-screen `DEV → ABOUT` pill was removed, and the ordinary screen and navigation-menu toplines no longer announce `DEV VERSION IN ABOUT`. These static banners implied that the home page displayed a development version and cluttered small screens. Home still has the readable **CREDITS / ABOUT** button; Settings and all nested navigation remain accessible.

**Preserved exactly:** About's live GitHub `dev` revision on every visit, actual latest commit summary and Recent Changes, bundled game version, responsive UI, all four buttons, rosters, mechanics, saves and art. This is not the requested future four-number `0.9.0.0` migration; that migration requires coordinated release policy and contract changes.

## Acceptance tests

- `tests/ui_no_dev_banner_20261020.test.cjs`: five new static/source contracts for home and ordinary menus, preserved About behavior and four-button mapping.
- `tests/graphics_branch_integration.test.cjs`: removed two obsolete assertions that forced `DEV → ABOUT` to remain visible, replacing them with strict absence checks plus About accessibility and revision checks. The existing bundle version integrity assertions remain.
- Existing `tests/about_revision.test.cjs` and `tests/versioning_policy_contract.test.cjs` are unchanged.
- Existing `tests/ui_back_routes_browser_qa.py` and entire Full Regression Census provide actual desktop and simulated-touch navigation coverage.

Modular QA and eight-shard Full Regression must be **verified on an integrated SHA after the final documentation and ownership release**. Neither documentation nor intermediate commits prove deployment; Pages must be checked separately. No physical devices were tested.

## Handover

Follow next with independently claimed `SAVE-101` ten Career slots or UI customization controls, not with uncoordinated removal of About SHA metadata. The canonical 30+15 owner backlog remains active.
