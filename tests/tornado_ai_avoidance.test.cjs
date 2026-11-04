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
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};};
const aiTuning=value=>mechanics.aiLevels[Math.max(0,Math.min(4,Math.trunc(value)))];
const react=method('reactToTornado',{norm,aiTuning});
function setup(side=0){
 const cpu={t:side,x:100,y:0,keeper:false,stun:0,jumpHold:0,src:{speedRating:60},breath:100,morale:55,
  aiTornadoKey:null,aiTornadoReaction:0,aiTornadoEvading:false};
 const game={players:[cpu],tornado:{x:0,y:0,radius:150,life:4.5},cpuLevel:()=>2,playerSpeed:()=>300,
  moveAgile(p,x,y,speed,dt){p.x+=x*speed*dt;p.y+=y*speed*dt;},staminaTick(){}};
 return{game,cpu};
}

test('CPU leaves the live Tornado pull radius after its difficulty reaction in both directions and at all rates',()=>{
 for(const level of mechanics.aiLevels)for(const side of [0,1])for(const hz of [30,60,120]){
  const {game,cpu}=setup(side);let frames=0;
  while(Math.hypot(cpu.x,cpu.y)<158&&frames<hz*4.5){
   const d=Math.hypot(cpu.x,cpu.y)||1;
   if(d<150){cpu.x+=(0-cpu.x)/d*110/hz;cpu.y+=(0-cpu.y)/d*110/hz;}
   game.reactToTornado=react;game.reactToTornado(cpu,1/hz,level.reaction);frames++;
  }
  assert.ok(Math.hypot(cpu.x,cpu.y)>=158,`${level.name}, team ${side}, ${hz}Hz`);
  assert.ok(frames<hz*4.5,'CPU should exit before the existing tornado lifetime expires');
 }
});

test('CPU tornado avoidance ignores keepers, absent hazards, and defenders already outside the pull radius',()=>{
 const missing=setup();missing.game.tornado=null;
 assert.equal(react.call(missing.game,missing.cpu,.02,.09),false);
 const keeper=setup();keeper.cpu.keeper=true;
 assert.equal(react.call(keeper.game,keeper.cpu,.02,.09),false);
 const far=setup();far.cpu.x=159;
 assert.equal(react.call(far.game,far.cpu,.02,.09),false);
});

test('DriveAI dispatches tornado avoidance without changing the four-button input schema',()=>{
 assert.match(engine,/this\.reactToTornado\(p,dt,ai\.reaction\)/);
 assert.match(fs.readFileSync('src/modules/input.js','utf8'),/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
});
