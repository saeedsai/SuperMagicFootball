'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const source=fs.readFileSync('src/modules/dribbles.js','utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/export \{DRIBBLES\};?/,'');
const DRIBBLES=vm.runInNewContext(source+'\nDRIBBLES;',{GAME_ASSETS:{mechanics}});
const attacker={x:100,y:0,dribbling:90,agility:80,fatigue:0};
const defender={x:40,y:0,vx:5,vy:0,face:1,defence:70,aggression:70,agility:98,fatigue:0};
const nutmeg=DRIBBLES.dribbleStyle('nutmeg');
test('facing the ball carrier increases active nutmeg anticipation',()=>{
 const toward=DRIBBLES.dribbleOdds(attacker,defender,nutmeg);
 const away=DRIBBLES.dribbleOdds(attacker,{...defender,face:-1},nutmeg);
 assert.ok(toward<away,'facing defender should counter better');
 assert.ok(away>0&&away<1);
});
test('missing or neutral facing preserves legacy spatial nutmeg counter',()=>{
 const toward=DRIBBLES.dribbleOdds(attacker,defender,nutmeg);
 for(const face of [undefined,0])assert.equal(DRIBBLES.dribbleOdds(attacker,{...defender,face},nutmeg),toward);
});
test('stationary, retreating and exhausted defenders gain no facing-specific counter',()=>{
 for(const patch of [{vx:0},{vx:-5},{fatigue:1}]){
  const facing=DRIBBLES.dribbleOdds(attacker,{...defender,...patch,face:1},nutmeg);
  const turned=DRIBBLES.dribbleOdds(attacker,{...defender,...patch,face:-1},nutmeg);
  assert.equal(facing,turned,JSON.stringify(patch));
 }
});
test('other dribble styles and stat-only callers are unchanged by facing',()=>{
 const rainbow=DRIBBLES.dribbleStyle('rainbow');
 const ordinary=DRIBBLES.dribbleStyle('roulette');
 assert.equal(DRIBBLES.dribbleOdds(attacker,defender,ordinary),DRIBBLES.dribbleOdds(attacker,{...defender,face:-1},ordinary));
 const stat={dribbling:90,agility:80,fatigue:0};
 const rival={defence:70,aggression:70,agility:98,fatigue:0};
 assert.equal(DRIBBLES.dribbleOdds(stat,{...rival,face:1},nutmeg),DRIBBLES.dribbleOdds(stat,{...rival,face:-1},nutmeg));
 assert.ok(Number.isFinite(DRIBBLES.dribbleOdds(attacker,defender,rainbow)));
});
test('counter uses existing four controls and does not modify player or saves',()=>{
 const before=JSON.stringify(attacker)+JSON.stringify(defender);
 DRIBBLES.dribbleOdds(attacker,defender,nutmeg);
 assert.equal(JSON.stringify(attacker)+JSON.stringify(defender),before);
 assert.equal((fs.readFileSync('index.html','utf8').match(/<button data-act=/g)||[]).length,4);
});
