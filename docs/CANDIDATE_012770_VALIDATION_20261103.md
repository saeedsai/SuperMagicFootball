# Candidate 0.12.77.0 validation — gameplay, recovery motion, Store and LAN

## Delivered

- Manual keeper Super Defence now rejects transformed shots while Silver Carp, Dolphin, or Wave is underground, consistently with automatic keeper behavior. The regression verifies both defending teams and unchanged ball, resources and events.
- Shot-impact get-up now bends/tucks the near knee under the hips while the far leg remains extended. Motion uses the existing 0.24-second timer and changes no gameplay state.
- Store search label and accessible name follow the selected category across all six Store categories, including the Teams/Players Coming Soon states.
- LAN broker pending approvals, decision expiry, replay tombstones and periodic cleanup use monotonic elapsed time. Wall-clock rate-limit and relay accounting remain unchanged.
- Actual local Chromium/WebRTC peers verify one refused guest input send is retried with JUMP and the same sequence; the host channel observes that sequence once. The lead frame remained 14 because it did not advance before retry. Engine/application behavior remains separately covered by deterministic LAN-092 tests.

## Focused validation

- Keeper underground-shot/input engine tests: **4/4**.
- Shot-impact/recovery Node tests: **7/7**; actual-renderer desktop Chromium gallery: **9/9** poses, zero page errors, unchanged player/ball state ([gallery](SHOT_IMPACT_RECOVERY_LEGS_20261103.png)).
- Store category label QA: desktop and simulated touch, all six categories; fixture build passed.
- LAN monotonic clock/broker tests: **22/22**; LAN Node suite reported **370/370**.
- Real two-browser LAN refusal/retry harness passed; `tests/lan_live_match.test.cjs` passed **40/40**.
- Integrated `npm run test:node`: **1,925/1,925** plus club fixture (32 clubs, 384 player slots, 2/3/4/3).
- Release/version contracts: **21/21**.
- Data validation with Python UTF-8 mode: **PASS**, 223 teams, 2,676 player slots, 84 avatar presets, zero errors.
- Four-shard portable-Chromium census: **211/211** with zero failures/timeouts/errors; the four-shard audit passes ([reports](qa_runs_012770_browser_utf8_20261103/README.md)).

## Remaining acceptance

Hosted service operation/restart, hosted bytes, exact-head CI, physical Android/iOS/controller testing, independent physical-device multiplayer and owner visual approval remain separate. Token rewards remain local soft currency, not server-secure; real-money purchase, a trusted server ledger, and team/player unlock content are not included. New concept-team/hero creation and player/team identity audits remain deferred by owner direction.
