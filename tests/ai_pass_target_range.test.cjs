'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/shotfeel.js')).href);

test('CPU pass targeting includes the exact maximum range and mirrors both directions',async()=>{
 const {SHOTFEEL}=await load();
 const from={x:0,y:0};
 const forward=SHOTFEEL.teammateInDirection(from,[{id:'edge',x:1300,y:0}],{x:1,y:0},1300);
 assert.equal(forward?.id,'edge','a target exactly at maxDistance is reachable');
 assert.equal(SHOTFEEL.teammateInDirection(from,[{id:'outside',x:1300.01,y:0}],{x:1,y:0},1300),null,
  'a target beyond the configured range stays unavailable');
 const reverse=SHOTFEEL.teammateInDirection({x:1300,y:0},[{id:'edge',x:0,y:0}],{x:-1,y:0},1300);
 assert.equal(reverse?.id,'edge','the range boundary is symmetric for the opposite attack direction');
});

test('CPU pass targeting retains the close-control cutoff and reachable-target preference',async()=>{
 const {SHOTFEEL}=await load();
 const from={x:0,y:0};
 assert.equal(SHOTFEEL.teammateInDirection(from,[{x:28,y:0}],{x:1,y:0},1300),null,
  'the existing 28-unit minimum remains exclusive');
 const candidates=[{id:'far',x:1000,y:20},{id:'near',x:500,y:12},{id:'misaligned',x:400,y:250}];
 assert.equal(SHOTFEEL.teammateInDirection(from,candidates,{x:1,y:0},1300)?.id,'near');
});
