# BPW All-Time Legendary 12 — shipped v0.8.23.1

**Priority:** P0 user-requested scope override, implemented ahead of remaining audio polish. Added as a seventh BPW team and a separate `bpw_alltime` picker category; six tournament-specific BPW World Cups (1998, 2002, 2006, 2010, 2014, 2018) still exist unchanged.

| Slot | Name | Country | Role | User legendary card rating |
|---:|---|---|---|---:|
| 1 | Lev Yashin | USSR (SU) | GK | 99 |
| 2 | Gianluigi Buffon | Italy (IT) | GK | 98 |
| 3 | Franz Beckenbauer | Germany (DE) | DF | 99 |
| 4 | Paolo Maldini | Italy (IT) | DF | 99 |
| 5 | Sergio Ramos | Spain (ES) | DF | 98 |
| 6 | Diego Maradona | Argentina (AR) | MF | 99 |
| 7 | Zinedine Zidane | France (FR) | MF | 99 |
| 8 | Johan Cruyff | Netherlands (NL) | MF | 99 |
| 9 | Lionel Messi | Argentina (AR) | MF | 99 |
| 10 | Pelé | Brazil (BR) | FW | 99 |
| 11 | Cristiano Ronaldo | Portugal (PT) | FW | 99 |
| 12 | Ronaldo Nazário | Brazil (BR) | FW | 99 |

**Meaning of ratings:** these are user-selected fictional *in-game legendary card ratings*, **not** licensed EA Sports/FIFA overall ratings and **not** the position-based OVR obtained from the mean of six numeric gameplay attributes. The menu shows LEG separately from calculated OVR. Position choices are user editorial selections, not asserted primary historical roles (e.g. Messi is explicitly MF in this squad). No fictional birth dates or faux source checks were added; illustrated appearances are gameplay-derived, not verified authentic likenesses. Some names reappear from World Cup BPW editions by design; roster slot IDs remain unique.

**Installation:** `installBPWAllTime()` runs after the six existing BPW World Cup teams and after previously saved user clubs. New stable ID is `bpw_alltime_legendary_12`, original six BPW and all saved-team numeric indexes are unchanged. `group='bpw_alltime'` distinguishes the seventh team from `group='bpw_worldcup'`. Unique custom roster slot IDs end in `_0` through `_11`. These remain stable for saves. The game has **223 base teams** without user clubs and **2,676 base player slots**.

**Visual & controls:** original generative crest/colors, 12 cartoon face portraits, six starter formation portraits, two goalkeeper slots; accepts all six current formations and runs home or away in Quick Match. No fifth action or new attack grammar introduced. The selected team's Super Shot preset uses an existing shot type; no custom legendary-exclusive shooting ability is invented for this milestone.

**QA:** `tests/v08231_bpw_alltime.mjs` and `tests/v08231_bpw_alltime_browser_qa.py` (desktop Chromium + simulated touch), plus inherited `tests/v0822_bpw_world_cups.mjs`, existing formation/super control tests, and full master suites. See `TEST_REPORT_v08231.md` for executed evidence. Physical devices and historical visual accuracy not certified.
