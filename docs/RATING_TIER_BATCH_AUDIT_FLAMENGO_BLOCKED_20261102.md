# Rating-tier source audit blocker: Flamengo (12 players)

**Audit date:** 2026-11-02  
**Scope:** Read-only source availability check for the twelve `club26_31` rows in [ROSTER_TIER_SOURCE_LEDGER_20261101.csv](ROSTER_TIER_SOURCE_LEDGER_20261101.csv). No player-field observations, ratings, tiers, identities, or verification fields were changed.

## Ledger coverage

The ledger contains 12 Flamengo roster rows: Agustín Rossi, Andrew da Silva, Léo Pereira, Léo Ortiz, Alex Sandro, Giorgian de Arrascaeta, Lucas Paquetá, Jorginho, Erick Pulgar, Pedro, Samuel Lino, and Gonzalo Plata. **0 of 12** rows have an FC 27 source player ID or official EA check date. All 12 carry the same [CONMEBOL Flamengo squad source](https://gol.conmebol.com/libertadores/en/news/flamengo-2026-conmebol-libertadores-results-squad-and-schedule), which may support roster context but does not identify EA ratings items.

## Official EA source check

The official [EA SPORTS FC 27 ratings database](https://www.ea.com/games/ea-sports-fc/ratings) describes 19,000+ player items and provides a player search. Its rendered league/team index lists ten selected leagues and their teams; it does not list a Brazilian league or Flamengo. The official [Brazil ratings page](https://www.ea.com/games/ea-sports-fc/ratings/nations-ratings/brazil/54) is nationality-based and is not a Flamengo roster. Exact-name searches on the official EA ratings domain did not surface a Flamengo team ratings page or matching FC 27 player pages for the checked names (Agustín Rossi, Andrew da Silva, Giorgian de Arrascaeta, Lucas Paquetá, Erick Pulgar, Pedro, and Gonzalo Plata).

This is an **identity/source-mapping blocker**, not evidence that every player is absent from every EA mode or item type. Without stable EA IDs or individual EA player pages, same-name matching could confuse distinct players, and the club list alone cannot establish the six canonical game-stat inputs. No field was inferred from a namesake, nationality, FC 26 page, or EA headline summary.

## What would unblock the batch

Provide an authoritative mapping for each ledger player to an EA FC 27 source player ID or official individual ratings URL, or an official EA Flamengo ratings list that exposes those identifiers. Then the ordinary 12-player field audit can proceed. Keep the roster values and tier assignments unchanged until that mapping exists.

## Validation

- Membership check: exactly 12 `club26_31` rows; 0 FC 27 source IDs; 0 explicit EA check dates.
- Source-ledger SHA-256: `4D93C6A8ECFF4F5B383D95AC6FA3F5DB6189F324A3E55F0FC6625514DD3150A1` (unchanged).
- Scope: documentation-only blocker note; no roster or ledger writes.
