'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const render=fs.readFileSync('src/modules/render.js','utf8');
const helper=render.match(/function penaltyHudHints\(pk,humans\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(helper,'penalty control guide helper is present');
const hints=vm.runInNewContext(helper+'\npenaltyHudHints',{});
test('two-player penalty HUD follows both alternating taker and human goalkeeper',()=>{
 assert.deepEqual(Array.from(hints({turn:0,shotTimer:0},2)),[
  'P1 TAKER: MOVE / AIM + SHOOT','P2 KEEPER: MOVE UP/DOWN + JUMP']);
 assert.deepEqual(Array.from(hints({turn:1,shotTimer:0},2)),[
  'P2 TAKER: MOVE / AIM + SHOOT','P1 KEEPER: MOVE UP/DOWN + JUMP']);
});
test('flight phase changes shooter hint without hiding human JUMP keeper control',()=>{
 for(const turn of [0,1]){
  const labels=Array.from(hints({turn,shotTimer:.2},2));
  assert.match(labels[0],/SHOT IN FLIGHT/);
  assert.match(labels[1],/KEEPER: MOVE UP\/DOWN \+ JUMP/);
 }
});
test('solo penalties never falsely advertise human goalkeeper controls',()=>{
 assert.deepEqual(Array.from(hints({turn:0,shotTimer:0},1)),[
  'P1 TAKER: MOVE / AIM + SHOOT','CPU KEEPER: AUTOMATIC']);
 assert.deepEqual(Array.from(hints({turn:1,shotTimer:0},1)),[
  'CPU TAKER: PREPARING SHOT','P1 KEEPER: AUTOMATIC']);
 assert.match(hints({turn:1,shotTimer:.1},1)[0],/SHOT IN FLIGHT/);
});
test('malformed read-only HUD state has safe fallback',()=>{
 assert.deepEqual(Array.from(hints(null,2)),[
  'P1 TAKER: MOVE / AIM + SHOOT','P2 KEEPER: MOVE UP/DOWN + JUMP']);
});
test('real penalty renderer paints two correct hints and bounded timer',()=>{
 const method=render.split('\n').slice(render.split('\n').findIndex(l=>l.includes('   drawPK(ctx,g){'))).join('\n').match(/^   drawPK\(ctx,g\)\{[\s\S]*?^   \}/m)?.[0];
 assert.ok(method,'real drawPK method is present');
 const r=vm.runInNewContext('({'+method.trim()+'})',{rr(){},penaltyHudHints:hints});
 r.screenW=1280;
 const text=[];
 const ctx={save(){},translate(){},restore(){},fillText(s){text.push(s)}};
 const pk={turn:1,shotTimer:.25,timer:-2,kicks:[[true],[false]]};
 const before=JSON.stringify(pk);
 r.drawPK(ctx,{pk,humans:2});
 assert.equal(JSON.stringify(pk),before,'render does not mutate match state');
 assert(text.includes('P2 TAKER: SHOT IN FLIGHT'));
 assert(text.includes('P1 KEEPER: MOVE UP/DOWN + JUMP'));
 assert(text.includes('TIME 0s'),'timer must not go negative');
});
