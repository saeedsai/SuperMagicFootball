# SuperMagicFootball — smf-hourly-dev-20261019
**Agent ID:** `smf-hourly-dev-20261019`
**Updated:** 2026-11-22

## Mission
Deliver player-facing gameplay, presentation and Career/Cup improvements while preserving four actions, canonical rosters, saves and offline play.

## Current checkpoint
- 0.12.81.194 KEEPER-DISTRIBUTION-READY-RECEIVER-01: keeper throws and punts exclude down, airborne, stunned, sliding, hurt, shot-down/get-up and impact-recovering teammates. A ready outlet is preferred; when none can receive, the existing safe open-turf clearance is used. Throw/punt speeds, pass physics, four actions, saves and data remain unchanged.
- Gameplay/source commit: `2c56d9d2cb4f1918bf0d716ee1085f224b918fbe`. Follow-up test-fixture repair: `312cae6415b8676bbda7ede01bbf367b6d04dea8`. Exact-head CI reruns are pending.
- Initial .194 Modular QA #45034417397 and Census #45034417384 each failed four isolated-VM tests (2,742 passed, 4 failed): existing `keeper_distribution_pressure_choice.test.cjs` omitted the new production helper from its VM. The fixture now injects the real helper; reruns #45034611576 and #45034611580 must establish green.
- .193 is the latest production release at main SHA `b302c58d2a1262b38d8732b4b428df2ac2d8ef1b`. Modular QA #45032909644 and Census #45032909653 passed; QA-gated promotion, Pages #45033782353, and independent main Census/hosted smoke #45033788552 all passed.

## Next smallest action
Verify the .194 exact-head Modular QA and four-Node/four-Chromium Census after the fixture repair. Fix only confirmed failures; allow only the existing QA-gated pipeline to promote, then independently verify Pages and main hosted-byte smoke.

## Next five product improvements
1. Add readable CPU defensive cover against a newly won first-touch outlet, without hidden-target omniscience.
2. Improve goalkeeper return-to-line recovery after catches, punches and rebound chases.
3. Continue source-faithful existing-player eight-view Studio work with game-scale screenshots and owner review.
4. Improve Player Studio live preview and directional customization usability.
5. Deepen Career/Cup season progression and match presentation.

## Ownership and exclusions
Only this checkpoint. No concept heroes or copied art. Preserve 223 teams, 2,676 players, exact ordering and 12-player ratios, six formations, four actions, compatible saves/offline/PWA, ten Career/Cup slots and SD09. No physical-device or visual approval claims; no routine LAN/P2P work. #48 stays open; #87 protection and #86 Render drift remain unresolved.

## Evidence
- .194 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45034611576
- .194 Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45034611580
- .193 Modular QA: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45032909644
- .193 Census: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45032909653
- .193 Pages: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45033782353
- .193 main Census/hosted smoke: https://github.com/saeedsai/SuperMagicFootball/actions/runs/45033788552

## Cleanup
Keep this checkpoint below 4 KiB; never bypass required CI, branch protection or QA promotion.
