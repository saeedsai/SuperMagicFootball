// Supermagic Football v0.8.25.30 | FITNESS | independently editable module
const FITNESS=(()=>{// v0.7.1: standalone, deterministic fatigue and match-fitness rules.
// These are arcade balance values, not physiological/medical predictions.
const MAX_SUBSTITUTIONS=3;
const clamp=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
const initialFatigue=p=>Number.isFinite(+p?.energy)?clamp(1-(+p.energy)/100,0,1):clamp((100-(Number(p?.condition) || 100))*.006,0,.65);
function fatigueTick(fatigue,stamina,seconds,intensity=0){
 const rated=clamp(Number(stamina)||60,1,100),load=clamp(intensity,0,1.8);
 const rate=(.0011+.015*load)*.78*(120-rated)/65; // lower exertion cost
 // v0.8.25.12: players recover meaningfully when resting or only jogging.
 // Around 3% stamina returns per 10 seconds when effectively idle, tapering as activity rises.
 const recovery=load<.03?.004:load<.08?.00155:.00018;
 return clamp(fatigue+seconds*(rate-recovery),0,1);
}
function actionFatigue(fatigue,stamina,kind,modifier=1){
 const costs={jump:.008,tackle:.019,slide:.029,pass:.004,dribble:.010,shoot:.012,super:.085,defenceSuper:.065,spinBumper:.125,keeperSuper:.080,hyperdash:.060,header:.013,keeperDive:.022,comboJump:.035,assistBoost:.023,flipKick:.022,comboSuper:.105,bicycle:.035,superBicycle:.070,flyingKick:.029,dribbleTrick:.020};
 return clamp(fatigue+(costs[kind]||0)*.78*Math.max(.5,Math.min(kind==='jump'?2:1.5,Number(modifier)||1))*(120-clamp(Number(stamina)||60,1,100))/65,0,1);
}
// ENERGY is long-term (legacy 'fatigue' 0..1 stays for save/API compatibility).
// BREATH is a separate, short-term action budget measured in seconds.
const breathCapacity=stamina=>3+7*(clamp(Number(stamina)||1,1,100)-1)/99;
const breathPenalty=(breath,stamina)=>{
 const cap=breathCapacity(stamina);
 return 1+.75*(1-clamp(Number(breath)||0,0,cap)/cap);
};
const breathActionSeconds=Object.freeze({
 pass:.25,shoot:1.1,super:2.6,comboSuper:3.0,defenceSuper:2.4,
 keeperSuper:2.4,tackle:1.2,slide:1.5,dribble:.3,dribbleTrick:1.8,
 jump:1.0,comboJump:1.6,superBicycle:2.2,bicycle:1.6,
 header:.8,keeperDive:1.1,hyperdash:2.2,spinBumper:2.3,
 flyingKick:1.6,flipKick:1.5,assistBoost:.7
});
function spendBreath(breath,stamina,kind){
 const cap=breathCapacity(stamina),rated=clamp(Number(stamina)||1,1,100);
 const cost=(breathActionSeconds[kind]||.45)*(1.2-.4*(rated-1)/99);
 return clamp((Number.isFinite(+breath)?+breath:cap)-cost,0,cap);
}
// Sustained ordinary DRIBBLE hold is inexpensive; JUMP sprint remains the high-drain option.
// This is separate from the one-off action cost of initiating a dribble or Magic Trick.
const dribbleHoldBreathRate=stamina=>.12+.08*(100-clamp(Number(stamina)||1,1,100))/99;
function breathTick(breath,stamina,seconds,intensity=0){
 const cap=breathCapacity(stamina),rated=clamp(Number(stamina)||1,1,100);
 const active=clamp(Number(intensity)||0,0,1.8);
 // Walking or resting restores breath; sprinting consumes it quickly.
 // Rest: refill ~3-5 seconds; walking: refill ~5-8 seconds.
 // Ordinary running (intensity .6) has a tiny drain; sprinting (1.5+) drains quickly.
 // Hard movement must NOT recharge Breath while it is being consumed.
 const regen=active<=.08?(1.4+1.1*(rated-1)/99):active<=.55?(1.0+.9*(rated-1)/99):0;
 const drain=active>0.55?(.02+(active-.55)*2.2)*(1.2-.4*(rated-1)/99):0;
 return clamp((Number.isFinite(+breath)?+breath:cap)+Math.max(0,seconds)*(regen-drain),0,cap);
}
// Explicit cumulative recovery after N rest days: +30%, +50%, then +10% per day.
// These are percentage points of MAX Energy, not percentages of the missing balance.
function recoverEnergy(energy,days,stamina=60){
 const available=clamp(Number(energy)||0,0,100),n=Math.max(0,Math.floor(Number(days)||0));
 const recovery=n===0?0:n===1?30:80+10*(n-2);
 // High stamina restores energy somewhat faster; low stamina somewhat slower.
 const statFactor=.85+.3*(clamp(Number(stamina)||1,1,100)-1)/99;
 return clamp(available+recovery*statFactor,0,100);
}
const staminaPercent=fatigue=>Math.round((1-clamp(fatigue||0,0,1))*100);
const matchCondition=(condition,fatigue,seconds)=>clamp(Math.round((Number(condition)??100)-fatigue*10-Math.min(5,seconds/65)),25,100);
function fatigueStatus(fatigue){return fatigue>=.75?'EXHAUSTED':fatigue>=.5?'TIRED':fatigue>=.3?'WORKING':'FRESH';}
function substitutionChanges(oldLineup,newLineup){
 const oldIds=new Set(oldLineup),newIds=new Set(newLineup);
 return {out:[...oldIds].filter(id=>!newIds.has(id)),in:[...newIds].filter(id=>!oldIds.has(id))};
}
function recommendSubstitute(plan,roster,ledger,subbedOut=new Set()){
 const starters=plan.lineup.slice(1),bench=roster.map((p,i)=>i).filter(i=>!plan.lineup.includes(i)&&roster[i].role!=='GK'&&!subbedOut.has(roster[i].id)&&!(roster[i].injuryWeeks>0));
 let best=null;
 for(const slot of starters){const src=roster[slot],fatigue=ledger[src.id]??initialFatigue(src);
  if(fatigue<.22)continue;
  const next=bench.map(i=>({i,role:roster[i].role===src.role?1:0,fatigue:ledger[roster[i].id]??initialFatigue(roster[i])})).sort((a,b)=>b.role-a.role||a.fatigue-b.fatigue)[0];
  if(!next)continue;
  const benefit=fatigue-next.fatigue+(next.role?.08:0);
  if(benefit>.17&&(!best||benefit>best.benefit))best={out:slot,in:next.i,benefit};
 }
 return best;
}

return {MAX_SUBSTITUTIONS,initialFatigue,fatigueTick,actionFatigue,staminaPercent,matchCondition,fatigueStatus,substitutionChanges,recommendSubstitute,breathCapacity,breathPenalty,spendBreath,breathTick,dribbleHoldBreathRate,recoverEnergy};})();

export {FITNESS};
