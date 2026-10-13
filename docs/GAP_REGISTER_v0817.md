# Priority gap register v0.8.17

## Closed in this hotfix

- Rapid Pass and Shoot taps missed between animation polls → input down/up queues and Shoot tap fallback.
- Ultra-fast moving Jump taps could double-activate → one-action-per-tap arbitration.
- Hold Jump while carrying ball jumped instead of sprinting → delayed tap vs hold gesture.
- Manual defensive switch jumped through two players in one frame and appeared not to work → selected-player snapshot.
- Auto-switch disabled whenever the user steered the joystick → clear distance/hold constraints and manual override grace.

## Backlog, not implemented

- #217: Hold Dribble + Jump lifts ball overhead **without leaping**.
- #218: During that lift, Jump + Shoot gives non-transforming high-powered super bicycle shot.
- Need combo-priority state machine because existing Jump+Dribble bicycle is already implemented.

## Still partial or unverified

- Real Android/iPhone and physical gamepad acceptance; simulated browser touch only.
- Manual balance/ergonomic testing for pass-release timing and sprint-hold feel.
- Team roster verification, hand-directed real-player caricatures, 7 BPW teams, 48+ national teams, cups, larger super-move catalog and online multiplayer remain open.
- Advanced GK controls/catch/throw and long-session smarter AI balancing remain open.
