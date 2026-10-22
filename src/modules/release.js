// Authoritative player-facing release metadata. Change only with certified game releases.
// Internal Git SHAs remain in GitHub Actions and release audit; never infer a deployed build from remote dev.
const RELEASE=Object.freeze({
 version:'0.9.13.1',
 date:'2026-10-22',
 notes:Object.freeze([
  'Player Studio now equips Trick levels 1–5 with a bounded dribble proficiency bonus.',
  'Player Studio now supports choosing Super Shot types and levels 1–5 for midfielders and forwards.',
  'Player Studio now lets outfield players choose and save one of ten trick styles.',
  'Rainbow Flick counterplay now scales with the approaching defender speed.',
  'Agile, fresh defenders can anticipate close-range Nutmeg tricks; tired defenders lose the counter.',
  'Live Nutmeg tricks now use the actual defender distance, movement and stamina for spatial timing and counterplay.',
  'Nutmeg trick success now has a medium-distance timing sweet spot; defenders can counter at the edges of the window.',
  'Agile ball carriers can now sidestep nearby closing defenders, with a stamina-sensitive capped footwork advantage.',
  'Fatigued defenders now have a weaker close-pressure read advantage during dribble duels.',
  'Closing-defender dribble-read advantage now fades with distance and disappears beyond the close-pressure radius.',
  'Dribble duels now reward actively closing defenders with a bounded read bonus; retreating defenders gain no bonus.',
  'Attacker stamina penalties in dribble success now remain bounded for out-of-range fatigue values.',
  'Defender fatigue now reduces defensive effectiveness against dribbles by up to 18%, making fresh substitutions more valuable.',
  'Player Studio validates defensive equipment against the chosen defence tier before saving.',
  'Trick counterplay now requires closing defenders to face the attacker; sprinting away cannot gain the trick-read bonus.',
  'Active defenders now counter double-Dribble tricks by moving toward the ball carrier; the read bonus is capped and no extra button is needed.',
  'Player Studio defence ability list now updates live with the selected tier, including tier-three Spinning Bumper eligibility.',
  'Player Studio now offers Drill and Burst defensive moves at levels 1–5, while Spinning Bumper requires level 3.',
  'Player Studio now equips eligible defender Super Defence abilities with levels 1–5, guarded saves and no fifth control button.',
  '10 independent Career save slots, including legacy career migration and backup support.',
  'New opt-in Spinning Bumper defender ability prototype with jump and dash counters.',
  'Cup tournaments support ten safe slots, non-destructive duplication, and checked backup export/import and a read-only slot preview before explicit overwrite confirmation.',
  'Improved touch input, match stability, offline caching and regression coverage.'
 ])
});
export {RELEASE};
