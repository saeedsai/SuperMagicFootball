# v0.8.10 — offline cartoon identity specification

**Module:** `src/identity.js`. **Consumers:** `src/main.js`, standalone bundler `tests/build.py`.

- `cartoonFlagSVG(team)` emits a viewBox 88×60 SVG with shaded cloth highlights, a thick rounded border and national-color schematic. Country aliases are read from the pre-existing `countryCode` mapping. England and Scotland receive their respective cross illustrations rather than a generic Union flag.
- Flags use a set of recognizable simplified layouts: horizontal/vertical bands, crosses, diagonals, disks, stars, crescents, emblem approximations, or procedural fallback. **Not a substitute for exact flag master assets**. Unknown geography uses colors from the team's own kit; there are no missing images or external network requests.
- `crestSVG(team)` creates a custom scalable badge from **five base shield shapes**, deterministic FNV-derived theme/pattern/symbol, team kit colors and sanitized initials; never embeds official club logos. Identical team records produce identical SVG, including across saved matches.
- `teamIdentity(team)` wraps the vector flag and optional club shield with a readable image role and team-name label. Both quick-match and competition lists use the same identity function. Native select dropdown labels use country/club codes to avoid platform-specific emoji.
- The full team dataset is not changed; old saved team IDs, stats, kit records and JSON exports remain compatible.

**Known limitations:** SVGs visually approximate flags, including complex emblems; official heraldic accuracy and political design updates need curated review. Physical Android/iOS and keyboard/screenreader accessibility have not been tested. Repeated icon markup is moderately more expensive than emoji; large-list performance remains to be profiled.
