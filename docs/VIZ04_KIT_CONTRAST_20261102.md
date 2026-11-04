# VIZ-04 kit contrast audit — 2 November 2026

The generated away primary color is compared with its source home primary using WCAG relative luminance. The selection preserves the team secondary when its contrast ratio reaches 2:1; otherwise it chooses a deterministic dark/navy or warm-light fallback. Across all 223 teams the minimum same-team home/away ratio is **2.0604:1**. This threshold is a jersey distinction guard, not a text-accessibility claim.

Match setup now reports the primary-color ratio for the selected home and away kit choices. If the ratio is below 2:1, a player can choose **IMPROVE KIT CONTRAST**. It selects a passing pair while making the fewest changes; already passing manual choices are preserved, and no choice changes automatically. The exhaustive regression tests all **49,506 ordered matchups** between distinct source teams. The default home-kit versus away-kit pairing is below 2:1 for **8,800** pairs; the lowest resulting recommended ratio is **2.0049:1**.

`tests/kits_contrast.test.cjs` verifies all generated same-team and opposing-team pairings, unchanged home primary colors, canonical IDs, deterministic recommendations, and least-change behavior. Desktop and simulated-touch Chromium checks exercise the clash warning, recommendation, manual override, persistence, and kickoff.

Relative luminance cannot establish perceptual distinction at actual game scale. This audit does not replace owner visual approval or physical-device readability review. Source roster data, gameplay physics, save format, and club identity remain unchanged. Integrated evidence is in [`qa_runs_012430_integrated_20261102`](qa_runs_012430_integrated_20261102/README.md).
