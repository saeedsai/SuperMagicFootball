# v0.8.24.5 Alpha — Regression reliability release

- Updated legacy browser tests to reference this game's active release instead of v0.8.24.3, including exported save assertions.
- Added automated release-alignment regression (`tests/v08245_release_alignment.mjs`).
- Fixed an incorrect Node runner filename; final 63/63 scripts pass.
- Rebuilt standalone offline HTML and PWA cache version; game mechanics and roster data intentionally unchanged.
- Added QA report, gap register, roadmap changes and cleaned stale generated browser screenshots/exports.
- Known limitation: full browser suite was not completed. See `docs/TEST_REPORT_v08245.md`.
