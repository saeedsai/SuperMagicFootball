# Audio design — v0.8.23

`src/audio.js` creates original synthesized music and effects entirely at runtime via Web Audio; no sampled commercial tracks or network assets. Two distinct 8-note motifs are used for menu and halftime. Match play prioritizes isolated event cues. User gesture unlock, tab suspension, rate limiting, scene transitions, master mute and five category gain levels are implemented. Settings persist under the existing `legend_` prefix using `audioOptions`. Existing legacy `sfx=false` acts as mute.

Cues: kick, keeper saves/catches, goal celebration, tackle/slide, stun/knockback, defense and aerial special, halftime, fulltime, penalty hit and UI click. Ambience gain slider is reserved for future crowd ambience, not yet producing ambience sound; this is explicitly not complete. Audio scene changes stop the previous motif rather than crossfading, a known polish gap. Musical motifs are procedurally authored for this project.

Hardware auditory quality, Safari auto-resume, Bluetooth latency and actual persistent storage need real-device qualification.
