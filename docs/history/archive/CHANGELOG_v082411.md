# Supermagic Football — v0.8.24.11 Alpha

**Baseline:** packaged v0.8.24.10 Alpha. **Date:** 14 October 2026.

## Confirmed gameplay fix

- Ball collection previously used `break` when the **nearest** eligible-by-stun player failed the distance or aerial-reach check. A nearby outfielder with smaller reach could suppress a slightly farther but valid goalkeeper collection. Use `continue` for candidates that cannot reach; retain nearest-first selection among candidates who *can* reach.
- Added keeper-versus-outfield height and radius regression fixtures. No goalkeeper catch radius, probability, rare Super Defense rate or shot velocity was changed.

## Diagnostic improvements

- Add backward-compatible metadata (`kind`, `origin`, `targetY`) to `kick` engine events; existing `player` and `super` properties remain unchanged. Classifies shots, Super Shots, passes and clearances without guessing from raw kick counts.
- New optional `src/match_telemetry.js` observer attributes individual attempt outcomes: goal, keeper catch/save, keeper deflection, defender interception, teammate recovery, completed/intercepted pass, unresolved flight and period transitions. It does not affect the game simulation or create new in-game controls.
- Extend four-button controller-vs-CPU replay from 15 to 45 seeded completed matches, 9 per difficulty, with three team/formation/policy combinations and three independently seeded variations each. Store event-backed data in `docs/HUMAN_CPU_OPPORTUNITY_REPLAYS_v082411.json`.

## Testing / documentation

- Added three Node regression scripts and six catalog entries, now 444 documented QA requirements.
- Updated PWA service-worker cache, metadata, standalone HTML, release contracts, test-runner validations, roadmap, handover, current gap register and QA report.
- Preserve simplified five-category menu, six formations, seven BPW teams including All-Time Legendary 12, exactly four buttons, audio, saves, and all approved Super Attack combinations.
- Physical controllers, Android/iOS, Safari/Firefox and human win-rate certification remain open. Super Defense/Tricks and roster correction work remain deferred.
