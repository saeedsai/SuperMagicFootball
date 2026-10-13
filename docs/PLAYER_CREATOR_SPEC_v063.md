# Player Creation and Visual Identity Specification — v0.6.3 backlog

## Goal and development boundaries

A single data-driven player factory shall generate and edit every player in classic teams, 2026 national squads, modern clubs, continental clubs, user-created clubs, and career youth/transfer markets. Target is a large-headed, expressive HD arcade character, *not* photorealism. All 2,592 current built-in player slots must migrate without losing their IDs or saves. Art must be newly drawn, not ripped from Nintendo assets.

## Required catalog and data fields

| Attribute | Minimum / range | Present state | Validation for future release |
|---|---|---|---|
| Generic face silhouettes | 20 genuinely different | 5 base shapes | 20 visually distinct entries in sprite contact sheet |
| Eyes | selectable iris color and 7+ eye types | eye styles only | iris rendered at 1x / 2x / 4x scale |
| Hair | 20 independently shaped styles | 13 IDs, 4 main silhouettes | show 20 visibly different silhouettes on same base face |
| Hair color | color palette and picker | basic picker | persists and previews in game |
| Beard/mustache | 10 distinct | 5 basic types | 10 different moustache/full-beard/goatee/sideburn options |
| Facial-hair color | independent from hair | missing | editor and rendering independent |
| Skin | curated palette / picker | basic picker | same identity across club and country |
| Accessories | glasses, headbands, masks etc. | partial | layering doesn't obscure eyes for basic modes |
| Marks | tattoos, freckles, scars | freckles + one scar | position presets and removal |
| Boots | style and color | fixed black | meaningful gameplay sprite change |
| Build | slim, medium, big | fixed | visible body silhouette; preserve collision fairness |
| Height | 155–210 cm inclusive | missing | min/mid/max visible sizes and aerial reach tested |
| New player creation | create, name, assign role, stats, appearance, club slot | missing | create player, save, reload, transfer and play |
| Reserved superstars | Messi, Cristiano Ronaldo, Lamine Yamal, Kylian Mbappé, Erling Haaland | name-based approximations only | protected `faceId` unavailable in generic creator, unique stylized artwork, name-stable |

## Proposed schema (NOT yet implemented)

`appearanceVersion: 2`, `faceId`, `eyeStyle`, `eyeColor`, `hairStyle`, `hairColor`, `facialHairStyle`, `facialHairColor`, `skinTone`, `accessories[]`, `tattoos[]`, `marks[]`, `boots`, `bootColor`, `bodyType`, `heightCm`. Existing saved `appearance.style`, `skin`, `hair`, `beard` and `scar` must remain readable and migrate safely. If a star is transferred, the same canonical portrait identity persists; players with the same name should not accidentally share assets.

## Milestone breakdown

1. **0.9.0:** creator schema, create-player UI, validations and old-save import/migration.
2. **0.9.1:** render catalog and editor controls: 20 faces, 20 haircuts, 10 facial-hair styles, eye/beard colors, masks, glasses, marks, boots, build and height. Test variety and scale.
3. **0.9.2:** unique art and locked faces for the five named stars. Confirm team and country use matching identity and generic players cannot select reserved faces.
4. **Beyond:** editorial unique faces for other world-class players, region-sensitive silhouette variety, animation blending, original-Nintendo humor/expressions, human-led QA.

This is a backlog specification only, except the pre-existing limited editor. No claim that these future controls or exact star likenesses are currently playable.
