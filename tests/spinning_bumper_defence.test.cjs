/** SD09: extracted live modular spinning-bumper ability with counterplay. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const mechanics=JSON.parse(read('data/mechanics/gameplay.json'));
const source=read('src/modules/engine.js');
const ui=read('src/modules/ui.js');
const a=source.indexOf('\n activateDefence(p){'),b=source.indexOf('\n activateKeeperSuper(',a);
assert.ok(a>0&&b>a,'real modular defence method must be extracted');
const ra=source.indexOf('resolveSpinBumper(p){'),rb=source.indexOf('updateSpinBumper(',ra);
const ua=rb,ub=source.indexOf('reactToSpinBumper(p,dt,reactionSeconds){',ua);
assert.ok(ra>0&&rb>ra&&ub>ua,'spinning bumper resolution methods must be extracted');
const reactStart=source.indexOf('reactToSpinBumper(p,dt,reactionSeconds){'),reactEnd=source.indexOf('activateDefence(p){',reactStart);
assert.ok(reactStart>0&&reactEnd>reactStart,'difficulty response method must be extracted');
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{const n=Math.hypot(x,y)||1;return {x:x/n,y:y/n}};
const move=mechanics.defensiveAbilities.spinBumper;
const activate=vm.runInNewContext('({'+source.slice(a,b)+'})',{
  fieldAbility:src=>src.superAbility?.type==='defence'?mechanics.defensiveAbilities[src.superAbility.id]:null,
  abilityReady:(p,m)=>!!(m&&p.stun<=0&&p.abilityCd<=0&&p.fatigue+m.cost<=.98),
  abilityLevel:p=>p.src.superDefenceLevel,
  levelModifiers:()=>({stun:1}),
  distance,norm,clamp,
  F:mechanics.world.field,
  stat:(p,k)=>p.src?.[k]??55,
  impactStun:()=>.58
}).activateDefence;
const resolve=vm.runInNewContext('({'+source.slice(ra,rb)+'})',{
 fieldAbility:src=>src.superAbility?.type==='defence'?mechanics.defensiveAbilities[src.superAbility.id]:null,
 abilityLevel:p=>p.src.superDefenceLevel,levelModifiers:()=>({stun:1}),distance,norm,clamp,F:mechanics.world.field,
 stat:(p,k)=>p.src?.[k]??55,impactStun:()=>.58
}).resolveSpinBumper;
const update=vm.runInNewContext('({'+source.slice(ua,ub)+'})',{ }).updateSpinBumper;
const react=vm.runInNewContext('({'+source.slice(reactStart,reactEnd)+',})',{distance,fieldAbility:src=>src?.superAbility?.type==='defence'?mechanics.defensiveAbilities[src.superAbility.id]:null}).reactToSpinBumper;
function setup(side=0){
 const p={t:side,x:1100,y:620,face:side? -1:1,keeper:false,stun:0,invuln:0,cd:0,abilityCd:0,fatigue:0,z:0,src:{id:'p',name:'Bumper',role:'DF',superDefenceLevel:3,superAbility:{type:'defence',id:'spinBumper'},aggression:75,defence:72}};
 const q={t:1-side,x:side?1020:1180,y:620,z:0,keeper:false,stun:0,invuln:0,dashTimer:0,src:{id:'q',name:'Carrier',strength:65,defence:60}};
 const friend={t:side,x:p.x+30,y:p.y,keeper:false,stun:0,invuln:0,src:{id:'f'}};
 const air={t:1-side,x:p.x,y:p.y+40,z:60,keeper:false,stun:0,invuln:0,dashTimer:0,src:{id:'air'}};
 const events=[],effects=[];
 const game={players:[p,q,friend,air],ball:{owner:q,x:q.x,y:q.y},
  spendStamina:(p,k)=>{effects.push(k);p.fatigue+=.12;},
  burst:(...x)=>effects.push(x),
  emit:(type,data)=>events.push({type,...data}),shake:0,activateDefence:activate,resolveSpinBumper:resolve,updateSpinBumper:update};
 return {game,p,q,friend,air,events,effects};
}
test('SPIN BUMPER is a bounded rare defensive move with real knockback in both directions',()=>{
 assert.equal(move.radius,116);assert.equal(move.cooldown,11);assert.equal(move.cost,.13);
 for(const side of [0,1]){
  const {game,p,q,friend,air,events,effects}=setup(side),old=q.x;
  assert.equal(game.activateDefence(p),true);
  assert.equal(q.x,old,'the 0.42-second tell gives an opponent a readable escape window');
  assert.equal(events[0].type,'spinBumperTelegraph');assert.equal(events[0].seconds,.42);
  assert.equal(game.updateSpinBumper(p,.42),true);
  assert.equal(q.x-old,side?-48:48,'displacement is away from defender on either side');
  assert.ok(q.stun>0&&q.stun<=.72,'stun cannot lock opponent indefinitely');
  assert.equal(q.invuln,1.1);assert.equal(friend.stun,0,'no friendly fire');
  assert.equal(air.stun,0,'jumping opponent counters the pulse');
  assert.equal(game.ball.owner,null);assert.equal(game.ball.x,q.x);
  assert.equal(p.abilityCd,11);assert.ok(p.fatigue>=.12);
  assert.equal(p.action,'defenceSuper');assert.equal(effects[0],'spinBumper');
  assert.equal(events.find(e=>e.type==='defenceSuper').id,'spinBumper');assert.equal(events.find(e=>e.type==='defenceSuper').hits,1);
  assert.equal(game.activateDefence(p),false,'cooldown prevents spam');
 }
});
test('dash and jump counter without consuming cooldown or fatigue',()=>{
 const {game,p,q,air,events,effects}=setup();
 q.dashTimer=.25;const before=JSON.stringify(game.ball);
 assert.equal(game.activateDefence(p),false,'dashing target escapes');
 assert.equal(p.abilityCd,0);assert.equal(p.fatigue,0);
 assert.equal(JSON.stringify(game.ball),before);
 assert.equal(events.length,0);assert.equal(effects.length,0);
 q.dashTimer=0;q.z=50;
 assert.equal(game.activateDefence(p),false,'both opponents airborne');
 q.z=0;assert.equal(game.activateDefence(p),true);
});
test('the telegraph resolves deterministically at 30, 60 and 120 Hz and is mirrored',()=>{
 for(const fps of [30,60,120])for(const side of [0,1]){
  const {game,p,q,events}=setup(side),before={x:q.x,y:q.y};
  assert.equal(game.activateDefence(p),true);assert.deepEqual({x:q.x,y:q.y},before);
  let frames=0;while(p.spinBumperPending&&frames<100){game.updateSpinBumper(p,1/fps);frames++;}
  assert.equal(frames,Math.ceil(.42*fps-1e-9),`${fps}Hz tell length is frame bounded`);
  assert.equal(events.filter(e=>e.type==='defenceSuper'&&e.id==='spinBumper').length,1);
  assert.equal(q.x-before.x,side?-48:48);assert.equal(q.y,before.y);
 }
});
test('a hit during the warning interrupts the move and never hits its target',()=>{
 const {game,p,q,events}=setup();const old={x:q.x,y:q.y};
 assert.equal(game.activateDefence(p),true);p.stun=.2;
 assert.equal(game.updateSpinBumper(p,1/60),false);assert.equal(p.spinBumperPending,null);
 assert.deepEqual({x:q.x,y:q.y},old);assert.equal(q.stun,0);
 assert.equal(events.filter(e=>e.type==='spinBumperInterrupted').length,1);
 assert.equal(events.filter(e=>e.type==='defenceSuper'&&e.id==='spinBumper').length,0);
});
test('CPU dodge reaction scales fairly across all five existing difficulty profiles',()=>{
 for(const level of mechanics.aiLevels)for(const fps of [30,60,120]){
  const p={t:1,x:1100,y:620,z:0,dashTimer:0,src:{id:'cpu'}},threat={t:0,x:1175,y:620,spinBumperPending:{remaining:.42},src:{id:'bumper',superAbility:{type:'defence',id:'spinBumper'}}};
  let jumps=0,remaining=.42;const game={players:[p,threat],reactToSpinBumper:react,jump(q){jumps++;q.z=48;return true;}};
  while(remaining>1e-9){game.reactToSpinBumper(p,1/fps,level.reaction);remaining=Math.max(0,remaining-1/fps);threat.spinBumperPending.remaining=remaining;}
  const shouldCounter=level.reaction<=.42;
  assert.equal(jumps>0,shouldCounter,`${level.name} at ${fps}Hz uses its configured reaction against the warning`);
  if(shouldCounter)assert.ok(p.z>=20,`${level.name} escapes by jumping`);
 }
});
test('an active low jump is preserved through the telegraph without spending a double-jump counter',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(const level of mechanics.aiLevels){
  const p={t:side,x:1100,y:620,z:12,dashTimer:0,action:'jump',actionTimer:.5,jumpCount:1,
   aiSpinBumperThreat:null,aiSpinBumperReaction:0,src:{id:'cpu'}};
  const threat={t:1-side,x:1175,y:620,spinBumperPending:{remaining:.42},src:{id:'bumper',superAbility:{type:'defence',id:'spinBumper'}}};
  let jumps=0;const game={players:[p,threat],jump(){jumps++;return true;}};
  let remaining=.42;
  while(remaining>1e-9){
   game.reactToSpinBumper=react;game.reactToSpinBumper(p,1/fps,level.reaction);
   assert.equal(jumps,0,`${level.name}, side ${side}, ${fps}Hz must keep the existing jump`);
   p.actionTimer=Math.max(0,p.actionTimer-1/fps);remaining=Math.max(0,remaining-1/fps);
  }
 }
});
test('CPU keepers ignore Spin Bumper telegraphs because the pulse cannot hit keepers',()=>{
 const keeper={t:1,x:1100,y:620,z:0,keeper:true,aiSpinBumperThreat:null,aiSpinBumperReaction:0,src:{id:'keeper'}};
 const threat={t:0,x:1175,y:620,spinBumperPending:{remaining:.3},src:{id:'bumper',superAbility:{type:'defence',id:'spinBumper'}}};
 let jumps=0;const game={players:[keeper,threat],jump(p){jumps++;p.z=48;return true;}};
 keeper.aiSpinBumperThreat=threat;keeper.aiSpinBumperReaction=.1;
 assert.equal(react.call(game,keeper,.2,0),false);
 assert.equal(jumps,0,'keeper must not perform an ineffective counter');
 assert.equal(keeper.aiSpinBumperThreat,null,'stale threat state is cleared');
 assert.equal(keeper.aiSpinBumperReaction,0,'stale reaction timer is cleared');
 const defender={...keeper,keeper:false,aiSpinBumperThreat:null,aiSpinBumperReaction:0};
 assert.equal(react.call(game,defender,.01,0),true,'eligible field defender retains the normal jump counter');
 assert.equal(jumps,1,'eligible defender still uses the standard jump counter');
});
test('non-defenders, insufficient tier and exhausted defenders cannot spin',()=>{
 const {game,p}=setup();
 p.src.role='MF';assert.equal(game.activateDefence(p),false);
 p.src.role='DF';p.src.superDefenceLevel=2;assert.equal(game.activateDefence(p),false);
 p.src.superDefenceLevel=3;p.fatigue=.89;assert.equal(game.activateDefence(p),false);
 p.fatigue=0;p.src.superAbility=null;assert.equal(game.activateDefence(p),false);
});
test('new ability is a configuration extension, not a fifth action key or roster change',()=>{
 const fitness=read('src/modules/fitness.js'),engine=read('src/modules/engine.js'),abilities=read('src/modules/abilities.js');
 assert.match(fitness,/spinBumper:\.125/);
 assert.match(engine,/kind==='spinBumper'\)\?'defence'/);
 assert.match(engine,/move\.id==='spinBumper'/);
 assert.match(engine,/spinBumperTelegraph/);
 assert.match(ui,/jump or dash out before it resolves/i);
 const render=read('src/modules/render.js');
 assert.match(render,/p\.spinBumperPending/);assert.match(render,/const spin=reduced\?0:progress\*PI\*2/);
 assert.match(abilities,/a\?\.type==='defence'/);
 assert.ok(mechanics.defensiveAbilities.spinBumper,'SD09 remains in the expanded defence catalogue');
});
