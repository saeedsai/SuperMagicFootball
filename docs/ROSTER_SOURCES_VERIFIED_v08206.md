# 2026 roster verification — LAFC correction
**Verified on:** 14 October 2026. Existing eight fully verified curated clubs retained from v0.8.20.5; this milestone adds three individually verified LAFC records, **not** a ninth completely verified club.

| Player | Game position / shirt | Birth date | Source |
|---|---|---|---|
| Son Heung-min | FW / 7 | 1992-07-08 | https://www.mlssoccer.com/players/son-heung-min/ |
| Thomas Hasal | GK / 12 | 1999-07-09 | https://www.mlssoccer.com/players/thomas-hasal/ |
| Hugo Lloris | GK / 1 | 1986-12-26 | https://www.mlssoccer.com/players/hugo-lloris/ |

Corroboration: official club roster https://www.lafc.com/roster/ and published roster rundown https://www.lafc.com/news/roster-rundown-2026 .

## Corrections and limits
The previous Los Angeles FC roster incorrectly placed the star forward Son Heung-min at **GK**. Son's existing stable slot ID `cont_concacaf_22_0` now has FW role and verified #7. A fictional FW slot `cont_concacaf_22_8` now represents backup GK Thomas Hasal, #12. Hugo Lloris is GK, #1. To avoid duplicated shirts in the remaining fictional placeholders, two placeholder jersey numbers were reassigned; these are **not certified official shirts**. All 12 existing saved slot IDs are retained. The other nine LAFC slots remain source-unverified and are not presented as real-world club registration records. Numerical game attributes, transfer values, skin/face likenesses and Super Shot ability levels remain provisional; `statsVerified:false`, `appearanceVerified:false`.

Age calculations use 2026-10-14 (Son 34, Hasal 27, Lloris 39). Complete club-role verification count is 99 slots (96 prior + 3 new). No national-team duplicate was auto-merged by name.
