import {FITNESS} from './fitness.js';
// Supermagic Football v0.8.25.30 | CAREER | independently editable module
const CAREER=(()=>{// Pure deterministic-season manager simulation; client-only career save; no server required.
const deep=x=>JSON.parse(JSON.stringify(x));
const {recoverEnergy}=FITNESS;
const currentSeasonDate=()=>new Date().toISOString().slice(0,10);
function parseSeasonDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const d=new Date(value+'T00:00:00.000Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value?d:null;}
function verifiedPlayerAgeOnDate(player,date){if(player?.ageVerified!==true)return null;const birth=parseSeasonDate(player.birthDate),asOf=parseSeasonDate(date);if(!birth||!asOf)return null;let age=asOf.getUTCFullYear()-birth.getUTCFullYear();if(asOf.getUTCMonth()<birth.getUTCMonth()||(asOf.getUTCMonth()===birth.getUTCMonth()&&asOf.getUTCDate()<birth.getUTCDate()))age--;return age>=0?age:null;}
function advanceCareerSeasonDate(date){const d=parseSeasonDate(date)||parseSeasonDate(currentSeasonDate()),year=d.getUTCFullYear()+1,month=d.getUTCMonth(),day=Math.min(d.getUTCDate(),new Date(Date.UTC(year,month+1,0)).getUTCDate());return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
// Where fixtures lack calendar dates, the game uses seven rest days for league
// and two for a cup fixture; callers can specify nextFixtureRestDays explicitly.
function recoverCareerEnergy(c,days){
 for(const p of c.roster||[]){
  const base=Number.isFinite(+p.energy)?+p.energy:Math.max(0,Math.min(100,Number(p.condition)||100));
  p.energy=recoverEnergy(base,days,Number(p.stamina)||60);
 }
 return c;
}

const seed=(...a)=>a.join('|').split('').reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
const FIRST=['Ace','Bobby','Juno','Marco','Leo','Kobe','Miko','Yuri','Rafi','Eli','Niko','Rio','Zeno','Jasper','Mateo','Kian'];
const LAST=['Storm','Blaze','Ramos','Falcon','Stone','Ninja','Hawk','Rocket','Volt','Breeze','Ace','River','Spark'];
const leagueSchedule=(members)=>{let a=members.slice(),rounds=[];for(let k=0;k<a.length-1;k++){let matches=[];for(let i=0;i<a.length/2;i++)matches.push([a[i],a[a.length-1-i]]);rounds.push(matches);a=[a[0],a[a.length-1],...a.slice(1,-1)]}return [...rounds,...rounds.map(ms=>ms.map(([x,y])=>[y,x]))]};
function createCareer(club,teams){const leagueClubs=teams.map((t,i)=>i).filter(i=>['club26','continental'].includes(teams[i].group)&&i!==club);const team=teams[club];const candidates=leagueClubs.sort((a,b)=>{const xa=teams[a],xb=teams[b],score=t=>(t.flag===team.flag?0:((t.continent||'UEFA')===(team.continent||'UEFA')?180:350))+Math.abs(t.rank-team.rank)*1.5;return score(xa)-score(xb)});const members=[club,...candidates.slice(0,7)];
 const seasonDate=currentSeasonDate(),roster=deep(teams[club].customRoster);for(const p of roster){const verifiedAge=verifiedPlayerAgeOnDate(p,seasonDate);if(verifiedAge!==null)p.age=verifiedAge;}
 return {club,season:1,seasonDate,week:0,scouted:[],sponsors:0,facilitiesNews:[],members,fixtures:leagueSchedule(members),table:Object.fromEntries(members.map(i=>[i,{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}])),cash:155000000,roster,facilities:{training:1,stadium:1,academy:1},cup:{stage:0,eliminated:false,pending:false,wins:0},history:[],lastResult:null,leagueFinished:false};}
function currentCareerFixture(c){if(!c||c.leagueFinished)return null;if(c.cup.pending&&!c.cup.eliminated){const rival=c.members[(c.cup.stage*2+3)%c.members.length]===c.club?c.members[1]:c.members[(c.cup.stage*2+3)%c.members.length];return {kind:'cup',opponent:rival,round:['Quarterfinal','Semifinal','Final'][c.cup.stage]}}
 const round=c.fixtures[c.week];if(!round)return null;const m=round.find(v=>v.includes(c.club));return {kind:'league',opponent:m[0]===c.club?m[1]:m[0],round:c.week+1};}
function add(c,a,b,sa,sb){const x=c.table[a],y=c.table[b];for(const q of [x,y])q.p++;x.gf+=sa;x.ga+=sb;y.gf+=sb;y.ga+=sa;if(sa>sb){x.w++;x.pts+=3;y.l++;}else if(sa<sb){y.w++;y.pts+=3;x.l++;}else{x.d++;y.d++;x.pts++;y.pts++;}}
// Keep new v0.6.2 attributes aligned with player growth. Old careers lacking
// explicit ratings still derive from legacy values at game initialization.
function growAttributes(p,focused=false,amount=1){
 const keys=(p.role==='GK'?['gkSkill','gkDiving','stamina','strength']:p.role==='DF'?['defence','strength','aggression','stamina']:p.role==='MF'?['passing','crossing','stamina','speedRating','agility','dribbling']:['shootPower','shootAccuracy','heading','speedRating','agility','dribbling']);
 const target=focused?[...keys,'stamina']:keys;
 for(const key of target)if(Number.isFinite(+p[key]))p[key]=Math.max(1,Math.min(100,Math.round(+p[key]+amount)));
}
// Potential classes are derived from the existing numeric value; no class field
// is written into careers, so old save shapes remain valid.
const POTENTIAL_BANDS=Object.freeze([
 {id:'foundation',label:'Foundation',min:0,max:59},
 {id:'developing',label:'Developing',min:60,max:69},
 {id:'promising',label:'Promising',min:70,max:79},
 {id:'elite',label:'Elite',min:80,max:89},
 {id:'generational',label:'Generational',min:90,max:99}
]);
function careerPotentialBand(value){
 const score=value&&typeof value==='object'?value.potential:value;
 if(score===null||score===undefined||score===''||!Number.isFinite(Number(score)))return null;
 const potential=Math.max(0,Math.min(99,Math.round(Number(score))));
 return POTENTIAL_BANDS.find(b=>potential>=b.min&&potential<=b.max)?.label||null;
}
// Pure bounded growth: inputs are deterministic development events, and the
// returned player is a copy. Rating is capped by potential; legacy players
// without that optional field use the ordinary 99 rating cap without migration.
// Training level 3 and a strong result can add development; a loss can regress.
// Under-21 players get a youth bonus, ages 29+ lose growth, and seasons from 30
// can regress when training/form is poor (age 34+ always regresses one point).
function applyCareerGrowth(player,{training=0,performance=0,ageAdvance=false,focused=false}={}){
 if(!player||typeof player!=='object')throw new TypeError('Career player is required');
 const updated={...player},age=Number.isFinite(Number(player.age))?Number(player.age):23;
 const train=Math.max(0,Math.min(3,Math.round(Number(training)||0)));
 const form=Math.max(-2,Math.min(2,Math.round(Number(performance)||0)));
 let units=0;
 if(ageAdvance){
  if(age<=19&&train>0)units=1;
  else if(age>=34||age>=30&&(train<2||form<0))units=-1;
 }else{
  units=1+(train>=3?1:0)+(form>=2?1:form<0?-2:0);
  if(age<=20&&units>0)units++;
  if(age>=29)units--;
  if(age>=32)units--;
  units=Math.max(-2,Math.min(2,units));
 }
 const rawPotential=Number(player.potential);
 const potential=Number.isFinite(rawPotential)?Math.max(0,Math.min(99,Math.round(rawPotential))):99;
 const currentRating=Number.isFinite(Number(player.rating))?Number(player.rating):
  Math.max(Number(player.power)||0,Number(player.shoot)||0,Number(player.defense)||0);
 if(units>0&&currentRating>=potential)units=0;
 const fields=[['rating',units>0?potential:99],['power',99],['shoot',70],['defense',70]];
 for(let step=0;step<Math.abs(units);step++){
  const direction=Math.sign(units);
  for(const [key,cap] of fields)if(Number.isFinite(Number(updated[key]))){
   updated[key]=Math.max(1,Math.min(cap,Math.round(Number(updated[key])+direction)));
  }
  growAttributes(updated,focused,direction);
 }
 return updated;
}
const strength=(teams,id)=>teams[id]?.rank||60;
function validateLeagueFixtureState(c){
 if(!c||typeof c!=='object'||!Number.isSafeInteger(c.club)||!Array.isArray(c.members)||
  c.members.length<2||c.members.some(id=>!Number.isSafeInteger(id)||id<0)||new Set(c.members).size!==c.members.length||
  !c.members.includes(c.club)||!Array.isArray(c.fixtures)||!Number.isSafeInteger(c.week)||
  c.week<0||c.week>=c.fixtures.length)throw Error('Invalid Career fixture schedule');
 const round=c.fixtures[c.week];
 if(!Array.isArray(round)||!round.length)throw Error('Invalid Career fixture schedule');
 const members=new Set(c.members),seen=new Set();let clubFixtures=0;
 for(const match of round){
  if(!Array.isArray(match)||match.length!==2||!match.every(id=>Number.isSafeInteger(id)&&id>=0&&members.has(id))||
   match[0]===match[1]||seen.has(match[0])||seen.has(match[1]))throw Error('Invalid Career fixture schedule');
  seen.add(match[0]);seen.add(match[1]);
  if(match.includes(c.club))clubFixtures++;
  for(const id of match){
   const row=Object.hasOwn(c.table||{},String(id))?c.table[id]:null;
   if(!row||typeof row!=='object'||Array.isArray(row)||!['p','w','d','l','gf','ga','pts'].every(key=>Number.isSafeInteger(row[key])&&row[key]>=0))
    throw Error('Invalid Career standings table');
  }
 }
 if(seen.size!==members.size)throw Error('Invalid Career fixture schedule');
 if(clubFixtures!==1)throw Error('Invalid Career fixture schedule');
}
function advanceCareer(c,teams,goals,penaltyWinner=null){if(!c||c.leagueFinished)throw Error('No playable fixture');if(!(c.cup?.pending&&!c.cup?.eliminated))validateLeagueFixtureState(c);const fx=currentCareerFixture(c);if(!fx)throw Error('No playable fixture');if(!Array.isArray(goals)||goals.length!==2||goals.some(v=>!Number.isInteger(v)||v<0||v>30))throw Error('A valid score is required');if(penaltyWinner!==null&&penaltyWinner!==0&&penaltyWinner!==1)throw Error('A valid penalty winner is required');const [a,b]=goals;const draw=a===b;
 // Shootout outcomes apply to the Cup only; a league draw remains a draw even
 // if a legacy caller supplies stray penalty metadata.
 const cupPenaltyWin=fx.kind==='cup'&&draw&&penaltyWinner===0,win=a>b||cupPenaltyWin;
 c.lastResult={kind:fx.kind,week:c.week+1,against:fx.opponent,a,b,win};
 if(fx.kind==='cup'){
  if(win){c.cup.wins++;c.cup.stage++;c.cash+=8500000;c.cup.pending=false;if(c.cup.stage===3)c.cash+=40000000;}
  else{c.cup.eliminated=true;c.cup.pending=false;}c.history.unshift(c.lastResult);return c.lastResult;
 }
 for(const match of c.fixtures[c.week]){if(match.includes(c.club)){const r=match[0]===c.club?[a,b]:[b,a];add(c,match[0],match[1],...r)}else{
 const ra=strength(teams,match[0]),rb=strength(teams,match[1]);const da=Math.max(0,Math.round(1.3+(ra-rb)*.055+(Math.sin(c.week*31+match[0]*9)*1.5))),db=Math.max(0,Math.round(1.3+(rb-ra)*.055+Math.sin(c.week*17+match[1]*13)*1.4));add(c,match[0],match[1],da,db);
 }}
 c.week++;c.cash+=1800000+Math.max(0,a)*2500000+(win?4300000:draw?1700000:500000)-Math.round(c.roster.reduce((total,p)=>total+(p.value||5000000)*.006,0));
 for(const p of c.roster){p.xp=(p.xp||0)+(win?24:12)+(c.facilities?.training||1)*3;if(p.xp>=100){p.level=(p.level||1)+1;p.xp-=100;Object.assign(p,applyCareerGrowth(p,{training:c.facilities?.training||1,performance:win?2:draw?0:-1}));p.value=Math.round((p.value||4000000)*1.04)}}
 if(c.week%3===0){const sponsor=450000*c.facilities.stadium;c.cash+=sponsor;c.sponsors=(c.sponsors||0)+sponsor;}
 for(const p of c.roster){p.condition=Math.max(50,(p.condition??100)-2+(c.facilities.training>2?1:0));if((p.injuryWeeks||0)>0)p.injuryWeeks--;if((p.contractYears||2)<=0)p.contractYears=1;}
 if(c.week===4||c.week===8||c.week===12){if(!c.cup.eliminated&&c.cup.stage<3)c.cup.pending=true}
 if(c.week>=c.fixtures.length){c.leagueFinished=true;const sorted=standings(c);const place=sorted.findIndex(v=>v.id===c.club)+1;c.cash+=[70000000,40000000,25000000,18000000,14000000,9000000,7000000,5000000][place-1]||5000000;c.championship=place===1;}
 c.history.unshift(c.lastResult);return c.lastResult;
}
function standings(c){return c.members.map(id=>({id,...c.table[id]})).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf)}
// Read-only season review foundation. The game stores no historical season
// archive: this snapshot is available only while the finished season's table
// is still present, before nextSeason() clears it. Legacy saves may omit the
// completion flag, so an exhausted, non-empty fixture list is accepted only
// when that flag itself is absent.
const reviewCount=value=>{
 if(typeof value==='number')return Number.isSafeInteger(value)&&value>=0?value:null;
 if(typeof value==='string'&&/^\d+$/.test(value.trim())){const parsed=Number(value.trim());return Number.isSafeInteger(parsed)?parsed:null;}
 return null;
};
function careerCupSeasonReview(cup){
 if(!cup||typeof cup!=='object'||Array.isArray(cup))return {status:'unknown',stage:null,wins:null,pending:null};
 const stage=Number.isInteger(cup.stage)&&cup.stage>=0&&cup.stage<=3?cup.stage:null;
 const wins=reviewCount(cup.wins);
 const pending=typeof cup.pending==='boolean'?cup.pending:null;
 let status='unknown';
 if(cup.eliminated===true&&stage!==3)status='eliminated';
 else if(cup.eliminated!==true&&stage===3)status='champion';
 else if(cup.eliminated!==true&&stage!==null)status=pending?'pending':'in_progress';
 return {status,stage,wins,pending};
}
function careerSeasonReview(c,teams=[]){
 const season=Number.isSafeInteger(c?.season)&&c.season>0?c.season:null;
 const clubId=Number.isSafeInteger(c?.club)&&c.club>=0?c.club:null;
 const clubName=Array.isArray(teams)&&typeof teams[clubId]?.name==='string'?teams[clubId].name:null;
 const unavailable=(reason)=>({available:false,reason,season,clubId,clubName,league:null,cup:careerCupSeasonReview(c?.cup)});
 if(!c||typeof c!=='object'||Array.isArray(c))return unavailable('career_unavailable');
 const complete=c.leagueFinished===true||(
  c.leagueFinished===undefined&&Array.isArray(c.fixtures)&&c.fixtures.length>0&&
  Number.isSafeInteger(c.week)&&c.week>=c.fixtures.length
 );
 if(!complete)return unavailable('season_not_confirmed_complete');
 if(clubId===null||!Array.isArray(c.members)||!c.members.length||
  !c.members.every((id,index)=>Number.isSafeInteger(id)&&id>=0&&c.members.indexOf(id)===index)||
  !c.members.includes(clubId)||!c.table||typeof c.table!=='object'||Array.isArray(c.table)){
  return unavailable('league_data_unavailable');
 }
 const ranked=[];
 for(let index=0;index<c.members.length;index++){
  const id=c.members[index],row=Object.hasOwn(c.table,String(id))?c.table[String(id)]:null;
  if(!row||typeof row!=='object'||Array.isArray(row))return unavailable('league_data_unavailable');
  const pts=reviewCount(row.pts),gf=reviewCount(row.gf),ga=reviewCount(row.ga);
  if(pts===null||gf===null||ga===null)return unavailable('league_data_unavailable');
  const value=key=>reviewCount(row[key]);
  ranked.push({id,name:Array.isArray(teams)&&typeof teams[id]?.name==='string'?teams[id].name:null,
   played:value('p'),wins:value('w'),draws:value('d'),losses:value('l'),
   goalsFor:gf,goalsAgainst:ga,goalDifference:gf-ga,points:pts,_sourceOrder:index});
 }
 ranked.sort((a,b)=>b.points-a.points||b.goalDifference-a.goalDifference||b.goalsFor-a.goalsFor||a._sourceOrder-b._sourceOrder);
 const standingsRows=ranked.map(({_sourceOrder,...row},index)=>({...row,position:index+1}));
 const userRow=standingsRows.find(row=>row.id===clubId);
 if(!userRow||!standingsRows.length)return unavailable('league_data_unavailable');
 const champion=standingsRows[0];
 return {available:true,reason:null,season,clubId,clubName,
  league:{championId:champion.id,championName:champion.name,clubPosition:userRow.position,
   teamCount:standingsRows.length,championIsUserClub:champion.id===clubId,clubRecord:{
    played:userRow.played,wins:userRow.wins,draws:userRow.draws,losses:userRow.losses,
    goalsFor:userRow.goalsFor,goalsAgainst:userRow.goalsAgainst,goalDifference:userRow.goalDifference,points:userRow.points,
   },standings:standingsRows},
  cup:careerCupSeasonReview(c.cup)};
}
// Preserve a small, immutable history because nextSeason resets the current
// standings and cup state. Old saves need no migration: this optional ledger
// is written only when a complete current season is explicitly advanced.
function completedSeasonArchive(c){
 if(!c||typeof c!=='object'||!Array.isArray(c.seasonArchive))return [];
 return deep(c.seasonArchive.filter(row=>row&&typeof row==='object'&&!Array.isArray(row)));
}
function isCompleteCareerArchiveRow(row){
 return Boolean(row&&typeof row==='object'&&!Array.isArray(row)&&Number.isSafeInteger(row.season)&&row.season>0&&
  Number.isSafeInteger(row.clubId)&&row.clubId>=0&&Number.isSafeInteger(row.championId)&&row.championId>=0&&
  Number.isSafeInteger(row.clubPosition)&&row.clubPosition>0&&Number.isSafeInteger(row.teamCount)&&row.teamCount>0&&
  row.clubPosition<=row.teamCount&&row.clubRecord&&typeof row.clubRecord==='object'&&!Array.isArray(row.clubRecord)&&
  Array.isArray(row.standings)&&row.cup&&typeof row.cup==='object'&&!Array.isArray(row.cup));
}
function archiveCompletedSeason(c){
 const review=careerSeasonReview(c);
 if(!review.available)return false;
 const archive=completedSeasonArchive(c);
 if(archive.some(row=>isCompleteCareerArchiveRow(row)&&row.season===review.season&&row.clubId===review.clubId))return false;
 const league=review.league;
 archive.push({season:review.season,clubId:review.clubId,championId:league.championId,
  clubPosition:league.clubPosition,teamCount:league.teamCount,clubRecord:deep(league.clubRecord),
  standings:deep(league.standings),cup:deep(review.cup)});
 c.seasonArchive=archive.slice(-12);
 return true;
}
function nextSeason(c){archiveCompletedSeason(c);c.season++;c.seasonDate=advanceCareerSeasonDate(c.seasonDate);for(const p of c.roster){const verifiedAge=verifiedPlayerAgeOnDate(p,c.seasonDate),legacyAge=Number(p.age);p.age=verifiedAge??(Number.isSafeInteger(legacyAge)&&legacyAge>=0&&legacyAge<Number.MAX_SAFE_INTEGER?legacyAge+1:24);Object.assign(p,applyCareerGrowth(p,{ageAdvance:true,training:c.facilities?.training||1,performance:c.lastResult?.win?2:c.lastResult?.a===c.lastResult?.b?0:-1}));p.contractYears=Math.max(0,(p.contractYears??2)-1);p.condition=100;p.injuryWeeks=0;}c.scouted=[];c.week=0;c.leagueFinished=false;c.fixtures=leagueSchedule(c.members);c.table=Object.fromEntries(c.members.map(i=>[i,{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}]));c.cup={stage:0,eliminated:false,pending:false,wins:0};}
const validCareerPlayerId=id=>(typeof id==='string'&&id.trim().length>0)||(Number.isSafeInteger(id)&&id>=0);
const sameCareerPlayerId=(a,b)=>validCareerPlayerId(a)&&validCareerPlayerId(b)&&String(a)===String(b);
const validCareerShirtNumber=num=>Number.isSafeInteger(num)&&num>=1&&num<=99;
function careerReplacementShirtNumber(c,incoming,releaseIndex,released){
 if(validCareerShirtNumber(released?.num))return released.num;
 // Older or imported Career rows may not have a usable number. Keep the
 // market player's valid number instead of replacing it with undefined/NaN.
 if(validCareerShirtNumber(incoming?.num))return incoming.num;
 const used=new Set(c.roster.filter((_,index)=>index!==releaseIndex).map(player=>player?.num).filter(validCareerShirtNumber));
 for(let number=1;number<=99;number++)if(!used.has(number))return number;
 return 1;
}
function careerTransferQuote(c,teams,marketTeam,playerIndex,releaseIndex){
 const source=teams?.[marketTeam]?.customRoster?.[playerIndex];
 const released=Array.isArray(c?.roster)&&Number.isInteger(releaseIndex)?c.roster[releaseIndex]:null;
 if(!source||typeof source!=='object'||Array.isArray(source)||!validCareerPlayerId(source.id)||marketTeam===c?.club||!released||typeof released!=='object'||Array.isArray(released))return {valid:false,affordable:false};
 if(c.roster.some(p=>sameCareerPlayerId(p?.id,source.id)))return {valid:false,affordable:false};
 const configuredMoney=source.value,configuredSaleValue=released.value;
 const price=configuredMoney===undefined||configuredMoney===null||configuredMoney===0||configuredMoney===''?5000000:Number(configuredMoney);
 const saleValue=configuredSaleValue===undefined||configuredSaleValue===null||configuredSaleValue===0||configuredSaleValue===''?2000000:Number(configuredSaleValue);
 if(!Number.isFinite(price)||price<=0||!Number.isFinite(saleValue)||saleValue<0||!Number.isFinite(c.cash))return {valid:false,affordable:false};
 const credit=Math.floor(saleValue*.35),projectedCash=c.cash-price+credit;
 if(!Number.isFinite(projectedCash))return {valid:false,affordable:false};
 return {valid:true,price,saleValue,credit,projectedCash,affordable:c.cash>=price,shortfall:Math.max(0,price-c.cash)};
}
function purchase(c,teams,marketTeam,playerIndex,releaseIndex){
 const source=teams?.[marketTeam]?.customRoster?.[playerIndex];
 if(!source||typeof source!=='object'||Array.isArray(source)||!validCareerPlayerId(source.id)||marketTeam===c?.club||
  !Array.isArray(c?.roster)||!Number.isInteger(releaseIndex)||releaseIndex<0||releaseIndex>=c.roster.length){
  throw Error('Select player and your outgoing squad member');
 }
 const released=c.roster[releaseIndex];
 if(!released||typeof released!=='object'||Array.isArray(released))throw Error('Select player and your outgoing squad member');
 if(c.roster.some(p=>sameCareerPlayerId(p?.id,source.id)))throw Error('Already in your squad');
 const quote=careerTransferQuote(c,teams,marketTeam,playerIndex,releaseIndex);
 if(!quote.valid)throw Error('Invalid transfer value');
 if(!quote.affordable)throw Error('Not enough transfer funds');
 const join=deep(source);
 join.num=careerReplacementShirtNumber(c,source,releaseIndex,released);
 const resultingCash=quote.projectedCash;
 if(!Number.isFinite(resultingCash))throw Error('Invalid transfer value');
 // Resolve every input and clone before committing either side of the swap.
 c.roster[releaseIndex]=join;
 c.cash=resultingCash;
 return join;
}
function upgradeFacility(c,type){if(!['training','stadium','academy'].includes(type))throw Error('Invalid facility');if(!c||typeof c!=='object'||!c.facilities||typeof c.facilities!=='object'||Array.isArray(c.facilities))throw Error('Invalid facility state');const level=c.facilities[type];if(!Number.isSafeInteger(level)||level<0)throw Error('Invalid facility level');if(!Number.isFinite(c.cash)||c.cash<0)throw Error('Invalid facility budget');const cost=level*12500000,nextLevel=level+1,resultingCash=c.cash-cost;if(!Number.isFinite(cost)||!Number.isSafeInteger(nextLevel)||!Number.isFinite(resultingCash))throw Error('Invalid facility upgrade');if(c.cash<cost)throw Error('Not enough funds');const facilities={...c.facilities,[type]:nextLevel};c.facilities=facilities;c.cash=resultingCash;return cost;}
function trainPlayer(c,index){if(!c||typeof c!=='object'||!Array.isArray(c.roster)||!Number.isInteger(index)||index<0||index>=c.roster.length)throw Error('Player not found');const p=c.roster[index];if(!p||typeof p!=='object'||Array.isArray(p))throw Error('Player not found');const cost=1500000;if(!Number.isFinite(c.cash)||c.cash<0)throw Error('Invalid training budget');if(c.cash<cost)throw Error('Insufficient funds');const rawTraining=c.facilities?.training||1,training=Number(rawTraining),xp=Number(p.xp||0),level=Number(p.level||1);if(!Number.isFinite(training)||training<0||!Number.isFinite(xp)||xp<0||!Number.isSafeInteger(level)||level<1)throw Error('Invalid training details');const nextXp=xp+38+training*8,resultingCash=c.cash-cost;if(!Number.isFinite(nextXp)||!Number.isFinite(resultingCash))throw Error('Invalid training details');const trained={...p,xp:nextXp,level};Object.assign(trained,applyCareerGrowth(trained,{training:Math.min(3,training+1),performance:0,focused:true}));if(trained.xp>=100){trained.xp-=100;trained.level++;if(!Number.isSafeInteger(trained.level))throw Error('Invalid training details');}const roster=c.roster.slice();roster[index]=trained;c.roster=roster;c.cash=resultingCash;return trained;}

function scoutAcademy(c){
 const cost=2500000;
 if(!c||typeof c!=='object'||!Number.isSafeInteger(c.club)||c.club<0||!Number.isSafeInteger(c.season)||c.season<1||!Number.isSafeInteger(c.week)||c.week<0||!Array.isArray(c.roster)||!c.roster.length||!c.facilities||typeof c.facilities!=='object'||Array.isArray(c.facilities)||!Number.isSafeInteger(c.facilities.academy)||c.facilities.academy<0||c.scouted!==undefined&&!Array.isArray(c.scouted))throw Error('Invalid Academy scouting state');
 if(!Number.isFinite(c.cash)||c.cash<0)throw Error('Invalid Academy budget');
 if(c.cash<cost)throw Error('Not enough scouting funds');
 const scouted=c.scouted||[],idBase='youth_'+c.club+'_'+c.season+'_'+c.week+'_',usedIds=new Set([...c.roster,...scouted].map(p=>p?.id).filter(id=>typeof id==='string'));
 let i=scouted.length;while(usedIds.has(idBase+i))i++;
 const n=seed(c.club,c.season,c.week,i),role=['GK','DF','MF','FW'][n%4],rating=54+Math.min(34,c.facilities.academy*3+(n%17)),id=idBase+i,model=c.roster[n%c.roster.length];
 if(!model||typeof model!=='object'||Array.isArray(model))throw Error('Invalid Academy scouting roster');
 const p={id,name:FIRST[n%FIRST.length]+' '+LAST[(n>>>5)%LAST.length],role,num:13+i,power:25+Math.round(rating*.38),shoot:Math.round(rating*.25),defense:Math.round(rating*.26),speed:['A','B','C'][n%3],shot:model.shot,shotName:model.shotName,skill:'Scouted academy talent',age:16+n%5,level:1,xp:0,rating,potential:Math.min(99,rating+8+n%13),value:Math.round(rating*rating*2200),fictional:true,source:'procedurally generated academy talent',condition:100,contractYears:3};
 const resultingCash=c.cash-cost;if(!Number.isFinite(resultingCash))throw Error('Invalid Academy budget');
 c.scouted=[...scouted,p];c.cash=resultingCash;return p;
}
function signAcademy(c,scoutIndex,releaseIndex){const p=c.scouted?.[scoutIndex];if(!p)throw Error('No such scouted player');if(!validCareerPlayerId(p.id))throw Error('Invalid youth player identity');if(!Array.isArray(c.roster)||c.roster.some(player=>sameCareerPlayerId(player?.id,p.id)))throw Error('Youth player identity already in your squad');if(!Number.isInteger(releaseIndex)||releaseIndex<0||releaseIndex>=12)throw Error('Select an outgoing player');const outgoing=Array.isArray(c.roster)?c.roster[releaseIndex]:null;if(!outgoing||!Number.isFinite(outgoing.num))throw Error('Select an outgoing player');if(!Number.isFinite(p.value)||p.value<0)throw Error('Invalid youth player value');if(!Number.isFinite(c.cash))throw Error('Invalid youth budget');const fee=Math.ceil(p.value*.55);if(c.cash<fee)throw Error('Cannot afford youth player');const resultingCash=c.cash-fee;if(!Number.isFinite(resultingCash))throw Error('Invalid youth budget');const signed=deep(p);signed.num=outgoing.num;const roster=c.roster.slice();roster[releaseIndex]=signed;const scouted=c.scouted.slice();scouted.splice(scoutIndex,1);c.roster=roster;c.scouted=scouted;c.cash=resultingCash;return signed;}
function renewContract(c,index){if(!Array.isArray(c?.roster)||!Number.isInteger(index)||index<0||index>=c.roster.length)throw Error('No player selected');const p=c.roster[index];if(!p||typeof p!=='object'||Array.isArray(p))throw Error('No player selected');const rawValue=p.value,rawYears=p.contractYears,value=rawValue===undefined||rawValue===null||rawValue===0||rawValue===''?5000000:Number(rawValue),years=rawYears===undefined||rawYears===null||rawYears===''?0:Number(rawYears);if(!Number.isFinite(value)||value<0||!Number.isSafeInteger(years)||years<0||!Number.isFinite(c.cash))throw Error('Invalid contract details');const fee=Math.round(value*.13)+850000,resultingCash=c.cash-fee,nextYears=years+2;if(!Number.isFinite(fee)||!Number.isFinite(resultingCash)||!Number.isSafeInteger(nextYears))throw Error('Invalid contract details');if(c.cash<fee)throw Error('Not enough budget');const roster=c.roster.slice();roster[index]={...p,contractYears:nextYears};c.roster=roster;c.cash=resultingCash;return fee;}
function recoverPlayer(c,index){if(!c||typeof c!=='object'||!Array.isArray(c.roster)||!Number.isInteger(index)||index<0||index>=c.roster.length)throw Error('No player selected');const p=c.roster[index];if(!p||typeof p!=='object'||Array.isArray(p))throw Error('No player selected');const fee=500000;if(!Number.isFinite(c.cash)||c.cash<0)throw Error('Invalid recovery budget');if(c.cash<fee)throw Error('Not enough budget');if(p.condition!==undefined&&p.condition!==null&&p.condition!==''&&p.condition!==0&&!Number.isFinite(Number(p.condition)))throw Error('Invalid player recovery state');if(p.injuryWeeks!==undefined&&p.injuryWeeks!==null&&p.injuryWeeks!==''&&!Number.isFinite(Number(p.injuryWeeks)))throw Error('Invalid player recovery state');const condition=Number(p.condition||100),injuryWeeks=Number(p.injuryWeeks||0),resultingCash=c.cash-fee;if(!Number.isFinite(condition)||!Number.isFinite(injuryWeeks)||!Number.isFinite(resultingCash))throw Error('Invalid player recovery state');const recovered={...p,condition:Math.min(100,condition+25),injuryWeeks:Math.max(0,injuryWeeks-1)},roster=c.roster.slice();roster[index]=recovered;c.roster=roster;c.cash=resultingCash;return recovered;}
function careerCoverage(c,teams){return {members:c.members.length,realDomesticMatches:c.fixtures.length,region:teams[c.club].continent||'UEFA',country:teams[c.club].flag,scoutCount:c.scouted?.length||0,activeInjuries:c.roster.filter(p=>p.injuryWeeks>0).length,expiring:c.roster.filter(p=>(p.contractYears??2)<=1).length};}

// v0.7.1: after an actual played career fixture, preserve fatigue-driven fitness.
// A low-condition, heavily exhausted athlete has a deterministic small risk of a
// short injury. Academy/bench players recover slightly if they did not play.
function recordMatchFitness(c,report){
 // Fitness reports are transient engine output, not saved Career data. Reject
 // malformed reports before touching any player so a bad row cannot persist a
 // NaN condition or leave earlier roster entries partially updated.
 if(!c||typeof c!=='object'||!Array.isArray(c.roster)||!Array.isArray(report))throw Error('Invalid Career fitness report');
 const reportIds=new Set();
 for(const row of report){
  const validId=(typeof row?.id==='string'&&row.id.trim().length>0)||(Number.isSafeInteger(row?.id)&&row.id>=0);
  if(!row||typeof row!=='object'||Array.isArray(row)||!validId||
   !Number.isFinite(row.seconds)||row.seconds<0||!Number.isFinite(row.fatigue)||row.fatigue<0||row.fatigue>1||
   !Number.isFinite(row.condition)||row.condition<0||row.condition>100||reportIds.has(row.id))throw Error('Invalid Career fitness report');
  reportIds.add(row.id);
 }
 const lookup=new Map(report.map(r=>[r.id,r]));const incidents=[];
 for(const p of c.roster){const r=lookup.get(p.id);if(!r)continue;
  const old=Number.isFinite(+p.condition)?+p.condition:100;
  if(r.seconds>0){p.condition=Math.max(25,Math.min(100,Math.round(r.condition)));p.energy=Math.max(0,Math.min(100,Math.round((1-(Number(r.fatigue)||0))*100)));}
  else p.condition=Math.min(100,old+2);
  const exposure=r.seconds>5&&(r.fatigue>.68||p.condition<48);
  const injuryRoll=seed(p.id,c.season,c.week,c.history.length)%1000;
  if(exposure&&injuryRoll<Math.min(85,Math.round((r.fatigue*.6+(100-p.condition)/200)*55))){p.injuryWeeks=Math.max(p.injuryWeeks||0,1+injuryRoll%2);incidents.push(p.name);}
 }
 // Report describes the completed match; recovery affects the *next* fixture.
 const days=Number.isFinite(+c.nextFixtureRestDays)?Math.max(0,+c.nextFixtureRestDays):(c.lastResult?.kind==='cup'?2:7);
 recoverCareerEnergy(c,days);
 c.lastFitnessReport={restDays:days,players:report.length,injuries:incidents,averageCondition:Math.round(c.roster.reduce((s,p)=>s+(p.condition??100),0)/c.roster.length)};
 return c.lastFitnessReport;
}

return {POTENTIAL_BANDS,careerPotentialBand,applyCareerGrowth,verifiedPlayerAgeOnDate,advanceCareerSeasonDate,createCareer,currentCareerFixture,advanceCareer,standings,careerSeasonReview,completedSeasonArchive,nextSeason,careerTransferQuote,purchase,upgradeFacility,trainPlayer,scoutAcademy,signAcademy,renewContract,recoverPlayer,careerCoverage,recordMatchFitness,recoverCareerEnergy};})();

export {CAREER};
