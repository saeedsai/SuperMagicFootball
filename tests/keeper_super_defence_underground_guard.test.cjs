'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

test('standalone and modular ability sources both exclude underground balls from keeper reach',()=>{
 for(const file of ['src/abilities.js','src/modules/abilities.js']){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  assert.match(source,/!ball\.shot\?\.underground/,file);
 }
});

test('manual goalkeeper Super Defence cannot intercept an underground transformed shot',async()=>{
 const {GameEngine}=await import('../src/engine.js');
 const {DEFAULT_OPTIONS}=await import('../src/data.js');
 for(const behavior of ['silverCarp','dolphin','wave'])for(const team of [0,1]){
  const options={...DEFAULT_OPTIONS,weather:'Clear'},game=new GameEngine(options);
  game.init({home:0,away:9,humans:1,options});
  const keeper=game.player(team,0);
  keeper.src={...keeper.src,gkSuperAbility:{type:'defence',id:'megaPalm',level:1},gkSuperLevel:1};
  Object.assign(keeper,{stun:0,fatigue:0,abilityCd:0});
  Object.assign(game.ball,{owner:null,attacker:1-team,x:keeper.x+(team===0?50:-50),y:keeper.y,z:0,
   vx:team===0?-500:500,vy:0,vz:0,age:.5,shot:{id:behavior,behavior,underground:true},
   strike:{kind:'super'},canCollect:0});
  const ballBefore={...game.ball},cooldownBefore=keeper.abilityCd,fatigueBefore=keeper.fatigue;
  assert.equal(game.requestKeeperSuper(team),false,`${behavior}, team ${team}: submerged shot is not in keeper reach`);
  assert.deepEqual({...game.ball},ballBefore,`${behavior}, team ${team}: rejected input leaves shot unchanged`);
  assert.equal(keeper.abilityCd,cooldownBefore);assert.equal(keeper.fatigue,fatigueBefore);
  assert.equal(game.events.some(event=>event.type==='keeperSuper'),false);
 }
});
