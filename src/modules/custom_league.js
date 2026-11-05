// Supermagic Football | isolated local Custom League campaign core.
// This module deliberately does not alter Career/Cup schemas or browser/UI wiring.
const CUSTOM_LEAGUE_MIN_TEAMS=4,CUSTOM_LEAGUE_MAX_TEAMS=16,CUSTOM_LEAGUE_FORMAT='custom-league',CUSTOM_LEAGUE_ID='league_CUSTOM';
const customLeagueZero=()=>({p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
const customLeagueFNV=(...parts)=>parts.join('|').split('').reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261)>>>0;
const customLeagueIsTeamId=id=>Number.isSafeInteger(id)&&id>=0;
const customLeagueIsTeam=(teams,id)=>Array.isArray(teams)&&customLeagueIsTeamId(id)&&Object.hasOwn(teams,id)&&Boolean(teams[id])&&typeof teams[id]==='object';
const customLeagueClone=value=>JSON.parse(JSON.stringify(value));
function validateEntrants(club,participants,teams){
 if(!customLeagueIsTeamId(club)||!Array.isArray(participants)||participants.length<CUSTOM_LEAGUE_MIN_TEAMS||participants.length>CUSTOM_LEAGUE_MAX_TEAMS||
  !participants.every(id=>customLeagueIsTeam(teams,id))||new Set(participants).size!==participants.length||!participants.includes(club))
  throw new Error('Choose 4–16 different existing teams, including your club.');
}
// Circle-method schedule. A null slot is an explicit bye; the return leg swaps
// home/away for every scheduled match while preserving each team's bye round.
function customLeagueBuildSchedule(participants){
 const ring=participants.slice();if(ring.length%2)ring.push(null);
 const firstLeg=[];let rotating=ring.slice();
 for(let r=0;r<rotating.length-1;r++){
  const matches=[],byes=[];
  for(let i=0;i<rotating.length/2;i++){
   const home=rotating[i],away=rotating[rotating.length-1-i];
   if(home===null)byes.push(away);else if(away===null)byes.push(home);else matches.push([home,away]);
  }
  firstLeg.push({matches,byes});rotating=[rotating[0],rotating[rotating.length-1],...rotating.slice(1,-1)];
 }
 const secondLeg=firstLeg.map(round=>({matches:round.matches.map(([home,away])=>[away,home]),byes:round.byes.slice()}));
 return [...firstLeg,...secondLeg];
}
function createCustomLeague(club,participants,teams){
 validateEntrants(club,participants,teams);
 const ids=participants.slice(),seed=customLeagueFNV('custom-league-v1',club,...ids),rounds=customLeagueBuildSchedule(ids);
 return {id:CUSTOM_LEAGUE_ID,compId:'CUSTOM_LEAGUE',format:CUSTOM_LEAGUE_FORMAT,version:1,club,seed,participants:ids,phase:'league',roundIdx:0,
  rounds,table:Object.fromEntries(ids.map(id=>[id,customLeagueZero()])),history:[],winner:null};
}
function customLeagueCurrent(c){
 if(!c||c.phase==='finished')return null;
 const round=c.rounds?.[c.roundIdx];if(!round)return null;
 const pair=round.matches.find(([home,away])=>home===c.club||away===c.club);
 if(!pair)return {kind:'league',bye:true,round:c.roundIdx+1,legs:c.rounds.length};
 const [home,away]=pair;return {kind:'league',bye:false,opponent:home===c.club?away:home,home:home===c.club,round:c.roundIdx+1,legs:c.rounds.length};
}
function customLeagueCompareRows(a,b,index){return b.pts-a.pts||((b.gf-b.ga)-(a.gf-a.ga))||b.gf-a.gf||b.w-a.w||index.get(a.id)-index.get(b.id);}
function customLeagueStandings(c){
 if(!c||!Array.isArray(c.participants)||!c.table||typeof c.table!=='object'||Array.isArray(c.table)||
  !c.participants.every(id=>Object.hasOwn(c.table,String(id))&&customLeagueValidRow(c.table[id])))return [];
 const order=new Map(c.participants.map((id,i)=>[id,i]));
 return c.participants.map(id=>({id,...c.table[id],gd:c.table[id].gf-c.table[id].ga}))
  .sort((a,b)=>customLeagueCompareRows(a,b,order)).map((row,index)=>({...row,position:index+1}));
}
function customLeagueAddScore(table,home,away,homeGoals,awayGoals){
 const h=table[home],a=table[away];h.p++;a.p++;h.gf+=homeGoals;h.ga+=awayGoals;a.gf+=awayGoals;a.ga+=homeGoals;
 if(homeGoals>awayGoals){h.w++;h.pts+=3;a.l++;}else if(homeGoals<awayGoals){a.w++;a.pts+=3;h.l++;}else{h.d++;a.d++;h.pts++;a.pts++;}
}
function customLeagueScoreForAi(teams,home,away,seed,roundIndex,matchIndex){
 const homeRank=Number.isFinite(Number(teams[home]?.rank))?Number(teams[home].rank):60;
 const awayRank=Number.isFinite(Number(teams[away]?.rank))?Number(teams[away].rank):60;
 const advantage=(homeRank-awayRank)*.025,homeNoise=(customLeagueFNV(seed,roundIndex,matchIndex,'home')%1000)/1000,awayNoise=(customLeagueFNV(seed,roundIndex,matchIndex,'away')%1000)/1000;
 return [Math.max(0,Math.min(6,Math.round(1.15+advantage+homeNoise*1.65))),Math.max(0,Math.min(6,Math.round(1.15-advantage+awayNoise*1.65)))];
}
function customLeagueValidRound(round,participants){
 if(!round||typeof round!=='object'||!Array.isArray(round.matches)||!Array.isArray(round.byes))return false;
 const seen=new Set();
 for(const pair of round.matches){if(!Array.isArray(pair)||pair.length!==2||!pair.every(id=>participants.includes(id))||pair[0]===pair[1]||seen.has(pair[0])||seen.has(pair[1]))return false;seen.add(pair[0]);seen.add(pair[1]);}
 for(const id of round.byes){if(!participants.includes(id)||seen.has(id)||round.byes.indexOf(id)!==round.byes.lastIndexOf(id))return false;seen.add(id);}
 return seen.size===participants.length&&round.byes.length===participants.length%2;
}
function customLeagueValidRow(row){
 return Boolean(row&&typeof row==='object'&&!Array.isArray(row)&&['p','w','d','l','gf','ga','pts'].every(k=>Number.isSafeInteger(row[k])&&row[k]>=0)&&
  row.p===row.w+row.d+row.l&&row.pts===row.w*3+row.d);
}
function customLeagueValid(c,teams){
 if(!c||typeof c!=='object'||Array.isArray(c)||c.id!==CUSTOM_LEAGUE_ID||c.compId!=='CUSTOM_LEAGUE'||c.format!==CUSTOM_LEAGUE_FORMAT||c.version!==1||
  !customLeagueIsTeamId(c.club)||!Array.isArray(c.participants)||c.participants.length<CUSTOM_LEAGUE_MIN_TEAMS||c.participants.length>CUSTOM_LEAGUE_MAX_TEAMS||
  !c.participants.every(id=>customLeagueIsTeam(teams,id))||new Set(c.participants).size!==c.participants.length||!c.participants.includes(c.club)||
  !Number.isSafeInteger(c.seed)||c.seed<0||!['league','finished'].includes(c.phase)||!Array.isArray(c.rounds)||
  !Number.isSafeInteger(c.roundIdx)||c.roundIdx<0||c.roundIdx>c.rounds.length||!Array.isArray(c.history)||
  c.history.length>c.participants.length*(c.participants.length-1)||!c.table||typeof c.table!=='object'||Array.isArray(c.table))return false;
 const expected=customLeagueBuildSchedule(c.participants);
 if(c.rounds.length!==expected.length||c.rounds.some((r,i)=>JSON.stringify(r)!==JSON.stringify(expected[i]))||c.rounds.some(r=>!customLeagueValidRound(r,c.participants)))return false;
 if(c.phase==='league'&&c.roundIdx>=c.rounds.length||c.phase==='finished'&&c.roundIdx!==c.rounds.length)return false;
 if(c.phase==='finished'?!Number.isSafeInteger(c.winner)||!c.participants.includes(c.winner):c.winner!==null)return false;
 const expectedTable=Object.fromEntries(c.participants.map(id=>[id,customLeagueZero()])),expectedHistory=[];
 for(let r=0;r<c.roundIdx;r++)for(const [home,away] of c.rounds[r].matches){
  const row=c.history[expectedHistory.length];if(!row||row.round!==r+1||row.home!==home||row.away!==away||
   !Number.isSafeInteger(row.homeGoals)||row.homeGoals<0||row.homeGoals>30||!Number.isSafeInteger(row.awayGoals)||row.awayGoals<0||row.awayGoals>30||
   typeof row.userControlled!=='boolean'||row.userControlled!==(home===c.club||away===c.club))return false;
  if(!row.userControlled){const deterministic=customLeagueScoreForAi(teams,home,away,c.seed,r,expected[r].matches.findIndex(pair=>pair[0]===home&&pair[1]===away));
   if(row.homeGoals!==deterministic[0]||row.awayGoals!==deterministic[1])return false;}
  customLeagueAddScore(expectedTable,home,away,row.homeGoals,row.awayGoals);expectedHistory.push(row);
 }
 if(expectedHistory.length!==c.history.length)return false;
 for(const id of c.participants){if(!Object.hasOwn(c.table,String(id))||!customLeagueValidRow(c.table[id])||JSON.stringify(c.table[id])!==JSON.stringify(expectedTable[id]))return false;}
 if(c.phase==='finished'&&customLeagueStandings({...c,table:expectedTable})[0]?.id!==c.winner)return false;
 return true;
}
function advanceCustomLeague(c,teams,clubScore=null){
 if(!customLeagueValid(c,teams)||c.phase==='finished')throw new Error('Invalid or completed Custom League campaign.');
 const fixture=customLeagueCurrent(c);if(!fixture)throw new Error('No playable league round.');
 if(fixture.bye){if(clubScore!==null)throw new Error('A bye round does not accept a score.');}
 else if(!Array.isArray(clubScore)||clubScore.length!==2||clubScore.some(v=>!Number.isSafeInteger(v)||v<0||v>30))throw new Error('A valid score is required.');
  const next=customLeagueClone(c),roundIndex=next.roundIdx,round=next.rounds[roundIndex];let userScoreWritten=false;
 for(let matchIndex=0;matchIndex<round.matches.length;matchIndex++){
  const [home,away]=round.matches[matchIndex],mine=home===next.club||away===next.club;
  let score;
  if(mine){const [forGoals,againstGoals]=clubScore;score=home===next.club?[forGoals,againstGoals]:[againstGoals,forGoals];userScoreWritten=true;}
  else score=customLeagueScoreForAi(teams,home,away,next.seed,roundIndex,matchIndex);
  customLeagueAddScore(next.table,home,away,score[0],score[1]);
  next.history.push({round:roundIndex+1,home,away,homeGoals:score[0],awayGoals:score[1],userControlled:mine});
 }
 if(!fixture.bye&&!userScoreWritten)throw new Error('The selected club fixture is missing.');
 next.roundIdx++;
 if(next.roundIdx===next.rounds.length){next.phase='finished';next.winner=customLeagueStandings(next)[0]?.id??null;}
 if(!customLeagueValid(next,teams))throw new Error('Custom League update failed validation.');
 return next;
}

export const CUSTOM_LEAGUE=Object.freeze({create:createCustomLeague,current:customLeagueCurrent,standings:customLeagueStandings,advance:advanceCustomLeague,validate:customLeagueValid});
export {createCustomLeague,customLeagueCurrent,customLeagueStandings,advanceCustomLeague,customLeagueValid};
