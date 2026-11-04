'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const start=engine.indexOf('\n reactToSupernova(');
const tail=start<0?-1:engine.slice(start+1).search(/\n [A-Za-z_$][\w$]*\(/);
assert.ok(start>=0&&tail>=0,'extract actual Supernova CPU reaction');
const react=vm.runInNewContext('({'+engine.slice(start,start+1+tail)+'})',{distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)}).reactToSupernova;

function setup(side,patch={}){
 const cpu={t:side,x:400,y:260,keeper:false,z:0,stun:0,action:'slide',actionTimer:.08,
  aiSupernovaKey:null,aiSupernovaReaction:0,...patch};
 const game={players:[cpu],supernova:{team:1-side,x:400,y:260,radius:142,remaining:.85},jumps:0,
  jump(p){this.jumps++;p.z=1.55;p.vz=420;p.action='jump';p.actionTimer=.5;return true;}};
 return{game,cpu};
}

test('short active slide does not suppress a later difficulty-timed Supernova jump',()=>{
 for(const side of [0,1])for(const hz of [30,60,120])for(const level of [1,2,3,4]){
  const {game,cpu}=setup(side),dt=1/hz,reaction=mechanics.aiLevels[level].reaction;
  let remaining=.85,slide=.08,jumpedAt=null;
  while(remaining>1e-9){
   remaining=Math.max(0,remaining-dt);slide=Math.max(0,slide-dt);
   game.supernova={...game.supernova,remaining};
   cpu.actionTimer=slide;
   if(slide<=1e-9)cpu.action='run';
   react.call(game,cpu,dt,reaction);
   if(game.jumps){jumpedAt=remaining;assert.ok(slide<=1e-9,'AI must not attempt to jump while the slide is active');break;}
  }
  const expected=.85-Math.ceil(.08*hz-1e-9)/hz-reaction>.12;
  assert.equal(jumpedAt!==null,expected,`${mechanics.aiLevels[level].name}, team ${side}, ${hz}Hz`);
  if(jumpedAt!==null)assert.ok(jumpedAt>.12,'jump starts while enough warning remains to counter');
 }
});

test('slide held through the impact remains a valid counter without a redundant jump',()=>{
 for(const side of [0,1])for(const hz of [30,60,120]){
  const {game,cpu}=setup(side,{actionTimer:1.1}),dt=1/hz;
  let remaining=.85,slide=1.1;
  while(remaining>1e-9){
   remaining=Math.max(0,remaining-dt);slide=Math.max(0,slide-dt);
   game.supernova={...game.supernova,remaining};cpu.actionTimer=slide;
   react.call(game,cpu,dt,.09);
   assert.equal(game.jumps,0,`side ${side}, ${hz}Hz`);
  }
 }
 });
