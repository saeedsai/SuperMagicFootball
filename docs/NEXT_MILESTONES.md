# Supermagic Football — Living Development Roadmap v0.8.17.1

**Current tested baseline:** v0.8.17.1, 13 October 2026. **218 tracked requirements: 39 Done / 120 Partial / 59 Missing**, preserving all previous requests (including #217 and #218).

## Just completed — priority input fixes

- v0.8.17 control reliability: Pass, hold-Jump run, Switch, auto-switch.
- v0.8.16.2 robust rapid input merged: buffered keyboard/real touch events, multi-pointer continuity and joystick handoff.
- v0.8.17.1 contextual chord correctness: Pass+Jump and Jump+Pass single cross; Jump+Dribble single bicycle; short Jump/tap and hold-Jump run compatibility.
- 29/29 Node suites, all 19 inherited browser regressions by completed reruns, and focused desktop/simulated-Android control tests passed.

## Next focused milestones

| Priority | Increment | Acceptance criteria |
|---|---|---|
| P0 | **v0.8.18 — goalkeeper catch, throw and contextual distribution** | Deterministic catch possession/animation, short pass to nearest teammate, long punt to forwards, press-under-threat decision; focused 4-button and AI tests |
| P0 | v0.8.19 — curated cartoon player identities | Flagship clubs/national stars, labels/presets, funny face and kit polish, reviewed screenshots |
| P0 | v0.8.20 — verified roster correction batch 2 | Source-backed first-team memberships; 12/team 2 GK / 3 DF / 4 MF / 3 FW preserved, high-value/star review and stable IDs |
| P1 | A later staged control increment | **#217 Hold Dribble+Jump** pop ball overhead without jumping; **#218 follow-up Jump+Shoot** strong untransformed bicycle; timing/cooldown/fatigue and existing tap bicycle priority tests |
| P1 | Expanded special-ability catalog | 30–40 unique super shots, 20+ super defenses, 10+ rare GK moves, five-tier levels, unique visuals and AI |
| P1 | Advanced player creation | 20+ faces, 20+ hair, 10+ facial hair, heights 155–210 cm, reusable player IDs and unique elite faces |
| P1 | International competitions and national expansion | +48 top countries incl. Italy, World Cup, continental national cups, verified rosters |
| P1 | Seven BPW era squads | 1998, 2002, 2006, 2010, 2016, 2020 and 2026; 12 per squad and no BPW-era player repetition |
| P2 | Career/online/full Nintendo feel | Manager growth, new competitions, online, source-based gag mechanics, physical-controller validation |

## Development discipline

One bounded milestone at a time. Each build updates the source, completed tests and inherited regressions, feature tracker, remaining-gap register, specification, changelog, README and versioned standalone HTML/source ZIP. A simulated Android browser is **not** physical-device certification.
