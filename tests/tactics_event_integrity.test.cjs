/** Issue #7: execute the real GameEngine.applyPlan method, not a reimplementation. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=engine.indexOf(' applyPlan(t,raw){'),end=engine.indexOf(' getTeam(t){',start);
assert.ok(start>0&&end>start,'active modular GameEngine.applyPlan');
const slots=Array.from({length:6},(_,i)=>({x:.1+i*.13,y:.08+i*.13}));
const applyPlan=vm.runInNewContext('({'+engine.slice(start,end)+'}).applyPlan',{
 validatePlan:(raw,roster)=>{
  if(raw.lineup.length!==6||new Set(raw.lineup).size!==6)throw Error('bad lineup');
  if(raw.lineup.some(i=>i<0||i>=roster.length)||roster[raw.lineup[0]].role!=='GK')throw Error('bad keeper');
  return {...raw,lineup:[...raw.lineup]};
 },
 substitutionChanges:(a,b)=>({out:a.filter(i=>!b.includes(i)),in:b.filter(i=>!a.includes(i))}),
 FORMATIONS:{'2-1-2':slots,'1-2-2':slots},
 F:{x:100,y:50,w:1900,h:900},initialFatigue:()=>.1,breathCapacity:()=>5,stat:()=>50,
 TEAMS:[{name:'Home'},{name:'Away'}]
});
function make(){
 const roster=Array.from({length:12},(_,i)=>({id:'id'+i,name:'Player'+i,role:i<2?'GK':'DF',injuryWeeks:0}));
 const lineup=[0,2,3,4,5,6];
 const plan={formation:'2-1-2',lineup:[...lineup],captain:4,penalty:4,freeKick:4,corner:4,attack:'Balanced',defence:'Balanced'};
 const players=lineup.map((n,i)=>({t:0,i,src:roster[n],fatigue:.2,breath:1+i*.2,morale:55,stun:0,x:240+i*35,y:270+i*33,
  action:'idle',actionTimer:0,keeper:i===0,cryTimer:0,abilityCd:0,dashCooldown:0,diveCooldown:0,comboCooldown:0,
  contactCooldown:0,trickCd:0,dribbleCooldown:0,trickGuard:0}));
 const events=[],game={rosters:[roster,[]],teamIds:[0,1],lineups:[[...lineup],[]],formation:['2-1-2','2-1-2'],
  teamPlans:[plan,null],matchState:'paused',substitutionsUsed:[0,0],subbedOut:[new Set(),new Set()],
  maxSubstitutions:3,fatigueLedger:[{},{}],moraleLedger:[{},{}],players,
  ball:{owner:null,vx:0,vy:0},controlled:[3,3],
  player(t,i){return this.players.find(x=>x.t===t&&x.i===i)},
  emit(type,data){events.push({type,...data})},toast(){}
 };
 return {game,events,plan};
}
test('attack/defence-only plan change applies tactical styles but does not fake a substitution',()=>{
 const {game,events,plan}=make();
 const next=applyPlan.call(game,0,{...plan,attack:'Direct',defence:'High Press'});
 assert.equal(next.attack,'Direct');
 assert.equal(next.defence,'High Press');
 assert.equal(game.teamPlans[0].attack,'Direct');
 assert.equal(game.teamPlans[0].defence,'High Press');
 assert.equal(game.substitutionsUsed[0],0);
 assert.equal(game.subbedOut[0].size,0);
 assert.deepEqual(game.lineups[0],plan.lineup);
 assert.equal(events.filter(e=>e.type==='substitution').length,0);
 for(const role of ['captain','penalty','freeKick','corner'])assert.equal(game.teamPlans[0][role],plan[role]);
});
test('formation-only or identical plan changes do not report a phantom substitution',()=>{
 const {game,events,plan}=make();
 applyPlan.call(game,0,{...plan,formation:'1-2-2'});
 applyPlan.call(game,0,{...game.teamPlans[0]});
 assert.equal(game.formation[0],'1-2-2');
 assert.equal(game.substitutionsUsed[0],0);
 assert.equal(events.filter(e=>e.type==='substitution').length,0);
});
test('real bench swap produces exactly one positive substitution event with correct quota',()=>{
 const {game,events,plan}=make();
 applyPlan.call(game,0,{...plan,lineup:[0,7,3,4,5,6]});
 const substitutions=events.filter(e=>e.type==='substitution');
 assert.equal(substitutions.length,1);
 assert.equal(substitutions[0].team,0);
 assert.equal(substitutions[0].count,1);
 assert.equal(substitutions[0].used,1);
 assert.equal(substitutions[0].max,3);
 assert.equal(game.substitutionsUsed[0],1);
 assert.equal(game.subbedOut[0].has('id2'),true);
 assert.equal(game.player(0,1).src.id,'id7');
 applyPlan.call(game,0,{...game.teamPlans[0],attack:'Possession'});
 assert.equal(events.filter(e=>e.type==='substitution').length,1);
 assert.equal(game.substitutionsUsed[0],1);
});
test('invalid paused state rejects changes and emits nothing',()=>{
 const {game,events,plan}=make();
 game.matchState='play';
 assert.throws(()=>applyPlan.call(game,0,{...plan,attack:'Direct'}),/paused match/);
 assert.equal(events.length,0);
 assert.equal(game.teamPlans[0].attack,'Balanced');
});

test('reordering existing tactical slots preserves each player Breath and emits no substitution',()=>{
 const {game,events,plan}=make();
 const before=Object.fromEntries(game.players.map(p=>[p.src.id,p.breath]));
 applyPlan.call(game,0,{...plan,lineup:[0,4,3,2,5,6]});
 assert.equal(game.player(0,1).src.id,'id4');
 assert.equal(game.player(0,3).src.id,'id2');
 for(const p of game.players)assert.equal(p.breath,before[p.src.id],p.src.id+' Breath must follow identity');
 assert.equal(game.substitutionsUsed[0],0);
 assert.equal(events.filter(e=>e.type==='substitution').length,0);
});
