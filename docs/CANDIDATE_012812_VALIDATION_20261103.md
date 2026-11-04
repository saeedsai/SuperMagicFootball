# Candidate 0.12.81.2 validation — 3 November 2026

## Delivered

- The host LAN result screen now remains available after both automatic token-wallet receipt writes fail. A polite status and keyboard-accessible retry action let the host make one explicit write attempt per activation. Receipt IDs remain idempotent; confirmed status requires a durable wallet receipt. Leaving or reloading before success loses the in-memory result, which is stated in the UI.
- The featured gold Home accent rail now uses a vertical gradient alongside the five other distinct category rails; the dashboard regression passes on desktop and mobile. The reduced-motion hazard gallery fixture now places Banana Peel inside the initial camera view instead of comparing offscreen pixels.
- The featured Quick Match hover/focus background now stays gold, avoiding a contrast drop against its dark label; Home hover/focus contrast measures **8.09:1** on desktop and touch. Home Store coverage now distinguishes the main route card from its separate accessible wallet shortcut; both Store route entries remain available. VIZ-02 card-name QA compares case-insensitively to account for intended CSS uppercase text without changing the title-case accessible name.
- Updated the four-part candidate, release notes, About metadata, offline cache, root README and current-version references.
- Run22 and Run23 attempted bald-head-only reuse for front Run00. Both pass AssetStudio structural validation but fail the visual/module gates: neck/collar separation, source-face/style fit, leaked source mask details and red edge fringe. Both remain isolated diagnostics; no art was integrated. See [Run22](../../references/analysis/player_master_pilot/animation_three_module_pilot/run00_three_module/iterations/run22_ai_head_fit_review_v01/README.md) and [Run23](../../references/analysis/player_master_pilot/animation_three_module_pilot/run00_three_module/iterations/run23_ai_head_reference_fit_v01/README.md).

## Validation run on 0.12.81.2

- Build: `python -X utf8 scripts/build.py` passed; 4,976,357 JavaScript characters and 5,070,835 HTML fixture characters.
- Full Node suite: **1,939/1,939** passed.
- LAN/P2P Node suite: **444/444** passed. The first combined run had one LAN broker subprocess exit early under concurrent test load; a standalone rerun passed 444/444.
- Release/version contracts: **21/21** passed; release/browser alignment: **137 checks** passed.
- Focused wallet/unlock/Cup tests plus dribble, Magic Trick, Super Shot, Super Defence and shot-impact/reaction tests: **42/42** passed.
- Focused LAN state/duplicate suite: **47/47** passed.
- Real Chromium/WebRTC recovery test on candidate .81.2 injected two automatic host receipt-write failures, then keyboard-activated the explicit retry. It confirmed exactly one receipt per wallet (30/20 tokens), no duplicate payout after repeated ACK, closed result channels and zero page errors.
- The reduced-motion Banana Peel/Ice arming gallery passed on desktop and simulated touch: zero changed pixels in reduced-motion mode, with 469/671 standard-mode changed pixels on desktop and 166/236 on simulated touch.
- Home dashboard browser check passed desktop and mobile with six menu destinations, distinct accent rails, route navigation, Quick Match, Store and Settings.
- Store purchase/ownership coverage passed desktop and touch; keyboard Store flow passed category navigation, paging, purchase announcement and focus retention. The 49-card accessibility tree check passed on desktop and touch at 390×844 and 320×568.
- VIZ-02 menu ID/ARIA/label integrity passed **54/54** route/viewport samples on .81.1 before the LAN-only UI change. No menu source changed in .81.2. The token/UI contracts were covered by the full Node suite.

The fresh 0.81.2 four-shard Chromium census is being rerun after correcting obsolete version pins, the offscreen hazard-test fixture, Home gold-hover contrast, Store-route selectors, and case-sensitive comparison of CSS-uppercased card labels. Its final shard audit and total are recorded below when complete. The audited four-shard 218/218 browser census and structural data validation remain historical evidence from .81.0. The five additional receipt scenarios were run on .81.1; only persistent-write recovery was re-run on .81.2. Hosted deployment, exact-head CI, independent-network multiplayer, authenticated server token settlement, physical-device/screen-reader acceptance, and owner visual approval remain unverified. No team/player identity audit or stat tuning was performed.

See [host recovery evidence](LAN_HOST_TOKEN_RECOVERY_20261103.md), [candidate .81.1 evidence](CANDIDATE_012811_VALIDATION_20261103.md), [current backlog](MASTER_BACKLOG.md), and the [menu ID-reference guard](VIZ02_MENU_IDREF_INTEGRITY_20261103.md).
