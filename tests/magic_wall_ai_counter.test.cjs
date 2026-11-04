'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');

function inertInput(){return{state:[{},{}],pulse:{},poll(){},just(){return false;},held(){return false;},axis(){return{x:0,y:0};},reset(){}};}
async function runtime(){
 const oldFetch=globalThis.fetch;
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(new URL(url),'utf8'))});
 try{const {loadAssets}=await import('../src/assets.js');await loadAssets();
  const [{ENGINE},{DATA}]=await Promise.all([import('../src/modules/engine.js'),import('../src/modules/data.js')]);
  return{ENGINE,DATA,restore(){if(oldFetch===undefined)delete globalThis.fetch;else globalThis.fetch=oldFetch;}};
 }catch(error){if(oldFetch===undefined)delete globalThis.fetch;else globalThis.fetch=oldFetch;throw error;}
}
function prepare(game){
 game.init({home:0,away:9,options:{...game.options,weather:'Clear'}});game.matchState='play';game.humans=0;game.cooldown=0;game.clock=5;
 for(const p of game.players){p.dx=p.dy=p.moveVX=p.moveVY=0;p.aiTarget=null;p.aiTimer=2;p.stun=0;p.z=0;}
}

test('AI field runner clears an opposing legal wall with the existing grounded slide',async()=>{
 const {ENGINE,DATA,restore}=await runtime();
 try{
  const game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},inertInput());prepare(game);
  const caster=game.player(0,1),carrier=game.player(1,3),runner=game.player(1,5);
  Object.assign(caster,{x:1888,y:765,face:1,cd:0,abilityCd:0,fatigue:0,breath:100});
  caster.src={...caster.src,role:'DF',superAbility:{type:'defence',id:'magicWall',level:1},superDefenceLevel:1};
  Object.assign(carrier,{x:2100,y:765,dx:0,dy:0,moveVX:0,moveVY:0,aiTarget:null,aiTimer:2});
  Object.assign(runner,{x:2040,y:765,face:-1,dx:-1,dy:0,moveVX:0,moveVY:0,aiTarget:null,aiTimer:0,cd:0,stun:0,fatigue:0,breath:100});
  for(const p of game.players)if(![caster,carrier,runner].includes(p)){p.x=p.t===0?350:2200;p.y=350;p.dx=p.dy=p.moveVX=p.moveVY=0;}
  game.take(carrier);game.controlled=[3,3];
  assert.equal(game.activateDefence(caster),true,'a tier-one DF can deploy the baseline wall');
  assert.equal(game.magicWalls[0].level,1);
  for(let frame=0;frame<24&&game.magicWalls.length;frame++)game.update(1/60);
  assert.equal(game.magicWalls.length,0,'the opposing AI runner should counter the wall before expiry');
  assert.ok(game.events.some(event=>event.type==='magicWallCounter'&&event.player===runner.src.name&&event.counter==='slide'));
  assert.equal(runner.action,'slide');
  assert.ok(runner.fatigue>0,'the counter uses the normal slide Energy cost');
  assert.ok(runner.breath<100,'the counter uses the normal slide Breath cost');
 }finally{restore();}
});

test('wall deployment enforces the same DF role and minimum defence tier as Player Studio',async()=>{
 const {ENGINE,DATA,restore}=await runtime();
 try{
  const minimum={magicWall:1,fireWall:2,iceWall:3,demonWall:4};
  for(const [id,tier] of Object.entries(minimum)){
   const game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},inertInput());prepare(game);
   const defender=game.player(0,1);Object.assign(defender,{cd:0,abilityCd:0,fatigue:0,breath:100,x:1200,y:765,face:1});
   defender.src={...defender.src,role:'DF',superAbility:{type:'defence',id,level:tier},superDefenceLevel:tier};
   assert.equal(game.activateDefence(defender),true,`${id} accepts its minimum tier`);
   assert.equal(game.magicWalls[0].level,tier);
   if(tier>1){defender.abilityCd=0;game.magicWalls=[];defender.src={...defender.src,superAbility:{type:'defence',id,level:tier-1},superDefenceLevel:tier-1};
    const fatigue=defender.fatigue;
    assert.equal(game.activateDefence(defender),false,`${id} rejects an under-tier legacy/runtime assignment`);
    assert.equal(game.magicWalls.length,0);assert.equal(defender.fatigue,fatigue);assert.equal(defender.abilityCd,0);}
   defender.src={...defender.src,role:'GK',superAbility:{type:'defence',id,level:tier},superDefenceLevel:tier};
   assert.equal(game.activateDefence(defender),false,`${id} remains field-DF-only`);
  }
 }finally{restore();}
});

test('wall AI refuses ineffective counters for keepers, airborne players, out-of-range runners, and exhausted stamina',async()=>{
 const {ENGINE,DATA,restore}=await runtime();
 try{
  const game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},inertInput());prepare(game);
  const caster=game.player(0,1),runner=game.player(1,5);caster.src={...caster.src,role:'DF',superAbility:{type:'defence',id:'iceWall',level:3},superDefenceLevel:3};
  Object.assign(caster,{x:1888,y:765,face:1,cd:0,abilityCd:0,fatigue:0});assert.equal(game.activateDefence(caster),true);
  Object.assign(runner,{x:2040,y:765,face:-1,dx:-1,cd:0,stun:0,z:0,fatigue:0,breath:100});
  const cases=[{keeper:true},{z:25},{x:2200},{breath:1},{fatigue:.99}];
  for(const patch of cases){Object.assign(runner,{x:2040,y:765,keeper:false,z:0,breath:100,fatigue:0},patch);runner.cd=0;
   assert.equal(game.reactToMagicWall(runner),false,JSON.stringify(patch));assert.notEqual(runner.action,'slide',JSON.stringify(patch));}
  runner.src={...runner.src,role:'GK'};
  assert.equal(game.reactToMagicWall(runner),false,'goalkeepers do not initiate the field slide counter');
  runner.src={...runner.src,role:'FW'};
  Object.assign(runner,{role:'FW',keeper:false,x:2040,y:765,z:0,breath:100,fatigue:0,cd:0});
  const closeOpponent=game.player(0,2);Object.assign(closeOpponent,{x:2042,y:765,stun:0,keeper:false});
  assert.equal(game.reactToMagicWall(runner),false,'an immediate player threat remains with normal AI tackle logic');
  assert.notEqual(runner.action,'slide');
 }finally{restore();}
});
