# Superseded Super Shot mirror trace — 3 November 2026

## Status: original fixture was not mirrored

This report's first interpretation incorrectly labeled lineup source ID `jp0` as the goalkeeper. It is the midfield kickoff taker (`p.i === 3`, `keeper === false`). `GameEngine.init()` offsets Team 0's kickoff taker; the original trace harness moved only the selected attacker. Thus the two compared directions started from unequal positions, and the tick-1 difference was a fixture artifact. The old JSON remains available for provenance but should not be read as evidence of a runtime goalkeeper asymmetry.

A corrected paired-state regression resets all non-shooter slots to their formation home positions and matches normalized player/ball/keeper state before and after the first simulation tick for ordinary and Silver Carp shots across three seeds (**6/6 pairs**). No production correction was warranted. See [corrected setup evidence](SUPER_SHOT_MIRRORED_FIXTURE_SETUP_20261103.md).

The separate corrected full-match diagnostic runs **108** regulation simulations across three fixed seeds. **13/54** reflected score pairs match; the rest remain unexplained by this setup correction. Since the global RNG is consumed in engine update order instead of being remapped by normalized role, this result cannot yet separate stochastic ordering from gameplay directionality. See the [updated whole-match report and data](SUPER_SHOT_WHOLE_MATCH_BALANCE_20261103.md).

The original 13-pair trace used one seed and invalid initial setups. Its archived JSON, [invalidated diagnostic source](SUPER_SHOT_MIRROR_DIVERGENCE_TRACE_INVALIDATED_20261103.mjs.txt), and table must not be used for balance or fairness conclusions.
