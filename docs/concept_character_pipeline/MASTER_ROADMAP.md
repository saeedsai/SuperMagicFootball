# Master roadmap — concept-quality fully modular footballers

**Goal:** eventually deliver the smooth, expressive illustrated concept style as actual playable characters, with multiple faces, bodies, hairstyles, beards, colors, tattoos, clothing and accessories, plus all major game actions in all **eight genuinely authored views**. Options must alter rendered game pixels and remain editable and saved in Player Studio. Passing tests alone does not establish artistic similarity: owner visual signoff is mandatory.

## Design decision and scope protection
Use an **artist-authored layered 2D rig** plus hand-painted corrective animation frames. Reuse shared bodies, kits and pose rigs while compositing unique heads/hair/skin/features; do not bake millions of combinations. Keep the old flat CONCEPT_HERO and ordinary CHARACTER_ART as fallback. Add the new renderer only to opt-in renderModel = concept_modular_v1 and expand through Concept Royals FC *before* other teams. Preserve original 223 team IDs, player data, positions, save keys, gameplay mechanics, four main buttons and match hitboxes. Keep existing numeric Studio option values intact and use versioned concept-specific IDs for richer choices.

## Programme stages (small commits, not a single huge task)

| Stage | Small deliveries, in this order | Gate to mark verified |
|---|---|---|
| C00 Reference and source foundations | Preserve approved art reference/source provenance, freeze game-scale screenshots, define editable layer source & alpha/pivot contract. | Source reference accessible in repo/authorized location, initial art comparison, manifest schema tests. |
| C01 One true modular hero | ONE high-quality body/head with independently authored hair, face, shirt, arms, knees, shoes; start ONE facing direction. | Real game shows one character without white matte, limb gaps or eye/hair seams. |
| C02 Eight-view hero | Expand the same hero to actual front, rear, both sides and four quarters; idle/walk/run and basic kick; avoid mirrored jersey numbers. | Eight coherent, distinct directions and animated run with reciprocal arm/leg movement. |
| C03 First unique team | Make all **12** Concept Royals players different using the same modular art system (2 GK, 3 DF, 4 MF, 3 FW). | Twelve visibly unique faces/hair/skin etc and dynamic kit numbers in real gameplay, not a team poster. |
| C04 Face construction | Add eye, brow, ear, nose, lips, mouth expressions, jaw/face banks; validate fit across hairstyles/beards. | Every shipped selector visibly changes character in appropriate eight directions. |
| C05 Hair + beard | Expand hair colors, natural curly/short/long styles, scalp/nape, beards/stubble/moustaches, sideburns. | No bald rear hair, accidental headbands or jaw-clipping beards. |
| C06 Body & equipment | Athletic builds, height bands, face-to-body proportion, shirt fit, boots, shorts, socks, full GK kit/gloves. | Body options grounded and rig-consistent; no fixed number 10 or goalkeeper blue kit. |
| C07 Accessories/details | Tattoos, scars, freckles, headbands, eyewear, captain bands, wrist tape, gloves, earrings where appropriate. | Correct side/limb/pose ownership, occlusion, eight headings and editor persistence. |
| C08 Core motion system | Breathing/blink, walking, running, start/stop/turn, ball carry/receive, passes, shots, slide/tackle, header, jump/landing. | Eight-direction seamless transitions and no sliding feet or detached body parts. |
| C09 Specials and goalkeepers | Super/combos, bicycle/flip/flying kicks, hurt/cry/celebrate, diving/catching/holding/throwing/punting and recovery. | All engine actions mapped to distinct quality art or explicitly tracked temporary fallback. |
| C10 Complete Studio + saves | Show all approved options, eight-view/pose previews, seeded randomization, safe migration, retained unsaved changes. | Actual edited artwork survives save and reload with backwards compatibility. |
| C11 Optimization + gradual rollout | Atlas compression/LOD/cache, measure PC & touch, expand opt-in to other players only after signoff. | Stable real game framerate and no regressions or missing assets. |
| C12 Release certification | Owner art review, full asset coverage, golden sheets, original-team regression, hosted gameplay & exact SHA. | Every release gate passes on same committed and deployed version. |

## One-session workflow
1. Read the entire pipeline document set and PROGRESS_TRACKER.json, re-fetch current dev head and related source.
2. Select **one small C-stage deliverable** (e.g. first isolated head-and-hair layer plus a validator, or two hair variants), not 40 models.
3. Implement a source file/manifest/renderer hookup, tests, playable screenshot; keep legacy fallback.
4. Run focused regression, game data validation and full active Node suite; browser check actual character.
5. Commit **only** the small verified change without force, update tracker and handover, compare with any parallel commits.
6. Read GitHub Actions for the exact SHA; if runtime changed, verify deployed browser behavior. Record PASS/FAIL/SKIP truthfully.

## Explicit completion criteria
- **Production-ready** means source-layer artwork exists, transparent runtime images and manifest resolve, selectable in game, meaningful visual difference, accurate eight views, animation coverage, save persistence, tests, and human review.
- A mere colorized flattened sprite, a five-view mirror with backwards numbers, a generated team portrait, or an unrigged stationary body is NOT a completed model.
- Multiple faces/body types should be independent layers on anatomically aligned anchors, **not** a separate full-body atlas for every combination.
- Treat "all animations/all views" as a release gate; until then, tag missing view/action as provisional in tracker and retain safe fallback.
- Stage each new family through one convincing example, a small diversity set, full catalog, then final coverage; support multiple skin and hair textures and colors naturally.
- Each agent should stop and save a checkpoint before the workload becomes unbounded. No force pushes or cleanup of another agent's files.

**Next task:** Start C00, then C01's *first small increment*: establish an editable source/reference and validated direction-specific layer/pivot example, then one real rendered modular head with hair in a playable prototype slot. Do NOT claim the full hero or 12 unique models are already complete.
