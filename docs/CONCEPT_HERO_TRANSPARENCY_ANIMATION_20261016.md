# Concept Royals FC — transparent sprite and running animation correction

## Root causes
The concept art was sliced into a five-view full-body WebP atlas. Near-white opaque matte regions remained between the illustrated legs in four views, so they showed as solid white shapes on the pitch. The original runtime moved only the whole body vertically and could not animate either leg.

## Implemented
- `scripts/clean_concept_hero_atlas.py` flood-fills only the four known near-white *connected background components* between the legs, leaving white uniforms, socks, boots and jersey numbers untouched. The result is saved as lossless-alpha WebP.
- `src/modules/concepthero.js` creates separate two-leg and upper-body layers for every heading. Each leg swings alternately about the hip based on the existing real-time `run` pose oscillator. The torso overlays the seams. Idle frames still display the untouched illustrated pose.
- No roster, stamina, physics, input, save structure, match rules or original 223 team records were changed.

## Verification
- Existing concept game-integration browser QA on desktop and simulated touch.
- New automated Canvas checks compare idle and forward/backward strides in all five underlying views; the existing facing transformation produces eight headings.
- Alpha assertions check the exact gap positions in the source WebP, and generate a screenshot contact sheet.
- Full active Node suite, game-data validation, and all available current-browser suites should be run on the same final commit. CI logs, not this document alone, establish passing results.
- GitHub Actions asset rebuild job commits the cleaned WebP so deployed players do not depend on ad hoc browser color keying.

## Remaining limitations
This is the original illustrated full-body sprite with a **lightweight cutout running animation**, not a fully hand-drawn twelve-frame walk/run cycle. Arms, jersey creases and individual facial expressions remain fixed. Future improvements can replace the two-leg rig with artist-authored separate body-part or animation frames. This fix does not introduce unique appearance variants for the cloned Concept Royals players.
