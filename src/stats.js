import {assignedDribbleType} from './dribbles.js';
import {abilityLevel} from './special_levels.js';
// v0.6.2 independent 0..100 player attributes. Legacy Arcade values are inferred,
// not historical/scouting ratings. Explicit user-edited numbers take precedence.
const cap=(v)=>Math.max(1,Math.min(100,Math.round(Number(v)||1)));
const speedGrades={A:88,B:75,C:62,D:48};
const hash=s=>[...String(s||'')].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
export const NUMERIC_STATS=['stamina','strength','aggression','defence','speedRating','agility','dribbling','shootPower','shootAccuracy','heading','passing','crossing','gkDiving','gkSkill'];
export function withStats(player){
 const p={...player},r=p.role||'MF',seed=hash(p.id||p.name),off=(n)=>(seed>>>n)%11-5;
 const overall=Number.isFinite(+p.rating)?+p.rating:68;
 const origPower=Number.isFinite(+p.power)?+p.power:45;
 const origShoot=Number.isFinite(+p.shoot)?+p.shoot:22;
 const origDefense=Number.isFinite(+p.defense)?+p.defense:19;
 const legacySpeed=typeof p.speed==='string'?speedGrades[p.speed]||68:Number(p.speed)||68;
 const defaults={
  stamina:Math.round(overall*.68+24+off(1)),
  strength:Math.round(origPower*.91+27),
  aggression:Math.round(origPower*.7+28+off(3)),
  defence:Math.round(origDefense*2.25+21+(r==='DF'?9:0)),
  speedRating:Math.round(legacySpeed),
  agility:Math.round(overall*.55+legacySpeed*.27+14+off(2)),
  dribbling:Math.round(overall*.56+legacySpeed*.24+13+(r==='FW'||r==='MF'?8:0)+off(8)),
  shootPower:Math.round(origShoot*2.22+23),
  shootAccuracy:Math.round(origShoot*2.05+21+(r==='FW'?7:0)+off(4)),
  heading:Math.round(overall*.66+16+(r==='FW'?10:0)+off(6)),
  passing:Math.round(overall*.78+13+(r==='MF'?7:0)+off(7)),
  crossing:Math.round(overall*.67+13+(r==='MF'?8:0)+off(9)),
  gkDiving:r==='GK'?Math.round(overall*.8+13+off(10)):18,
  gkSkill:r==='GK'?Math.round(overall*.85+9+off(11)):12,
 };
 // Backwards compatibility: pre-v0.8.19.6 rosters and save imports used gkJump.
 // Canonical persisted/exported attribute and UI name is now gkDiving.
 if(!Number.isFinite(+p.gkDiving) && Number.isFinite(+p.gkJump))p.gkDiving=+p.gkJump;
 delete p.gkJump;
 for(const key of NUMERIC_STATS)p[key]=cap(Number.isFinite(+p[key])?+p[key]:defaults[key]);
 p.dribbleType=assignedDribbleType(p);
 // Only listed, special characters retain defensive powers. No fictional unique
 // GK abilities are invented for ordinary keepers or academy players.
 const namedAbility=String(p.skill||'');
 p.superAbility=p.superAbility ?? (r==='GK'?null:namedAbility.includes('Drill Attack')?{type:'defence',id:'drill',name:namedAbility}:p.id==='jp3'?{type:'defence',id:'burst',name:'Shock Burst (remake)'}:p.shot?{type:'shoot',id:p.shot,name:p.shotName||'Signature Shot'}:null);
 p.gkSuperAbility=r!=='GK'?null:(p.gkSuperAbility ?? ((p.id==='jp11'||namedAbility.includes('Tornado Punch'))?{type:'defence',id:'tornadoPunch',name:'Tornado Punch'}:(p.id==='jp5'||namedAbility.includes('Mega Drive Shot'))?{type:'defence',id:'megaPalm',name:'Mega Palm (remake)'}:null));
 p.superShotLevel=abilityLevel(p,'shot');
 p.superDefenceLevel=abilityLevel(p,'defence');
 p.gkSuperLevel=abilityLevel(p,'keeper');
 return p;
}
// Display-only position overall: the rounded arithmetic mean of six relevant
// independent 1–100 attributes. Kept separate from legacy rating, which is
// still used by career finances, special levels, and original data generation.
export const POSITION_OVR_STATS=Object.freeze({
 GK:Object.freeze(['gkSkill','gkDiving','agility','strength','passing','stamina']),
 DF:Object.freeze(['defence','strength','aggression','speedRating','heading','stamina']),
 MF:Object.freeze(['passing','crossing','dribbling','agility','stamina','speedRating']),
 FW:Object.freeze(['shootAccuracy','shootPower','dribbling','speedRating','agility','heading'])
});
export function overallForPosition(player,position=player?.role){
 const role=Object.hasOwn(POSITION_OVR_STATS,position)?position:'MF';
 const source=player?.src||player||{};
 const attributes=withStats(source);
 const values=POSITION_OVR_STATS[role].map(key=>attributes[key]);
 return Math.round(values.reduce((sum,value)=>sum+value,0)/values.length);
}
export const stat=(p,key)=>withStats(p.src||p)[key];
export const endurance=(p)=>Math.max(.52,1-.47*Math.max(0,Math.min(1,p.fatigue||0)));
export const contest=(attacker,defender,slide=false)=>{
 const atk=(stat(attacker,'aggression')*.60+stat(attacker,'defence')*.40+(slide?8:0))*(1-.27*(attacker.fatigue||0));
 const resist=stat(defender,'strength')*.78+stat(defender,'defence')*.22;
 return {attack:atk,resist,knockChance:Math.min(.92,Math.max(.08,.46+(atk-resist)/115)),duration:.40+Math.max(0,atk-resist)/100};
};
export const shotError=(p,base=32)=>base*(1.55-stat(p,'shootAccuracy')*.012)* (1+.5*(p.fatigue||0));
