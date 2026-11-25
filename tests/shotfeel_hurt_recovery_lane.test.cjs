'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/shotfeel.js')).href);

test('directional ground passes ignore active hurt recovery in both lane and moving-receiver crowding reads',async()=>{
 const {SHOTFEEL}=await load(),from={x:0,y:0};
 const hurt={x:220,y:0,stun:0,action:'hurt',actionTimer:.35,moveVX:0,moveVY:0,vx:0,vy:0};
 const recovered={...hurt,actionTimer:0};
 assert.equal(SHOTFEEL.passingLanePressure(from,{x:220,y:0},[hurt]),0);
 assert.ok(SHOTFEEL.passingLanePressure(from,{x:220,y:0},[recovered])>=.10);
 const direct={x:200,y:0,stun:0,moveVX:140,moveVY:0,vx:0,vy:0};
 const angled={x:200,y:60,stun:0,moveVX:0,moveVY:0,vx:0,vy:0};
 const mates=[direct,angled];
 assert.equal(SHOTFEEL.teammateInDirection(from,mates,{x:1,y:0},1150,[hurt]),direct);
 assert.equal(SHOTFEEL.teammateInDirection(from,mates,{x:1,y:0},1150,[recovered]),angled);
});

test('completed hurt recovery and ordinary ready defenders remain genuine lane threats',async()=>{
 const {SHOTFEEL}=await load(),from={x:0,y:0},to={x:220,y:0};
 const completed={x:220,y:0,stun:0,action:'hurt',actionTimer:0,moveVX:0,moveVY:0};
 const ready={...completed,action:'idle'};
 assert.ok(SHOTFEEL.passingLanePressure(from,to,[completed])>=.10);
 assert.ok(SHOTFEEL.passingLanePressure(from,to,[ready])>=.10);
 assert.equal(SHOTFEEL.passingLanePressure(from,to,[{...completed,actionTimer:.25}]),0);
});


test('directional ground passes ignore every active shot-impact recovery phase and restore the defender when it clears',async()=>{
 const {SHOTFEEL}=await load();
 const phases=['shotImpactKnockdownPending','shotImpactKnockdownTimer','shotImpactRiseTimer'];
 for(const direction of [1,-1]){
  const from={x:0,y:0};
  const direct={x:direction*200,y:0,stun:0,moveVX:direction*140,moveVY:0,vx:0,vy:0};
  const angled={x:direction*200,y:60,stun:0,moveVX:0,moveVY:0,vx:0,vy:0};
  const defender={x:direction*220,y:0,stun:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,vx:0,vy:0};
  for(const phase of phases){
   const recovering={...defender,[phase]:.35},recovered={...recovering,[phase]:0};
   assert.equal(SHOTFEEL.passingLanePressure(from,{x:direction*220,y:0},[recovering]),0,phase+' should not block');
   assert.ok(SHOTFEEL.passingLanePressure(from,{x:direction*220,y:0},[recovered])>=.10,phase+' should restore lane pressure');
   assert.equal(SHOTFEEL.teammateInDirection(from,[direct,angled],{x:direction,y:0},1150,[recovering]),direct,phase+' recovery should leave the moving direct receiver preferred');
   assert.equal(SHOTFEEL.teammateInDirection(from,[direct,angled],{x:direction,y:0},1150,[recovered]),angled,phase+' completion should restore collection-pocket crowding');
  }
 }
});
