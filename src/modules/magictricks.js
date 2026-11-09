// Deterministic, side-effect-free Scream Magic Trick rules (not yet wired into a match).
// Keep this separate from the ten ordinary Dribble Styles; no magic Trick tiers.
const SCREAM_RULES=Object.freeze({range:110,cooldown:11,staminaCost:.045,stunSeconds:.52});
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
function evaluateScream({carrier,opponents=[],roll=.5}={}){
 if(!carrier||!Number.isFinite(carrier.x)||!Number.isFinite(carrier.y)||
    carrier.magicTrick!=='scream'||carrier.role==='GK'||carrier.stunned||
    (carrier.cooldown||0)>0||(Number.isFinite(carrier.fatigue)&&carrier.fatigue>.85))return {activated:false,reason:'unavailable'};
 const fatigue=Number.isFinite(carrier.fatigue)?clamp(carrier.fatigue,0,1):0;
 const valid=opponents.filter(o=>o&&o.team!==carrier.team&&o.role!=='GK'&&!o.stunned&&
    Number.isFinite(o.x)&&Number.isFinite(o.y)&&Math.hypot(carrier.x-o.x,carrier.y-o.y)<SCREAM_RULES.range)
  .sort((a,b)=>Math.hypot(carrier.x-a.x,carrier.y-a.y)-Math.hypot(carrier.x-b.x,carrier.y-b.y));
 if(!valid.length)return {activated:false,reason:'no-target'};
 const rival=valid[0],dx=carrier.x-rival.x,dist=Math.hypot(dx,carrier.y-rival.y);
 const closing=(rival.vx||0)*dx+(rival.vy||0)*(carrier.y-rival.y);
 const aware=Number.isFinite(rival.face)&&rival.face*dx>0&&closing>.12*dist;
 const defence=clamp(((Number.isFinite(rival.defence)?rival.defence:0)*.6+
  (Number.isFinite(rival.agility)?rival.agility:0)*.4)/100,0,1);
 const chance=clamp(.88-dist/550-defence*.2-(aware?.18:0)-fatigue*.12,.2,.82);
 const success=clamp(Number.isFinite(roll)?roll:.5,0,1)<chance;
 return {activated:true,success,targetId:rival.id,chance,countered:!success,
  cooldown:SCREAM_RULES.cooldown,staminaCost:SCREAM_RULES.staminaCost,
  stunSeconds:success?SCREAM_RULES.stunSeconds:0};
}
export {SCREAM_RULES,evaluateScream};
