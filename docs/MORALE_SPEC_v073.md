# Match Morale & Comedy — v0.7.3 design spec

## Data model

- `GameEngine.moraleLedger[team][playerId]`: 0–100 numeric, defaults to 55; includes 12 players per team.
- `GameEngine.talksUsed[team].pregame / halftime`: once per team/period, reset only by a new match.
- `personalityOf(src)`: stable hash derived from player ID/name: sensitive, bold, playful, disciplined. This is procedural fiction, **not** a verified original player-profile archive.
- `player.morale` mirrors ledger for the active six. After substitutions, kickoff and bench swaps, the ledger restores emotional state.
- `reactToTalk`: matching personality choice +13, strongly disliked choice -10, other choices +2/+4/+5. Halftime deltas scaled to 75% and rounded; results bounded 0–100. No reroll exploit.
- `goalMorale`: scorer +11, conceder -13; applies to active and bench; resets only when a new match starts.

## Gameplay effects

`moraleFactor(M) = 0.82 + 0.003*M`, for M in [0,100], multiplier 0.82–1.12.

- Running top speed multiplies by `moraleFactor` in addition to fatigue/terrain/Speed.
- Normal and transforming shooting velocity multiply by morale. Aiming spread divides by morale.
- Knockdown contest attacker chance scales by `moraleFactor(attacker) / moraleFactor(defender)`, bounded 0.96.
- Morale changes do not override fatigue and do not make a team immune to knockdowns.

## Match user experience

Before kick-off choose: no talk, encouragement, challenge, joke, focus. Each player reacts according to personality, sometimes negatively. At halftime choose another talk before resuming. During a goal sequence the losing team visibly cries for 3.3 seconds and the scoring team performs a varied celebration. Character-specific jokes/animation sheets remain future work.

## Known differences from the Nintendo original

The original has character-specific dialogues, gifts, phone calls and a historic mood system. v0.7.3 only delivers a new data-driven foundation and light comedy, not full mechanics parity. Versioned sources and tests are authoritative on delivered scope.
