# Candidate 0.12.81.54 validation

**Status: local candidate; exact-head CI has not run.** This candidate improves rolling-ball texture continuity and closes the remaining UTF-8 backup-size asymmetry in Career/Cup. Exact-head Census and Modular QA, protected promotion, hosted deployment and physical-device/owner visual review remain separate gates.

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

- Run final full local tests, then exact-head Full Regression Census and Modular QA; verify promotion, Pages deploy, hosted byte/smoke, and main Census for this exact SHA.
- Owner visual/gameplay review and physical-device acceptance remain open.
- Public Online Career/Ultimate Team/PVP hosting needs the owner-provided server, durable PostgreSQL, OIDC/secrets and backup/restore configuration. Active PVP restart resume still needs a safe authoritative engine checkpoint contract.