# Supermagic Football — v0.8.0 Defensive & Goalkeeper Abilities

## Controlled release scope

All these abilities use independent HTML5/JS physics and original generated HD visual effects. **They are not claims of exact behavior from the 1993 cartridge.** Only specifically assigned players receive them. Modern clubs retain their existing data unless a mod explicitly supplies a valid ability ID.

| Player | Ability | Type | Cooldown | Approx. stamina cost (pre endurance factor) | Effect |
|---|---|---|---:|---:|---|
| Iwakabe (Japan) | Drill Attack | Defensive / dash | 7.5 s | 6.5% fatigue scaling | Charge toward target within 170 units, stagger/dislodge ball |
| Horibata (Japan) | Shock Burst | Defensive / radius | 9 s | 6.5% fatigue scaling | Hits multiple opponents within 126 units |
| Genei (Japan GK) | Mega Palm | Goalkeeper / clearance | 9 s | 8.0% fatigue scaling | Deflect incoming ball within horizontal 220 and lateral 130 units |
| Carlos (Japan GK) | Tornado Punch | Goalkeeper / clearance | 11 s | 8.0% fatigue scaling | Extended 260x160 reach with airborne spiraling clearance |

Stamina cost is scaled by each character's Stamina rating. Moves require not being stunned and a safe amount of remaining energy. Cooldown ticks only during live play and is carried through kickoff. Defender activation needs a nearby opponent; failure to find one doesn't spend energy/cooldown. Strength and Defense ratings reduce stun duration. Incoming keeper saves require the ball to be loose and last attacked by the opposing side; ball direction is reversed away from own goal and its special-shot physics is cleared. CPU field defenders attempt moves probabilistically based on difficulty/press tactics; computer goalkeepers can use saves against incoming magic shots.

## Controls

When possessing the ball, **L / gamepad X / mobile SPECIAL** still triggers the player's shooting super move. When not in possession, the same input triggers assigned defense move (if a target is in range), an available keeper rescue near the goal, or otherwise normal tackle behavior. Use Tab to select another field player. Goalkeeper rescue is activated through the team's Special button (not individual direct GK selection). This is an intentionally simple first milestone.

## API and saves

Stat adapter `withStats()` maps legacy Japan skills to stable `superAbility` and `gkSuperAbility` definitions. Runtime-only `abilityCd` and `abilityFx` travel with the active player's identity across kickoffs; team tactics and player career format are unchanged. Add move definitions in `src/abilities.js`, physics in `GameEngine.activateDefence()` or `.activateKeeperSuper()`. PWA caches updated for new module.

## Known gaps

Original hyperdash, teammate stacking and flip attacks, full goalkeeper dives/controls, every historic move, referee free kicks, jump-frame exactness and distinct sprites/sounds are not implemented; physical Bluetooth controller/iPhone native fullscreen and original-ROM frame comparisons remain unverified. The first rare keeper saves are game-engine effects, not faithful cartridge emulations.
