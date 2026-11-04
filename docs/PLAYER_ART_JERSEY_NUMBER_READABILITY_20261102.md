# Existing player jersey number readability — 2 November 2026

**Status: technical prototype; owner visual acceptance remains open.** This iteration refines the existing procedural fallback renderer only.

## Change and acceptance criteria

The front/quarter-front shirt number used an 11 px gold fill with a 1.3 px outline darkened from the jersey color. At live sprite size, that thin shirt-toned edge could blend into bright kits. Front-facing numbers now use a 12 px bold fill, a 1.8 px outline, and an outline color chosen from the kit's primary-color luminance: dark navy ink on light kits, warm cream on darker kits. Gold trim remains the number fill. Rear numbers retain their existing 21 px size, 2.8 px outline width and prior outline color. No roster, appearance schema, kit palette, gameplay action, or renderer fallback changed.

The acceptance checks were: front and quarter-front numbers keep their trim-colored fill; outline color contrasts on dark, light and bright kit primaries; rear number sizing remains unchanged; and ordinary appearance rendering remains nonblank and unclipped.

## Validation

- `node --test tests/player_art_v3_contract.test.cjs tests/player_art_rework.test.cjs` — **12/12 passed**. New contract coverage exercises front/quarter numbers across bright orange, light and dark kits, and verifies rear-number sizing is unchanged.
- The browser directional QA rendered **2,860** cases on desktop and **2,860** on simulated touch. Both passed with zero blank or clipped sprites, zero page errors, and no collapsed face/hair/beard/nose/lip variants. Results: [player_art_directional_report.json](./browser_render_qa/player_art_directional_report.json).
- A direct 64×64 game-renderer browser capture compares front and front-right kit numbers on bright orange, light away and dark navy palettes: [game-size visual comparison](./browser_render_qa/jersey_numbers_dark_light_bright_64.png). The screenshot uses nearest-neighbor enlargement for inspection while retaining 64×64 source canvases.

The change preserves team-specific trim colors and does not imitate any licensed club crest. Human art approval and device acceptance remain separate gates.
