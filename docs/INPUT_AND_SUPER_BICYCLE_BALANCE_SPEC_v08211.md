# Four-button input and Super Bicycle balance — v0.8.21.1

## Release contract
1. Keyboard, touch, gamepad can share action semantics. Ending a touch must **not** release Pass/Shoot if keyboard or other input continues holding the action.
2. A `pointercancel`, `lostpointercapture`, window blur or document-hidden interruption means **ABORT**, not intentional completion. The engine discards pending Shoot charge, Pass hold/chase, Jump pending, and Dribble hold before standard action handling. Live keyboard action is not canceled by an unrelated lost touch capture.
3. Completed quick taps remain queued (up to 12), preserving ordering per action; stale/replayed input cannot trigger extra releases. Input sources cannot recover button transitions that physically occur entirely between gamepad polls (hardware limitation).
4. Four primary actions only. No Special, Sprint, Switch or manual goalkeeper-dive buttons.

## New combo tuning
- Stationary loft: carry ball, hold Dribble >= 0.26s, press Jump; player stays grounded; ball rises.
- Follow-up window: 1.55s, release both; press Jump then Shoot while airborne, ball shape unchanged.
- Velocity = `min(1550 × gameSpeed, (990 + shootPower × 5) × endurance × moraleFactor × gameSpeed)` game-world units/s.
- New Super Bicycle fatigue base cost **0.070** compared to ordinary bicycle **0.035**, with existing stamina scaling. This limits repeat exploitation but is **not a substitute for human balancing tests**.
- Requires possession ownership, valid ball height/distance, non-stunned player, adequate stamina; canceled by interception or timeout.
- Ordinary Jump + Dribble still bicycle; Jump first -> airborne Pass still cross; holding Pass then releasing remains long aerial pass.

## Tests and limitations
- Node script `tests/v08211_control_cancellation_balance.mjs`.
- Browser `tests/v08211_input_cancel_browser_qa.py`, verified desktop Chromium and simulated Android only.
- Earlier ball-lift, input-buffer, formations, GK and Career suites re-executed; see `MASTER_QA_EXECUTION_SUMMARY_v08211.json`.
- Physical devices, USB/Bluetooth controllers, Safari/Firefox and extended human-play balance are not certified.
