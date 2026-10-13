# Supermagic Football v0.8.17.1 — Test and Regression Report

## Acceptance scope

Input-order independence, exactly-once resolution of Jump+Pass crossing and Jump+Dribble bicycle, legacy tap/hold Jump, quick Pass, four-button phone layout and preservation of the prior gameplay systems.

## Automated results

| Test group | Result | Notes |
|---|---|---|
| Full Node gameplay suite | **29/29 PASS** | Includes inherited 27 suites, new `combo_priority.mjs` and buffered-input `input_buffer.mjs` |
| Inherited browser suites | **19/19 PASS** | Six first-batch suites passed, then the combined process timed out in the player-stats test. Stats passed on isolated rerun; 12 remaining scripts passed in three further batches. |
| New priority browser QA | **Desktop PASS / simulated Android PASS** | CDP touch and keyboard: Pass→Jump, Jump→Pass, Jump→Dribble, exactly one action and no page errors |
| Rapid-tap browser QA | **Desktop PASS / simulated Android PASS** | Subframe Pass, Switch and multi-button buffering |
| v0.8.17 control reliability browser QA | **Desktop PASS / simulated Android PASS** | Test updated to assert buffered two-poll release behavior rather than the earlier same-poll assumption |
| Additional browser scripts | **8/8 PASS** | Secondary controls, cartoon identity, character art, rosters, super levels, AI pursuit, fullscreen/brand and other inherited control coverage |
| Standalone HTML | **Build PASS** | `python tests/build.py` |

## Observed test-run interruptions and corrections

- The combined seven-script browser batch reached the execution limit after six passing scripts. The seventh test, `stats_browser_qa.py`, was then rerun in isolation and **passed**. This timeout is not counted as a passing execution.
- `control_reliability_browser_qa.py` initially expected the old input implementation's same-frame release flag. With buffered edges, a subframe tap is intentionally observed as one pressed frame followed by a release frame. The test was updated to assert the intended two-step behavior; no gameplay bypass was introduced.
- All browser counts above are based on completed reruns, not a claim of one uninterrupted combined QA command.

## Remaining limitations

- Physical Android/iPhone, Safari/Firefox and actual wired/Bluetooth gamepads are not tested here.
- Timing near overloaded frames and double-tap controls still need longer human playtesting.
- Features #217 and #218 (grounded ball pop and high-power non-transforming bicycle follow-up) are **not implemented**.
- This patch does not finish goalkeeper animation/throw polish, roster authenticity, special-move catalog, BPW, World Cup or online multiplayer.
