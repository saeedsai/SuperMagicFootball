# Input Reliability and 4-Button Contract — v0.8.19.3

## Existing controls (unchanged)

| Situation | Gesture | Result |
|---|---|---|
| Ball possession | Tap Pass | Short pass |
| Ball possession | Hold Pass then release | Long/high pass |
| Airborne with ball | Jump first, then Pass while airborne | Cross |
| Ball possession | Pass first then Jump | **Not** a cross |
| Ball possession | Tap Shoot / hold then release | Regular / charged shot |
| Ball possession | Jump then Shoot | Aerial shot |
| Ball possession | Tap/Hold Jump | Jump / moving run when held |
| Ball possession | Tap Dribble / double tap | Dash / trick |
| No possession | Tap Pass / hold Pass | Standing tackle / chase |
| No possession | Tap Shoot | Slide tackle, longer while running |
| No possession | Tap Dribble | Switch player |
| No possession | Jump then Shoot | Defensive aerial move |
| Both | Movement / direction | Direction input, not a fifth action |
| Goalkeeper | No manual GK button | Automatic dives, catches, safe throw or long punt |

## New input cancellation rule

1. A `pointerup` commits a completed touch gesture and, when appropriate, fires a release action.
2. A `pointercancel` or `lostpointercapture` **aborts** its current gesture. If it was previously rendered as held, the release is suppressed to prevent a charged shot/long pass firing from an OS gesture or finger capture loss.
3. Independent held keyboard controls still function if a touch using that same action is canceled.
4. Failure to acquire DOM pointer capture is tolerated; active pointer tracking continues from received events.

## Low-FPS and extreme bursts

- Completed keyboard and touch press/release pairs between polls are buffered with measured durations and replayed as one press+release per poll.
- To bound stale future actions, store at most **12 unconsumed completed taps per action per slot**. Extra cycles in the *same backlog episode* are discarded rather than replaying after a long stall. This is an intentional safety limit, not a claim that literally every possible tap will execute.
- Real physical gamepad state is only available when polled. Very fast presses that start and finish between snapshots cannot be reconstructed. Browser simulation is not physical gamepad validation.
- Focus loss / hidden tab resets all pending actions and joystick state.

## Test plan and limitations

`tests/v08193_input_stress.mjs`: ordered 12-tap replay, burst cap at 100 taps, canceled held Shoot/Pass, capture loss, independent keyboard/touch, normal re-entry. `tests/v08193_browser_qa.py`: bundled HTML in desktop and simulated Android, 12-tap replay/bounded 100-tap burst, pointer interruptions, valid subsequent taps, four-button UI. Inherited combo/keeper regressions protect unchanged behaviors. Real throttled hardware, pressure from animation frames, and device latency must be measured on actual devices; synthetic burst tests prove the queue behavior only.
