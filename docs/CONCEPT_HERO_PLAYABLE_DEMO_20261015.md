# SuperMagicFootball — Literal illustrated Concept Hero prototype

## Implemented game feature

The approved character-turnaround drawing is directly used as the playable character asset, **not** recreated with the game's procedural vector graphics. Its five foreground silhouettes have been extracted and packed into one transparent WebP image atlas (`assets/concept_hero/hero_atlas.webp`). The sprite module uses the exact atlas regions for front, front 3/4, side, back 3/4 and back; the other headings are mirrored.

**Play it:** Main Menu → Quick Match → **★ PLAY CONCEPT ROYALS FC** → **KICK OFF**. An alternate route is Quick Match → On Device → CONCEPT PLAYER DEMO.

Concept Royals FC is an additional special-purpose 12-player exhibition club, with 2 GK, 3 DF, 4 MF and 3 FW. Every one of its players has the same model (`renderModel: 'concept_hero'`), one body, one face, one hairstyle, blue kit and appearance details, per the request. Existing 223 original teams, IDs and save files are not edited. A gameplay renderer switch calls `CONCEPT_HERO.draw` only for those demo players and the pre-existing procedural renderer for everyone else.

## Testing and verification

- `python3 scripts/validate_data.py` validates existing authoritative teams and roster data.
- `python3 scripts/build.py` builds the same deterministic browser fixture used by established browser QA and embeds the original atlas bytes without requiring an external network location.
- `node --test tests/*.test.cjs` verifies active gameplay, rosters and the new prototype contract.
- `python3 tests/concept_hero_browser_qa.py` selects the demo from the actual Quick Match navigation, kicks off a match, verifies six active demo players all use the illustrated model, renders eight visibly distinct directions, checks pixels and page errors, and captures desktop game screenshots and simulated-touch evidence.
- `.github/workflows/concept-hero-qa.yml` executes these checks on `dev` and uploads browser screenshots.

## Transparent limitations

This is a **one-character visual prototype**, not a complete replacement of every character. Its illustrated pixels closely match the reference image at match scale, including cheeks, eyes, spiky hair, collar, crest and boots. The sprite is a fixed full-body pose with a small movement bob, not cut into individually rigged/animated arms and legs. Blue number 10 is baked into the art, so all demo players, including both goalkeepers, visually wear this same number/kit regardless of their underlying numerical roster ID; reversed directions mirror that painted number. Match AI, ball, input, injuries and physics still run normally. These visual limitations should be assessed before authoring a full eight-view animation atlas.

## Deployment

The original image data was committed as a WebP atlas; the normal game loads it through a relative URL and includes it in the offline service worker precache. The generated inline QA fixture embeds the exact same WebP bytes as base64. Automated Chromium on desktop and simulated touch is not certification of performance on physical iOS/Android devices. Verify the GitHub Actions run and Pages deployment for the actual pushed commit; never infer live-URL playability from a green unit test alone.
