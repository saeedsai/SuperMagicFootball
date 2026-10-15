// Supermagic Football v0.8.25.30 | AI | independently editable module
import {GAME_ASSETS} from "../assets.js";
const AI=(()=>{// Five behaviour profiles. These affect COMPUTER opponents only; human controls and
// teammate assistants keep the baseline Normal profile. Tunable without changing match code.
const AI_LEVELS=GAME_ASSETS.mechanics.aiLevels;
function aiTuning(value) {
  const index = Number(value);
  return AI_LEVELS[Number.isFinite(index) ? Math.max(0,Math.min(4,Math.trunc(index))) : 2];
}


// Computes pressing assignments from the players actually controlled by AI.
// One active runner attacks the ball/ball carrier; the next covers a passing
// lane. It never assigns the human-selected player as the only pressing bot.
function defensivePressers(players,team,target,humanControlled=null){
 if(!target)return {primary:null,support:null};
 const candidates=players.filter(p=>p.t===team&&!p.keeper&&p!==humanControlled&&p.stun<=0)
  .sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y));
 return {primary:candidates[0]||null,support:candidates[1]||null};
}

return {AI_LEVELS,aiTuning,defensivePressers};})();

export {AI};
