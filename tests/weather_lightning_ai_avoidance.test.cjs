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
const react=method('reactToWeatherLightning',{norm,aiTuning:value=>mechanics.aiLevels[Math.max(0,Math.min(4,Math.trunc(value)))]});
function setup(side=0){
 const cpu={t:side,x:105,y:0,keeper:false,stun:0,jumpHold:0,src:{speedRating:60},breath:100,morale:55,
  aiWeatherKey:null,aiWeatherReaction:0,aiWeatherEvading:false};
 const game={weatherLightning:{phase:'warning',x:0,y:0,radius:110,remaining:.55},options:{gameSpeed:1},cpuLevel:()=>2,
  playerSpeed:()=>300,moveAgile(p,x,y,speed,dt){p.x+=x*speed*dt;p.y+=y*speed*dt;},staminaTick(){}};
 return{game,cpu};
}
function simulate(side,hz,level){
 const {game,cpu}=setup(side);let remaining=.55,frames=0;
 while(remaining>1e-9&&frames<hz){
  remaining=Math.max(0,remaining-1/hz);game.weatherLightning={...game.weatherLightning,remaining};
  game.reactToWeatherLightning=react;game.reactToWeatherLightning(cpu,1/hz,level.reaction);frames++;
  if(Math.hypot(cpu.x,cpu.y)>=118)break;
 }
 return{cpu,remaining,frames,distance:Math.hypot(cpu.x,cpu.y)};
}

test('CPU uses existing difficulty timing to escape a nearby Storm strike in both directions and rates',()=>{
 for(const level of mechanics.aiLevels)for(const side of [0,1])for(const hz of [30,60,120]){
  const result=simulate(side,hz,level),expected=level.reaction<=.32;
  assert.equal(result.distance>=118,expected,`${level.name}, team ${side}, ${hz}Hz`);
  if(expected)assert.ok(result.remaining>.12,'CPU exits before the unsafe final warning window');
 }
});

test('CPU does not evade allies, keepers, distant players, expired cues, or a stale strike phase',()=>{
 const ally=setup();ally.game.weatherLightning=null;
 assert.equal(react.call(ally.game,ally.cpu,.02,.09),false);
 const expired=setup();expired.game.weatherLightning.remaining=0;
 assert.equal(react.call(expired.game,expired.cpu,.02,.09),false);
 const strike=setup();strike.game.weatherLightning.phase='strike';
 assert.equal(react.call(strike.game,strike.cpu,.02,.09),false);
 const keeper=setup();keeper.cpu.keeper=true;
 assert.equal(react.call(keeper.game,keeper.cpu,.02,.09),false);
 const far=setup();far.cpu.x=119;
 assert.equal(react.call(far.game,far.cpu,.02,.09),false);
});

test('DriveAI dispatches the response without changing the four-button input schema',()=>{
 assert.match(engine,/this\.reactToWeatherLightning\(p,dt,ai\.reaction\)/);
 assert.match(fs.readFileSync('src/modules/input.js','utf8'),/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
});
