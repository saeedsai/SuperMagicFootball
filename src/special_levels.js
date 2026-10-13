// v0.8.16 — five-level arcade special-ability progression.
// Named tiers are editorial game balancing, NOT EA/Transfermarkt values.
// Persist only explicit user overrides; derived defaults stay deterministic across club/nation copies.
export const MAX_SPECIAL_LEVEL=5;
export const LEVEL_FIVE_STARS=Object.freeze(['Lionel Messi','Cristiano Ronaldo','Kylian Mbappé','Erling Haaland']);
export const LEVEL_FOUR_STARS=Object.freeze([
 'Lamine Yamal','Vinícius Júnior','Mohamed Salah','Neymar','Harry Kane','Kevin De Bruyne',
 'Jude Bellingham','Rodri','Ronaldinho','Ronaldo Nazário','Zinedine Zidane','Pelé'
]);
const five=new Set(LEVEL_FIVE_STARS),four=new Set(LEVEL_FOUR_STARS);
const clampLevel=n=>Math.max(1,Math.min(5,Math.floor(Number(n))));
const validLevel=n=>Number.isInteger(Number(n))&&Number(n)>=1&&Number(n)<=5;
const source=p=>p?.src||p||{};

// Attack, defence and goalkeeper special levels are independent. No ability is created by a level.
export function abilityLevel(player,kind='shot'){
 const p=source(player),isKeeper=kind==='keeper',isDef=kind==='defence';
 const key=isKeeper?'gkSuperLevel':isDef?'superDefenceLevel':'superShotLevel';
 if(validLevel(p[key]))return clampLevel(p[key]);
 const ability=isKeeper?p.gkSuperAbility:isDef?p.superAbility?.type==='defence'?p.superAbility:null:p.superAbility?.type==='shoot'?p.superAbility:null;
 if(validLevel(ability?.level))return clampLevel(ability.level);
 if((isKeeper&&!p.gkSuperAbility)||(isDef&&p.superAbility?.type!=='defence'))return 1;
 if(p.fictional)return 1;
 if(!isKeeper&&!isDef&&five.has(p.name))return 5;
 if(!isKeeper&&!isDef&&four.has(p.name))return 4;
 const rating=Number(p.rating)||65;
 if(isKeeper)return rating>=88?3:rating>=76?2:1;
 if(isDef)return rating>=86?3:rating>=74?2:1;
 return rating>=86?3:rating>=74?2:1;
}
export function levelModifiers(level){
 const l=clampLevel(level);
 return {level:l,power:1+(l-1)*.055,fatigue:1-(l-1)*.08,reach:1+(l-1)*.04,stun:1+(l-1)*.055};
}
export function shotVelocityModifier(shotId,level){
 // A fish/ghost/underground or trick shot can remain slow despite being rare and powerful.
 const specialMotion=new Set(['fish','piranha','mole','ghost','ninja','bird','banana','books','nuts']);
 return specialMotion.has(shotId)?1:1+Math.max(0,levelModifiers(level).level-1)*.018;
}
