# Future-only customization and Career development requirements — v0.8.20.3
**Status: BACKLOG / NOT IMPLEMENTED.** Research and approval of balancing remain future tasks. Existing customization, Career training and stat behavior are unchanged in this release.

## FCUST-01 — Curated palettes (no arbitrary RGB picker)
- Replace unrestricted skin/hair/eye RGB sliders with **named, visually realistic swatch sets**. Proposed initial ranges: ~12 diverse skin tones, ~12 natural hair options (including greying/white and optional plausible dyed colors), ~9 eye colors; final palette needs art/accessibility review.
- Keep the full range of real-world complexions and undertones represented; no skin color tied to ability, quality, nation or player tier.
- Show a text name and preview for each swatch (example: “Deep brown”, “Medium olive”, “Dark chestnut”, “Hazel”), not just a hex code. Color names are illustrative and subject to artist review.
- Existing custom characters with arbitrary stored RGB values require a non-destructive compatibility/migration plan (nearest valid swatch or legacy visual preservation), and migration regression tests.

## FCUST-02 — Meaningful names for customization choices
- Every face/head shape, facial feature, hairstyle, size/body proportion, beard, accessories, equipment and visual style must show a concise **descriptive title**, e.g., “Round face”, “High fade”, “Short athletic build”, “Wrist tape”, not unlabeled numbered options.
- The avatar preview must update immediately, work with touch/keyboard and expose accessible text labels. Language/translation keys to be designed later.
- Appearance choices do not change numerical stats unless a separate, explicit gameplay rule is approved.

## FMGR-01 — Customizable Career manager avatar
- Add manager appearance to Career setup and Manager screens using the **existing player avatar renderer and visual customization catalog**, avoiding a duplicate implementation.
- Store the manager avatar separately from player roster identities. Presets, edit/reset, save/export/import, new season, and retirement of Career manager must preserve manager appearance.
- Manager appearance is cosmetic; no arbitrary avatar-dependent club/football ability effects.

## FAGE-01 — Player age and age-related progression
- Display verified player age in Career with **birth date as canonical source** where available; advance it on in-game calendar/season milestones (not on each match).
- Younger players may improve more readily; aging players can plateau or decline gradually. Define career-phase age curves per position later (GK peak can differ from FW), without blanket age penalties each match.
- Age must remain consistent between team and national-team copies via future canonical identity migration.
- Do not fabricate DOBs or override already sourced dates. Handle missing age with an explicit unverified/provisional status.

## FGROW-01 — Exactly five named growth-potential categories
**Proposed names:** Very Low, Low, Normal, High, Exceptional. Five ordered qualitative values; concrete numerical coefficients and distribution remain to be balanced.
- Store growth potential per **canonical player**, not per team roster slot. Keep it distinct from OVR, current rating and market value.
- Do not infer growth potential from nationality, appearance, skin, eye color, or historic-name popularity.
- Persist in Career saves. Player Growth is inactive until identity/stat verification reaches required quality.

## FGROW-02 — Match-performance-driven long-term progression
- Career development depends on a documented combination of **match performance**, growth potential, age/position curve, playing time, training/facility effects, health and fatigue, coaching/team context, and controlled randomness.
- Use a cap per match/season to prevent abuse; include outfield and GK-specific contribution signals. Bad match performance should not automatically destroy ratings after one game.
- Apply gradual, auditable changes to relevant attributes, then recalculate position-specific **display OVR**; prevent OVR from silently setting player tiers or super abilities before classification launch.
- Save progression to Career state and restore deterministically. Test identical seeded simulations, full season, bench/starting appearances, injury/recovery and across-season declines.

## Dependencies and implementation order
1. Verified player identities, 2026 memberships, DOB and relevant position-specific stats.
2. Canonical player identity plus save migration.
3. Age and five-level growth schema, long-session seeded balance and UI explanation.
4. Manager avatar and named limited-color customization improvements.
5. Activate growth simulations only after many-season deterministic verification.

**Acceptance gates:** no fifth action button; no changes to approved 6 formations; no arbitrary new match rules; no fabricated rating, age or growth value. Current release **documents only** these six requirements.
