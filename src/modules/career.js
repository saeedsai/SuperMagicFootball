// Supermagic Football v0.8.25.30 | CAREER | independently editable module
const CAREER=(()=>{// Pure deterministic-season manager simulation; client-only career save; no server required.
const deep=x=>JSON.parse(JSON.stringify(x));
const seed=(...a)=>a.join('|').split('').reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
const FIRST=['Ace','Bobby','Juno','Marco','Leo','Kobe','Miko','Yuri','Rafi','Eli','Niko','Rio','Zeno','Jasper','Mateo','Kian'];
const LAST=['Storm','Blaze','Ramos','Falcon','Stone','Ninja','Hawk','Rocket','Volt','Breeze','Ace','River','Spark'];
const leagueSchedule=(members)=>{let a=members.slice(),rounds=[];for(let k=0;k<a.length-1;k++){let matches=[];for(let i=0;i<a.length/2;i++)matches.push([a[i],a[a.length-1-i]]);rounds.push(matches);a=[a[0],a[a.length-1],...a.slice(1,-1)]}return [...rounds,...rounds.map(ms=>ms.map(([x,y])=>[y,x]))]};
function createCareer(club,teams){const leagueClubs=teams.map((t,i)=>i).filter(i=>['club26','continental'].includes(teams[i].group)&&i!==club);const team=teams[club];const candidates=leagueClubs.sort((a,b)=>{const xa=teams[a],xb=teams[b],score=t=>(t.flag===team.flag?0:((t.continent||'UEFA')===(team.continent||'UEFA')?180:350))+Math.abs(t.rank-team.rank)*1.5;return score(xa)-score(xb)});const members=[club,...candidates.slice(0,7)];
 return {club,season:1,week:0,scouted:[],sponsors:0,facilitiesNews:[],members,fixtures:leagueSchedule(members),table:Object.fromEntries(members.map(i=>[i,{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}])),cash:155000000,roster:deep(teams[club].customRoster),facilities:{training:1,stadium:1,academy:1},cup:{stage:0,eliminated:false,pending:false,wins:0},history:[],lastResult:null,leagueFinished:false};}
function currentCareerFixture(c){if(!c||c.leagueFinished)return null;if(c.cup.pending&&!c.cup.eliminated){const rival=c.members[(c.cup.stage*2+3)%c.members.length]===c.club?c.members[1]:c.members[(c.cup.stage*2+3)%c.members.length];return {kind:'cup',opponent:rival,round:['Quarterfinal','Semifinal','Final'][c.cup.stage]}}
 const round=c.fixtures[c.week];if(!round)return null;const m=round.find(v=>v.includes(c.club));return {kind:'league',opponent:m[0]===c.club?m[1]:m[0],round:c.week+1};}
function add(c,a,b,sa,sb){const x=c.table[a],y=c.table[b];for(const q of [x,y])q.p++;x.gf+=sa;x.ga+=sb;y.gf+=sb;y.ga+=sa;if(sa>sb){x.w++;x.pts+=3;y.l++;}else if(sa<sb){y.w++;y.pts+=3;x.l++;}else{x.d++;y.d++;x.pts++;y.pts++;}}
// Keep new v0.6.2 attributes aligned with player growth. Old careers lacking
// explicit ratings still derive from legacy values at game initialization.
function growAttributes(p,focused=false){
 const keys=(p.role==='GK'?['gkSkill','gkDiving','stamina','strength']:p.role==='DF'?['defence','strength','aggression','stamina']:p.role==='MF'?['passing','crossing','stamina','speedRating','agility','dribbling']:['shootPower','shootAccuracy','heading','speedRating','agility','dribbling']);
 const target=focused?[...keys,'stamina']:keys;
 for(const key of target)if(Number.isFinite(+p[key]))p[key]=Math.min(100,Math.round(+p[key]+1));
}
const strength=(teams,id)=>teams[id]?.rank||60;
function advanceCareer(c,teams,goals,penaltyWinner=null){const fx=currentCareerFixture(c);if(!fx)throw Error('No playable fixture');const [a,b]=goals;const win=a>b||a===b&&penaltyWinner===0;const draw=a===b;
 c.lastResult={kind:fx.kind,week:c.week+1,against:fx.opponent,a,b,win};
 if(fx.kind==='cup'){
  if(win){c.cup.wins++;c.cup.stage++;c.cash+=8500000;c.cup.pending=false;if(c.cup.stage===3)c.cash+=40000000;}
  else{c.cup.eliminated=true;c.cup.pending=false;}c.history.unshift(c.lastResult);return c.lastResult;
 }
 for(const match of c.fixtures[c.week]){if(match.includes(c.club)){const r=match[0]===c.club?[a,b]:[b,a];add(c,match[0],match[1],...r)}else{
 const ra=strength(teams,match[0]),rb=strength(teams,match[1]);const da=Math.max(0,Math.round(1.3+(ra-rb)*.055+(Math.sin(c.week*31+match[0]*9)*1.5))),db=Math.max(0,Math.round(1.3+(rb-ra)*.055+Math.sin(c.week*17+match[1]*13)*1.4));add(c,match[0],match[1],da,db);
 }}
 c.week++;c.cash+=1800000+Math.max(0,a)*2500000+(win?4300000:draw?1700000:500000)-Math.round(c.roster.reduce((total,p)=>total+(p.value||5000000)*.006,0));
 for(const p of c.roster){p.xp=(p.xp||0)+(win?24:12)+c.facilities.training*3;if(p.xp>=100){p.level=(p.level||1)+1;p.xp-=100;p.power=Math.min(99,p.power+1);p.shoot=Math.min(70,p.shoot+1);p.defense=Math.min(70,p.defense+1);p.rating=Math.min(99,(p.rating||70)+1);growAttributes(p);p.value=Math.round((p.value||4000000)*1.04)}}
 if(c.week%3===0){const sponsor=450000*c.facilities.stadium;c.cash+=sponsor;c.sponsors=(c.sponsors||0)+sponsor;}
 for(const p of c.roster){p.condition=Math.max(50,(p.condition??100)-2+(c.facilities.training>2?1:0));if((p.injuryWeeks||0)>0)p.injuryWeeks--;if((p.contractYears||2)<=0)p.contractYears=1;}
 if(c.week===4||c.week===8||c.week===12){if(!c.cup.eliminated&&c.cup.stage<3)c.cup.pending=true}
 if(c.week>=c.fixtures.length){c.leagueFinished=true;const sorted=standings(c);const place=sorted.findIndex(v=>v.id===c.club)+1;c.cash+=[70000000,40000000,25000000,18000000,14000000,9000000,7000000,5000000][place-1]||5000000;c.championship=place===1;}
 c.history.unshift(c.lastResult);return c.lastResult;
}
function standings(c){return c.members.map(id=>({id,...c.table[id]})).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf)}
function nextSeason(c){c.season++;for(const p of c.roster){p.age=(p.age||23)+1;p.contractYears=Math.max(0,(p.contractYears??2)-1);p.condition=100;p.injuryWeeks=0;}c.scouted=[];c.week=0;c.leagueFinished=false;c.fixtures=leagueSchedule(c.members);c.table=Object.fromEntries(c.members.map(i=>[i,{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}]));c.cup={stage:0,eliminated:false,pending:false,wins:0};}
function purchase(c,teams,marketTeam,playerIndex,releaseIndex){const source=teams[marketTeam]?.customRoster?.[playerIndex];if(!source||marketTeam===c.club||releaseIndex<0||releaseIndex>11)throw Error('Select player and your outgoing squad member');const money=source.value||5000000;if(c.cash<money)throw Error('Not enough transfer funds');if(c.roster.some(p=>p.id===source.id))throw Error('Already in your squad');c.cash-=money;const released=c.roster[releaseIndex];c.cash+=Math.floor((released.value||2000000)*.35);const join=deep(source);join.num=released.num;c.roster[releaseIndex]=join;return join;}
function upgradeFacility(c,type){if(!['training','stadium','academy'].includes(type))throw Error('Invalid facility');const cost=c.facilities[type]*12500000;if(c.cash<cost)throw Error('Not enough funds');c.cash-=cost;c.facilities[type]++;return cost;}
function trainPlayer(c,index){const p=c.roster[index];if(!p)throw Error('Player not found');const cost=1500000;if(c.cash<cost)throw Error('Insufficient funds');c.cash-=cost;p.xp=(p.xp||0)+38+c.facilities.training*8;if(p.xp>=100){p.xp-=100;p.level++;p.shoot=Math.min(70,p.shoot+1);p.power=Math.min(99,p.power+1);p.rating=Math.min(99,(p.rating||75)+1);growAttributes(p,true);}return p;}

function scoutAcademy(c){const cost=2500000;if(c.cash<cost)throw Error('Not enough scouting funds');c.cash-=cost;const i=(c.scouted?.length||0),n=seed(c.club,c.season,c.week,i),role=['GK','DF','MF','FW'][n%4],rating=54+Math.min(34,c.facilities.academy*3+(n%17)),id='youth_'+c.club+'_'+c.season+'_'+c.week+'_'+i;
 const p={id,name:FIRST[n%FIRST.length]+' '+LAST[(n>>>5)%LAST.length],role,num:13+i,power:25+Math.round(rating*.38),shoot:Math.round(rating*.25),defense:Math.round(rating*.26),speed:['A','B','C'][n%3],shot:c.roster[n%c.roster.length].shot,shotName:c.roster[n%c.roster.length].shotName,skill:'Scouted academy talent',age:16+n%5,level:1,xp:0,rating,potential:Math.min(99,rating+8+n%13),value:Math.round(rating*rating*2200),fictional:true,source:'procedurally generated academy talent',condition:100,contractYears:3};
 (c.scouted||(c.scouted=[])).push(p);return p;}
function signAcademy(c,scoutIndex,releaseIndex){const p=c.scouted?.[scoutIndex];if(!p)throw Error('No such scouted player');if(!Number.isInteger(releaseIndex)||releaseIndex<0||releaseIndex>=12)throw Error('Select an outgoing player');const fee=Math.ceil(p.value*.55);if(c.cash<fee)throw Error('Cannot afford youth player');c.cash-=fee;p.num=c.roster[releaseIndex].num;c.roster[releaseIndex]=deep(p);c.scouted.splice(scoutIndex,1);return p;}
function renewContract(c,index){const p=c.roster[index];if(!p)throw Error('No player selected');const fee=Math.round((p.value||5000000)*.13)+850000;if(c.cash<fee)throw Error('Not enough budget');c.cash-=fee;p.contractYears=(p.contractYears||0)+2;return fee;}
function recoverPlayer(c,index){const p=c.roster[index];if(!p)throw Error('No player selected');const fee=500000;if(c.cash<fee)throw Error('Not enough budget');c.cash-=fee;p.condition=Math.min(100,(p.condition||100)+25);p.injuryWeeks=Math.max(0,(p.injuryWeeks||0)-1);return p;}
function careerCoverage(c,teams){return {members:c.members.length,realDomesticMatches:c.fixtures.length,region:teams[c.club].continent||'UEFA',country:teams[c.club].flag,scoutCount:c.scouted?.length||0,activeInjuries:c.roster.filter(p=>p.injuryWeeks>0).length,expiring:c.roster.filter(p=>(p.contractYears??2)<=1).length};}

// v0.7.1: after an actual played career fixture, preserve fatigue-driven fitness.
// A low-condition, heavily exhausted athlete has a deterministic small risk of a
// short injury. Academy/bench players recover slightly if they did not play.
function recordMatchFitness(c,report){
 const lookup=new Map(report.map(r=>[r.id,r]));const incidents=[];
 for(const p of c.roster){const r=lookup.get(p.id);if(!r)continue;
  const old=Number.isFinite(+p.condition)?+p.condition:100;
  if(r.seconds>0){p.condition=Math.max(25,Math.min(100,Math.round(r.condition)));}
  else p.condition=Math.min(100,old+2);
  const exposure=r.seconds>5&&(r.fatigue>.68||p.condition<48);
  const injuryRoll=seed(p.id,c.season,c.week,c.history.length)%1000;
  if(exposure&&injuryRoll<Math.min(85,Math.round((r.fatigue*.6+(100-p.condition)/200)*55))){p.injuryWeeks=Math.max(p.injuryWeeks||0,1+injuryRoll%2);incidents.push(p.name);}
 }
 c.lastFitnessReport={players:report.length,injuries:incidents,averageCondition:Math.round(c.roster.reduce((s,p)=>s+(p.condition??100),0)/c.roster.length)};
 return c.lastFitnessReport;
}

return {createCareer,currentCareerFixture,advanceCareer,standings,nextSeason,purchase,upgradeFacility,trainPlayer,scoutAcademy,signAcademy,renewContract,recoverPlayer,careerCoverage,recordMatchFitness};})();

export {CAREER};
