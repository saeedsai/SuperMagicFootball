'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/modules/artpose.js','utf8').replace(/export \{ARTPOSE\};?\s*$/,'');
const ARTPOSE=vm.runInNewContext(source+'\nARTPOSE',{});

test('keeper dive adds a bounded whole-body lean in both directions and goal-side facings',()=>{
 for(const face of [-1,1])for(const diveDy of [-1,1]){
  const start=ARTPOSE.keeperPose('keeperDive',0,.6,diveDy,face);
  const peak=ARTPOSE.keeperPose('keeperDive',.6,.1,diveDy,face);
  assert.ok(Number.isFinite(peak.angle));
  assert.ok(Math.abs(peak.angle)>.70&&Math.abs(peak.angle)<1.2,JSON.stringify({face,diveDy,peak}));
  assert.equal(Math.sign(peak.angle),diveDy,'torso and legs lean toward the saved lane');
  assert.ok(Math.abs(start.angle)<Math.abs(peak.angle),'lean grows through existing dive phase');
  assert.equal(peak.x,face*28);
  assert.ok(Math.abs(peak.y-(diveDy*(8+30*Math.sin(Math.PI*.72))+4))<1e-9);
  const recover=ARTPOSE.keeperPose('keeperRecover',0,.34,diveDy,face);
  assert.ok(Math.abs(recover.x-peak.x)<1e-9&&Math.abs(recover.y-peak.y)<1e-9&&Math.abs(recover.angle-peak.angle)<1e-9,'dive and recovery endpoints coincide');
 }
});

test('existing dive duration, direction sign, and neutral fallback are unchanged',()=>{
 for(const diveDy of [-1,1]){
  assert.equal(ARTPOSE.keeperPose('keeperDive',.30,0,diveDy,1).x,17.5);
  assert.equal(Math.sign(ARTPOSE.keeperPose('keeperDive',.30,0,diveDy,1).y),diveDy);
 }
 assert.deepEqual({...ARTPOSE.keeperPose('idle',.6,.2,1,1)},{x:0,y:0,angle:0});
});
