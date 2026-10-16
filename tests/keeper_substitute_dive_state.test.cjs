const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const from=source.indexOf(' applyPlan(t,raw){');
const to=source.indexOf(' getTeam(t){',from);
assert(from>=0&&to>from,'active engine applyPlan method is available');
const positions=Array.from({length:6},(_,i)=>({x:.12+i*.13,y:.1+i*.15}));
const applyPlan=vm.runInNewContext('({'+source.slice(from,to)+'}).applyPlan',{
 validatePlan:(plan)=>plan,
 substitutionChanges:(before,after)=>({
  out:before.filter(i=>!after.includes(i)),
  in:after.filter(i=>!before.includes(i))
 }),
 FORMATIONS:{'2-1-2':positions,'1-2-2':positions},
 F:{x:100,y:50,w:1900,h:900},
 initialFatigue:()=>.1,
 TEAMS:[{name:'Home'},{name:'Away'}]
});

function fixture(){
 const roster=Array.from({length:7},(_,i)=>({
  id:'p'+i,name:'Player '+i,role:i===0||i===6?'GK':'MF',
  injuryWeeks:0
 }));
 const old=roster.slice(0,6);
 const players=old.map((src,i)=>({
  t:0,i,src,x:200+i*30,y:300+i*20,fatigue:.2,morale:55,stun:0,
  cryTimer:0,abilityCd:0,dashCooldown:0,diveCooldown:0,
  comboCooldown:0,contactCooldown:0,trickCd:0,dribbleCooldown:0,
  trickGuard:0,action:i===0?'keeperDive':'run',actionTimer:.45,
  keeper:i===0,keeperHold:i===0?.3:0,diveDy:1,diveDx:.5,diveElapsed:.25,
  diveIntentCooldown:.86,diveIntentPending:true,diveAdvanceTravel:19,
  z:14,vz:30
 }));
 const events=[];
 const game={rosters:[roster,[]],lineups:[[0,1,2,3,4,5],[]],
  formation:['2-1-2','2-1-2'],teamIds:[0,1],teamPlans:[],matchState:'paused',
  substitutionsUsed:[0,0],subbedOut:[new Set(),new Set()],
  maxSubstitutions:3,fatigueLedger:[{},{}],moraleLedger:[{},{}],
  players,ball:{owner:players[0],vx:10,vy:5},controlled:[3,3],
  player(t,i){return this.players.find(p=>p.t===t&&p.i===i);},
  emit(type,data){events.push({type,data});},toast(){}
 };
 return {game,events,players};
}
test('new goalkeeper does not inherit a replaced keeper dive or freeze movement',()=>{
 const {game,players,events}=fixture();
 const plan={lineup:[6,1,2,3,4,5],formation:'2-1-2'};
 assert.equal(applyPlan.call(game,0,plan),plan);
 const entering=players[0];
 assert.equal(entering.src.id,'p6');
 assert.equal(entering.keeper,true);
 for(const key of ['diveIntentPending'])assert.equal(entering[key],false,key);
 for(const key of ['diveIntentCooldown','diveAdvanceTravel','diveDy','diveDx','diveElapsed','actionTimer','z','vz'])
  assert.equal(entering[key],0,key);
 assert.equal(entering.action,'idle');
 assert.equal(game.ball.owner,null);
 assert.equal(game.ball.canCollect,.3);
 assert.equal(game.substitutionsUsed[0],1);
 assert.equal(game.subbedOut[0].has('p0'),true);
 assert.equal(events.filter(e=>e.type==='substitution').length,1);
});
test('unchanged lineup/formation update preserves an active keeper state',()=>{
 const {game,players}=fixture();
 game.ball.owner=null;
 const keeper=players[0];
 applyPlan.call(game,0,{lineup:[0,1,2,3,4,5],formation:'1-2-2'});
 assert.equal(keeper.src.id,'p0');
 assert.equal(keeper.diveIntentPending,true);
 assert.equal(keeper.diveAdvanceTravel,19);
 assert.equal(keeper.action,'keeperDive');
 assert.equal(game.substitutionsUsed[0],0);
});
test('replacement also clears completed dive/catch recovery presentation',()=>{
 for(const action of ['keeperDiveCatch','keeperRecover']){
  const {game,players}=fixture();
  players[0].action=action;
  game.ball.owner=null;
  applyPlan.call(game,0,{lineup:[6,1,2,3,4,5],formation:'2-1-2'});
  assert.equal(players[0].action,'idle',action);
  assert.equal(players[0].diveIntentPending,false,action);
  assert.equal(players[0].actionTimer,0,action);
 }
});
