# Supermagic Football v0.8.23.2 Alpha — Changelog (2026-10-14)

- Preserved complete v0.8.23.1 source, all seven BPW squads including the user-selected All-Time 12, all six approved formations, four actions, Super Attack combos and old saves.
- Procedural menu ↔ halftime **dual-sequencer 0.85-second crossfade** with gain envelopes and timer cleanup.
- Added **audible, original synthesised match crowd ambience**, filtered deterministic noise, separate ambience slider control, no external samples or internet dependence.
- Repaired audio settings migration: previous SOUND on/off preference no longer unexpectedly overrides an explicit master unmute; stale or malformed saved audio values are safely sanitized.
- Added `touchstart`, `pagehide` and `pageshow` lifecycle handling and guarded Web Audio resume/suspend promises.
- Updated service worker cache key and release strings; fixed outdated browser document title.
- Added one Node audio reliability script, one desktop/simulated-touch browser storage-rehydration script, and eight new QA catalog cases (383 total, not 383 certifications).
- Full master Node regression **57/57 PASS** and headless Chromium browser regression **37/37 PASS** in six bounded shards. Unrestricted-origin storage, physical devices and alternative engines still need testing.
