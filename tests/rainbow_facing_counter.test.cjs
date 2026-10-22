'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/dribbles.js','utf8').replace(/^import .*;\s*/m,'').replace(/export \{DRIBBLES\};?\s*$/m,'');
const styles=[{id:'rainbow',evade:.35},{id:'sideStep',evade:.27}];
const api=vm.runInNewContext(source+'; DRIBBLES;', {GAME_ASSETS:{mechanics:{dribbleStyles:styles}}});
const carrier={dribbling:75,agility:70,fatigue:0,x:0,y:0};
const rival={defence:95,aggression:65,fatigue:0,x:50,y:0,vx:-4,vy:0};
const odds=(changes={},style=styles[0])=>api.dribbleOdds(carrier,{...rival,...changes},style);
test('Rainbow Flick aerial read requires defender facing carrier',()=>{
 assert.ok(odds({face:-1})<odds({face:1}));
 assert.equal(odds({face:-1}),odds());
 assert.equal(odds({face:0}),odds());
});
test('Other dribbles, stationary, retreating, distant and tired defenders retain odds',()=>{
 assert.equal(odds({face:-1},styles[1]),odds({face:1},styles[1]));
 for(const changed of [{vx:0},{vx:4},{x:220},{fatigue:1}])
  assert.equal(odds({...changed,face:-1}),odds({...changed,face:1}),JSON.stringify(changed));
});
test('Live engine supplies actual defender facing',()=>{
 const engine=fs.readFileSync('src/modules/engine.js','utf8');
 const start=engine.indexOf('tryDribbleTrick(p,byAI=false)');
 const block=engine.slice(start,engine.indexOf('const forward=norm(',start));
 assert.match(block,/if\(threat\)threat\.face=rival\.face;/);
 assert.match(block,/dribbleOdds\(skill,threat,style\)/);
});
