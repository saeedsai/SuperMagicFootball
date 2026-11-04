# UX26 portrait orientation prompt focus acceptance

**Date:** 2 November 2026  
**Scope:** Make the existing portrait recommendation usable with keyboard and assistive technology. No new artwork or gameplay controls were added.

## Behavior

- `#rotate` is a named modal dialog linked to its visible title and description; the decorative rotate glyph is hidden from assistive technology.
- When coarse-pointer gameplay enters portrait, focus moves to **PLAY ANYWAY**. Tab and Shift+Tab remain inside the dialog; other keyboard actions cannot leak into gameplay.
- Escape or the button dismisses the prompt for the current page session and safely restores focus. If the original opener is hidden, focus moves to a visible match control.
- Rotation to landscape hides the dialog and restores focus without marking it dismissed. Returning to portrait reopens and focuses it; desktop is unaffected.
- The portrait threshold, match state, and four-button grammar are unchanged. Browser zoom remains available.

## Validation

- `node --test tests/ux26_rotate_prompt_focus.test.cjs`: **3/3** passed.
- `python tests/browser_runner_compat.py tests/ux26_rotate_prompt_focus_browser_qa.py`: passed for simulated-touch dismissal, focus containment, orientation hide/reopen and desktop behavior; no page errors.
- Build passed with `PYTHONUTF8=1`; full candidate Node/Chromium integration follows in the `.47` evidence report.

Screen-reader and physical-device acceptance remain separate.
