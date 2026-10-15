// Supermagic Football v0.8.25.30 | DATA | independently editable module
import {PLAYERIDENTITY} from "./playeridentity.js";
import {GAME_ASSETS} from "../assets.js";
const DATA=(()=>{const {canonicalPersonId}=PLAYERIDENTITY;// Roster corrections generated from user-supplied audit CSVs and selected 2026/27 club sources.
// Critical: editorial selections and role balancing are NOT certified transfer/club registration data.
// Each team: exactly 2 GK, 3 DF, 4 MF, 3 FW. Preserve existing player IDs whenever possible.
// The complete verified historical roster corrections are already applied to
// data/players/*.json. Do not reapply legacy patches (which would overwrite
// independent JSON edits or assume obsolete source row ordering).
const ROSTER_CORRECTIONS=GAME_ASSETS.players.arcade;
const JAPAN_ROSTER = [
 ['Kunio','MF',9,55,21,25,'B','nuts','Nuts Shot','Explosive Attack'],
 ['Yoritsune','FW',8,50,24,20,'A','ninja','Ninja Shot','Swallow Return'],
 ['Saji','FW',10,55,27,15,'B','wheel','Wheelie Shot','Tornado Kick'],
 ['Horibata','DF',2,60,24,20,'D','mole','Princess Mole Shot','Explosive Attack'],
 ['Iwakabe','DF',3,45,24,20,'B','cannon','Unstoppable Shot','Drill Attack'],
 ['Genei','GK',1,60,21,20,'C','mega','Mega Drive Shot','Mortal Dribble'],
 ['Ugajin','DF',4,45,15,20,'D','ghost','Bitter Shot','Triple Accel'],
 ['Onitake','MF',5,50,15,15,'B','target','Accurate Shot','Mortal Dribble'],
 ['Kumon','DF',6,50,27,15,'C','books','Boring Shot','Explosive Attack'],
 ['Kaizuki','MF',7,45,21,15,'D','fish','Tosa Moon Shot','Explosive Attack'],
 ['Tsunewo','FW',11,65,21,20,'B','banana','Banana Crocodile Shot','Mortal Dribble'],
 ['Carlos','GK',12,65,24,25,'D','omega','Omega Drive Shot','Tornado Punch']
].map(([name,role,num,power,shoot,defense,speed,shot,shotName,skill],i)=>({id:'jp'+i,name,role,num,power,shoot,defense,speed,shot,shotName,skill,age:17+i%3,level:1,xp:0}));
const TEAMS=GAME_ASSETS.teams.slice(0,13).map((t,index)=>({...t,index}));
const FIRST=['Ryu','Min','Pao','Bat','Kofi','Mako','Diop','Leo','Diego','Rafa','Jack','Lukas','Marco'];
const LAST=['Kato','Park','Chan','Bataar','Nono','Tari','Faye','Rossi','Silva','Santos','Mason','Fischer','Ricci'];
// Canonical person ID is an additional, non-destructive reference. The old slot
// ID remains the key used by saves and Career/tactics. Unverified slots do not
// receive a guessed person ID, even if their names match known players.
function safeRosterCopy(players){return players.map(p=>{const personId=canonicalPersonId(p);return personId?{...p,canonicalId:personId}:{...p};});}
function rosterFor(teamIndex){
 const patch=GAME_ASSETS.rosters[TEAMS[teamIndex]?.id]||ROSTER_CORRECTIONS[TEAMS[teamIndex]?.id];
 if(patch)return safeRosterCopy(patch);
 if(TEAMS[teamIndex]?.customRoster)return safeRosterCopy(TEAMS[teamIndex].customRoster);
 if(teamIndex===0)return safeRosterCopy(JAPAN_ROSTER);
 const t=TEAMS[teamIndex],base=t.rank;
 return Array.from({length:12},(_,i)=>{const role=i===0||i===11?'GK':i<4?'DF':i<7?'MF':'FW';const num=[1,2,3,4,5,6,7,8,9,10,11,12][i];return {id:t.id+'_'+i,name:i===0?`${FIRST[teamIndex]} ${LAST[teamIndex]}`:`${['Ari','Dan','Ben','Kai','Ren','Rio','Tao','Neo','Ken','Ayo','Sol'][i-1]} ${LAST[teamIndex]}`,role,num,power:Math.round((base*.62+i*4)%29+35),shoot:Math.round((base*.18+i*3)%15+14),defense:Math.round((base*.17+i*2)%16+14),speed:['B','C','A','B','C','B','A'][i%7],shot:t.shot,shotName:t.shot.charAt(0).toUpperCase()+t.shot.slice(1)+' Shot',skill:'Team Power',level:1,xp:0,fictional:true}});
}
const SHOTS=GAME_ASSETS.mechanics.shotTypes;
const FORMATIONS=GAME_ASSETS.mechanics.formations;
const DEFAULT_LINEUP=GAME_ASSETS.mechanics.defaultLineup;
const DEFAULT_OPTIONS=GAME_ASSETS.mechanics.defaultOptions;
const WEATHER=GAME_ASSETS.mechanics.weather;
const TERRAIN=GAME_ASSETS.mechanics.terrain;
const CONDITIONS=GAME_ASSETS.mechanics.conditions;

return {JAPAN_ROSTER,TEAMS,rosterFor,SHOTS,FORMATIONS,DEFAULT_LINEUP,DEFAULT_OPTIONS,WEATHER,TERRAIN,CONDITIONS};})();

export {DATA};
