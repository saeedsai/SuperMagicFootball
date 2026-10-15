// Supermagic Football v0.8.25.30 | BPWALLTIME | independently editable module
import {BPW} from "./bpw.js";
import {GAME_ASSETS} from "../assets.js";
const BPWALLTIME=(()=>{const {historicalPersonKey}=BPW;/** BPW All-Time Legendary 12 — user-curated editorial arcade selection.
 * Distinct from all six tournament-specific BPW World Cup squads.
 * `legendaryRating` is the requested card rating, not a verified FIFA/EA
 * number or the calculated six-stat positional OVR. No fabricated ages,
 * researched appearance traits, or historical tournament membership.
 * Append after the original six BPW teams to preserve older numeric IDs.
 */

const BPW_ALLTIME_ID='bpw_alltime_legendary_12';
// [name, nationality, position, user-specified legendary rating]
const BPW_ALLTIME_SELECTION=Object.freeze(GAME_ASSETS.editorial.bpwAllTimeSelections.map(row=>Object.freeze(row)));
function installBPWAllTime(teams,shots,avatarFor){
 const existing=teams.find(t=>t.id===BPW_ALLTIME_ID);
 if(existing)return existing;
 const shotKey='comet';
 if(!shots[shotKey]||!shots.target)throw new Error('Required legacy shot definitions missing');
 const roster=BPW_ALLTIME_SELECTION.map(([name,nationality,role,legendaryRating],i)=>{
  const rating=legendaryRating;
  const shot=role==='GK'?'target':shotKey;
  const identity=historicalPersonKey(name);
  const p={id:`${BPW_ALLTIME_ID}_${i}`,name,nationality,role,num:i+1,
   rating,legendaryRating,ratingSource:'user-selected legendary arcade rating; not EA/FIFA or six-stat OVR',
   power:Math.round(rating*.64+8),shoot:Math.round(rating*.30+3),defense:Math.round(rating*.30+3),
   speed:role==='GK'||role==='DF'?'B':'A',shot,shotName:shots[shot].name,
   skill:'All-Time Legend',level:1,xp:0,fictional:false,
   historicalPersonKey:identity,variantOf:identity,
   source:'User-approved BPW All-Time Legendary 12, 2026-10-14',
   rosterVerification:'user_editorial_alltime',
   appearanceVerification:'not independently verified; generated arcade portrait',
   specialTierStatus:'future classification not activated'};
  if(avatarFor)p.avatar=avatarFor(p);
  return p;
 });
 const team={id:BPW_ALLTIME_ID,index:teams.length,name:'BPW All-Time Legendary 12',
  group:'bpw_alltime',flag:'ALL',primary:'#38285e',secondary:'#e9c766',trim:'#f2f0ff',
  shot:shotKey,rank:99,rosterPrecision:'user-curated all-time editorial selection',
  customRoster:roster};
 teams.push(team);
 return team;
}

return {BPW_ALLTIME_ID,BPW_ALLTIME_SELECTION,installBPWAllTime};})();

export {BPWALLTIME};
