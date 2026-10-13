import assert from 'node:assert/strict';
import {GameEngine} from '../src/engine.js';
import {TEAMS,SHOTS,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {MAX_SUBSTITUTIONS,fatigueTick,actionFatigue,initialFatigue,staminaPercent,recommendSubstitute} from '../src/fitness.js';
import {createCareer,recordMatchFitness} from '../src/career.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const input={state:[{},{}],poll(){},just(){return false}};
const create=()=>{const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});return g;};
const g=create();assert.equal(g.maxSubstitutions,3);assert.equal(g.rosters[0].length,12);
let p=g.player(0,3);let f0=p.fatigue;
g.staminaTick(p,10,1);const sprint=p.fatigue-f0;
let rest=g.player(0,4);g.staminaTick(rest,10,0);assert.ok(sprint>rest.fatigue-f0);
assert.ok(fatigueTick(.3,90,5,1)<fatigueTick(.3,30,5,1));
assert.ok(actionFatigue(.2,70,'super')>actionFatigue(.2,70,'pass'));
assert.equal(staminaPercent(1),0);assert.equal(initialFatigue({condition:75}),.15);
assert.ok(g.playerSpeed({...p,fatigue:.8})<g.playerSpeed({...p,fatigue:.1})*.8);
let initialPlan=g.teamPlans[0],firstOut=initialPlan.lineup[1];
let initialOutId=g.rosters[0][firstOut].id;
g.matchState='play';assert.throws(()=>g.applyPlan(0,{...initialPlan,lineup:[...initialPlan.lineup.slice(0,1),7,...initialPlan.lineup.slice(2)],captain:7}),/paused/);
let lineup=g.lineups[0].slice(),available=[...Array(12).keys()].filter(i=>!lineup.includes(i));
const out=[];
g.matchState='paused';
for(let i=0;i<MAX_SUBSTITUTIONS;i++){
 const pos=1+i,next=available[i];out.push(g.rosters[0][lineup[pos]].id);lineup[pos]=next;
 const plan={...g.teamPlans[0],lineup, ...(g.teamPlans[0].captain===g.lineups[0][pos]?{captain:next}:{})};
 // If a designated captain is no longer on the field, assign the new entrant.
 if(!lineup.includes(plan.captain))plan.captain=next;
 g.applyPlan(0,plan);
 assert.equal(g.substitutionsUsed[0],i+1);
}
assert.equal(g.substitutionsUsed[0],3);
assert.ok(out.includes(initialOutId));
let usedPlan=g.teamPlans[0];
const lastLineup=g.lineups[0].slice();const benched=available[3];
let extra=lastLineup.slice();extra[4]=benched;
assert.throws(()=>g.applyPlan(0,{...usedPlan,lineup:extra}),/Only 3 substitutions/);
let comeback=lastLineup.slice();comeback[4]=firstOut;
assert.throws(()=>g.applyPlan(0,{...usedPlan,lineup:comeback}),/Only 3 substitutions/);
assert.deepEqual(g.lineups[0],lastLineup,'rejected substitutions must not alter match');
const noReentry=create();noReentry.matchState='paused';const beforeLineup=noReentry.lineups[0].slice(),outId=beforeLineup[1],newPlayer=noReentry.rosters[0].findIndex((x,i)=>!beforeLineup.includes(i)&&x.role!=='GK');
const afterLineup=beforeLineup.slice();afterLineup[1]=newPlayer;noReentry.applyPlan(0,{...noReentry.teamPlans[0],lineup:afterLineup,captain:newPlayer});
const back=afterLineup.slice();back[1]=outId;assert.throws(()=>noReentry.applyPlan(0,{...noReentry.teamPlans[0],lineup:back,captain:outId}),/cannot return/);
assert.equal(noReentry.substitutionsUsed[0],1,'rejected re-entry must not charge a substitution');
let worn=g.player(0,1);worn.fatigue=.89;g.staminaTick(worn,.01,0);const fatigueBefore=worn.fatigue;
g.resetKickoff(0);assert.ok(Math.abs(g.player(0,1).fatigue-fatigueBefore)<.002,'goals must not restore fitness');
g.player(1,1).fatigue=.81;g.staminaTick(g.player(1,1),.01,0);
const beforeHalf=g.player(1,1).fatigue, tiredId=g.player(1,1).src.id;g.matchState='play';g.clock=g.matchSeconds+.1;g.update(.016);
assert.equal(g.matchState,'paused','half-time must pause');assert.equal(g.half,2);
assert.ok(g.fatigueLedger[1][tiredId]<beforeHalf,'halftime rest must partially recover');
assert.ok(g.fatigueLedger[1][tiredId]>0,'halftime is not a full reset');
// CPU automatic substitution: high-fatigue away runner and fresh same-role bench.
const c=create();c.matchState='paused';let cpu=c.player(1,1);cpu.fatigue=.91;c.fatigueLedger[1][cpu.src.id]=.91;
assert.ok(recommendSubstitute(c.teamPlans[1],c.rosters[1],c.fatigueLedger[1]));
assert.ok(c.autoSubstituteCpu(),'CPU changes a tired player at stoppage');assert.equal(c.substitutionsUsed[1],1);
// Unused bench player has a real persistent condition. A played match affects next match.
const clubs=TEAMS.findIndex(t=>t.group==='club26');let career=createCareer(clubs,TEAMS);career.roster[0].condition=85;
const report=career.roster.map((x,i)=>({id:x.id,fatigue:i===0?.83:0,seconds:i===0?200:0,condition:i===0?70:100}));
const result=recordMatchFitness(career,report);
assert.equal(career.roster[0].condition,70);
assert.ok(result.averageCondition<100);
assert.ok(career.roster.every(x=>x.condition>=25&&x.condition<=100));
// Deterministic injury: no stochastic nondeterminism in test and stable results.
const clone=JSON.parse(JSON.stringify(career));clone.roster[0].condition=85;
const first=recordMatchFitness(clone,report);
assert.deepEqual(first.injuries,result.injuries);
console.log('v0.7.1 FITNESS & SUBSTITUTIONS PASS — distinct action costs, permanent three-sub limit, no re-entry, fatigue ledger, halftime recovery, CPU swap, career fitness');
