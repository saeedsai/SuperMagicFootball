'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/modules/characterart.js','utf8').replace(/export \{CHARACTER_ART\};?\s*$/,'');
const CHARACTER_ART=vm.runInNewContext(source+'\nCHARACTER_ART',{});

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
