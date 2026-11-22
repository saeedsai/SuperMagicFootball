'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const render=fs.readFileSync('src/modules/render.js','utf8');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
async function loadAI(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();return (await import('../src/modules/ai.js')).AI;}
async function loadEngine(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();return (await import('../src/modules/engine.js')).ENGINE;}
function carrier(overrides={}){return {t:0,x:100,y:400,dx:1,dy:0,face:1,firstTouchOutletReadTimer:.8,firstTouchControlTimer:0,firstTouchPressure:.6,hideBallTimer:0,...overrides};}
function defender(overrides={}){return {t:1,x:50,y:400,dx:0,dy:0,face:1,defence:80,stun:0,invuln:0,down:false,z:0,action:'idle',actionTimer:0,...overrides};}
function extract(startText,endText,label){
 const start=engine.indexOf(startText),end=engine.indexOf(endText,start);
 assert.ok(start>=0&&end>start,'extract '+label);
 return engine.slice(start,end);
}
test('a second defender screening the visible first-touch carry lane reads a trick when the nearest marker is turned away',async()=>{
 const AI=await loadAI(),p=carrier(),nearest=defender({x:55,face:-1}),screen=defender({x:165,face:-1,defence:92});
 const read=AI.defensiveMagicTrickReadTarget(p,[nearest,screen],true);
 assert.equal(read?.defender,screen);assert.equal(read?.screened,true);assert.equal(read?.gap,65);
 assert.equal(AI.defensiveMagicTrickReadTarget(p,[nearest,screen],false),null);
});
test('the first-touch screen read mirrors when the carrier attacks left',async()=>{
 const AI=await loadAI(),p=carrier({t:1,x:200,dx:-1,face:-1}),screen=defender({x:135,face:1});
 const read=AI.defensiveMagicTrickReadTarget(p,[screen],true);
 assert.equal(read?.defender,screen);assert.equal(read?.screened,true);
});

test('a successful screen reader narrows the visible forward lane on both attack directions',async()=>{
 const AI=await loadAI(),bounds={xMin:0,xMax:2000,yMin:0,yMax:1000};
 for(const team of [0,1]){
  const dir=team===0?1:-1,defending=1-team;
  const p=carrier({t:team,x:team===0?700:1300,dx:dir,dy:0,moveVX:dir*180,moveVY:0});
  const primary=defender({t:defending,x:p.x-dir*55,y:p.y,face:dir});
  const screen=defender({t:defending,x:p.x+dir*68,y:p.y+18,face:-dir,magicReadCounterpressTimer:.42});
  const target=AI.defensiveMagicReadCounterpressTarget(defending,p,[p,primary,screen],bounds,screen,primary);
  assert.ok(target,JSON.stringify({team,target}));
  const forward=(target.x-p.x)*dir;
  assert.ok(forward>=42&&forward<=72,'screen reader should close into the forward carry lane');
  assert.ok(Math.hypot(target.x-p.x,target.y-p.y)>=45&&Math.hypot(target.x-p.x,target.y-p.y)<=82);
  assert.ok(Math.hypot(target.x-primary.x,target.y-primary.y)>=38,'the primary remains spatially distinct');
  assert.ok(target.x>=24&&target.x<=1976&&target.y>=24&&target.y<=976);
 }
});
test('screen-read counterpress rejects expired, hidden, backward, unavailable and human-owned states',async()=>{
 const AI=await loadAI(),bounds={xMin:0,xMax:2000,yMin:0,yMax:1000};
 const p=carrier({t:0,x:700,dx:1,dy:0,moveVX:180,moveVY:0});
 const primary=defender({t:1,x:645,y:400,face:1});
 const screen=defender({t:1,x:768,y:418,face:-1,magicReadCounterpressTimer:.42});
 const players=[p,primary,screen],args=[1,p,players,bounds,screen,primary];
 assert.equal(AI.defensiveMagicReadCounterpressTarget(1,p,players,bounds,{...screen,magicReadCounterpressTimer:0},primary),null);
 assert.equal(AI.defensiveMagicReadCounterpressTarget(...args,screen),null,'human-controlled reader cannot be moved by CPU');
 assert.equal(AI.defensiveMagicReadCounterpressTarget(1,{...p,hideBallTimer:.2},players,bounds,screen,primary),null);
 assert.equal(AI.defensiveMagicReadCounterpressTarget(1,{...p,moveVX:-180},players,bounds,screen,primary),null);
 assert.equal(AI.defensiveMagicReadCounterpressTarget(1,p,players,bounds,{...screen,down:true},primary),null);
 assert.equal(AI.defensiveMagicReadCounterpressTarget(1,p,players,bounds,screen,{...primary,x:950}),null);
});

test('ordinary Magic Trick reads still require a nearby active defender closing and facing the carrier',async()=>{
 const AI=await loadAI(),p=carrier({firstTouchOutletReadTimer:0,firstTouchPressure:0}),closing=defender({x:50,dx:1,face:1});
 const read=AI.defensiveMagicTrickReadTarget(p,[closing],true);
 assert.equal(read?.defender,closing);assert.equal(read?.screened,false);
 assert.equal(AI.defensiveMagicTrickReadTarget(p,[{...closing,face:-1}],true),null);
 assert.equal(AI.defensiveMagicTrickReadTarget(p,[{...closing,dx:0}],true),null);
});
test('unavailable, airborne, recovering, hidden-ball and backwards first-touch states cannot create a lane read',async()=>{
 const AI=await loadAI(),p=carrier(),screen=defender({x:165,face:-1});
 for(const patch of [{down:true},{stun:.2},{invuln:.2},{z:30},{action:'shotDown'},{action:'shotGetUp'},
  {action:'slide',actionTimer:.2},{action:'hurt',actionTimer:.2},{shotImpactKnockdownPending:.2},
  {shotImpactKnockdownTimer:.2},{shotImpactRiseTimer:.2}]){
  assert.equal(AI.defensiveMagicTrickReadTarget(p,[{...screen,...patch}],true),null);
 }
 assert.equal(AI.defensiveMagicTrickReadTarget({...p,hideBallTimer:.3},[screen],true),null);
 assert.equal(AI.defensiveMagicTrickReadTarget({...p,firstTouchOutletReadTimer:0},[screen],true),null);
 assert.equal(AI.defensiveMagicTrickReadTarget({...p,dx:-1},[screen],true),null);
});
test('the read cue decays in simulation time and is rendered as steady reduced-flash-safe feedback',()=>{
 const updateSource=extract(' updateMagicReadCue(p,dt){',' updateMagicReadCounterpress(p,dt){','read cue timer');
 const counterpressSource=extract(' updateMagicReadCounterpress(p,dt){',' updateTeleportTrail(p,dt){','counterpress timer');
 const updateCounterpress=vm.runInNewContext('({'+counterpressSource+'})').updateMagicReadCounterpress;
 const update=vm.runInNewContext('({'+updateSource+'})').updateMagicReadCue;
 const defender={magicReadCueTimer:.48};
 assert.equal(update.call({},defender,.2),true);assert.ok(Math.abs(defender.magicReadCueTimer-.28)<1e-9);
 assert.equal(update.call({},defender,.5),false);assert.equal(defender.magicReadCueTimer,0);
 const reader={magicReadCounterpressTimer:.42};
 assert.equal(updateCounterpress.call({},reader,.16),true);assert.ok(Math.abs(reader.magicReadCounterpressTimer-.26)<1e-9);
 assert.equal(updateCounterpress.call({},reader,.3),false);assert.equal(reader.magicReadCounterpressTimer,0);
 assert.match(render,/function drawMagicReadCue\(ctx,p,reducedFlash=false\)/);
 assert.match(render,/strokeText\('READ!',0,-130\)/);
});
test('the real named Magic Trick resolver applies the screen read, while ordinary Dribble Styles keep their own odds',async()=>{
 const AI=await loadAI();
 const trickSource=extract(' tryMagicTrick(p){',' updateSpinBumpFx(p,dt){','live named Magic Trick resolver');
 const dribbleSource=extract(' tryDribbleTrick(p,byAI=false){',' // Safety is evaluated at release time;','ordinary Dribble Style resolver');
 assert.doesNotMatch(dribbleSource,/defensiveMagicTrickReadTarget|readBonus/);
 function attempt(screenAvailable){
  const p=carrier();
  p.src={id:'carrier',name:'Carrier',magicTrick:'hideBall',dribbling:90};
  p.magicReadyAt=0;p.fatigue=0;p.keeper=false;p.stun=0;p.z=0;
  const nearest=defender({x:55,face:-1,dx:0});
  nearest.src={id:'nearest',name:'Nearest',defence:20};
  const screen=defender({x:165,face:-1,dx:0,defence:92});
  screen.src={id:'screen',name:'Screen',defence:92};
  if(!screenAvailable){screen.down=true;screen.stun=1;}
  const game={ball:{owner:p},players:[p,nearest,screen],clock:2,magicHazards:[],fatigueLedger:[{},{}],events:[],
   burst(){},emit(type,payload){this.events.push({type,...payload});}};
  const deterministicMath=Object.create(Math);deterministicMath.random=()=>.1;
  const resolve=vm.runInNewContext('({'+trickSource+'})',{
   F:mechanics.world.field,
   distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
   norm:(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};},
   clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
   stat:(q,key)=>q?.src?.[key]??50,
   STATS:{verifiedRatingTierForPlayer:()=>null},
   placeBananaPeel:()=>[],placeIcePatch:()=>[],
   defensiveMagicTrickReadTarget:AI.defensiveMagicTrickReadTarget,
   Math:deterministicMath
  }).tryMagicTrick;
  assert.equal(resolve.call(game,p),true);
  return {player:p,game,event:game.events.at(-1),reader:screen};
 }
 const open=attempt(false),screened=attempt(true);
 assert.equal(open.event.countered,false,'a turned-away nearest marker alone does not read Hide Ball');
 assert.equal(open.player.hideBallTimer,.65,'unread Magic Trick still activates');
 assert.equal(open.reader.magicReadCueTimer||0,0,'a turned-away nearest marker alone gets no read cue');
 assert.equal(screened.event.countered,true,'the visible second-defender screen can read the named Magic Trick');
 assert.equal(screened.player.hideBallTimer||0,0,'a read cancels the trick effect');
 assert.equal(screened.reader.magicReadCueTimer,.48,'the actual screen reader receives the brief visual cue');
 assert.equal(screened.game.ball.owner,screened.player,'the read does not award an automatic tackle or possession');
 assert.equal(screened.player.magicReadyAt,8,'the caster still pays the normal six-second cooldown');
 assert.equal(screened.player.fatigue,.035,'the caster still pays the normal fatigue cost');
}); 
test('real engine sends the successful screen reader into a short counterpress while the primary keeps pressing',async()=>{
 const ENGINE=await loadEngine(),field=ENGINE.WORLD.field;
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,humans:0,mode:'quick'});
  const defending=1-team,dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
  const carrier=game.player(team,3),primary=game.player(defending,3),screen=game.player(defending,4);
  for(const q of game.players)if(q!==carrier&&q!==primary&&q!==screen&&!q.keeper){q.down=true;q.stun=1;}
  Object.assign(carrier,{x,y,z:0,down:false,stun:0,keeper:false,action:'idle',actionTimer:0,
   dx:dir,dy:0,moveVX:dir*180,moveVY:0,face:dir,firstTouchOutletReadTimer:.8,
   firstTouchControlTimer:0,firstTouchPressure:.6,hideBallTimer:0,magicReadyAt:0,
   magicReadCueTimer:0,magicReadCounterpressTimer:0,fatigue:0,aiTimer:0,aiTarget:null,cd:1});
  Object.assign(carrier.src,{magicTrick:'hideBall',dribbling:90});
  Object.assign(primary,{x:x-dir*30,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   dx:0,dy:0,moveVX:0,moveVY:0,face:dir,aiTimer:0,aiTarget:null,cd:1});
  Object.assign(screen,{x:x+dir*68,y:y+18,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   dx:0,dy:0,moveVX:0,moveVY:0,face:-dir,aiTimer:0,aiTarget:null,cd:1});
  game.ball.owner=carrier;game.ball.x=x;game.ball.y=y;game.ball.z=0;game.ball.lastTouchTeam=team;
  game.clock=10;
  const oldRandom=Math.random;Math.random=()=>.1;
  try{assert.equal(game.tryMagicTrick(carrier),true);}finally{Math.random=oldRandom;}
  assert.equal(game.events.at(-1)?.countered,true,'the visible screen should read the named trick');
  assert.equal(screen.magicReadCounterpressTimer,.42);
  game.driveAI(screen,.016);
  assert.ok(screen.aiTarget,JSON.stringify({team,target:screen.aiTarget}));
  const forward=(screen.aiTarget.x-carrier.x)*dir;
  assert.ok(forward>=42&&forward<=72,'the second defender should close the forward lane');
  assert.equal(screen.action,'idle','the movement-only counterpress must not auto-tackle');
  game.driveAI(primary,.016);
  assert.ok(Math.hypot(primary.aiTarget.x-carrier.x,primary.aiTarget.y-carrier.y)<50,
   'the original primary presser must continue to close the carrier');
 }
});

test('primary named Magic Trick and delayed Lightning counters read the defender\'s actual 2D heading on both teams',async()=>{
 const ENGINE=await loadEngine();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const cases=[
   {name:'vertical front',carrier:{x:300,y:250},defender:{x:300,y:300,dx:0,dy:-1,face:1},countered:true},
   {name:'vertical rear',carrier:{x:300,y:350},defender:{x:300,y:300,dx:0,dy:-1,face:1},countered:false},
   {name:'diagonal front',carrier:{x:300+dir*50,y:350},defender:{x:300,y:300,dx:dir,dy:1,face:-dir},countered:true},
   {name:'diagonal rear',carrier:{x:300-dir*50,y:250},defender:{x:300,y:300,dx:dir,dy:1,face:-dir},countered:false},
   {name:'horizontal front',carrier:{x:300+dir*50,y:300},defender:{x:300,y:300,dx:dir,dy:0,face:dir},countered:true},
   {name:'horizontal rear',carrier:{x:300-dir*50,y:300},defender:{x:300,y:300,dx:dir,dy:0,face:dir},countered:false}
  ];
  for(const sample of cases){
   const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,humans:0,mode:'quick'});
   const p=game.player(team,3),q=game.player(1-team,3);
   for(const other of game.players)if(other!==p&&other!==q&&!other.keeper){other.down=true;other.stun=1;}
   Object.assign(p,{x:sample.carrier.x,y:sample.carrier.y,z:0,down:false,stun:0,keeper:false,
    action:'idle',actionTimer:0,firstTouchOutletReadTimer:0,firstTouchPressure:0,
    firstTouchControlTimer:0,hideBallTimer:0,magicReadyAt:0,fatigue:0,lightningPending:null});
   Object.assign(p.src,{magicTrick:'hideBall',dribbling:60});
   Object.assign(q,{x:sample.defender.x,y:sample.defender.y,z:0,down:false,stun:0,invuln:0,keeper:false,
    action:'idle',actionTimer:0,dx:sample.defender.dx,dy:sample.defender.dy,
    moveVX:sample.defender.dx*180,moveVY:sample.defender.dy*180,face:sample.defender.face});
   Object.assign(q.src,{defence:95});
   game.ball.owner=p;game.ball.x=p.x;game.ball.y=p.y;game.ball.z=0;game.clock=10;
   assert.equal(game.tryMagicTrick(p),true);
   assert.equal(game.events.at(-1)?.countered,sample.countered,`Hide Ball ${sample.name}, team ${team}`);
   assert.equal(p.hideBallTimer||0,sample.countered?0:.65);
   q.action='idle';q.actionTimer=0;q.stun=0;q.z=0;q.lightningMark=.32;
   p.lightningPending={remaining:.32,target:q};
   const resolved=game.resolveLightningTrick(p);
   assert.equal(game.events.at(-1)?.type,'lightningTrickResolved');
   assert.equal(game.events.at(-1)?.countered,sample.countered,`Lightning ${sample.name}, team ${team}`);
   assert.equal(resolved,!sample.countered,`Lightning hit result ${sample.name}, team ${team}`);
  }
 }
});
