// Supermagic Football v0.7.3 – deterministic personality-aware team morale.
// Individual reactions are stable for a given player and talk; no hidden dice rolls.
export const TEAM_TALKS = Object.freeze({
 none:{name:'No team talk',hint:'Preserve current morale'},
 encourage:{name:'Believe in yourselves',hint:'Supports nervous players, may bore confident stars'},
 challenge:{name:'Prove you deserve to win!',hint:'Motivates bold players; may overwhelm cautious ones'},
 joke:{name:'Tell a ridiculous joke',hint:'Eases tension; disciplined players may dislike it'},
 focus:{name:'Stay calm and follow the plan',hint:'Helps disciplined players; impulsive players may rebel'},
});
export const clampMorale = v=>Math.max(0,Math.min(100,Number.isFinite(v)?v:55));
export function personalityOf(src){
 const text=String(src?.id||src?.name||'PLAYER');let hash=2166136261;
 for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619)>>>0;
 const styles=['sensitive','bold','playful','disciplined'];
 return styles[hash%styles.length];
}
export const moraleFactor = value=>0.82+clampMorale(value)/100*.30;
export const moodLabel = value=>value>=76?'FIRED UP':value>=57?'HAPPY':value>=39?'STEADY':value>=21?'UPSET':'DESPAIR';
export function reactToTalk(value,player,choice,round=1){
 const style=personalityOf(player),before=clampMorale(value);
 if(!TEAM_TALKS[choice]||choice==='none')return {before,after:before,delta:0,backfire:false,personality:style};
 const likes={sensitive:'encourage',bold:'challenge',playful:'joke',disciplined:'focus'};
 const dislikes={sensitive:'challenge',bold:'focus',playful:'focus',disciplined:'joke'};
 // A team talk is not guaranteed to help everyone; outcomes are player-specific.
 const delta=choice===likes[style]?13:choice===dislikes[style]?-10:choice==='encourage'?5:choice==='focus'?4:2;
 const adjusted=round===2?Math.round(delta*.75):delta;
 const after=clampMorale(before+adjusted);
 return {before,after,delta:after-before,backfire:after<before,personality:style};
}
export function goalMorale(value,scored){return clampMorale(value+(scored?11:-13));}
