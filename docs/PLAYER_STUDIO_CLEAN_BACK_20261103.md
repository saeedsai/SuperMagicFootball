# Player Studio clean Back state — 3 November 2026

## Change

Rebuilding the goalkeeper Super Defence selector while Player Studio initializes now establishes the selected saved option as its default form state. Previously, assigning `keep` after constructing dynamic options made the DOM compare the selected value against an unset default. An untouched Studio page could therefore show a false discard-confirmation prompt on Back. A genuine later selection or tier change remains dirty and still receives the existing confirmation.

## Validation

- The `tests/fix_ui_101_back_acceptance.test.cjs` regression is included in the full local Node suite (**1,796/1,796**).
- `npm run build:qa`: passed.
- `python -X utf8 tests/browser_runner_compat.py tests/ui_back_routes_browser_qa.py`: desktop and simulated-touch route checks pass across Player Studio (including team selection), clubs, roster editor, gallery, squad and input mapping; untouched forms show no prompt and no browser errors.
- `python -X utf8 tests/browser_runner_compat.py tests/fix_ui_101_routes_browser_qa.py`: desktop and simulated-touch dirty-form confirmations pass; Cancel preserves edits and confirmed Back restores the correct parent.

No save schema, roster, gameplay controls or persistence behavior changed. Physical-device and screen-reader acceptance remain separate.
