# SuperMagicFootball integrated local QA — 0.12.27.0

**Date:** 1 November 2026  
**Source:** local uncommitted integration on `dev`, based on `7d2d0d0c6fc4397400c3b1a8a7400faa6009c49d`

| Gate | Result |
|---|---:|
| `npm run test:node` (build, full CJS suite, club parity) | **PASS — 1,518/1,518** (includes contract renewal/confirmation, route focus, team picker, Career age, Cup naming, and CT19 reconnect regressions) |
| Independent Node regression census | **PASS — 385/385** (four latest shards in `../qa_runs_012270_node_releasecheck_20261101/`) |
| Chromium regression census | **140/141** in the pre-transfer fixture run `../qa_runs_012270_browser_latest_20261101/`; the single Player Studio reload timeout under parallel load passed on isolated retry. Career transfer confirmation and VIZ-02 picker live-status checks also passed in isolated desktop/simulated-touch runs. |
| Data validation | **PASS — 223 teams, 2,676 players, 84 avatar presets** |
| Concept source manifest | **PASS — 8/8 layers** (covered by the full Node suite) |
| New country-ball visual QA | **PASS** — Tricolore and Auriverde differ from Classic in actual Canvas output on desktop and simulated touch; selected cosmetic leaves the paired match-engine state unchanged |
| UX-102 forced-colors QA | **PASS** — Chromium emulation verifies system colors and a 3px visible keyboard focus outline; CSS test passes |
| SuperMagicAssetStudio | **PASS** — 237/237 unit, 149/149 contract, 70/70 browser; PowerShell 7.6.5 create/reopen wrapper smoke passes with 8 views and zero warnings (see `../../../SuperMagicAssetStudio/docs/TEST_REPORT_CURRENT.md`) |

SHOT-VFX-02 provides opt-in Japan-inspired Hinomaru, France-inspired Tricolore, and Brazil-inspired Auriverde designs. The France and Brazil color references follow official national descriptions; the ball artwork is original, player-selected, off by default, and never assigned from nationality. [France source](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006527453/2026-02-06), [Brazil source](https://www.gov.br/planalto/pt-br/conheca-a-presidencia/biblioteca-da-pr/simbolos-nacionais/bandeira/bandeira-nacional).

UX-102 adds a forced-colors baseline for menus, forms, focus, HUD and touch controls. Run13 and Run14 remain diagnostic. Run15 improves profile width and passes three-module/mirror/sequence checks, but remains unapproved due to fringe and collar joins. Run16 was rejected because its edit changed 32.77% of the entire source and did not remove those defects. See the [Run15 report](../../references/analysis/player_master_pilot/animation_three_module_pilot/run15_ai_compact_cycle_v1/run15_assetstudio_trial_v1/README.md).

UX28 contract renewal validates career, roster index, player value, term, and available cash before applying a copied roster and new balance together. Buy & Swap confirms fee, outgoing credit and projected budget; Cancel leaves roster and save unchanged. Browser acceptance passes on desktop and simulated touch. VIZ-02 route changes focus the new page heading, while same-page refresh leaves an active editor untouched; the picker announces filtered/empty/capped results. Focused browser checks pass on desktop and simulated touch.

This report records local uncommitted source evidence. It does not certify exact-commit CI, protected promotion, hosted Pages bytes, physical-device acceptance, two-device LAN, human art approval or online server readiness.
