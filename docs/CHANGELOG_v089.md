# Supermagic Football — v0.8.9 Alpha changelog

### Added

- Structured home-page navigation with Play, Championship/Career and Management/Customization sections; responsive action tiles and quick stats.
- Specific simulated-mobile-landscape layout: prioritizes menu functionality above animated poster.
- Audited three newly attached roster CSVs, written a 734-row review queue and a source-dependent correction plan.
- BPW seven-team roster rule specification (1998, 2002, 2006, 2010, 2016, 2020, 2026), 84 unique era selections, shared base identities and BPW-only variants.
- Extended the master tracker from 184 to 200 items.

### Preserved

- 216 teams and 2,592 roster slots, prior AI, 4-button control, home/away kits, cups, career, save import/export and offline standalone build.

### Not implemented

- Any roster correction, any new or replacement BPW team, any new iconic face/ability, cartoon flag or club-crest art, character graphics rework. These are separate backlog work.

### Internal

- 0.8.9 version and service-worker cache keys; updated standalone export and current browser version assertions.
- Browser regression adjusted one **test scenario only**: flying-kick target at 88px instead of 42px to avoid collision-stun preempting the action under test.
