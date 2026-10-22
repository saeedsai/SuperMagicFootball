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
 // Clamp fatigue before applying the attacker's stamina penalty, matching defender bounds.
 const attackerFatigue=Math.max(0,Math.min(1,Number(p.fatigue)||0));
 const offense=(p.dribbling*.57+p.agility*.43)*(1-attackerFatigue*.28);
 // Tired defenders are less effective at reading an attacker; the penalty is bounded.
 const defenderFatigue=Math.max(0,Math.min(1,Number(defender.fatigue)||0));
 // Active closing defenders can read a trick better than defenders moving away.
 // Directional awareness is opt-in: existing callers without velocity/position retain prior odds.
 const dx=Number(p.x)-Number(defender.x),dy=Number(p.y)-Number(defender.y);
 const vx=Number(defender.vx),vy=Number(defender.vy);
 const closing=Number.isFinite(dx)&&Number.isFinite(dy)&&Number.isFinite(vx)&&Number.isFinite(vy)
  && dx*dx+dy*dy>1 && dx*vx+dy*vy>0;
 // A nearby closing defender reads a dribble better than one far away.
 // Outside the close-pressure radius the bonus tapers to zero.
 const distance=closing?Math.hypot(dx,dy):Infinity;
 const proximity=closing?Math.max(0,Math.min(1,(180-distance)/120)):0;
 // Fatigued defenders cannot sustain the same close-pressure reading bonus.
 const freshness=1-defenderFatigue*.35;
 const readBonus=closing?Math.min(5,Math.hypot(vx,vy)*.4)*proximity*freshness:0;
 // A fresh ball carrier can sidestep a close-pressure defender. This uses existing
 // dribble/agility stats and the same four-button controls, without new save data.
 const evasiveFootwork=closing&&proximity>0
  ?Math.min(4,Math.max(0,((Number(p.agility)||0)-65)/12))*proximity*(1-attackerFatigue)
  :0;
 const defense=(defender.defence*.67+defender.aggression*.33)*(1-defenderFatigue*.18)+readBonus-evasiveFootwork;
 return Math.max(.12,Math.min(.95,.47+(offense-defense)/155+style.evade*.29));
}

// Player Studio explicitly equips one of the ten existing dribble archetypes.
// Keep the source immutable and preserve identity, roster order and save schema.
function withStudioDribble(player,styleId){
 const source=player?.src||player;
 const role=String(source?.role||source?.position||'').toUpperCase();
 if(!['DF','MF','FW'].includes(role))throw Error('Only outfield players can equip dribble styles');
 if(typeof styleId!=='string'||!LOOKUP.has(styleId))throw Error('Unknown dribble style');
 return {...source,dribbleType:styleId};
}
return {DRIBBLE_STYLES,dribbleStyle,assignedDribbleType,dribbleOdds,withStudioDribble};})();

export {DRIBBLES};
