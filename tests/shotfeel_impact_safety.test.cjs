'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

const load=()=>import(pathToFileURL(path.resolve('src/modules/shotfeel.js')).href);

test('shot contact energy stays finite and cannot be amplified by malformed flight values',async()=>{
 const {SHOTFEEL}=await load();
 const minNormal=.21,minSuper=.33;
 for(const bad of [NaN,Infinity,-Infinity,undefined,null,false,'',{},'not-a-number']){
  assert.ok(Number.isFinite(SHOTFEEL.contactEnergy(bad,1200,300)),`power ${String(bad)}`);
  assert.ok(Number.isFinite(SHOTFEEL.contactEnergy(400,bad,300)),`speed ${String(bad)}`);
  if(bad!==undefined){
   assert.equal(SHOTFEEL.impactFactor(bad,false),minNormal,`normal distance ${String(bad)} uses conservative falloff`);
   assert.equal(SHOTFEEL.impactFactor(bad,true),minSuper,`Super Shot distance ${String(bad)} uses conservative falloff`);
  }
  assert.equal(SHOTFEEL.contactEnergy(400,1200,bad,false),(400+1200/45)*minNormal,
   `malformed normal travel cannot retain full impact energy: ${String(bad)}`);
  assert.equal(SHOTFEEL.contactEnergy(400,1200,bad,true),(400+1200/45)*minSuper,
   `malformed Super Shot travel cannot retain full impact energy: ${String(bad)}`);
 }
 assert.equal(SHOTFEEL.contactEnergy(-400,-1200,-300),0,'negative energy, speed, and travel clamp safely');
});

test('finite impact tuning and numeric-string compatibility are unchanged',async()=>{
 const {SHOTFEEL}=await load();
 assert.equal(SHOTFEEL.impactFactor(300,false),1-300/1450);
 assert.equal(SHOTFEEL.impactFactor(300,true),1-300/1950);
 assert.equal(SHOTFEEL.contactEnergy(400,900,300,true),(400+900/45)*(1-300/1950));
 assert.equal(SHOTFEEL.contactEnergy('400','900','300',true),SHOTFEEL.contactEnergy(400,900,300,true));
});
