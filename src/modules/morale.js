// Supermagic Football v0.8.25.30 | MORALE | independently editable module
import {GAME_ASSETS} from "../assets.js";
const MORALE=(()=>{// Supermagic Football v0.7.3 – deterministic personality-aware team morale.
// Individual reactions are stable for a given player and talk; no hidden dice rolls.
const TEAM_TALKS=Object.freeze(GAME_ASSETS.mechanics.teamTalks);
const clampMorale = v=>Math.max(0,Math.min(100,Number.isFinite(v)?v:55));
function personalityOf(src){
 const text=String(src?.id||src?.name||'PLAYER');let hash=2166136261;
 for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619)>>>0;
 const styles=['sensitive','bold','playful','disciplined'];
 return styles[hash%styles.length];
}
const moraleFactor = value=>0.82+clampMorale(value)/100*.30;
const moodLabel = value=>value>=76?'FIRED UP':value>=57?'HAPPY':value>=39?'STEADY':value>=21?'UPSET':'DESPAIR';
function reactToTalk(value,player,choice,round=1){
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
function goalMorale(value,scored){return clampMorale(value+(scored?11:-13));}

return {TEAM_TALKS,clampMorale,personalityOf,moraleFactor,moodLabel,reactToTalk,goalMorale};})();

export {MORALE};
