import {FORMATIONS,DEFAULT_LINEUP} from './data.js';
export const ATTACK_STYLES=['Balanced','Possession','Direct'];
export const DEFENCE_STYLES=['Balanced','High Press','Deep Block'];
export const ROLES=['captain','penalty','freeKick','corner'];
export function defaultPlan(teamIndex=0){return {formation:'2-1-2',lineup:teamIndex===0?DEFAULT_LINEUP.slice():[0,1,2,3,5,9],captain:3,penalty:4,freeKick:3,corner:3,attack:'Balanced',defence:'Balanced'};}
export function validatePlan(plan,roster,teamIndex=0){
 const base=defaultPlan(teamIndex),p={...base,...plan};
 if(!FORMATIONS[p.formation])throw Error('Unknown formation');
 if(!Array.isArray(p.lineup)||p.lineup.length!==6||p.lineup.some(i=>!Number.isInteger(i)||i<0||i>=roster.length)||new Set(p.lineup).size!==6)throw Error('Choose six different valid players');
 if(roster[p.lineup[0]]?.role!=='GK')throw Error('First position needs a goalkeeper');
 for(const key of ROLES)if(!Number.isInteger(p[key])||p[key]<0||p[key]>=roster.length)throw Error('Invalid '+key+' player');
 if(!p.lineup.includes(p.captain))throw Error('Captain must be on the field');
 if(!ATTACK_STYLES.includes(p.attack)||!DEFENCE_STYLES.includes(p.defence))throw Error('Unknown tactical style');
 return p;
}
export function safePlan(plan,roster,teamIndex=0){try{return validatePlan(plan,roster,teamIndex)}catch{return defaultPlan(teamIndex)}}
export function tacticModifiers(plan){return {advance:plan.attack==='Direct'?1.24:plan.attack==='Possession'?.82:1,pass:plan.attack==='Possession'?1.24:plan.attack==='Direct'?.75:1,shoot:plan.attack==='Direct'?1.3:1,press:plan.defence==='High Press'?1.34:plan.defence==='Deep Block'?.64:1,defensiveDepth:plan.defence==='Deep Block'?.52:1};}
