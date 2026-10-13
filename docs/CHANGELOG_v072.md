# Supermagic Football v0.7.2 — Changelog (2026-10-13)

## Implemented
- Public-facing product renamed from the previous "Nekketsu Legends HD" alpha label to **Supermagic Football**. Browser/PWA titles, menu, copyright text, current documentation and download names updated.
- Persistent fullscreen button in every menu; separate touch-friendly in-match fullscreen toggle, exit control, fullscreenchange synchronization.
- Fullscreen API request only in response to real player click; best-effort landscape orientation lock on success. Honest fallback instructions for unsupported browsers, including iOS Safari.
- Wide-screen camera viewport matches modern phone screen aspects without distorted artwork or unnecessary horizontal bars. Safe-area CSS, visualViewport and orientation resize.
- PWA metadata, icon-180/192/512 PNG assets, cache-v072 with offline game modules.
- Save compatibility with previous `product` name and `legend_*` keys; export uses new product name and filename.
- Official `window.SupermagicFootball` API alias while legacy `window.NekketsuHD` stays active for old tooling.

## Deliberately deferred
Original team-mood dialogue, crying/funny celebration animation, exclusive face models, exact classic moves, better referee restarts, official rosters, online multiplayer.

## Limitations
A preliminary web name search does not constitute trademark clearance. Fullscreen and orientation behavior differ across phone browsers, notably iOS; tests cover headless Chromium and simulated mobile, not real hardware.
