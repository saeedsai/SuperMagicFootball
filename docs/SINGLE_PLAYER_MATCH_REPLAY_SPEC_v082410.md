# Seeded single-player match replay — v0.8.24.10

The harness uses a controller that calls the **same game input methods** as a player would (`state`, `poll`, `just`, `released`), with exactly Pass, Shoot, Dribble and Jump. Each run plays both regulation halves at a deterministic 30 Hz simulation step. The away team is controlled by the selected CPU difficulty; defenders and goalkeeper move normally. Tied games proceed through penalty shootouts. There are three distinct fixture/policy/weather configurations at each of five difficulty levels (15 complete matches total).

Observed regulation outcomes: **5 home wins, 3 CPU wins, 7 draws sent to penalties**. Ties are completed via the shootout simulation; they do not count as regulation wins. Replay deterministic equality is asserted by repeating a seeded fixture. Data source: `docs/HUMAN_CPU_REGULATION_REPLAYS_v082410.json`.

**Limitations:** This is a scripted controller—not an actual human. Three fixtures per difficulty are insufficient to establish win-rate percentages or goalkeeper save percentage with useful statistical confidence. The event named `kick` includes passes, so kick totals must not be reported as shot accuracy. Possession observations sample ball ownership, not continuous zonal control; no win-rate claim is made. A physical-device player study is still required.

**Planned extension:** More seeds per team pair, possession chains, attacking opportunities with shot-vs-pass classification, goalkeeper deflection/catch separation, frame-rate comparisons and device input captures. Never reuse the historical AI-vs-AI calibration as a player difficulty comparison.
