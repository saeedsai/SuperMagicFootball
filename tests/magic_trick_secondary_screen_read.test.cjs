'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const render=fs.readFileSync('src/modules/render.js','utf8');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
async function loadAI(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();return (await import('../src/modules/ai.js')).AI;}
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
 const updateSource=extract(' updateMagicReadCue(p,dt){',' updateTeleportTrail(p,dt){','read cue timer');
 const update=vm.runInNewContext('({'+updateSource+'})').updateMagicReadCue;
 const defender={magicReadCueTimer:.48};
 assert.equal(update.call({},defender,.2),true);assert.ok(Math.abs(defender.magicReadCueTimer-.28)<1e-9);
 assert.equal(update.call({},defender,.5),false);assert.equal(defender.magicReadCueTimer,0);
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