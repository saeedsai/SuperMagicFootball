'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8');
function method(name,globals={}){
	const a=engine.indexOf(`\n ${name}(`),tail=a<0?-1:engine.slice(a+1).search(/\n [A-Za-z_$][\w$]*\(/);
	assert.ok(a>=0&&tail>=0,`extract ${name}`);
	const b=a+1+tail;
	return vm.runInNewContext('({'+engine.slice(a,b)+'})',globals)[name];
}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const react=method('reactToSupernova',{distance});
function setup(side=0,patch={}){
 const cpu={t:side,x:1100,y:620,keeper:false,z:0,stun:0,action:'run',actionTimer:0,
  aiSupernovaKey:null,aiSupernovaReaction:0,src:{id:'cpu',jumping:70},...patch};
 const game={players:[cpu],supernova:{team:1-side,x:1100,y:620,radius:142,remaining:.85},
  jump(p){p.z=1.55;p.vz=420;p.action='jump';p.actionTimer=.5;return true;}};
 return{game,cpu};
}

test('CPU reacts to an in-range Supernova within its remaining warning using difficulty timing',()=>{
 for(const level of mechanics.aiLevels)for(const side of [0,1])for(const hz of [30,60,120]){
  const {game,cpu}=setup(side);let remaining=.85,frames=0,jumped=false;
  while(remaining>1e-9&&frames<hz*2){
   remaining=Math.max(0,remaining-1/hz);game.supernova={...game.supernova,remaining};
   game.reactToSupernova=react;game.reactToSupernova(cpu,1/hz,level.reaction);
   frames++;
   if(cpu.action==='jump'){jumped=true;break;}
  }
  const expected=level.reaction<=.53;
  assert.equal(jumped,expected,`${level.name}, team ${side}, ${hz}Hz`);
  if(jumped)assert.ok(remaining>.12,`${level.name} must begin with enough warning left to reach z>=20`);
 }
});

test('CPU Supernova response ignores allies, keepers, out-of-radius and already-countered states',()=>{
 const ally=setup(0);ally.game.supernova.team=0;
 assert.equal(react.call(ally.game,ally.cpu,.02,.09),false);
 const far=setup();far.cpu.x+=143;
 assert.equal(react.call(far.game,far.cpu,.02,.09),false);
 for(const patch of [{keeper:true},{z:20},{action:'slide',actionTimer:.2}]){
  const state=setup(0,patch);
  assert.equal(react.call(state.game,state.cpu,.02,.09),false,JSON.stringify(patch));
 }
});

test('Supernova response does not jump after its warning expires and retains the four-button contract',()=>{
 const expired=setup();expired.game.supernova.remaining=0;
 assert.equal(react.call(expired.game,expired.cpu,.02,.09),false);
 assert.equal(expired.cpu.action,'run');
 assert.match(engine,/this\.reactToSupernova\(p,dt,ai\.reaction\)/);
 assert.match(fs.readFileSync('src/modules/input.js','utf8'),/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
});
