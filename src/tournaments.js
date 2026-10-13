// Independent data-first continental campaign engine (offline). Formats are arcade approximations.
// One leg knockout ties; UEFA/AFC use eight scheduled round-robin opponents, not official fixtures.
import {CONTINENTS} from './continental.js';
const zero=()=>({p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
const hash=(...values)=>values.join(':').split('').reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261)>>>0;
const pairRounds=(ids,legs=1)=>{let a=ids.slice(),pairs=[];if(a.length%2)a.push(null);for(let k=0;k<a.length-1;k++){const round=[];for(let i=0;i<a.length/2;i++)if(a[i]!=null&&a[a.length-1-i]!=null)round.push([a[i],a[a.length-1-i]]);pairs.push(round);a=[a[0],a[a.length-1],...a.slice(1,-1)]}return legs===2?[...pairs,...pairs.map(round=>round.map(([a,b])=>[b,a]))]:pairs};
const bounded=(v,a,b)=>Math.min(b,Math.max(a,v));
const compare=(a,b)=>b.pts-a.pts||((b.gf-b.ga)-(a.gf-a.ga))||b.gf-a.gf||b.w-a.w;
const shuffleDeterministic=(ids,seed)=>ids.slice().sort((a,b)=>hash(seed,a)-hash(seed,b));
const strength=(teams,id)=>teams[id]?.rank||70;
function simulate(teams,home,away,seed){const diff=(strength(teams,home)-strength(teams,away))*.028;const r=hash(seed,home,away),x=hash('x',seed,away,home);return [bounded(Math.round(1.2+diff+(r%500)/290),0,6),bounded(Math.round(1.1-diff+(x%400)/300),0,6)]}
function addStat(t,a,b,x,y){const s=t.table[a],o=t.table[b];for(let p of [s,o])p.p++;s.gf+=x;s.ga+=y;o.gf+=y;o.ga+=x;if(x>y){s.w++;s.pts+=3;o.l++}else if(y>x){o.w++;o.pts+=3;s.l++}else{s.d++;s.pts++;o.d++;o.pts++}}
function pairElimination(ids,seed,byeCount=0){const sorted=ids.slice();const byes=byeCount?sorted.splice(0,byeCount):[];const matches=[];for(let i=0;i<sorted.length;i+=2){if(sorted[i+1]==null)byes.push(sorted[i]);else matches.push([sorted[i],sorted[i+1]])}return {matches,byes};}
function stageLabel(n){return n===2?'FINAL':n===4?'SEMI-FINAL':n===8?'QUARTER-FINAL':n===16?'ROUND OF 16':n===24?'PLAYOFF':'FIRST ROUND'}
function startKnockout(t,ids,byes=[]){t.phase='knockout';t.roundIdx=0;t.knockout={matches:pairElimination(ids,t.seed).matches,byes,stage:stageLabel(ids.length+byes.length),remaining:ids.length+byes.length};if(ids.length%2)t.knockout.byes.push(ids[ids.length-1]);}
export function createTournament(compId,club,teams,continentalMapping){const comp=CONTINENTS.find(c=>c.id===compId);if(!comp)throw Error('Unknown confederation');const ids=continentalMapping[compId];if(!ids.includes(club))throw Error('Selected club is not a participant in this competition');
 const t={id:'cup_'+compId,compId,club,season:comp.season,seed:hash(compId,club),format:comp.format,phase:'league',roundIdx:0,rounds:[],groups:[],table:Object.fromEntries(ids.map(i=>[i,zero()])),history:[],earned:0,winner:null,participants:ids.slice(),knockout:null};
 if(comp.format==='knockout'){const ordered=ids.slice().sort((a,b)=>strength(teams,b)-strength(teams,a));const five=ordered.slice(0,5),others=ordered.slice(5);t.phase='knockout';t.knockout={matches:pairElimination(others,t.seed).matches,byes:five,stage:'FIRST ROUND',remaining:ids.length};return t}
 if(comp.format==='league'){t.groups=[ids.slice()];t.rounds=pairRounds(ids).slice(0,8)}
 else if(comp.format==='regional-league'){t.groups=[ids.slice(0,16),ids.slice(16,32)];const west=pairRounds(t.groups[0]),east=pairRounds(t.groups[1]);t.rounds=Array.from({length:8},(_,i)=>[...west[i],...east[i]])}
 else{const gsize=4,numGroups=ids.length/gsize,tgroups=Array.from({length:numGroups},()=>[]);ids.forEach((id,i)=>tgroups[i%numGroups].push(id));t.groups=tgroups;const legs=comp.format==='short-groups'?1:2;const each=tgroups.map(g=>pairRounds(g,legs));t.rounds=Array.from({length:each[0].length},(_,i)=>each.flatMap(x=>x[i]))}
 return t;
}
export function tournamentStandings(t,groupIndex=null){const ids=groupIndex===null?t.participants:t.groups[groupIndex];return ids.map(id=>({id,...t.table[id]})).sort(compare)}
export function tournamentCurrent(t){if(!t||t.phase==='finished')return null;
 if(t.phase==='league'){const pair=t.rounds[t.roundIdx]?.find(p=>p.includes(t.club));if(!pair)return null;return {kind:'league',opponent:pair[0]===t.club?pair[1]:pair[0],home:pair[0]===t.club,round:t.roundIdx+1,legTotal:t.rounds.length,stage:t.format==='groups'||t.format==='short-groups'?'GROUP STAGE':'LEAGUE STAGE',bye:false}}
 const pair=t.knockout.matches.find(p=>p.includes(t.club));if(!pair)return {kind:'knockout',opponent:null,bye:true,stage:t.knockout.stage,round:t.roundIdx+1};return {kind:'knockout',opponent:pair[0]===t.club?pair[1]:pair[0],home:pair[0]===t.club,bye:false,stage:t.knockout.stage,round:t.roundIdx+1};
}
function groupQualify(t){
 if(t.format==='league'){const top=tournamentStandings(t);t.knockout={matches:[],byes:top.slice(0,8).map(x=>x.id),stage:'KNOCKOUT PLAYOFF',remaining:24};let pool=top.slice(8,24).map(x=>x.id);t.knockout.matches=pool.slice(0,8).map((id,i)=>[id,pool[15-i]]);t.phase=top.slice(0,24).some(x=>x.id===t.club)?'knockout':'finished';t.roundIdx=0;t.history.unshift({kind:'qualification',teams:top.slice(0,24).map(x=>x.id)});return}
 if(t.format==='regional-league'){const qualifiers=t.groups.map(g=>g.map(id=>({id,...t.table[id]})).sort(compare).slice(0,8).map(x=>x.id));let pairs=[];for(const q of qualifiers)for(let i=0;i<4;i++)pairs.push([q[i],q[7-i]]);t.phase=qualifiers.some(q=>q.includes(t.club))?'knockout':'finished';t.roundIdx=0;t.knockout={matches:pairs,byes:[],stage:'ROUND OF 16',remaining:16};return}
 const n=t.format==='short-groups'?2:2;const qual=t.groups.flatMap(g=>g.map(id=>({id,...t.table[id]})).sort(compare).slice(0,n).map(x=>x.id));
 const groupCount=t.groups.length,first=[],second=[];for(let k=0;k<groupCount;k++){first.push(qual[k*2]);second.push(qual[k*2+1]);}const pairs=first.map((id,i)=>[id,second[(i+1)%groupCount]]);t.phase=qual.includes(t.club)?'knockout':'finished';t.roundIdx=0;t.knockout={matches:pairs,byes:[],stage:stageLabel(qual.length),remaining:qual.length};
}
export function tournamentAdvance(t,teams,score=null,penaltyWinner=null){if(!t||t.phase==='finished')throw Error('The continental campaign has finished.');const fx=tournamentCurrent(t);if(!fx)throw Error('No fixture');if(!fx.bye&&(!Array.isArray(score)||score.length!==2||score.some(v=>!Number.isInteger(v)||v<0||v>30)))throw Error('A valid score is required');let playerResult=null;
 if(t.phase==='league'){
 const pairs=t.rounds[t.roundIdx];for(const [a,b] of pairs){const mine=a===t.club||b===t.club;const [x,y]=mine?(a===t.club?score:[score[1],score[0]]):simulate(teams,a,b,t.seed+t.roundIdx*101);addStat(t,a,b,x,y);if(mine)playerResult={a,b,scoreA:x,scoreB:y,kind:'league',round:t.roundIdx+1};}
 t.roundIdx++;if(t.roundIdx>=t.rounds.length)groupQualify(t);
 }else{
 const previous=t.knockout;let victors=previous.byes.slice();for(const [a,b] of previous.matches){const mine=a===t.club||b===t.club;const [x,y]=mine?(a===t.club?score:[score[1],score[0]]):simulate(teams,a,b,t.seed+t.roundIdx*797);let winner;if(x!==y)winner=x>y?a:b;else if(mine&&penaltyWinner!==null)winner=penaltyWinner===0?t.club:(a===t.club?b:a);else winner=hash(t.seed,a,b,t.roundIdx)%2?a:b;victors.push(winner);if(mine)playerResult={a,b,scoreA:x,scoreB:y,winner,kind:'knockout',stage:previous.stage}}
 if(fx.bye)playerResult={kind:'bye',stage:previous.stage,winner:t.club};t.roundIdx++;
 if(!victors.includes(t.club)){t.phase='finished';t.winner=null;t.knockout={...previous,stage:'ELIMINATED',matches:[],byes:[]};}
 else if(victors.length===1){t.phase='finished';t.winner=victors[0];t.knockout={...previous,stage:'CHAMPION',matches:[],byes:[]};}
 else{let matches=[];for(let i=0;i<victors.length;i+=2)if(victors[i+1]!=null)matches.push([victors[i],victors[i+1]]);t.knockout={matches,byes:victors.length%2?[victors[victors.length-1]]:[],stage:stageLabel(victors.length),remaining:victors.length};}
 }
 t.earned+=playerResult?.kind==='bye'?0:(playerResult?.winner===t.club?5000000:playerResult?.kind==='league'?2500000:1000000);
 t.history.unshift(playerResult);if(t.history.length>90)t.history.length=90;return playerResult;
}
export function tournamentProgress(t){if(t.phase==='finished')return t.winner===t.club?'CHAMPIONS':'TOURNAMENT ENDED';if(t.phase==='league')return `${t.format==='groups'||t.format==='short-groups'?'Group':'League'} matchday ${t.roundIdx+1}/${t.rounds.length}`;return t.knockout.stage;}
export function validateTournament(t,teams){return !!t&&Array.isArray(t.participants)&&t.participants.length>0&&t.participants.every(id=>teams[id])&&t.participants.includes(t.club)&&['league','knockout','finished'].includes(t.phase)}
