'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/modules/characterart.js','utf8').replace(/export \{CHARACTER_ART\};?\s*$/,'');
const CHARACTER_ART=vm.runInNewContext(source+'\nCHARACTER_ART',{});

function drawTrace(action,timer){
 const strokes=[];let path=[];
 const ctx={
  createLinearGradient(){return {addColorStop(){}}},
  save(){},restore(){},translate(){},rotate(){},scale(){},
  beginPath(){path=[]},moveTo(x,y){path.push([x,y])},lineTo(x,y){path.push([x,y])},
  quadraticCurveTo(){},bezierCurveTo(){},ellipse(){},roundRect(){},closePath(){},clip(){},fill(){},fillText(){},strokeText(){},
  stroke(){strokes.push(path.map(point=>point.slice()))}
 };
 const player={src:{num:10},action,actionTimer:timer,keeper:false};
 const appearance={face:0,style:1,eyes:0,brows:0,nose:0,lips:0,skin:'#b77d5b',hair:'#392d27'};
 const team={primary:'#286bc5',secondary:'#f5f1e9',trim:'#f4c24e'};
 CHARACTER_ART.draw(ctx,player,appearance,team,{kind:'front',side:1},{run:0});
 return strokes;
}

test('shot recovery plants an open near palm and has no recovery-only change at its endpoints',()=>{
 const start=drawTrace('shotGetUp',.24),push=drawTrace('shotGetUp',.12),stand=drawTrace('shotGetUp',0),idle=drawTrace('idle',0);
 const plantedForearm=[[31,-29],[36,-19]],
  endpointForearm=[[36,-39],[41,-24]];
 assert.ok(push.some(path=>JSON.stringify(path)===JSON.stringify(plantedForearm)),
  'mid push-up lowers the near forearm to a planted palm position');
 assert.ok(start.some(path=>JSON.stringify(path)===JSON.stringify(endpointForearm)),
  'recovery begins from the ordinary arm pose');
 assert.ok(stand.some(path=>JSON.stringify(path)===JSON.stringify(endpointForearm)),
  'recovery ends at the ordinary standing arm pose');
 assert.ok(!push.some(path=>JSON.stringify(path)===JSON.stringify(endpointForearm)),
  'the peak push-up has a visibly different arm silhouette');
 assert.match(source,/The near hand opens against the turf/);
});

test('get-up arm bracing is outfield-only and driven by the existing bounded recovery phase',()=>{
 const arm=source.slice(source.indexOf(' function arm('),source.indexOf('\n function drawMaceSweep('));
 assert.match(arm,/const recoveryBrace=!p\.keeper\?shotRecoveryBrace\(p\.action,p\.actionTimer\):0/);
 assert.match(arm,/const gettingUp=!p\.keeper&&p\.action==='shotGetUp'/);
 assert.match(arm,/gettingUp\?\[elbow\[0\]\+sign\*5,-24\+sw\+\(near\?5:13\)\*recoveryBrace\]/);
 assert.doesNotMatch(arm,/p\.(?:x|y|vx|vy|vz|hitbox)\s*=/i,'animation adds no physics or hitbox writes');
});
