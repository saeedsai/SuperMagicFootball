# Deferred feature specification — Super Defense & Tricks (recorded v0.8.24.1)

**Status: BACKLOG ONLY. DO NOT activate new abilities or alter input bindings in v0.8.24.1.** Requested by user 14 October 2026. This document is an explicit durable feature specification, not a claim of implementation.

## Eligibility and fairness (design candidates requiring approval/testing)
- **Super Shot:** Stars and Superstars playing MF/FW can qualify. Existing abilities are grandfathered until the future tier-migration milestone; do not remove an existing shot through a roster rewrite now.
- **Super Defense:** Star and Superstar GK/DF can qualify; GK version carries **very high fatigue cost** and meaningful cooldown. DF version costs stamina and has counters. Avoid guaranteed saves, unfair permanent stuns, or unavoidable goal-line walls. Review whether the previously proposed exclusive Shot/Defense specialization remains appropriate for multi-position players; do not silently grant both.
- **Tricks:** only selected Stars/Superstars while possessing the ball, with cooldown/fatigue, visible tells, collision bounds and a way for opponent/CPU to respond. Four on-screen action buttons remain **Pass, Shoot, Dribble, Jump**; use existing combination grammar with anti-misfire rules. General basic dribbling remains for all.
- Balance must be tested across five difficulty levels, AI/human, both directions, 30/60/120Hz, high fatigue, goalkeeper saves, accessibility settings and defensive counters; measure expected goals, possession win rate, per-minute stamina costs and stun-lock frequency.

## Super Defense concepts (proposals, not shipped)
1. Spinning bumper: contact knocks opponents back with short bounded stun.
2. Comic mace/bat bonk: stylized cartoon impact and brief stun (non-graphic).
3. Fire Wall, Ice Wall, Magic Wall, Demon Wall: different readable barrier visuals and timed defensive rules.
4. Supernova: spectacular area pulse with very high cost and a clear telegraph/counter.
5. Unique character-specific funny animations, with safe flash/intensity and reduced-motion variants.

## Ball-carrier Trick concepts (proposals, not shipped)
- Comic mace/bat bonk; sand-in-eyes brief disruption; spinning body bump; temporary hiding with own-team highlighted outline and opposing AI vision suppression; invisible ball with fair readable countercue; scream/stun.
- Lightning near a defender; riding a ball like a wheel; standing on teammate's shoulders; comic fireball and temporary cartoon burn; ice patch/slip; gust/wind knockback; blink forward (bounded displacement); mud trail slows pursuers.
- Every stun, burn, electrocution, invisibility, teleport and area effect must be temporary, non-stacking past a cap, legible, and accessible. Keep friendly-fire/team play, fouls, stamina, goalkeeper immunity windows and competitive fairness in future acceptance tests.

## Release gates
1. Confirm player-tier qualification matrix and existing ability migration; no routine world-roster corrections.
2. Approve mappings to the *same four buttons* and interaction priority versus aerial Super Shots.
3. Implement one defensive and one trick prototype behind feature flags at their future milestone.
4. Compare controlled gameplay with baseline, add Node and browser/manual physical-device QA.
5. Expand ability roster and art only after balance sign-off.
