import {canonicalPersonId} from './player_identity_registry.js';
import {ROSTER_CORRECTIONS} from './roster_corrections.js';
// Nekketsu-inspired HD arcade soccer remake: editable data layer.
// Original Japanese roster stats and shot *names* from Falanx's GameFAQs guide.
// Opposing player identities/stats and visual super shot designs are new, not asserted to be original.
export const JAPAN_ROSTER = [
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
export const TEAMS=[
 ['japan','Japan','JP','#fa773c','#fff0df','#17213c','nuts',90],
 ['korea','Korea','KR','#f24a58','#fcf5f5','#2c4e9b','tiger',64],
 ['thailand','Thailand','TH','#3d79ec','#f5cf62','#f9fbff','elephant',62],
 ['mongolia','Mongolia','MN','#b03e32','#f6d56e','#262b48','horse',65],
 ['cameroon','Cameroon','CM','#26a778','#fad047','#bc313c','lion',69],
 ['newguinea','New Guinea','PG','#222532','#f1b632','#db473c','bird',72],
 ['senegal','Senegal','SN','#22a983','#ffdb57','#dd4b50','serpent',74],
 ['argentina','Argentina','AR','#79c9f0','#f9fdff','#f2cb71','banana',79],
 ['mexico','Mexico','MX','#229764','#f3efe2','#d84454','cactus',77],
 ['brazil','Brazil','BR','#f3cf39','#329b65','#2646b4','piranha',84],
 ['england','England','GB','#edf4f4','#df4149','#25387b','comet',85],
 ['germany','Germany','DE','#2c313b','#e1e6ea','#eab844','eagle',89],
 ['italy','Italy','IT','#3476c8','#f5f5ff','#edba51','tornado',94]
].map(([id,name,flag,primary,secondary,trim,shot,rank],index)=>({id,index,name,flag,primary,secondary,trim,shot,rank}));
const FIRST=['Ryu','Min','Pao','Bat','Kofi','Mako','Diop','Leo','Diego','Rafa','Jack','Lukas','Marco'];
const LAST=['Kato','Park','Chan','Bataar','Nono','Tari','Faye','Rossi','Silva','Santos','Mason','Fischer','Ricci'];
// Canonical person ID is an additional, non-destructive reference. The old slot
// ID remains the key used by saves and Career/tactics. Unverified slots do not
// receive a guessed person ID, even if their names match known players.
function safeRosterCopy(players){return players.map(p=>{const personId=canonicalPersonId(p);return personId?{...p,canonicalId:personId}:{...p};});}
export function rosterFor(teamIndex){
 const patch=ROSTER_CORRECTIONS[TEAMS[teamIndex]?.id];
 if(patch)return safeRosterCopy(patch);
 if(TEAMS[teamIndex]?.customRoster)return safeRosterCopy(TEAMS[teamIndex].customRoster);
 if(teamIndex===0)return safeRosterCopy(JAPAN_ROSTER);
 const t=TEAMS[teamIndex],base=t.rank;
 return Array.from({length:12},(_,i)=>{const role=i===0||i===11?'GK':i<4?'DF':i<7?'MF':'FW';const num=[1,2,3,4,5,6,7,8,9,10,11,12][i];return {id:t.id+'_'+i,name:i===0?`${FIRST[teamIndex]} ${LAST[teamIndex]}`:`${['Ari','Dan','Ben','Kai','Ren','Rio','Tao','Neo','Ken','Ayo','Sol'][i-1]} ${LAST[teamIndex]}`,role,num,power:Math.round((base*.62+i*4)%29+35),shoot:Math.round((base*.18+i*3)%15+14),defense:Math.round((base*.17+i*2)%16+14),speed:['B','C','A','B','C','B','A'][i%7],shot:t.shot,shotName:t.shot.charAt(0).toUpperCase()+t.shot.slice(1)+' Shot',skill:'Team Power',level:1,xp:0,fictional:true}});
}
export const SHOTS={
 nuts:{name:'Nuts Shot',color:'#ffc15f',trail:'#ed763c',behavior:'ricochet',speed:1.18,impact:1.35},
 ninja:{name:'Ninja Shot',color:'#b29bfa',trail:'#7e68e9',behavior:'clone',speed:1.37,impact:1.08},
 wheel:{name:'Wheelie Shot',color:'#e0ecff',trail:'#f8ce53',behavior:'spin',speed:1.36,impact:1.25},
 mole:{name:'Princess Mole Shot',color:'#dc9a5d',trail:'#c07b55',behavior:'burrow',speed:1.15,impact:1.4},
 cannon:{name:'Unstoppable Shot',color:'#ff9349',trail:'#ff463d',behavior:'blast',speed:1.5,impact:1.65},
 mega:{name:'Mega Drive Shot',color:'#77fcf5',trail:'#42bde9',behavior:'lightning',speed:1.48,impact:1.65},
 ghost:{name:'Bitter Shot',color:'#c6f2e7',trail:'#6bedcb',behavior:'phase',speed:1.18,impact:1.35},
 target:{name:'Accurate Shot',color:'#ecf5a5',trail:'#eac044',behavior:'homing',speed:1.26,impact:1.34},
 books:{name:'Boring Shot',color:'#f8d675',trail:'#f39f46',behavior:'zigzag',speed:1.3,impact:1.2},
 fish:{name:'Tosa Moon Shot',color:'#61e3f4',trail:'#19a8cf',behavior:'swim',speed:1.32,impact:1.29},
 banana:{name:'Banana Crocodile Shot',color:'#eaff70',trail:'#6cc744',behavior:'curve',speed:1.28,impact:1.35},
 omega:{name:'Omega Drive Shot',color:'#de9eff',trail:'#6d6cfc',behavior:'warp',speed:1.57,impact:1.75},
 tiger:{name:'Tiger Shot',color:'#f39e36',trail:'#f3562d',behavior:'blast',speed:1.23,impact:1.3},
 elephant:{name:'Elephant Shot',color:'#afd2ea',trail:'#7da9cf',behavior:'spin',speed:1.2,impact:1.45},
 horse:{name:'Horse Shot',color:'#d1a16c',trail:'#77523f',behavior:'ricochet',speed:1.3,impact:1.26},
 lion:{name:'Lion Shot',color:'#ffad36',trail:'#e65a28',behavior:'blast',speed:1.3,impact:1.45},
 bird:{name:'Bird Shot',color:'#d7def5',trail:'#9cc9e9',behavior:'swim',speed:1.37,impact:1.18},
 serpent:{name:'Serpent Shot',color:'#a8e468',trail:'#51ba8e',behavior:'zigzag',speed:1.21,impact:1.33},
 piranha:{name:'Piranha Shot',color:'#67d9f0',trail:'#1d9ee7',behavior:'swim',speed:1.36,impact:1.33},
 cactus:{name:'Cactus Shot',color:'#95d884',trail:'#46b982',behavior:'spin',speed:1.2,impact:1.38},
 comet:{name:'Comet Shot',color:'#ffb14d',trail:'#f77b5d',behavior:'blast',speed:1.48,impact:1.34},
 eagle:{name:'Eagle Shot',color:'#b8cbf7',trail:'#7d84d7',behavior:'homing',speed:1.47,impact:1.32},
 tornado:{name:'Tornado Shot',color:'#c5ecff',trail:'#91a1f1',behavior:'spiral',speed:1.43,impact:1.44}
};
export const FORMATIONS={
 '2-1-2':[{x:.08,y:.5},{x:.28,y:.27},{x:.28,y:.73},{x:.48,y:.5},{x:.70,y:.27},{x:.70,y:.73}],
 '1-2-2':[{x:.08,y:.5},{x:.26,y:.5},{x:.47,y:.28},{x:.47,y:.72},{x:.71,y:.27},{x:.71,y:.73}],
 '2-2-1':[{x:.08,y:.5},{x:.3,y:.25},{x:.3,y:.75},{x:.55,y:.3},{x:.55,y:.7},{x:.75,y:.5}],
 '1-3-1':[{x:.08,y:.5},{x:.27,y:.5},{x:.48,y:.23},{x:.48,y:.5},{x:.48,y:.77},{x:.74,y:.5}],
 // Each formation specifies exactly five outfield players, plus the goalkeeper.
 // 1-1-3: one defender, one midfielder and three forwards.
 '1-1-3':[{x:.08,y:.5},{x:.29,y:.5},{x:.52,y:.5},{x:.76,y:.23},{x:.76,y:.5},{x:.76,y:.77}],
 // 3-1-1: three defenders, one midfielder and one forward.
 '3-1-1':[{x:.08,y:.5},{x:.29,y:.23},{x:.29,y:.5},{x:.29,y:.77},{x:.53,y:.5},{x:.76,y:.5}]
};
export const DEFAULT_LINEUP=[5,3,4,0,1,2];
export const DEFAULT_OPTIONS={difficulty:2,halfSeconds:120,weather:'Random',terrain:'Classic',condition:'Good',formation:'2-1-2',music:true,sfx:true,showNames:true,filter:'HD',camera:'Follow',team:0,opponent:9,gameSpeed:1,aiStyle:'Balanced'};
export const WEATHER=['Clear','Rain','Wind','Storm','Tornado','Random'];
export const TERRAIN=['Classic','Grass','Dirt','Sand'];
export const CONDITIONS=['Good','Patchy','Wet'];
