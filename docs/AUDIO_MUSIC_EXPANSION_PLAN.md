# SuperMagicFootball — Future Audio & Music Expansion Plan
**Status:** Planned backlog only — no audio assets downloaded or shipped.
**Added:** 2026-10-22. **Priority:** After current gameplay/QA/release work; do not block dev increments or protected deployment.

## Product goals
Build a cohesive, energetic, playful arcade-football soundtrack and reactive effects library. Music should rotate among several distinct, compatible tracks, rather than one song repeating indefinitely. Keep music and SFX separately adjustable, optional and mobile-friendly. Preserve four gameplay buttons, offline play and current save formats.

## Music zones and initial playlist targets
| Zone/event | Mood and proposed number of licensed tracks |
| --- | --- |
| Main menu / title | 6–10 catchy chiptune, electro-funk, arcade-sport loops |
| Quick Match, Career, Leagues/Cups menu navigation | 3–5 each, distinct thematic playlists and smooth transitions |
| Team selection, formations, player customization, settings | 2–4 each, lower-intensity loops; avoid interrupting music on every submenu |
| Loading / kickoff / pre-match | 4–6 short musical cues |
| Normal gameplay | 6–10 upbeat, loopable instrumental tracks; stadium ambience layered separately |
| Intense match, late comeback, extra time, penalties | 3–5 tension tracks or adaptive layers |
| Halftime | 4–6 relaxed, motivational or playful tracks; resume match playlist cleanly |
| Tournament boss/final match, championship | 4–6 distinctive high-energy 'boss' / final-match tracks |
| Goal, victory, defeat, draw, cup presentation, career promotion | 3–5 stingers per major category |
| Pause, replay, results, credits | 2–4 each, calm or celebratory as appropriate |

## Sound-effect coverage
- **Menus/UI:** move focus, hover (subtle), select/confirm, back/cancel, invalid input, slider, switch, save, load, success/failure, popup, team selection.
- **Ball:** short/long pass, ground bounce, header, chest trap, ball post/crossbar, net, shot charge, shot release, super shot travel, super shot impact, goalkeeper catch/parry.
- **Players:** footsteps, sprint, dribble touches, slide tackle, normal tackle, jump, landing, collision, stun/KO, dash, super defence, bicycle kick, super bicycle, super header.
- **Match/stadium:** referee whistle (kickoff/halftime/fulltime/foul), crowd ambience and reactions, goal cheer, boo, suspense, penalty, substitution, victory celebration.
- **Accessibility/comfort:** distinct but not harsh UI cues, no excessive repetitive sounds, volume limits and no unwanted autoplay before user interaction.

## Candidate sources (research leads, NOT approved individual assets)
1. Kenney Interface Sounds — https://kenney.nl/assets/interface-sounds — 100 CC0 interface effects.
2. Kenney UI Audio — https://kenney.nl/assets/ui-audio — 50 CC0 button and switch effects.
3. Kenney Impact Sounds — https://kenney.nl/assets/impact-sounds — 130 CC0 hits, useful for tackle/collision layering.
4. Kenney Music Jingles — https://kenney.nl/assets/music-jingles — 85 CC0 short musical stingers; not full background tracks.
5. OpenGameArt — https://opengameart.org/ — search chiptune, sports, funk, boss battle, arcade, halftime; per-track license review.
6. Freesound — https://freesound.org/ — crowd, whistle, ball, stadium, footsteps; filter CC0 and verify every recording.
7. Incompetech — https://incompetech.com/music/ — music with track-specific attribution/license requirements.
8. Soundimage — https://soundimage.org/ — loop-oriented game music; review license and credits.
9. Pixabay Audio — https://pixabay.com/music/ and https://pixabay.com/sound-effects/ — review current Pixabay terms, redistribution, and Content ID risks per item.
10. Eric Skiff / Resistor Anthems — https://ericskiff.com/music/ — retro/chiptune candidates; verify license and credits.
11. 5 Chiptunes (Action) by Juhani Junkala — https://opengameart.org/content/5-chiptunes-action — candidate retro loops, verify source page/license.
12. Kenney RPG Audio — https://kenney.nl/assets/rpg-audio — possible footsteps and movement layers.
13. Tallbeard Abstraction loop collection — search the original author/source; candidate CC0 loop library, verify original source.
14. Sonniss GDC sound libraries — https://sonniss.com/gameaudiogdc — professional Foley candidate; review redistribution terms.

## Asset selection and legal QA gate
For EACH selected track/effect create a manifest row: asset ID, title, author, canonical source URL, download URL, license and version, attribution text, redistribution/embedding permission, Content ID concerns, duration, BPM/key (if music), loop points, codec, compressed size, SHA-256, mapped game zone/event, and review date.
Prefer CC0; allow CC BY only with durable in-game credits and required notices. Reject NC, ND, unknown ownership and licenses that do not permit bundling in an openly accessible GitHub Pages game. 'Royalty-free' or 'free download' alone is not proof of game redistribution rights. Check whether the track is registered in Content ID; avoid recognizable copyrighted commercial songs and game soundtrack rips.
No assets enter repository until their license evidence is recorded and the audio has been auditioned for suitability, consistency, clean loops and absence of speech/advertising.

## Implementation phases (future iterations)
1. **Discovery and curation:** shortlist at least 40–60 candidate background tracks and 100+ candidate effects; listen, deduplicate, classify and license-audit; choose a coherent initial pack of ~20–30 songs and 40–80 effects.
2. **Audio manifest:** versioned JSON catalogs with source/license metadata and zone playlists; validate paths, unique IDs, missing files and credits.
3. **Music director:** menu/halftime/match/final playlists, shuffle-bag without immediate repeats, crossfade, per-zone overrides, track resume, optional next-track and music toggle. No track change on every submenu focus; change on meaningful zone transitions or track completion.
4. **SFX event mapping:** varied samples with pitch/volume jitter and cooldowns; tackle, pass, shoot, goal, keeper, super moves, crowd, whistle and UI; duck music under important cues.
5. **Settings/accessibility:** independent Music/SFX/Ambience sliders, mute, reduced audio mode, browser autoplay handling, mobile/touch support, headphones and offline caching.
6. **Performance and QA:** preload only short essentials, lazy-load playlists, prefer compressed OGG/MP3 with browser fallbacks, enforce asset-size budget; automated manifest/license/404 tests, Chromium audio unlock tests, desktop/mobile smoke and offline tests.
7. **Release:** version bump, README and About release notes, service-worker rotation, full 4+4 regression and Modular QA, protected dev→main promotion and hosted Pages verification.

## Acceptance criteria
- At least three distinct playable songs in each high-traffic music zone (menu, match, halftime, final) at first rollout, plus a larger expandable catalog.
- No audible clipping, excessive loudness jumps, rapid menu-switch music restarts or unexpected autoplay.
- SFX distinct enough to recognize key actions, with repetition limits and adjustable mix.
- All shipped files have audited redistribution rights and credits; fully playable offline after cache.
- No regression to four-button controls, roster data, existing saves, touch/gamepad/keyboard or release workflow.
