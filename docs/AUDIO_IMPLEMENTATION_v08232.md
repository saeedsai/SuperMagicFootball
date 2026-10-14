# Audio implementation and lifecycle — v0.8.23.2

## Original work and offline rights

All sounds originate from `src/audio.js` using browser Web Audio oscillators or a seeded pseudorandomly constructed, low-pass-filtered crowd buffer. There are **no audio downloads, samples, commercial masters, third-party libraries or external license dependencies**. Built `play.html` contains the sound synthesis code inline.

## Scenes and crossfade

- `menu`: repeating 8-note menu motif; `halftime`: different 8-note motif.
- Menu ↔ halftime transition creates a new gain bus and concurrent sequencer, fading the new bus in and the former bus out over **0.85 seconds**. The retired sequencer and gain node disconnect once the overlap finishes.
- `match`: music stops and a low-amplitude procedural filtered-noise crowd source starts. This is original stylized texture, **not** recorded or stadium-realistic crowd chanting.
- `silent` (including pause): stops active music and ambience. Muting and zero master/track volume also silence/tear down the relevant audio nodes. Return to a scene restarts only the allowed sounds.
- Sound-effects and UI cues remain separate with independent gains; no change to shooting, ball physics or event grammar.

## Accessibility, portability and save compatibility

A user pointer, key or touch gesture first creates/resumes an AudioContext; merely drawing the home menu does not autoplay. The context is suspended on visibility loss/pagehide, and resume is attempted on page return and subsequent gestures. Browser promises are caught to prevent unhandled rejections if gesture permissions differ. Five saved controls remain master/music/sfx/ui/ambience plus master mute under `legend_audioOptions`; old `legend_options.sfx` is read for backward compatibility and explicitly synchronized with the new mute selection on settings save. Malformed numbers revert to defaults and text `"false"` does not accidentally activate mute.

## QA and limitations

`v08232_audio_reliability.mjs` checks the synthetic engine's crossfade overlap, no autoplay, active nodes, crowd loops, settings, mute, cleanup and lifecycle. `v08232_audio_storage_browser_qa.py` uses explicit **simulated** storage injected into separate Chromium pages and checks desktop/simulated-touch UI and Web Audio nodes. Real normal-origin storage test was **blocked** by administrator browser restrictions; no physical devices, audio waveform perception or Safari engine have been certified. Run normal-origin and hardware checks externally before production release.
