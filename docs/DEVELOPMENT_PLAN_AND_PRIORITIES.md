# Development priorities — v0.8.25.31

Source of truth: GitHub `dev` branch, **based on main `34dd3d3`**. The v0.8.25.30 modular architecture and game/data schemas remain authoritative. Do not recreate the game or overwrite independently edited JSON shards.

## Completed this iteration
1. Added optional live FPS + frame-time overlay, off by default, configured in the Graphics screen and persisted in existing settings.
2. Extracted seven attack/knockback/keeper prediction coefficients to validated JSON (`mechanics.engineBalance`) preserving previous game behavior.
3. Added hosted/HTTP asset load error recovery UI and rotated service-worker cache.
4. Added new Node/browser feature tests, repaired inherited version guards, tested desktop/mobile simulations and 24 match replays. Restored previously missing modular test scripts and validation to dev source distribution.
5. Cleaned obsolete root standalone game and handover-oriented files from `dev` only; historic git history and main branch unaffected.

## Priorities
P0: real HTTPS hosting/Pages source configuration and physical browser validation; no unsupported claims that dev is published.
P1: saved legacy user state and cosmetic views, manual player art review, low-end mobile performance.
P2: gradual audited gameplay coefficient externalization and independent JSON patch conflict validation.
P3: medium-term keeper/passing animations and career maintenance without speculative balance edits.

See `NEXT_MILESTONES.md` for the next five iteration gates; `GAP_REGISTER_v082531.md` tracks non-delivered requirements. Respect parallel-editor ownership in `PARALLEL_DEVELOPMENT_GUIDE.md`.
