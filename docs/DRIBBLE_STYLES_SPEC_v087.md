# v0.8.7 — Ten dribble profiles and match behavior

## Input and player data

- First Dribble tap: regular forward feint if carrying ball, or player switch without possession.
- Second Dribble press within 0.30 seconds: player's assigned special dribble when eligible.
- Four visible actions are unchanged: Pass, Shoot, Dribble, Jump. No popup.
- Every player now has `dribbling` (1–100) and `dribbleType` (`sideStep`, `roulette`, `elastico`, `rainbow`, `swerve`, `dragBack`, `heelFlick`, `stepovers`, `nutmeg`, `lightningCut`). Invalid IDs fall back to deterministic name hashing. Keep explicit values on save import.

## Styles

| Name | Distinct behavior | Risk/reward |
|---|---|---|
| Side Step | Quick side escape | Short cooldown/low energy, moderate tackle resistance |
| Roulette | Wide sideways rotation | Better evasion, slower recovery |
| Elastico | Sharp diagonal lateral cut | Faster forward progress, moderate cost |
| Rainbow Flick | Aerialized ball graphic + burst | High stamina/cooldown |
| Body Swerve | Strong forward feint | Least stamina/cooldown, less defensive cover |
| Drag Back | Reverse move + cut | Retreating exit, greater defense |
| Heel Flick | Forward toe lift | Fast recovery, limited lateral avoidance |
| Stepovers | Wide deceptive shift | Strong temporary tackle resistance |
| Nutmeg | Direct forward passage; nearby defender can be briefly stunned | Highest physical-contact risk; may spill ball on failure |
| Lightning Cut | Biggest forward+diagonal displacement | High power and stamina, long cooldown |

## Mechanisms

A dribble is legal only with possession and without stun, keeper status, cooldown or severe exhaustion. Chance vs nearby defender is clamped and compares carrier Dribbling/Agility/Fatigue with defender Defence/Aggression and the chosen style's evasion modifier. Failure reduces movement and can lose possession. Successful tricks carry a brief stat-dependent tackle-resistance window, never guaranteed invulnerability. Cooldown and stamina vary by style. The renderer draws a colored trail and the specific trick name. AI under pressure can attempt the same player-specific move, based on difficulty awareness. Substitutions preserve current cooldown.

## Compatibility/limits

All prior saves can import; unspecified styles/ratings receive defaults. No network required. Named real-world player style assignments are currently game-editorial, not verified historical dribbling signatures. No frame-accurate Nintendo animation or physical controller certification is claimed.
