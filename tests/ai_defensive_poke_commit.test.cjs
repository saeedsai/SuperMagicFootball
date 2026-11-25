'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

let ENGINE;
test.before(async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 ({ENGINE}=await import('../src/modules/engine.js'));
});

const player=(t,x,y,extra={})=>({t,x,y,keeper:false,down:false,stun:0,invuln:0,z:0,dx:1,dy:0,face:1,...extra});
function commit(defender,carrier,ball=null){
 return ENGINE.GameEngine.prototype.defensivePokeCommitWindow.call({},defender,carrier,ball);
}
function ballSide(defender,carrier,ball){
 return ENGINE.GameEngine.prototype.defensivePokeBallSideRead.call({},defender,carrier,ball);
}
function slideBallSide(defender,carrier,ball,baseSpeed=320){
 return ENGINE.GameEngine.prototype.defensiveTackleSlideBallSideRead.call({},defender,carrier,ball,baseSpeed);
}

test('relative closing lets an advancing defender open the bounded early PASS-poke window',()=>{
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const qualifies=(defenderSpeed,carrierSpeed=0,range=78,defence=50,extra={})=>{
   const defender=player(team,1000,700,{dx:0,dy:0,face:-dir,
    moveVX:dir*defenderSpeed,moveVY:0,src:{defence},...extra});
   const carrier=player(1-team,1000+dir*range,700,{moveVX:dir*carrierSpeed,moveVY:0});
   const ball={owner:carrier,x:carrier.x-dir*17,y:carrier.y+12,z:12};
   return commit(defender,carrier,ball);
  };
  assert.equal(qualifies(120),true,'average Defence recognizes 120 units/s of relative closing');
  assert.equal(qualifies(119.9),false,'the existing average closing threshold remains exact');
  assert.equal(qualifies(220,0,89),true,'bounded defender movement lead opens the 89-unit edge');
  assert.equal(qualifies(220,0,90),false,'the predicted post-step 62-unit gap remains exclusive');
  assert.equal(qualifies(220,100),true,'a retreating carrier can still be met when net closing reaches 120');
  assert.equal(qualifies(220,110),false,'a faster retreat keeps net closing below threshold');
  assert.equal(qualifies(0),false,'stationary facing alone never opens the early window');
  assert.equal(qualifies(-220),false,'a defender moving away cannot manufacture closing speed');
  assert.equal(qualifies(106.5,0,78,95),true,'elite Defence keeps its 106.5 threshold');
  assert.equal(qualifies(106.4,0,78,95),false);
  assert.equal(qualifies(129,0,78,20),true,'low Defence keeps its 129 threshold');
  assert.equal(qualifies(128.9,0,78,20),false);
  assert.equal(qualifies(220,0,78,50,{moveVY:220,moveVX:0}),false,
   'lateral movement cannot be mistaken for approach');
  assert.equal(qualifies(220,0,78,50,{dx:-dir,dy:0}),false,
   'explicit input facing away overrides residual approach momentum');
 }
});

test('driveAI commits the early poke from defender residual approach in both directions',()=>{
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const dir=team===0?1:-1,defender=game.player(team,3),carrier=game.player(1-team,3);
  const field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
  for(const q of game.players){
   q.down=true;q.stun=1;q.aiTarget=null;q.aiTimer=0;q.aiAssistTarget=null;q.aiGiveAndGoRun=null;
  }
  Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,aiTimer:0,aiTarget:null,
   aiDetour:null,action:'idle',actionTimer:0,moveVX:dir*220,moveVY:0,dx:0,dy:0,face:-dir,
   sprintCharge:0,dashTimer:0,magicReadCounterpressTimer:0});
  Object.assign(carrier,{x:x+dir*88,y,z:0,down:false,stun:0,invuln:0,action:'idle',
   actionTimer:0,moveVX:0,moveVY:0});
  Object.assign(game.ball,{owner:carrier,x:carrier.x-dir*17,y:y+12,z:12,vx:0,vy:0,vz:0,
   pass:false,shot:null,strike:null,ordinaryShot:false});
  game.clock=5;game.activateDefence=()=>false;
  const calls=[];game.tackle=(who,slide,slideBall)=>{calls.push({who,slide,slideBall});who.cd=.5;return true;};
  const originalRandom=Math.random;Math.random=()=>0;
  try{game.driveAI(defender,.016);}finally{Math.random=originalRandom;}
  assert.equal(calls.length,1,'team '+team+' should make one early poke');
  assert.equal(calls[0].who,defender);
  assert.equal(calls[0].slide,false,'the 88-unit approach remains an ordinary PASS poke');
  assert.equal(calls[0].slideBall,game.ball,'the validated live ball must reach the ordinary poke aim');
 }
});

test('closing grounded carriers open the bounded early PASS-poke window in both directions',()=>{
 const rightDefender=player(0,1000,700,{dx:1,dy:0,face:1});
 const rightCarrier=player(1,1088,700,{moveVX:-240,moveVY:0});
 assert.equal(commit(rightDefender,rightCarrier),true);
 const leftDefender=player(1,1088,700,{dx:-1,dy:0,face:-1});
 const leftCarrier=player(0,1000,700,{moveVX:240,moveVY:0});
 assert.equal(commit(leftDefender,leftCarrier),true);
});

test('retreating, lateral and insufficiently closing carriers keep the existing timing',()=>{
 const defender=player(0,1000,700,{dx:1,dy:0,face:1});
 assert.equal(commit(defender,player(1,1088,700,{moveVX:240,moveVY:0})),false);
 assert.equal(commit(defender,player(1,1088,700,{moveVX:0,moveVY:240})),false);
 assert.equal(commit(defender,player(1,1088,700,{moveVX:-80,moveVY:0})),false);
 assert.equal(commit(defender,player(1,1088,700)),false);
 assert.equal(commit(defender,player(1,1088,700,{moveVX:NaN,moveVY:NaN,vx:-300,vy:0})),false,
  'legacy velocity must not override the zero-motion fallback used by the actual poke');
});

test('Defence skill scales the closing-speed read while the average baseline stays unchanged',()=>{
 const average=player(0,1000,700,{src:{defence:50}});
 const elite=player(0,1000,700,{src:{defence:95}});
 const weak=player(0,1000,700,{src:{defence:20}});
 assert.equal(commit(average,player(1,1083,700,{moveVX:-120,moveVY:0})),true,
  'average Defence keeps the existing 120-unit/s threshold');
 assert.equal(commit(average,player(1,1083,700,{moveVX:-119.9,moveVY:0})),false);
 const slowerClosing=player(1,1083,700,{moveVX:-110,moveVY:0});
 assert.equal(commit(elite,slowerClosing),true,'high Defence reads a slower closing carrier');
 assert.equal(commit(weak,slowerClosing),false,'low Defence keeps the stricter approach threshold');
 const mirroredElite=player(1,1083,700,{dx:-1,dy:0,face:-1,src:{defence:95}});
 assert.equal(commit(mirroredElite,player(0,1000,700,{moveVX:110,moveVY:0})),true,
  'the skill read mirrors when defending the opposite goal');
});


test('close-contact PASS poke reads the exposed ball and respects far-side shielding in both directions',()=>{
 for(const defendingTeam of [0,1]){
  const dir=defendingTeam===0?1:-1;
  const defender=player(defendingTeam,1000,700,{dx:dir,dy:0,face:dir});
  const carrier=player(1-defendingTeam,1000+dir*52,700,{moveVX:0,moveVY:0});
  const exposed={owner:carrier,x:carrier.x-dir*17,y:carrier.y+12,z:12};
  const shielded={owner:carrier,x:carrier.x+dir*17,y:carrier.y+12,z:12};
  assert.equal(ballSide(defender,carrier,exposed),true,JSON.stringify({defendingTeam,exposed}));
  assert.equal(ballSide(defender,carrier,shielded),false,JSON.stringify({defendingTeam,shielded}));
  assert.equal(ballSide(defender,carrier,{...exposed,owner:defender}),false,'mismatched ownership fails closed');
  assert.equal(ballSide(defender,carrier,{...exposed,x:carrier.x-dir*40}),false,'stale ball positions fail closed');
  assert.equal(ballSide(defender,carrier,{...exposed,x:Infinity}),false,'invalid ball coordinates fail closed');
  assert.equal(ballSide(defender,carrier,null),false,'missing live ball cannot authorize a close poke');
 }
});

test('the early window follows the existing poke lead and 16-unit step contact budget',()=>{
 const defender=player(0,1000,700,{dx:1,dy:0,face:1});
 assert.equal(commit(defender,player(1,1089,700,{moveVX:-240,moveVY:0})),true);
 assert.equal(commit(defender,player(1,1090,700,{moveVX:-240,moveVY:0})),false);
 assert.equal(commit(defender,player(1,1095,700,{moveVX:-300,moveVY:0})),false);
 assert.equal(commit(defender,player(1,1095,700,{moveVX:-240,moveVY:0})),false);
});

test('the early poke respects forward arc, player eligibility and finite coordinates',()=>{
 const carrier=player(1,1088,700,{moveVX:-240,moveVY:0});
 assert.equal(commit(player(0,1000,700,{dx:0,dy:1,face:1}),carrier),false);
 for(const invalid of [
  {down:true},{stun:.2},{invuln:.2},{z:20},{z:NaN},{action:'shotDown'},
  {action:'shotGetUp'},{keeper:true},{x:Infinity}
 ]) assert.equal(commit(player(1,1000,700,{dx:1,dy:0,face:1}),{...carrier,...invalid}),false,JSON.stringify(invalid));
 assert.equal(commit(player(0,1000,700),player(0,1088,700,{moveVX:-240,moveVY:0})),false);
 assert.equal(commit(player(0,1000,700),null),false);
});

test('the Defence-scaled threshold remains bounded for extreme ratings',()=>{
 const low=player(0,1000,700,{src:{defence:1}});
 const high=player(0,1000,700,{src:{defence:100}});
 assert.equal(commit(low,player(1,1083,700,{moveVX:-134,moveVY:0})),false);
 assert.equal(commit(low,player(1,1083,700,{moveVX:-135,moveVY:0})),true);
 assert.equal(commit(high,player(1,1083,700,{moveVX:-105,moveVY:0})),true);
 assert.equal(commit(high,player(1,1083,700,{moveVX:-104.9,moveVY:0})),false);
});



test('early PASS poke requires the live ball to be exposed toward the approaching defender',()=>{
 const defender=player(0,1000,700,{dx:1,dy:0,face:1});
 const exposed=player(1,1088,700,{face:-1,moveVX:-240,moveVY:0});
 const exposedBall={owner:exposed,x:exposed.x-17,y:exposed.y+12,z:12};
 assert.equal(commit(defender,exposed,exposedBall),true,
  'a ball carried on the defender-facing foot remains readable');
 const shielded=player(1,1088,700,{face:1,moveVX:-240,moveVY:0});
 const shieldedBall={owner:shielded,x:shielded.x+17,y:shielded.y+12,z:12};
 assert.equal(commit(defender,shielded,shieldedBall),false,
  'a carrier shielding the ball on the far side is not early-poked');
 assert.equal(commit(defender,shielded,{owner:defender,x:shielded.x+17,y:shielded.y+12}),false,
  'a mismatched ball owner cannot create a read');
 assert.equal(commit(defender,shielded,{owner:shielded,x:Infinity,y:shielded.y}),false,
  'invalid ball coordinates fail closed');
 assert.equal(commit(defender,shielded,{owner:shielded,x:shielded.x+40,y:shielded.y+12}),false,
  'stale ball positions outside the carried-ball envelope fail closed');
 assert.equal(commit(defender,shielded),true,
  'legacy helper callers without a live-ball argument retain their existing behavior');
 const leftDefender=player(1,1088,700,{dx:-1,dy:0,face:-1});
 const leftExposed=player(0,1000,700,{face:1,moveVX:240,moveVY:0});
 const leftExposedBall={owner:leftExposed,x:leftExposed.x+17,y:leftExposed.y+12,z:12};
 const leftShielded=player(0,1000,700,{face:-1,moveVX:240,moveVY:0});
 const leftShieldedBall={owner:leftShielded,x:leftShielded.x-17,y:leftShielded.y+12,z:12};
 assert.equal(commit(leftDefender,leftExposed,leftExposedBall),true,'left-side defender reads the exposed ball');
 assert.equal(commit(leftDefender,leftShielded,leftShieldedBall),false,'left-side carrier can shield the far foot');
});

test('CPU SHOOT slide selection requires an exposed live ball in both directions',()=>{
 for(const defendingTeam of [0,1]){
  const dir=defendingTeam===0?1:-1;
  const defender=player(defendingTeam,1000,700,{dx:dir,dy:0,face:dir,moveVX:dir*240,moveVY:0});
  const carrier=player(1-defendingTeam,1000+dir*55,700,{moveVX:dir*340,moveVY:0});
  const exposed={owner:carrier,x:carrier.x-dir*17,y:carrier.y+12,z:12};
  const shielded={owner:carrier,x:carrier.x+dir*17,y:carrier.y+12,z:12};
  assert.equal(slideBallSide(defender,carrier,exposed),true);
  assert.equal(slideBallSide(defender,carrier,shielded),false);
  assert.equal(slideBallSide(defender,carrier,{...exposed,owner:defender}),false);
  assert.equal(slideBallSide(defender,carrier,{...exposed,x:carrier.x-dir*40}),false);
  assert.equal(slideBallSide(defender,carrier,{...exposed,x:Infinity}),false);
  assert.equal(slideBallSide(defender,carrier,null),false);
  assert.equal(slideBallSide({...defender,moveVX:0},carrier,exposed),false);
  assert.equal(slideBallSide({...defender,dx:-dir,face:-dir,moveVX:-dir*240},carrier,exposed),false);
 }
});

test('ordinary and primary close-contact non-slide pokes respect ball shielding while physical slides remain available',()=>{
 const source=fs.readFileSync('src/modules/engine.js','utf8');
 assert.ok(source.includes('const closeContact=!!(owner&&owner.t!==t&&distance(p,owner)<68);'));
 assert.ok(source.includes('if(!closeContact||slide||this.defensivePokeBallSideRead(p,owner,liveBall))this.tackle(p,slide,slide?liveBall:null);'));
 assert.ok(source.includes('if(slide||this.defensivePokeBallSideRead(p,owner,liveBall))this.tackle(p,slide,slide?liveBall:null);'));
 assert.ok(source.includes('tackle(p,slide=false,slideBall=null){'));
 assert.ok(source.includes('defensivePokeBallSideRead(p,target,slideBall)?slideBall:null;'));
 assert.ok(source.includes('if(Math.random()<readChance)this.tackle(p,true,liveBall);'));
 assert.ok(source.includes('if(ball!==null&&!defensivePokeBallSideRead(defender,carrier,ball))return false;'));
 assert.ok(source.includes('GameEngine.prototype.defensivePokeBallSideRead=defensivePokeBallSideRead;'));
 assert.equal((source.match(/defensiveTackleSlideBallSideRead\(p,owner,liveBall,this\.playerSpeed\(p\)\)/g)||[]).length,2);
 assert.ok(source.includes('else if(carrierDistance<=98&&defensivePokeBallSideRead(p,owner,liveBall)&&defensiveFirstTouchSlide(p,owner,this.playerSpeed(p)))'));
 assert.ok(source.includes('GameEngine.prototype.defensiveTackleSlideBallSideRead=defensiveTackleSlideBallSideRead;'));
 assert.ok(source.includes('if(carrierDistance<74){'),
  'the primary presser retains its dedicated close-contact window');
});


test('a ball-side-qualified CPU slide aims through the exposed live ball, not the carrier body',()=>{
 const run=(makeBall)=>{
  const defender=player(0,1000,700,{moveVX:220,moveVY:0,dx:1,dy:0,face:1,src:{name:'defender',speedRating:50,defence:50}});
  const carrier=player(1,1055,700,{moveVX:300,moveVY:0});
  const ball=makeBall?makeBall(defender,carrier):null;
  const game={players:[defender,carrier],ball:{owner:carrier},spendStamina(){},
   playerSpeed(){return 320;},emit(){},slideContact(){return false;}};
  assert.equal(ENGINE.GameEngine.prototype.tackle.call(game,defender,true,ball),true);
  return {x:defender.slideDX,y:defender.slideDY};
 };
 const exposed=run((defender,carrier)=>({owner:carrier,x:carrier.x-17,y:carrier.y+20,z:12}));
 const body=run(()=>null);
 const shielded=run((defender,carrier)=>({owner:carrier,x:carrier.x+17,y:carrier.y+20,z:12}));
 const mismatched=run((defender,carrier)=>({owner:defender,x:carrier.x-17,y:carrier.y+20,z:12}));
 assert.ok(exposed.y>.2,JSON.stringify({exposed,body}));
 assert.ok(body.y<.01,JSON.stringify(body));
 assert.ok(shielded.y<.01,JSON.stringify(shielded));
 assert.ok(mismatched.y<.01,JSON.stringify(mismatched));
});


test('ground PASS pokes and SHOOT slides reject airborne or invalid-height carried balls',()=>{
 const defender=player(0,1000,700,{dx:1,dy:0,face:1,moveVX:240,moveVY:0});
 const carrier=player(1,1055,700,{moveVX:340,moveVY:0});
 const closeCarrier=player(1,1088,700,{moveVX:-240,moveVY:0});
 const ballFor=(target,z)=>({owner:target,x:target.x-17,y:target.y+12,z});
 const grounded=ballFor(carrier,19.99);
 assert.equal(ballSide(defender,carrier,grounded),true,'the last grounded unit remains contestable');
 assert.equal(slideBallSide(defender,carrier,grounded),true,'grounded exposed ball remains slide-eligible');
 assert.equal(commit(defender,closeCarrier,ballFor(closeCarrier,19.99)),true,
  'the existing early PASS window remains available at the grounded boundary');
 for(const z of [20,45,NaN,Infinity,undefined]){
  const aerial=ballFor(carrier,z),closeAerial=ballFor(closeCarrier,z);
  assert.equal(ballSide(defender,carrier,aerial),false,`ball height ${String(z)} cannot authorize a ground challenge`);
  assert.equal(slideBallSide(defender,carrier,aerial),false,`ball height ${String(z)} cannot authorize a SHOOT slide`);
  assert.equal(commit(defender,closeCarrier,closeAerial),false,
   `ball height ${String(z)} cannot authorize an early PASS poke`);
 }
});


test('the dedicated pressured first-touch slide read takes priority over a relative early poke',()=>{
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const dir=team===0?1:-1,defender=game.player(team,3),carrier=game.player(1-team,3);
  const field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
  for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
  Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,aiTimer:0,aiTarget:null,
   aiDetour:null,action:'idle',actionTimer:0,moveVX:dir*240,moveVY:0,dx:dir,dy:0,face:dir,
   sprintCharge:0,dashTimer:0,magicReadCounterpressTimer:0});
  Object.assign(carrier,{x:x+dir*85,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
   moveVX:dir*100,moveVY:0,firstTouchControlTimer:.16,firstTouchPressure:.8});
  Object.assign(game.ball,{owner:carrier,x:carrier.x-dir*17,y:y+12,z:12,vx:0,vy:0,vz:0,
   pass:false,shot:null,strike:null,ordinaryShot:false});
  game.clock=.5;game.activateDefence=()=>false;
  const calls=[];game.tackle=(who,slide,slideBall)=>{calls.push({who,slide,slideBall});who.cd=.5;return true;};
  const originalRandom=Math.random;Math.random=()=>0;
  try{game.driveAI(defender,.016);}finally{Math.random=originalRandom;}
  assert.equal(calls.length,1,'team '+team+' should make one first-touch challenge');
  assert.equal(calls[0].who,defender);
  assert.equal(calls[0].slide,true,'the extended first-touch read must not be consumed by an ordinary poke');
  assert.equal(calls[0].slideBall,game.ball,'the existing live-ball slide target remains intact');
  assert.equal(game.ball.owner,carrier,'the decision itself does not transfer possession');
 }
});


test('actual PASS poke aims through the exposed live ball and keeps body aim against shielding',()=>{
 for(const defendingTeam of [0,1]){
  const dir=defendingTeam===0?1:-1;
  const run=(exposed)=>{
   const game=new ENGINE.GameEngine({halfSeconds:120});
   game.init({home:0,away:1,mode:'quick',humans:0});
   const defender=game.player(defendingTeam,3),carrier=game.player(1-defendingTeam,3);
   const x=1000,y=700;
   for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
   Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
    moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
   Object.assign(carrier,{x:x+dir*52,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
    moveVX:0,moveVY:0});
   const ballX=carrier.x+(exposed?-dir*17:dir*17),ballY=y+12;
   Object.assign(game.ball,{owner:carrier,x:ballX,y:ballY,z:12,vx:0,vy:0,vz:0,
    pass:false,shot:null,strike:null,ordinaryShot:false});
   const expectedX=exposed?ballX-x:dir*52,expectedY=exposed?ballY-y:0;
   const expectedLength=Math.hypot(expectedX,expectedY);
   const originalRandom=Math.random;Math.random=()=>0;
   try{assert.equal(game.tackle(defender,false,game.ball),true);}finally{Math.random=originalRandom;}
   assert.equal(game.ball.owner,null,'a valid close-contact poke should release the carrier');
   assert.ok(Math.abs(game.ball.vx-expectedX/expectedLength*150)<1e-8,
    JSON.stringify({defendingTeam,exposed,vx:game.ball.vx,expectedX:expectedX/expectedLength*150}));
   assert.ok(Math.abs(game.ball.vy-expectedY/expectedLength*150)<1e-8,
    JSON.stringify({defendingTeam,exposed,vy:game.ball.vy,expectedY:expectedY/expectedLength*150}));
  };
  run(true);
  run(false);
 }
});
