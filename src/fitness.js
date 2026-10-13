// v0.7.1: standalone, deterministic fatigue and match-fitness rules.
// These are arcade balance values, not physiological/medical predictions.
export const MAX_SUBSTITUTIONS=3;
const clamp=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
export const initialFatigue=p=>clamp((100-(Number(p?.condition) || 100))*.006,0,.65);
export function fatigueTick(fatigue,stamina,seconds,intensity=0){
 const rated=clamp(Number(stamina)||60,1,100),load=clamp(intensity,0,1.8);
 const rate=(.0011+.015*load)*(120-rated)/65;
 const recovery=load<.08?.00165:.00018;
 return clamp(fatigue+seconds*(rate-recovery),0,1);
}
export function actionFatigue(fatigue,stamina,kind,modifier=1){
 const costs={jump:.008,tackle:.019,slide:.029,pass:.004,shoot:.012,super:.085,defenceSuper:.065,keeperSuper:.080,hyperdash:.060,header:.013,keeperDive:.022,comboJump:.035,assistBoost:.023,flipKick:.022,comboSuper:.105,bicycle:.035,flyingKick:.029,dribbleTrick:.020};
 return clamp(fatigue+(costs[kind]||0)*Math.max(.5,Math.min(1.5,Number(modifier)||1))*(120-clamp(Number(stamina)||60,1,100))/65,0,1);
}
export const staminaPercent=fatigue=>Math.round((1-clamp(fatigue||0,0,1))*100);
export const matchCondition=(condition,fatigue,seconds)=>clamp(Math.round((Number(condition)??100)-fatigue*10-Math.min(5,seconds/65)),25,100);
export function fatigueStatus(fatigue){return fatigue>=.75?'EXHAUSTED':fatigue>=.5?'TIRED':fatigue>=.3?'WORKING':'FRESH';}
export function substitutionChanges(oldLineup,newLineup){
 const oldIds=new Set(oldLineup),newIds=new Set(newLineup);
 return {out:[...oldIds].filter(id=>!newIds.has(id)),in:[...newIds].filter(id=>!oldIds.has(id))};
}
export function recommendSubstitute(plan,roster,ledger,subbedOut=new Set()){
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
