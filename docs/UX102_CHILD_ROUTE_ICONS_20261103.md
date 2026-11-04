# UX-102 child-route icon artwork — 3 November 2026

## Change

Child-route navigation cards now use original static inline SVG emblems instead of platform-dependent emoji. The vector set covers Quick Match, online/LAN, Career and saves, cups/leagues, settings, controls, customization, roster tools and planned competition cards. Existing text, descriptions, `data-action` routes, later labels and accessible button names are unchanged; each emblem is hidden from assistive naming and cannot receive focus. The icons reuse the menu's existing badge styling and reduced-motion/forced-colors rules. No external image assets or runtime requests were added.

## Validation

`python -X utf8 scripts/build.py` passed. The focused Chromium regression `python -X utf8 tests/ux102_child_route_icons_browser_qa.py` passed:

- 10 child menus at desktop **1280×800**, simulated touch **390×844**, and simulated touch **320×568**: **30 route/viewport checks** and **147 SVG badge instances**.
- All visible cards retained their action and text-derived accessible name; every badge remained decorative, rendered within its card, measured at least **29×29 CSS px**, and caused no horizontal overflow or page error.
- Forced-colors emulation kept badge contrast on system colors with no shadow.
- Reduced-motion touch emulation kept the emblems static and disabled card transitions.
- Desktop and 320×568 screenshots were visually inspected.

Screenshots: [desktop Quick Match menu](evidence/browser/ux102_child_route_quick_desktop-1280x800.png) · [320×568 Quick Match menu](evidence/browser/ux102_child_route_quick_touch-320x568.png).

## Limits

Touch and forced-colors checks use Chromium emulation. Physical-device, Windows High Contrast, screen-reader, and owner visual acceptance remain separate.
