'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/modules/characterart.js','utf8').replace(/export \{CHARACTER_ART\};?\s*$/,'');
const CHARACTER_ART=vm.runInNewContext(source+'\nCHARACTER_ART',{});
const poseSource=fs.readFileSync('src/modules/artpose.js','utf8').replace(/export \\{ARTPOSE\\};?\\s*$/,'');
const ARTPOSE=vm.runInNewContext(poseSource+'\\nARTPOSE',{});

test('keeper gloves ease from ready reach to full extension over the real dive timer',()=>{
 const reach=CHARACTER_ART.keeperArmReach;
 assert.equal(reach('idle',.3),0);assert.equal(reach('keeperRecover',.3),0);
 assert.equal(reach('keeperDive',0),0);assert.equal(reach('keeperDiveCatch',0),0);
 assert.ok(reach('keeperDive',.15)>.15&&reach('keeperDive',.15)<.16);
 assert.equal(reach('keeperDive',.3),.5);
 assert.ok(reach('keeperDiveCatch',.45)>.84&&reach('keeperDiveCatch',.45)<.85);
 assert.equal(reach('keeperDive',.6),1);assert.equal(reach('keeperSuper',0),1);
 assert.equal(reach('keeperDive',2),1);assert.equal(reach('keeperDive',-1),0);
 assert.equal(reach('keeperDive',Number.NaN),0);
});

test('both keeper arms consume the same timer phase, with unchanged dive and glove gates',()=>{
 const art=fs.readFileSync('src/modules/characterart.js','utf8');
 assert.match(art,/const diveReach=dive\?keeperArmReach\(p\.action,p\.diveElapsed\):0/);
 assert.match(art,/dive\?\[sh\+sign\*\(12\+9\*diveReach\),-49-11\*diveReach\]/);
 assert.match(art,/dive\?\[elbow\[0\]\+sign\*\(5\+13\*diveReach\),-58-16\*diveReach\]/);
 assert.match(art,/const catchingGlove=\['keeperDive','keeperDiveCatch','keeperCatch','keeperHold','keeperSuper'\]/);
});

test('grounded keeper catch closes the gloves while the held ball settles to the chest',()=>{
 const settle=CHARACTER_ART.keeperCatchSettle;
 assert.equal(settle('keeperCatch',.46),0);
 assert.ok(Math.abs(settle('keeperCatch',.23)-.5)<1e-9);
 assert.equal(settle('keeperCatch',0),1);
 assert.equal(settle('keeperHold',0),1);
 assert.equal(settle('keeperThrow',0),0);
 const early=ARTPOSE.keeperGrip('keeperCatch',1,.46);
 const middle=ARTPOSE.keeperGrip('keeperCatch',1,.23);
 const held=ARTPOSE.keeperGrip('keeperCatch',1,0);
 const hold=ARTPOSE.keeperGrip('keeperHold',1,0);
 assert.equal(early.y,-54);
 assert.equal(middle.y,-56.5);
 assert.equal(held.y,-59);
 assert.equal(hold.y,-59);
 assert.equal(ARTPOSE.keeperGrip('keeperCatch',-1,.46).x,-5);
 assert.equal(ARTPOSE.keeperGrip('keeperThrow',1,.2),null);
 const art=fs.readFileSync('src/modules/characterart.js','utf8');
 assert.match(art,/const holdPhase=holding\?keeperCatchSettle\(p\.action,p\.actionTimer\):0/);
 assert.match(art,/holding\?\[sh-sign\*\(9-2\*holdPhase\),-52-3\*holdPhase\]/);
 assert.match(art,/holding\?\[elbow\[0\]-sign\*\(5-2\*holdPhase\),-54-5\*holdPhase\]/);
});
