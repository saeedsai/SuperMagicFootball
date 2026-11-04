# Academy signing UI validation — 2026-11-03

## Change

Replaced the browser-native Academy signing prompt with an in-game, accessible confirmation screen. It names the prospect and shows overall rating, potential, and fee; a labelled selector lists all twelve outgoing squad members by shirt number and role. A polite live status explains the selected replacement and shirt-number reuse. The player must explicitly confirm or cancel.

Confirmation rejects an empty/invalid outgoing-player selection before cloning or mutating Career state. A valid choice is passed to the existing `signAcademy` API on a Career copy; the active Career slot is committed before live state and the compatibility mirror are updated. Cancellation returns to scouting without a signing call or persistence write. This retains the API's duplicate-ID checks, one-for-one roster replacement, shirt-number reuse, fee, and candidate removal behavior.

## Validation evidence

- `python scripts/build.py` — passed; generated fixture reports 4,950,430 HTML characters.
- `node --test tests/career_academy_signing_ui.test.cjs tests/career_academy_scout_atomicity.test.cjs tests/career_academy_id_integrity.test.cjs tests/career_purchase_atomicity.test.cjs` — 13 passed, 0 failed.
- `python -X utf8 tests/manager_v060.py` — desktop and simulated-touch browser runs passed. Both cover invalid confirmation leaving Career/slot/mirror unchanged, cancel preserving state, successful replacement preserving twelve unique IDs and shirt number, charging the existing fee, removing the prospect, persisting the active slot and mirror, and existing contract actions.

## Scope and limits

No roster identity or rating audit was performed. Browser validation used Playwright Chromium in desktop and touch-emulated viewports; no physical device review was performed. No deployment or publishing claim is made.
