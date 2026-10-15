// Supermagic Football v0.8.25.30 | BPW | independently editable module
import {GAME_ASSETS} from "../assets.js";
const BPW=(()=>{/** BPW: Best Players of each historical World Cup, not a national XI.
 * Six historically inspired *editorial* mixed squads (1998–2018), 12 unique
 * people per edition and 72 distinct people across editions. Selections are
 * based on historical All-Star / fan selections and tournament performances.
 * Names, tournament participation and primary playing roles are sourced.
 * Gameplay ratings/power and approximate tournament ages are arcade balance
 * design choices, not official FIFA/EA Sports player ratings or audited DOBs.
 * Slot IDs are version-stable and never replace legacy club/national team IDs.
 */
const BPW_YEARS=Object.freeze([1998,2002,2006,2010,2014,2018]);
// [name, role, 2-letter nationality, approximate tournament age]
const BPW_SELECTIONS=Object.freeze(GAME_ASSETS.editorial.bpwSelections);
const COLORS={1998:['#273869','#e1c357','#e7e9fb'],2002:['#f5d056','#27a47e','#3448a2'],2006:['#325ab5','#f3f5f9','#efc65d'],2010:['#d1ab4f','#263c60','#fbefe1'],2014:['#41ab6f','#e8d052','#2c58a0'],2018:['#d63e48','#f0eadf','#315eac']};
const SQUAD_SHOTS={1998:'comet',2002:'omega',2006:'eagle',2010:'target',2014:'tornado',2018:'mega'};
// Game-world identity reference: deterministic within the six BPW variants.
// Separate from verified club canonicalId (name+DOB); a future DOB audit may
// securely link these using variantOf without equating homonymous players.
function historicalPersonKey(name){return 'worldcup:'+String(name).normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function installBPWWorldCups(TEAMS,SHOTS,avatarFor){
 const installed=[];
 for(const year of BPW_YEARS){
  const teamId=`bpw_wc_${year}`;
  const existing=TEAMS.find(t=>t.id===teamId);
  if(existing){installed.push(existing);continue;}
  const colors=COLORS[year];
  const shotKey=SQUAD_SHOTS[year];
  const roster=BPW_SELECTIONS[year].map(([name,role,nationality,age],i)=>{
   const rating=Math.min(99,Math.max(89,98-Math.floor(i/3)+(year%5===0?0:1)));
   const shot=(role==='GK')?'target':shotKey;
   const person=historicalPersonKey(name);
   const player={id:`bpw_wc_${year}_${i}`,name,role,nationality,
    num:i+1,age,ageStatus:'approximate at tournament',rating,
    ratingSource:'editorial arcade gameplay; not FIFA/EA ratings',
    power:Math.round(rating*.64+8),shoot:Math.round(rating*.30+3),defense:Math.round(rating*.30+3),
    speed:(role==='GK'||role==='DF')?'B':'A',shot,shotName:SHOTS[shot].name,
    skill:'World Cup All-Star',level:1,xp:0,fictional:false,
    historicalPersonKey:person,variantOf:person,worldCupYear:year,
    source:'Historical World Cup All-Star/editorial selection; see BPW_SOURCES_v0822.md',
    rosterVerification:'historical_tournament_selection',
    specialTierStatus:'future classification not activated'};
   if(avatarFor)player.avatar=avatarFor(player);
   return player;
  });
  const team={id:teamId,index:TEAMS.length,name:`BPW World Cup ${year}`,group:'bpw_worldcup',
   flag:'WC',primary:colors[0],secondary:colors[1],trim:colors[2],shot:shotKey,
   rank:98,worldCupYear:year,rosterPrecision:'editorial all-star selection',
   customRoster:roster};
  TEAMS.push(team);installed.push(team);
 }
 return installed;
}

return {BPW_YEARS,BPW_SELECTIONS,historicalPersonKey,installBPWWorldCups};})();

export {BPW};
