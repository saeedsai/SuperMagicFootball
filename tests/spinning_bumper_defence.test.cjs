/** SD09: extracted live modular spinning-bumper ability with counterplay. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const mechanics=JSON.parse(read('data/mechanics/gameplay.json'));
const source=read('src/modules/engine.js');
const a=source.indexOf('\n activateDefence(p){'),b=source.indexOf('\n activateKeeperSuper(',a);
assert.ok(a>0&&b>a,'real modular defence method must be extracted');
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
function setup(side=0){
 const p={t:side,x:1100,y:620,face:side? -1:1,keeper:false,stun:0,invuln:0,cd:0,abilityCd:0,fatigue:0,z:0,src:{id:'p',name:'Bumper',role:'DF',superDefenceLevel:3,superAbility:{type:'defence',id:'spinBumper'},aggression:75,defence:72}};
 const q={t:1-side,x:side?1020:1180,y:620,z:0,keeper:false,stun:0,invuln:0,dashTimer:0,src:{id:'q',name:'Carrier',strength:65,defence:60}};
 const friend={t:side,x:p.x+30,y:p.y,keeper:false,stun:0,invuln:0,src:{id:'f'}};
 const air={t:1-side,x:p.x,y:p.y+40,z:60,keeper:false,stun:0,invuln:0,dashTimer:0,src:{id:'air'}};
 const events=[],effects=[];
 const game={players:[p,q,friend,air],ball:{owner:q,x:q.x,y:q.y},
  spendStamina:(p,k)=>{effects.push(k);p.fatigue+=.12;},
  burst:(...x)=>effects.push(x),
  emit:(type,data)=>events.push({type,...data}),shake:0,activateDefence:activate};
 return {game,p,q,friend,air,events,effects};
}
test('SPIN BUMPER is a bounded rare defensive move with real knockback in both directions',()=>{
 assert.equal(move.radius,116);assert.equal(move.cooldown,11);assert.equal(move.cost,.13);
 for(const side of [0,1]){
  const {game,p,q,friend,air,events,effects}=setup(side),old=q.x;
  assert.equal(game.activateDefence(p),true);
  assert.equal(q.x-old,side?-48:48,'displacement is away from defender on either side');
  assert.ok(q.stun>0&&q.stun<=.72,'stun cannot lock opponent indefinitely');
  assert.equal(q.invuln,1.1);assert.equal(friend.stun,0,'no friendly fire');
  assert.equal(air.stun,0,'jumping opponent counters the pulse');
  assert.equal(game.ball.owner,null);assert.equal(game.ball.x,q.x);
  assert.equal(p.abilityCd,11);assert.ok(p.fatigue>=.12);
  assert.equal(p.action,'defenceSuper');assert.equal(effects[0],'spinBumper');
  assert.equal(events[0].id,'spinBumper');assert.equal(events[0].hits,1);
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
 assert.match(abilities,/a\?\.type==='defence'/);
 assert.equal(Object.keys(mechanics.defensiveAbilities).length,3);
});
