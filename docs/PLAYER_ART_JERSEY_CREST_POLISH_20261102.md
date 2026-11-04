# Existing player kit crest polish — 2 November 2026

**Status: technical prototype; owner visual acceptance remains open.** This small visual adjustment improves the existing in-game procedural fallback without adding a player, changing identity data, or changing renderer selection.

## Change and acceptance criteria

The front-facing jersey mark was a gold oval with a dark wedge. It now reads as a compact shield: a gold trim silhouette, inset team-color field, dark outline, and two small palette accents. Colors come from the existing kit palette. The regular number, jersey colors, player appearance schema, draw order, physics and saved data are unchanged. The badge remains limited to front and front-quarter views; side and rear views do not receive a front-facing crest.

The required checks were: (1) the shield outline and palette-derived fills are present on front and quarter-front; (2) the mark is absent on side and back projections; (3) the ordinary `CHARACTER_ART` renderer remains on the current fallback path; and (4) small-viewport directional art remains nonblank and unclipped.

## Validation

- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **11/11 passed**, including new shield geometry/view coverage.
- The existing browser directional QA rendered **2,860** appearances on desktop and **2,860** on simulated touch. Both passed with zero blank, clipped, or errored frames; face, hair, beard, nose, and lip variation checks passed.
- A direct 64×64 browser render of front, front-right, left, and back projections is captured in [the contact sheet](./browser_render_qa/crest_game_scale_contact.png). Browser report: [player_art_directional_report.json](./browser_render_qa/player_art_directional_report.json).

The screenshot shows game-scale readability only. It does not establish owner approval, production acceptance, or licensing for any real club emblem; the shield is generic procedural kit art.
