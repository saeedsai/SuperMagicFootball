# Music and sound design production plan — not implemented in v0.8.18

Existing game contains very basic synthesized event beeps controlled by Settings > Sound. Rich music and event SFX below are **backlog**.

## Music cues
- Main menu: looping upbeat signature theme, arcade energy, no recognizable copyrighted compositions.
- Match setup, player selection: short versions and transitions.
- Kickoff/match ambience: optional lightweight loop and layered audience/field noise, lower than impact SFX.
- Halftime: distinct transition sting and brief background music.
- Goal celebration: escalating victory musical sting, goal crowd response and optional customized team cheers.
- Fulltime win/draw/loss, penalties, tournament trophy, game over: separate musical cues.

## Sound effects
- Pass, regular shot, ball bounce, pitch contact, keeper catch/punt/save, UI navigation.
- Slide tackle travel/impact, body hits, temporary stun, super-shot knockback, airborne player launch/landing.
- Signature super-shot startup, midflight transformations, near-miss, defense activation, super save and goal impact.
- Crowd reaction, whistles, match kickoff, halftime and fulltime, weather and stadium ambience.

## Engineering acceptance gates
1. Author or properly license original sound/music; avoid unlicensed game soundtrack samples. Use Web Audio and compressed offline-compatible assets.
2. Separate music/SFX/UI/ambience volume sliders, master mute, defaults respecting system/browser autoplay policies.
3. Music crossfade by menu/play/halftime/fulltime; unlock audio on deliberate user interaction only; pause/resume on blur.
4. Deterministic event-to-cue mapping, variation without overwhelming repeated hits; rate-limit audio triggering during multi-hit effects.
5. Audio latency, performance, offline caching and mobile memory budget QA; captions/visual feedback for players with sound off.
6. Regression for goal, tackle, stun, launch, special, save, halftime and ending event hooks; no silent missing asset errors.
