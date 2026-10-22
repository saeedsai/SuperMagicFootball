// Supermagic Football v0.8.25.30 | DRIBBLES | independently editable module
import {GAME_ASSETS} from "../assets.js";
const DRIBBLES=(()=>{// v0.8.7: ten gameplay-distinct dribble archetypes. Original remake moves.
// Stable identity selection is based on the person's name, so club/national versions
// use the same style. An explicit, valid roster dribbleType always takes precedence.
const DRIBBLE_STYLES=Object.freeze(GAME_ASSETS.mechanics.dribbleStyles);
const LOOKUP=new Map(DRIBBLE_STYLES.map(s=>[s.id,s]));
const dribbleStyle=(id)=>LOOKUP.get(id)||DRIBBLE_STYLES[0];
function stableHash(value){let n=2166136261;for(const c of String(value).normalize('NFKD').toLowerCase())n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n>>>0;}
function assignedDribbleType(player){
 if(LOOKUP.has(player?.dribbleType))return player.dribbleType;
 // Names, not roster indices: a famous player's trick identity is stable.
 return DRIBBLE_STYLES[stableHash(player?.name||player?.id||'rookie')%DRIBBLE_STYLES.length].id;
}
function dribbleOdds(p,defender,style){
 const offense=(p.dribbling*.57+p.agility*.43)*(1-(p.fatigue||0)*.28);
 // Tired defenders are less effective at reading an attacker; the penalty is bounded.
 const defenderFatigue=Math.max(0,Math.min(1,Number(defender.fatigue)||0));
 const defense=(defender.defence*.67+defender.aggression*.33)*(1-defenderFatigue*.18);
 return Math.max(.12,Math.min(.95,.47+(offense-defense)/155+style.evade*.29));
}

return {DRIBBLE_STYLES,dribbleStyle,assignedDribbleType,dribbleOdds};})();

export {DRIBBLES};
