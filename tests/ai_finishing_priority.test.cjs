'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

const load=()=>import(pathToFileURL(path.resolve('src/modules/shotfeel.js')).href);

test('AI finishing priority fails closed for invalid distance without changing finite thresholds',async()=>{
 const {SHOTFEEL}=await load();
 const priority=SHOTFEEL.aiFinishingPriority;
 for(const invalid of [NaN,Infinity,-Infinity,-1,undefined,null,'','   ',false,{},[]]){
  assert.equal(priority(invalid,180,80,.8),0,'invalid distance must not request a speculative CPU shot');
 }
 assert(priority(710,180,80,.8)>0,'the existing 710-unit boundary remains included');
 assert.equal(priority(711,180,80,.8),0,'shots beyond the existing maximum distance remain unavailable');
 assert(priority(709,180,80,.8)>0,'finite near-range shot remains available');
 assert(priority(250,180,80,.8)>priority(650,180,80,.8),'close-range finishing remains more likely');
 assert(priority(250,200,80,.8)>priority(250,70,80,.8),'close defender pressure still discourages a shot');
 assert.equal(priority('250',180,80,.8),priority(250,180,80,.8),'finite numeric strings retain compatibility');
 const homeGoalDistance=Math.abs(1050-350),awayGoalDistance=Math.abs(350-1050);
 assert.equal(priority(homeGoalDistance,180,80,.8),priority(awayGoalDistance,180,80,.8),'mirrored shot distances remain symmetric');
});
