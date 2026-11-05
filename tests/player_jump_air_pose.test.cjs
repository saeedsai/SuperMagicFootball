'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

const artPath=path.resolve(__dirname,'../src/modules/characterart.js');
const artPromise=import(pathToFileURL(artPath).href);
const team={primary:'#2769c0',secondary:'#f5f2e8',trim:'#ffc14b'};
const appearance={face:1,beard:0,style:2,eyes:3,brows:4,eyeColor:2,nose:1,lips:1,skin:'#af7957',hair:'#27222b'};
const groundPlayer={src:{num:10},action:'idle',keeper:false,i:0,z:0,vz:0,jumpCount:0,actionTimer:0};
function traceCanvas(){
 const events=[];let pathOps=[];
 const c={createLinearGradient(){return {addColorStop(){}}},save(){},restore(){},beginPath(){pathOps=[]},
  moveTo(...a){pathOps.push(['M',...a])},lineTo(...a){pathOps.push(['L',...a])},quadraticCurveTo(...a){pathOps.push(['Q',...a])},bezierCurveTo(...a){pathOps.push(['C',...a])},ellipse(...a){pathOps.push(['E',...a])},roundRect(...a){pathOps.push(['R',...a])},
  fill(){events.push(['fill',c.fillStyle,pathOps.slice()])},stroke(){events.push(['stroke',c.strokeStyle,c.lineWidth,pathOps.slice()])},closePath(){},clip(){},fillText(){},strokeText(){},translate(){},rotate(){},scale(){}};
 return {c,events};
}

test('normal and double jump phases produce bounded takeoff, apex tuck, and descent extension',async()=>{
 const {CHARACTER_ART:art}=await artPromise,pose=art.jumpAirPose;
 for(const action of ['jump','doubleJump']){
  const takeoff=pose(2,420,action==='jump'?1:2,action,.5);
  const rising=pose(38,220,action==='jump'?1:2,action,.18);
  const apex=pose(action==='jump'?82:148,0,action==='jump'?1:2,'idle',0);
  const descent=pose(36,-300,action==='jump'?1:2,'idle',0);
  assert.ok(takeoff.weight>0&&takeoff.weight<rising.weight,action+' begins on takeoff and blends in');
  assert.ok(rising.weight<apex.weight,'pose weight follows the jump height');
  assert.ok(apex.tuck>rising.tuck&&apex.tuck>descent.tuck,'knees tuck most clearly near apex');
  assert.ok(descent.extend>0&&descent.armDrop>0,'descent extends the legs and lowers the hands');
  for(const sample of [takeoff,rising,apex,descent])for(const key of ['weight','tuck','extend','armOpen','armLift','armDrop'])
   assert.ok(Number.isFinite(sample[key])&&sample[key]>=0&&sample[key]<=10,action+' '+key+' bounded');
 }
});

test('grounded, special-aerial, keeper, and invalid samples receive no normal jump pose',async()=>{
 const {CHARACTER_ART:art}=await artPromise,pose=art.jumpAirPose;
 for(const args of [[0,0,0,'idle',0],[90,0,1,'header',0],[90,0,1,'bicycle',0],[0,0,1,'jump',0]])
  assert.equal(pose(...args).weight,0,JSON.stringify(args));
 for(const args of [[NaN,NaN,1,'jump',.3],[80,NaN,1,'doubleJump',.3],[80,0,NaN,'jump',.3]])
  for(const value of Object.values(pose(...args)))assert.ok(Number.isFinite(value));
});

test('air pose changes articulated limbs, blends away run swing, and stays deterministic in reduced flash',async()=>{
 const {CHARACTER_ART:art}=await artPromise;
 function draw(pose,view='front',side=1,reducedFlash=false){
  const {c,events}=traceCanvas();
  const player=Object.freeze({...groundPlayer,...(pose?.jumpCount?{action:pose.action,z:pose.z,vz:pose.vz,jumpCount:pose.jumpCount,actionTimer:pose.actionTimer}:{} )});
  const jumpAirPose=art.jumpAirPose(player.z,player.vz,player.jumpCount,player.action,player.actionTimer);
  art.draw(c,player,appearance,team,{kind:view,side},{run:.85,locomotion:false,reducedFlash,jumpAirPose});
  return JSON.stringify(events);
 }
 const poses={ground:{},rise:{action:'jump',z:38,vz:220,jumpCount:1,actionTimer:.18},apex:{action:'idle',z:82,vz:0,jumpCount:1,actionTimer:0},fall:{action:'idle',z:36,vz:-300,jumpCount:1,actionTimer:0}};
 for(const view of ['front','quarterFront','side'])for(const side of [-1,1]){
  const baseline=draw(poses.ground,view,side),rise=draw(poses.rise,view,side),apex=draw(poses.apex,view,side),fall=draw(poses.fall,view,side);
  assert.notEqual(rise,baseline,view+' rise limbs differ from grounded');
  assert.notEqual(apex,rise,view+' apex tuck differs from rise');
  assert.notEqual(fall,apex,view+' descent extension differs from apex');
  assert.equal(draw(poses.apex,view,side,true),apex,'reduced flash holds deterministic pose');
 }
});

test('renderer gates normal/double jump only, uses paint blend, and leaves simulation owned by engine',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../src/modules/render.js'),'utf8');
 const engine=fs.readFileSync(path.resolve(__dirname,'../src/modules/engine.js'),'utf8');
 assert.match(source,/const normalAirborne=!p\.keeper&&p\.jumpCount>0&&p\.z>0&&\['jump','doubleJump','idle'\]\.includes\(p\.action\)/);
 assert.match(source,/const jumpPose=normalAirborne\?CHARACTER_ART\.jumpAirPose\(p\.z,p\.vz,p\.jumpCount,p\.action,p\.actionTimer\):null/);
 assert.match(source,/const poseRun=run\*\(1-\(jumpPose\?\.weight\|\|0\)\)/);
 assert.match(source,/jumpAirPose:jumpPose/);
 assert.match(engine,/p\.action='doubleJump';p\.actionTimer=\.5/);
 assert.match(engine,/p\.action='jump';p\.actionTimer=\.5/);
 assert.doesNotMatch(source,/p\.(?:x|y|z|vz|jumpCount)\s*[+*/-]?=/,'renderer must not write jump physics');
});
