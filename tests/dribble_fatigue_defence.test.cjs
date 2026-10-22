'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/dribbles.js'),'utf8');
const body=source.replace(/^import .*;\s*/m,'').replace(/export \{DRIBBLES\};?\s*$/m,'');
const styles=[{id:'default',evade:0}];
const api=vm.runInNewContext(body+'; DRIBBLES;', {GAME_ASSETS:{mechanics:{dribbleStyles:styles}}});
const attacker={dribbling:75,agility:75,fatigue:0};
const defender={defence:80,aggression:80};
test('fatigued defender gives attacker a better chance',()=>{
 const fresh=api.dribbleOdds(attacker,{...defender,fatigue:0},styles[0]);
 const tired=api.dribbleOdds(attacker,{...defender,fatigue:1},styles[0]);
 assert.ok(tired>fresh);
});
test('fatigue is bounded to 0..1',()=>{
 assert.equal(api.dribbleOdds(attacker,{...defender,fatigue:1},styles[0]),api.dribbleOdds(attacker,{...defender,fatigue:20},styles[0]));
 assert.equal(api.dribbleOdds(attacker,{...defender,fatigue:0},styles[0]),api.dribbleOdds(attacker,{...defender,fatigue:-4},styles[0]));
});
test('odds remain within the original gameplay caps',()=>{
 assert.ok(api.dribbleOdds(attacker,{...defender,fatigue:1},styles[0])<=.95);
 assert.ok(api.dribbleOdds(attacker,{...defender,fatigue:1},styles[0])>=.12);
});

test('attacker fatigue is clamped for dribble odds',()=>{
 assert.equal(api.dribbleOdds({...attacker,fatigue:1},defender,styles[0]),api.dribbleOdds({...attacker,fatigue:100},defender,styles[0]));
 assert.equal(api.dribbleOdds({...attacker,fatigue:0},defender,styles[0]),api.dribbleOdds({...attacker,fatigue:-10},defender,styles[0]));
 assert.ok(api.dribbleOdds({...attacker,fatigue:1},defender,styles[0])<api.dribbleOdds({...attacker,fatigue:0},defender,styles[0]));
});

test('closing defender gets bounded read bonus, retreating defender does not',()=>{
 const carrier={...attacker,x:80,y:0};
 const base={...defender,x:0,y:0,fatigue:0};
 const retreat=api.dribbleOdds(carrier,{...base,vx:-8,vy:0},styles[0]);
 const closing=api.dribbleOdds(carrier,{...base,vx:8,vy:0},styles[0]);
 assert.ok(closing<retreat);
 assert.equal(retreat,api.dribbleOdds(carrier,{...base,vx:0,vy:0},styles[0]));
 assert.equal(api.dribbleOdds(carrier,{...base,vx:100,vy:0},styles[0]),api.dribbleOdds(carrier,{...base,vx:12.5,vy:0},styles[0]));
});

test('closing bonus fades beyond pressure radius',()=>{
 const near={...attacker,x:80,y:0};
 const far={...attacker,x:300,y:0};
 const chaser={...defender,x:0,y:0,vx:8,vy:0};
 const still={...chaser,vx:0};
 assert.ok(api.dribbleOdds(near,chaser,styles[0])<api.dribbleOdds(near,still,styles[0]));
 assert.equal(api.dribbleOdds(far,chaser,styles[0]),api.dribbleOdds(far,still,styles[0]));
});

test('fresh closing defender reads better than equally skilled tired defender',()=>{
 const carrier={...attacker,x:50,y:0};
 const base={...defender,x:0,y:0,vx:10,vy:0};
 const fresh=api.dribbleOdds(carrier,{...base,fatigue:0},styles[0]);
 const tired=api.dribbleOdds(carrier,{...base,fatigue:1},styles[0]);
 assert.ok(fresh<tired);
});

test('agile dribblers counter nearby closing pressure',()=>{
 const close={...defender,x:0,y:0,vx:10,vy:0,fatigue:0};
 const agile={...attacker,x:50,y:0,agility:95};
 const basic={...attacker,x:50,y:0,agility:65,dribbling:75+(95-65)*.43/.57};
 // Matched baseline offense isolates the new agility-based sidestep.
 assert.ok(api.dribbleOdds(agile,close,styles[0])>api.dribbleOdds(basic,close,styles[0]));
});
test('sidestep advantage disappears for distant or exhausted ball carriers',()=>{
 const carrier={...attacker,x:50,y:0,agility:95};
 const far={...defender,x:-300,y:0,vx:10,vy:0};
 const close={...defender,x:0,y:0,vx:10,vy:0};
 const equalBase={...carrier,agility:65,dribbling:75+30*.43/.57};
 assert.ok(Math.abs(api.dribbleOdds(carrier,far,styles[0])-api.dribbleOdds(equalBase,far,styles[0]))<1e-10);
 assert.ok(Math.abs(api.dribbleOdds({...carrier,fatigue:1},close,styles[0])-api.dribbleOdds({...equalBase,fatigue:1},close,styles[0]))<1e-10);
});

test('nutmeg sweet spot outperforms edge of valid timing window',()=>{
 const carrier={...attacker,dribbling:95,agility:75,x:0,y:0};
 const rival={...defender,defence:65,aggression:65,y:0,vx:-5,vy:0};
 const nutmeg={...styles[0],nutmeg:true};
 const plain={...styles[0],nutmeg:false};
 const advantage=d=>api.dribbleOdds(carrier,{...rival,x:d},nutmeg)-api.dribbleOdds(carrier,{...rival,x:d},plain);
 assert.ok(advantage(50)>advantage(20));
 assert.ok(advantage(50)>advantage(95));
 assert.equal(advantage(15),0);
 assert.equal(advantage(100),0);
});
