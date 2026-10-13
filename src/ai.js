// Five behaviour profiles. These affect COMPUTER opponents only; human controls and
// teammate assistants keep the baseline Normal profile. Tunable without changing match code.
export const AI_LEVELS = [
  {id:0,name:'Rookie', speed:0.69,reaction:0.78,anticipation:0.00,aimError:170,passRate:0.08,shootRate:0.45,superRate:0.08,tackleRate:0.23,pressure:260,keeperRead:0.02,comboAwareness:0,comboTiming:0},
  {id:1,name:'Easy',   speed:0.78,reaction:0.53,anticipation:0.09,aimError:115,passRate:0.18,shootRate:0.58,superRate:0.14,tackleRate:0.39,pressure:365,keeperRead:0.10,comboAwareness:.25,comboTiming:.35},
  {id:2,name:'Normal', speed:0.86,reaction:0.32,anticipation:0.18,aimError:65, passRate:0.30,shootRate:0.72,superRate:0.21,tackleRate:0.54,pressure:470,keeperRead:0.23,comboAwareness:.55,comboTiming:.60},
  {id:3,name:'Hard',   speed:0.95,reaction:0.18,anticipation:0.28,aimError:33, passRate:0.42,shootRate:0.85,superRate:0.29,tackleRate:0.74,pressure:590,keeperRead:0.37,comboAwareness:.82,comboTiming:.82},
  {id:4,name:'Expert', speed:1.02,reaction:0.09,anticipation:0.40,aimError:12, passRate:0.55,shootRate:0.96,superRate:0.36,tackleRate:0.91,pressure:730,keeperRead:0.49,comboAwareness:1,comboTiming:1},
];
export function aiTuning(value) {
  const index = Number(value);
  return AI_LEVELS[Number.isFinite(index) ? Math.max(0,Math.min(4,Math.trunc(index))) : 2];
}


// Computes pressing assignments from the players actually controlled by AI.
// One active runner attacks the ball/ball carrier; the next covers a passing
// lane. It never assigns the human-selected player as the only pressing bot.
export function defensivePressers(players,team,target,humanControlled=null){
 if(!target)return {primary:null,support:null};
 const candidates=players.filter(p=>p.t===team&&!p.keeper&&p!==humanControlled&&p.stun<=0)
  .sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y));
 return {primary:candidates[0]||null,support:candidates[1]||null};
}
