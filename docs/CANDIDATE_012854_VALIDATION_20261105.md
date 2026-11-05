# Candidate 0.12.81.54 validation

**Status: promoted and deployed; main Census passed.** Exact-head Full Regression Census (`42027710060`) and Modular QA (`42027710079`) passed for SHA `d3c5cdab25ba55958650c404b569211e6b8321cb`; protected promotion passed; Pages deploy (`42028977160`), hosted smoke, and main Census (`42028977389`) passed. Current Player Graphics QA (`42027710103`) remains in progress.

## Changes

- The renderer overlaps each projected rolling-ball texture triangle by at most 0.36 screen pixels. Original sphere vertices still define UV transforms; radius, movement vectors, collision, match state and physics are unchanged. This prevents background-colored hairlines between antialiased clips.
- Career and Cup inspection/import now enforce both the 2,000,000-character limit and a 2,000,000-byte UTF-8 file limit before parsing or writes. This complements .53 export limits so Unicode-heavy backups cannot bypass the importer’s file-size cap.

## Validation

- `node --test tests/game_ball_surface_render.test.cjs tests/career_backup_integrity.test.cjs tests/cup_backup_integrity.test.cjs`: **46/46 passed**.
- `python tests/game_ball_clip_overlap_qa.py`: **60/60** real-renderer Chromium samples across five ball models × three roll angles × four travel headings at radius 17. All four directions render distinctly; maximum painted radius was 18.18. Match-state snapshot unchanged; no browser/console/request errors. Contact sheet: [rolling-ball projection](evidence/browser/ball_rolling_projection_012854.png).
- `node --test tests/about_revision.test.cjs tests/versioning_policy_contract.test.cjs`: **20/20 passed**.
- `npm run test:node`: build and full Node suite passed **2,288/2,288**; Club26/FC27 fixture passed. `npm run build:qa`: **5,220,463 JS / 5,343,515 HTML characters**.
- `git diff --check`: passed.

## Remaining acceptance

- Current Player Graphics QA `42027710103` remains in progress; owner visual/gameplay review and physical-device acceptance are also open.
- Public Online Career/Ultimate Team/PVP hosting needs the owner-provided server, durable PostgreSQL, OIDC/secrets and backup/restore configuration. Active PVP restart resume still needs a safe authoritative engine checkpoint contract.
