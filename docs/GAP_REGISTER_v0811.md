# Open-gap register — prioritized after v0.8.11

This register describes **work still outstanding**; it is not a claim that all requirements can be finished in one increment. It consolidates the three uploaded `NEXT_MILESTONES` files, the v0.8.10 source, and the current 200-item tracker.

| Priority | Open gap | Actual condition and acceptance check | Next increment |
|---|---|---|---|
| P0 | Reliability of four-button edge actions | Automated Android flying-kick test initially flaky; isolate timing/players, then test deterministic touch transitions, Player 2 mappings and goalkeeper actions | v0.8.12 |
| P0 | Roster validity | 2026 players and clubs contain many fictional academy stand-ins and mismatched positions; three external audit CSVs are proposed corrections, not verified truth | Data batch milestones; verify with dated sources |
| P0 | Visual identity of famous players | Face/hair diversity improved but real stars are still not reliably recognizable; no locked exclusive faces | v0.9.x art creator |
| P1 | Full character creator | Missing 20 face types, 20 hairstyles, 10 facial hairs, height 155–210 cm, body types, footwear, eye/beard colors and save migrations | v0.9.x staged |
| P1 | Detailed historical mechanics | Original match/combo/free-kick/cards/calls/gifts/mood are not reproduced faithfully | Reference-based Nintendo parity milestones |
| P1 | Special move catalogue | Two defensive and two GK specials; offensive transformations have repeated approximate themes; requested 30–40 + 20 + 10 mechanically distinct moves not finished | Ability batches |
| P1 | Team management & penalties | Set-piece player assignments exist, but actual free kicks/corners and advanced penalty dribbling/GK interaction need work | Follow-on mechanics |
| P1 | International competition | 48+ modern nations incl. Italy, World Cup and continental national cups not yet added | Data + tournament milestones |
| P1 | BPW seven squads | Only six older legend squads currently ship; new 1998–2026 nonduplicated BPW selections not built | BPW batch |
| P1 | Arcade pacing/world geometry | User-requested pitch/goal scale and super-shot behavior require grounded gameplay tuning | Physics milestone |
| P2 | UI accessibility & real device QA | Menu keyboard focus, screen readers, real iOS/Android/gamepads not validated | Accessibility/device QA |
| P2 | Career and online | Deeper manager seasons, club infrastructure, contracts and server-authoritative multiplayer remain incomplete | Later |

**Risk rule:** Keep generated or unverified player appearance, names, ratings and market values clearly labeled. Never silently infer them from publicly unverified lists. Historical files with old target versions are archived roadmaps, not the active baseline.


**Resolved in v0.8.11.1:** transformed super-shot ball visual never ending while loose. Regression gate added.
