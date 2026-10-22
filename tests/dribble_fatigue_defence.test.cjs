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
 const carrier={...attacker,x:100,y:0};
 const base={...defender,x:0,y:0,fatigue:0};
 const retreat=api.dribbleOdds(carrier,{...base,vx:-8,vy:0},styles[0]);
 const closing=api.dribbleOdds(carrier,{...base,vx:8,vy:0},styles[0]);
 assert.ok(closing<retreat);
 assert.equal(retreat,api.dribbleOdds(carrier,{...base,vx:0,vy:0},styles[0]));
 assert.equal(api.dribbleOdds(carrier,{...base,vx:100,vy:0},styles[0]),api.dribbleOdds(carrier,{...base,vx:12.5,vy:0},styles[0]));
});
