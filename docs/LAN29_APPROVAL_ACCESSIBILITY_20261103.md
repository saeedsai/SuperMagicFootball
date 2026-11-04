# LAN/Online P2P host approval accessibility — 3 November 2026

## Change

Incoming guest requests now update the lobby's polite status region with the guest name and explain that **Accept Guest** or **Reject** is available. The status uses `aria-atomic="true"` so assistive technology receives the complete sentence. The update does not move focus. The global game input layer now leaves Tab to the browser, while retaining its arrow-key and Space suppression for gameplay; Tab remains unmapped and does not trigger a game action.

This fixes two linked keyboard-accessibility defects: incoming host-consent prompts were silent to screen readers, and the global input listener prevented Tab from moving to lobby controls.

## Validation

- `node --test tests/ct19_input_acceptance_matrix.test.cjs tests/lan_auto_lobby_flow.test.cjs`: **56/56 passed**, including a regression that Tab is not prevented or mapped to a gameplay action and LAN/Online P2P host consent updates the live announcement region.
- `python -X utf8 scripts/build.py`: passed.
- `python -X utf8 tests/lan_auto_approval_accessibility_browser_qa.py`: actual local-game Chromium lobby passed. The polite atomic status announced Ada's request; focus stayed on Host Game after the network message; repeated Tab reached Find Games, Cancel, Manual LAN Connection, Accept Guest, and Reject in order; no browser errors.
- `git diff --check` passed for the focused source, tests, and evidence files.

## Limits

Chromium verified DOM announcement semantics and keyboard focus traversal. No specific screen reader, physical keyboard, or real multiplayer device was used; those acceptance checks remain open.
