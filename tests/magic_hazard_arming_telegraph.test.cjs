'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const render=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');

function paintHarness(){
 const start=render.indexOf('function drawHazardArmingCue(');
 const end=render.indexOf('function line(ctx,pts',start);
 assert.ok(start>=0&&end>start,'hazard arming and paint helpers must be present');
 const source=render.slice(start,end);
 const drawn=[];
 const ellipse=(ctx,x,y,rx,ry,fill)=>drawn.push({type:'ellipse',x,y,rx,ry,fill});
 const painters=new Function('PI','ellipse',source+';return {drawBananaPeels,drawIcePatches};')(Math.PI,ellipse);
 const ctx={
  save(){},restore(){},beginPath(){},moveTo(){},quadraticCurveTo(){},lineTo(){},
  stroke(){drawn.push({type:'stroke',style:this.strokeStyle});},
  arc(x,y,r,start,end){drawn.push({type:'arc',x,y,r,start,end});}
 };
 return {painters,drawn,ctx};
}

test('both Magic Trap types display a visible arming ring while countdown is positive',()=>{
 const {painters,drawn,ctx}=paintHarness();
 painters.drawBananaPeels(ctx,[{kind:'banana',x:120,y:80,life:3,arm:.25}]);
 painters.drawIcePatches(ctx,[{kind:'ice',x:210,y:90,life:2.5,arm:.3}]);
 const arcs=drawn.filter(item=>item.type==='arc');
 assert.equal(arcs.length,2);
 assert.deepEqual(arcs.map(a=>a.r),[21,37]);
 assert.ok(arcs.every(a=>Math.abs((a.end-a.start)-2*Math.PI)<1e-8));
});

test('arming ring shrinks with time and disappears after arming without hiding trap artwork',()=>{
 const {painters,drawn,ctx}=paintHarness();
 const banana={kind:'banana',x:120,y:80,life:2.5,arm:.125};
 painters.drawBananaPeels(ctx,[banana]);
 const arc=drawn.find(item=>item.type==='arc');
 assert.ok(arc);
 assert.ok(Math.abs((arc.end-arc.start)-Math.PI)<1e-8);
 drawn.length=0;
 painters.drawBananaPeels(ctx,[{...banana,arm:0}]);
 assert.equal(drawn.filter(item=>item.type==='arc').length,0);
 assert.ok(drawn.some(item=>item.type==='ellipse'),'armed trap still painted');
 drawn.length=0;
 painters.drawIcePatches(ctx,[{kind:'ice',x:210,y:90,life:1,arm:0}]);
 assert.equal(drawn.filter(item=>item.type==='arc').length,0);
 assert.ok(drawn.some(item=>item.type==='ellipse'),'armed ice still painted');
});

test('expired traps and unrelated hazards never draw arming rings',()=>{
 const {painters,drawn,ctx}=paintHarness();
 painters.drawBananaPeels(ctx,[{kind:'banana',x:1,y:2,life:0,arm:.25},{kind:'ice',x:2,y:3,life:1,arm:.3}]);
 painters.drawIcePatches(ctx,[{kind:'ice',x:1,y:2,life:0,arm:.3},{kind:'banana',x:2,y:3,life:1,arm:.25}]);
 assert.equal(drawn.length,0);
});
