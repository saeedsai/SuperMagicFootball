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

test('second-defender Magic Trick screen reads require the live ball on the defender-facing side',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,p=carrier({t:team,x:team===0?100:200,dx:dir,face:dir});
  const screen=defender({t:1-team,x:p.x+dir*68,y:p.y+18,face:-dir});
  const exposed={owner:p,x:p.x+dir*17,y:p.y+12};
  const shielded={owner:p,x:p.x-dir*17,y:p.y+12};
  const read=AI.defensiveMagicTrickReadTarget(p,[screen],true,exposed);
  assert.equal(read?.defender,screen,JSON.stringify({team,read}));
  assert.equal(read?.screened,true,'the live ball is presented toward the screening defender');
  assert.equal(AI.defensiveMagicTrickReadTarget(p,[screen],true,shielded),null,
   'far-side shielding must not grant an omniscient second-defender read');
  assert.equal(AI.defensiveMagicTrickReadTarget(p,[screen],true,{owner:{},x:p.x+17,y:p.y+12}),null,
   'a ball owned by another player cannot grant the read');
  assert.equal(AI.defensiveMagicTrickReadTarget(p,[screen],true,{owner:p,x:p.x+40,y:p.y+12}),null,
   'a stale ball outside the carrier envelope cannot grant the read');
  const closing=defender({t:1-team,x:p.x-dir*12,y:p.y,face:dir,dx:dir,dy:0});
  const ordinary=AI.defensiveMagicTrickReadTarget(p,[closing],true,shielded);
  assert.equal(ordinary?.defender,closing);
  assert.equal(ordinary?.screened,false,'the ball-side gate only restricts the second-defender screen read');
 }
});
test('second-defender screen reads require a two-dimensional heading toward the carrier',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,p=carrier({t:team,x:team===0?100:200,dx:dir,dy:0,face:dir});
  const exposed={owner:p,x:p.x+dir*17,y:p.y+12};
  const base=defender({t:1-team,x:p.x+dir*68,y:p.y+18,face:-dir});
  const perpendicular={...base,dx:0,dy:1};
  assert.equal(AI.defensiveMagicTrickReadTarget(p,[perpendicular],true,exposed),null,
   'a perpendicular 2D heading must reject the screen even when horizontal face matches');
  const movementPerpendicular={...base,dx:0,dy:0,moveVX:0,moveVY:1};
  assert.equal(AI.defensiveMagicTrickReadTarget(p,[movementPerpendicular],true,exposed),null,
   'movement velocity is the fallback heading when dx/dy are stationary');
  const diagonalToward={...base,dx:-dir,dy:-.25};
  assert.equal(AI.defensiveMagicTrickReadTarget(p,[diagonalToward],true,exposed)?.defender,diagonalToward,
   'a diagonal heading with a positive carrier-facing component remains eligible');
  const faceFallback={...base,dx:0,dy:0,moveVX:0,moveVY:0};
  assert.equal(AI.defensiveMagicTrickReadTarget(p,[faceFallback],true,exposed)?.defender,faceFallback,
   'stationary defenders retain the existing horizontal-facing fallback');
 }
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
test('screen-read counterpress follows live directional input before residual carrier momentum',async()=>{
 const AI=await loadAI(),bounds={xMin:0,xMax:2000,yMin:0,yMax:1000};
 for(const team of [0,1]){
  const dir=team===0?1:-1,defending=1-team,x=team===0?700:1300,y=400;
  const primary=defender({t:defending,x:x-dir*55,y,face:dir});
  const screen=defender({t:defending,x:x+dir*68,y:y+18,face:-dir,magicReadCounterpressTimer:.42});
  const diagonalCarrier=carrier({t:team,x,y,dx:dir*.8,dy:.6,moveVX:dir*180,moveVY:0});
  const diagonal=AI.defensiveMagicReadCounterpressTarget(defending,diagonalCarrier,
   [diagonalCarrier,primary,screen],bounds,screen,primary);
  assert.ok(diagonal,JSON.stringify({team,diagonal}));
  assert.ok(Math.abs(diagonal.y-y)>25,
   'a live diagonal cut must move the counterpress target into the new lane, not stale horizontal momentum');
  const neutralCarrier={...diagonalCarrier,dx:0,dy:0};
  const neutral=AI.defensiveMagicReadCounterpressTarget(defending,neutralCarrier,
   [neutralCarrier,primary,screen],bounds,screen,primary);
  assert.ok(neutral,JSON.stringify({team,neutral}));
  assert.ok(Math.abs(neutral.y-y)<20,
   'when input releases, residual horizontal movement remains the fallback');
  const backwardCarrier={...diagonalCarrier,dx:-dir,dy:0};
  assert.equal(AI.defensiveMagicReadCounterpressTarget(defending,backwardCarrier,
   [backwardCarrier,primary,screen],bounds,screen,primary),null,
   'a backward live input must not inherit the previous forward momentum counterpress');
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
 assert.equal(AI.defensiveMagicReadCounterpressTarget(1,{...p,dx:0,dy:0,moveVX:-180,moveVY:0},players,bounds,screen,primary),null);
 const turnedAfterRead={...screen,face:1},turnedPlayers=[p,primary,turnedAfterRead];
 assert.ok(AI.defensiveMagicReadCounterpressTarget(1,p,turnedPlayers,bounds,turnedAfterRead,primary),
  'the successful read timer remains actionable when the defender turns toward its lane assignment');
 assert.equal(AI.defensiveMagicReadCounterpressTarget(1,p,players,bounds,{...screen,down:true},primary),null);
 assert.equal(AI.defensiveMagicReadCounterpressTarget(1,p,players,bounds,screen,{...primary,x:950}),null);
});

test('ordinary Magic Trick reads still require a nearby active defender closing and facing the carrier',async()=>{
 const AI=await loadAI(),p=carrier({firstTouchOutletReadTimer:0,firstTouchPressure:0}),closing=defender({x:50,dx:1,face:1});
 const read=AI.defensiveMagicTrickReadTarget(p,[closing],true);
 assert.equal(read?.defender,closing);assert.equal(read?.screened,false);
 assert.equal(AI.defensiveMagicTrickReadTarget(p,[{...closing,face:-1,dx:0,dy:0,moveVX:0,moveVY:0}],true),null,
  'the stationary horizontal-facing fallback must reject a defender turned away');
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
 assert.match(render,/function drawMagicReadCue\(ctx,p,reducedFlash=false,logicalScale=1,viewSide=1\)/);
 const playerRenderer=render.slice(render.indexOf(' drawPlayer(ctx,p,game){'),render.indexOf(' drawPenaltyPlayers(ctx,g){'));
 const cueIndex=playerRenderer.indexOf('drawMagicReadCue(ctx,p,');
 assert.ok(cueIndex>0,'production renderer calls the READ! cue');
 const cuePrefix=playerRenderer.slice(Math.max(0,cueIndex-600),cueIndex);
 const finalRestore=cuePrefix.lastIndexOf('ctx.restore();');
 const worldTranslate=cuePrefix.indexOf('ctx.translate(p.x,p.y-',finalRestore);
 assert.ok(finalRestore>=0&&worldTranslate>finalRestore,'cue is anchored after character-local transforms in world coordinates');
 const cueCall=playerRenderer.slice(cueIndex,playerRenderer.indexOf(';',cueIndex)+1);
 assert.match(cueCall,/Math\.max\(\.12,Math\.min\(3,/);
 assert.match(cueCall,/Number\(this\.scale\)\|\|1/);
 assert.match(cueCall,/Number\(this\.dpr\)\|\|1/);
 assert.match(cueCall,/Number\(this\.cameraZoom\)\|\|1/);
 assert.match(cueCall,/,\s*1\);$/,'world-space label must not inherit character mirroring');
 assert.doesNotMatch(cueCall,/view\.side/);
 assert.match(render,/strokeText\('READ!',0,-130\)/);
});
test('the real named Magic Trick resolver applies the screen read, while ordinary Dribble Styles keep their own odds',async()=>{
 const AI=await loadAI();
 const trickSource=extract(' tryMagicTrick(p){',' updateSpinBumpFx(p,dt){','live named Magic Trick resolver');
 const dribbleSource=extract(' tryDribbleTrick(p,byAI=false){',' // Safety is evaluated at release time;','ordinary Dribble Style resolver');
 assert.doesNotMatch(dribbleSource,/defensiveMagicTrickReadTarget|readBonus/);
 function attempt(screenAvailable,ballSide='exposed',dribbling=90,defence=92,randomValue=.1){
  const p=carrier();
  p.src={id:'carrier',name:'Carrier',magicTrick:'hideBall',dribbling};
  p.magicReadyAt=0;p.fatigue=0;p.keeper=false;p.stun=0;p.z=0;
  const nearest=defender({x:55,face:-1,dx:0});
  nearest.src={id:'nearest',name:'Nearest',defence:20};
  const screen=defender({x:165,face:-1,dx:0,defence:92});
  screen.src={id:'screen',name:'Screen',defence};
  if(!screenAvailable){screen.down=true;screen.stun=1;}
  const ballOffset=ballSide==='shielded'?-17:17;
  const game={ball:{owner:p,x:p.x+ballOffset,y:p.y+12},players:[p,nearest,screen],clock:2,magicHazards:[],fatigueLedger:[{},{}],events:[],
   burst(){},emit(type,payload){this.events.push({type,...payload});}};
  const deterministicMath=Object.create(Math);deterministicMath.random=()=>randomValue;
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
 const open=attempt(false),screened=attempt(true),shielded=attempt(true,'shielded');
 const lowSkill=attempt(true,'exposed',1,92,.22);
 const averageSkill=attempt(true,'exposed',50,92,.22);
 const eliteSkill=attempt(true,'exposed',100,92,.22);
 const minimumChance=attempt(true,'exposed',100,1,.039);
 const belowMinimumChance=attempt(true,'exposed',100,1,.041);
 const maximumChance=attempt(true,'exposed',1,100,.279);
 const aboveMaximumChance=attempt(true,'exposed',1,100,.281);
 assert.equal(lowSkill.event.countered,true,'low Dribbling makes the named trick more readable');
 assert.equal(averageSkill.event.countered,true,'neutral Dribbling preserves the established defender-based chance');
 assert.equal(eliteSkill.event.countered,false,'elite Dribbling resists the same screen-read roll');
 assert.equal(lowSkill.reader.magicReadCueTimer,.48);
 assert.equal(averageSkill.reader.magicReadCueTimer,.48);
 assert.equal(eliteSkill.reader.magicReadCueTimer||0,0);
 assert.equal(lowSkill.player.magicReadyAt,averageSkill.player.magicReadyAt);
 assert.equal(averageSkill.player.magicReadyAt,eliteSkill.player.magicReadyAt);
 assert.equal(lowSkill.player.fatigue,averageSkill.player.fatigue);
 assert.equal(averageSkill.player.fatigue,eliteSkill.player.fatigue);
 assert.equal(minimumChance.event.countered,true,'the 4% lower bound remains inclusive');
 assert.equal(belowMinimumChance.event.countered,false,'the 4% lower bound rejects a roll just above it');
 assert.equal(maximumChance.event.countered,true,'the 28% upper bound remains inclusive');
 assert.equal(aboveMaximumChance.event.countered,false,'the 28% upper bound rejects a roll just above it');
 assert.equal(open.event.countered,false,'a turned-away nearest marker alone does not read Hide Ball');
 assert.equal(open.player.hideBallTimer,.65,'unread Magic Trick still activates');
 assert.equal(open.reader.magicReadCueTimer||0,0,'a turned-away nearest marker alone gets no read cue');
 assert.equal(screened.event.countered,true,'the visible second-defender screen can read the named Magic Trick');
 assert.equal(screened.player.hideBallTimer||0,0,'a read cancels the trick effect');
 assert.equal(screened.reader.magicReadCueTimer,.48,'the actual screen reader receives the brief visual cue');
 assert.equal(screened.game.ball.owner,screened.player,'the read does not award an automatic tackle or possession');
 assert.equal(shielded.event.countered,false,'a far-side shield prevents the second-defender read');
 assert.equal(shielded.player.hideBallTimer,.65,'shielded Hide Ball activates normally');
 assert.equal(shielded.reader.magicReadCueTimer||0,0,'a shielded ball gives the screen no READ! cue');
 assert.equal(screened.player.magicReadyAt,8,'the caster still pays the normal six-second cooldown');
 assert.equal(screened.player.fatigue,.035,'the caster still pays the normal fatigue cost');
}); 
test('real engine grants the screen counter only when the live ball is exposed, mirrored on both teams',async()=>{
 const ENGINE=await loadEngine(),field=ENGINE.WORLD.field;
 for(const team of [0,1])for(const ballSide of ['exposed','shielded']){
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
  Object.assign(screen,{x:x+dir*70,y:y+18,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   dx:0,dy:0,moveVX:0,moveVY:0,face:-dir,aiTimer:0,aiTarget:null,cd:1});
  game.ball.owner=carrier;game.ball.x=x+(ballSide==='exposed'?dir*17:-dir*17);game.ball.y=y+12;game.ball.z=0;game.ball.lastTouchTeam=team;
  game.clock=10;
  const oldRandom=Math.random;Math.random=()=>.1;
  try{assert.equal(game.tryMagicTrick(carrier),true);}finally{Math.random=oldRandom;}
  const readExpected=ballSide==='exposed';
  assert.equal(game.events.at(-1)?.countered,readExpected,JSON.stringify({team,ballSide,event:game.events.at(-1)}));
  if(readExpected){
   assert.equal(screen.magicReadCounterpressTimer,.42);
   assert.equal(screen.magicReadCueTimer,.48);
   // The read has been proved; clear its first-touch window to exercise the
   // counterpress fallback separately from established first-touch cover.
   carrier.firstTouchOutletReadTimer=0;
   // The player cuts diagonally after the successful read while old horizontal
   // momentum remains; the second defender must update to the live input lane.
   Object.assign(carrier,{dx:dir*.8,dy:.6});
   game.driveAI(screen,.016);
   assert.ok(screen.aiTarget,JSON.stringify({team,target:screen.aiTarget}));
   const forward=(screen.aiTarget.x-carrier.x)*dir;
   assert.ok(forward>=42&&forward<=72,'the second defender should close the live forward lane');
   assert.ok(Math.abs(screen.aiTarget.y-carrier.y)>20,
    'the actual engine counterpress should follow the carrier diagonal input instead of stale momentum');
   assert.equal(screen.action,'idle','the movement-only counterpress must not auto-tackle');
   assert.ok(Math.hypot(screen.aiTarget.x-carrier.x,screen.aiTarget.y-carrier.y)<=82,
    'the earned screen reader must keep the bounded counterpress lane target');
   game.driveAI(primary,.016);
   assert.ok(Math.hypot(primary.aiTarget.x-carrier.x,primary.aiTarget.y-carrier.y)<50,
    'the original primary presser must continue to close the carrier');
  }else{
   assert.equal(carrier.hideBallTimer,.65,'far-side shielding lets the named trick proceed');
   assert.equal(screen.magicReadCounterpressTimer||0,0);
   assert.equal(screen.magicReadCueTimer||0,0);
  }
 }
});
test('the real Magic Trick screen read is a bounded Defence-versus-Dribbling contest on both teams',async()=>{
 const ENGINE=await loadEngine();
 const profiles=[
  {name:'low Dribbling',dribbling:1,roll:.22,countered:true},
  {name:'neutral Dribbling',dribbling:50,roll:.22,countered:true},
  {name:'elite Dribbling',dribbling:100,roll:.22,countered:false}
 ];
 for(const team of [0,1])for(const profile of profiles){
  const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,humans:0,mode:'quick'});
  const defending=1-team,dir=team===0?1:-1,field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
  const carrier=game.player(team,3),primary=game.player(defending,3),screen=game.player(defending,4);
  for(const q of game.players)if(q!==carrier&&q!==primary&&q!==screen&&!q.keeper){q.down=true;q.stun=1;}
  Object.assign(carrier,{x,y,z:0,down:false,stun:0,keeper:false,action:'idle',actionTimer:0,
   dx:dir,dy:0,moveVX:dir*180,moveVY:0,face:dir,firstTouchOutletReadTimer:.8,
   firstTouchControlTimer:0,firstTouchPressure:.6,hideBallTimer:0,magicReadyAt:0,
   magicReadCueTimer:0,magicReadCounterpressTimer:0,fatigue:0,aiTimer:0,aiTarget:null,cd:1});
  Object.assign(carrier.src,{magicTrick:'hideBall',dribbling:profile.dribbling});
  Object.assign(primary,{x:x-dir*30,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   dx:0,dy:0,moveVX:0,moveVY:0,face:dir,aiTimer:0,aiTarget:null,cd:1});
  Object.assign(screen,{x:x+dir*70,y:y+18,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   dx:0,dy:0,moveVX:0,moveVY:0,face:-dir,aiTimer:0,aiTarget:null,cd:1});
  Object.assign(screen.src,{defence:92});
  game.ball.owner=carrier;game.ball.x=x+dir*17;game.ball.y=y+12;game.ball.z=0;game.ball.lastTouchTeam=team;
  game.clock=10;
  const oldRandom=Math.random;Math.random=()=>profile.roll;
  try{assert.equal(game.tryMagicTrick(carrier),true);}finally{Math.random=oldRandom;}
  assert.equal(game.events.at(-1)?.countered,profile.countered,JSON.stringify({team,profile,event:game.events.at(-1)}));
  assert.equal(screen.magicReadCueTimer||0,profile.countered ? .48 : 0);
  assert.equal(screen.magicReadCounterpressTimer||0,profile.countered ? .42 : 0);
  assert.equal(carrier.hideBallTimer||0,profile.countered ? 0 : .65);
  assert.equal(carrier.magicReadyAt,16,'the caster always pays the same cooldown');
  assert.equal(carrier.fatigue,.035,'the caster always pays the same fatigue');
  assert.equal(game.ball.owner,carrier,'a probabilistic screen read does not award possession');
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


test('direct named Magic Trick counters recognize residual 2D movement after directional input releases, but not stationary facing',async()=>{
 const ENGINE=await loadEngine(),field=ENGINE.WORLD.field;
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
  const cases=[
   {mode:'approach',moveVX:dir*144,moveVY:-108,countered:true},
   {mode:'retreat',moveVX:-dir*144,moveVY:108,countered:false},
   {mode:'stationary',moveVX:0,moveVY:0,countered:false}
  ];
  for(const sample of cases){
   const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,humans:0,mode:'quick'});
   const carrier=game.player(team,3),defender=game.player(1-team,3);
   for(const other of game.players)if(other!==carrier&&other!==defender&&!other.keeper){other.down=true;other.stun=1;}
   Object.assign(carrier,{x,y,z:0,down:false,stun:0,keeper:false,action:'idle',actionTimer:0,
    dx:dir,dy:0,moveVX:dir*180,moveVY:0,face:dir,firstTouchOutletReadTimer:0,
    firstTouchControlTimer:0,firstTouchPressure:0,hideBallTimer:0,magicReadyAt:0,fatigue:0});
   Object.assign(carrier.src,{magicTrick:'hideBall',dribbling:50});
   Object.assign(defender,{x:x-dir*50,y:y+30,z:0,down:false,stun:0,keeper:false,
    action:'idle',actionTimer:0,dx:0,dy:0,moveVX:sample.moveVX,moveVY:sample.moveVY,face:dir});
   Object.assign(defender.src,{defence:95});
   Object.assign(game.ball,{owner:carrier,x:x+dir*12,y,z:0,pass:false,passTarget:null,
    attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
   game.clock=2;
   assert.equal(game.tryMagicTrick(carrier),true);
   assert.equal(game.events.at(-1)?.countered,sample.countered,JSON.stringify({team,...sample}));
   assert.equal(carrier.hideBallTimer||0,sample.countered?0:.65,
    'only a defender with actual approach movement may counter after input release');
   assert.equal(game.ball.owner,carrier,'the counter does not award automatic possession');
   assert.equal(carrier.magicReadyAt,8,'the caster pays the same cooldown');
   assert.equal(carrier.fatigue,.035,'the caster pays the same fatigue');
  }
 }
});


test('direct named Magic Trick reads search past the nearest idle marker for a closing second defender',async()=>{
 const ENGINE=await loadEngine(),field=ENGINE.WORLD.field;
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
  const cases=[
   {mode:'approach',moveVX:dir*150,moveVY:-30,defence:95,offset:58,countered:true},
   {mode:'retreat',moveVX:-dir*150,moveVY:30,defence:95,offset:58,countered:false},
   {mode:'stationary',moveVX:0,moveVY:0,defence:95,offset:58,countered:false},
   {mode:'glancing',moveVX:dir*35,moveVY:95,defence:95,offset:58,countered:false},
   {mode:'low-defence',moveVX:dir*150,moveVY:-30,defence:49,offset:58,countered:false},
   {mode:'equal-skill',moveVX:dir*150,moveVY:-30,defence:50,offset:58,countered:true},
   {mode:'outside-range',moveVX:dir*150,moveVY:-30,defence:95,offset:110,countered:false}
  ];
  for(const sample of cases){
   const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,humans:0,mode:'quick'});
   const carrier=game.player(team,3),nearest=game.player(1-team,3),second=game.player(1-team,4);
   for(const other of game.players)if(other!==carrier&&other!==nearest&&other!==second&&!other.keeper){other.down=true;other.stun=1;}
   Object.assign(carrier,{x,y,z:0,down:false,stun:0,keeper:false,action:'idle',actionTimer:0,
    dx:dir,dy:0,moveVX:dir*180,moveVY:0,face:dir,firstTouchOutletReadTimer:0,
    firstTouchControlTimer:0,firstTouchPressure:0,hideBallTimer:0,magicReadyAt:0,fatigue:0});
   Object.assign(carrier.src,{magicTrick:'hideBall',dribbling:50});
   Object.assign(nearest,{x:x-dir*25,y,z:0,down:false,stun:0,keeper:false,action:'idle',actionTimer:0,
    dx:0,dy:0,moveVX:0,moveVY:0,face:-dir,magicReadCueTimer:0});
   Object.assign(nearest.src,{defence:20});
   Object.assign(second,{x:x-dir*sample.offset,y:y+15,z:0,down:false,stun:0,keeper:false,action:'idle',actionTimer:0,
    dx:0,dy:0,moveVX:sample.moveVX,moveVY:sample.moveVY,face:dir,magicReadCueTimer:0});
   Object.assign(second.src,{defence:sample.defence});
   Object.assign(game.ball,{owner:carrier,x:x+dir*12,y,z:0,pass:false,passTarget:null,
    attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
   game.clock=2;
   assert.equal(game.tryMagicTrick(carrier),true);
   assert.equal(game.events.at(-1)?.countered,sample.countered,JSON.stringify({team,...sample}));
   assert.equal(carrier.hideBallTimer||0,sample.countered?0:.65);
   assert.equal(second.magicReadCueTimer||0,sample.countered ? .48 : 0,
    'the closest eligible second defender receives the READ! cue');
   assert.equal(nearest.magicReadCueTimer||0,0,'the nearest idle/turned-away marker is not credited');
   assert.equal(second.magicReadCounterpressTimer||0,0,'a direct read does not add an automatic counterpress');
   assert.equal(game.ball.owner,carrier,'the read never awards automatic possession');
   assert.equal(carrier.magicReadyAt,8,'the caster pays the same cooldown');
   assert.equal(carrier.fatigue,.035,'the caster pays the same fatigue');
  }
 }
});

test('direct named Magic Trick reads reject unavailable defenders and glancing lateral movement',async()=>{
 const ENGINE=await loadEngine(),field=ENGINE.WORLD.field;
 const unavailable=[
  {name:'downed',patch:{down:true}},
  {name:'invulnerable',patch:{invuln:.2}},
  {name:'airborne',patch:{z:24}},
  {name:'slide timer',patch:{slideTimer:.2}},
  {name:'active slide recovery',patch:{action:'slide',actionTimer:.3}},
  {name:'active hurt recovery',patch:{action:'hurt',actionTimer:.3}},
  {name:'shot impact pending',patch:{shotImpactKnockdownPending:.2}},
  {name:'shot impact knockdown',patch:{shotImpactKnockdownTimer:.2}},
  {name:'shot impact rise',patch:{shotImpactRiseTimer:.2}},
  {name:'shot-down recovery',patch:{action:'shotDown'}},
  {name:'shot-get-up recovery',patch:{action:'shotGetUp'}}
 ];
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
  for(const sample of unavailable){
   const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,humans:0,mode:'quick'});
   const carrier=game.player(team,3),defender=game.player(1-team,3);
   for(const other of game.players)if(other!==carrier&&other!==defender&&!other.keeper){other.down=true;other.stun=1;}
   Object.assign(carrier,{x,y,z:0,down:false,stun:0,keeper:false,action:'idle',actionTimer:0,
    dx:dir,dy:0,moveVX:dir*180,moveVY:0,face:dir,firstTouchOutletReadTimer:0,
    firstTouchControlTimer:0,firstTouchPressure:0,hideBallTimer:0,magicReadyAt:0,fatigue:0});
   Object.assign(carrier.src,{magicTrick:'hideBall',dribbling:50});
   Object.assign(defender,{x:x-dir*58,y:y+15,z:0,down:false,stun:0,invuln:0,keeper:false,
    action:'idle',actionTimer:0,slideTimer:0,dx:0,dy:0,moveVX:dir*150,moveVY:-30,face:dir});
   Object.assign(defender,sample.patch);
   Object.assign(defender.src,{defence:95});
   Object.assign(game.ball,{owner:carrier,x:x+dir*12,y,z:0,pass:false,passTarget:null,
    attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
   game.clock=2;
   assert.equal(game.tryMagicTrick(carrier),true);
   assert.equal(game.events.at(-1)?.countered,false,JSON.stringify({team,state:sample.name}));
   assert.equal(carrier.hideBallTimer,.65,JSON.stringify({team,state:sample.name}));
   assert.equal(defender.magicReadCueTimer||0,0,JSON.stringify({team,state:sample.name}));
   assert.equal(game.ball.owner,carrier,'an unavailable defender cannot read or take possession');
  }
 }
});
 
test('delayed Lightning counters recognize residual 2D approach after input release, but not retreat or stationary facing',async()=>{
 const ENGINE=await loadEngine(),field=ENGINE.WORLD.field;
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
  const cases=[
   {mode:'approach',moveVX:dir*144,moveVY:-108,countered:true},
   {mode:'retreat',moveVX:-dir*144,moveVY:108,countered:false},
   {mode:'stationary',moveVX:0,moveVY:0,countered:false}
  ];
  for(const sample of cases){
   const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,mode:'quick',humans:0});
   const carrier=game.player(team,3),defender=game.player(1-team,3);
   for(const other of game.players)if(other!==carrier&&other!==defender&&!other.keeper){other.down=true;other.stun=1;}
   Object.assign(carrier,{x,y,z:0,down:false,stun:0,keeper:false,action:'idle',actionTimer:0,
    face:dir,dx:dir,dy:0,moveVX:dir*180,moveVY:0,
    lightningPending:{remaining:.32,target:defender}});
   Object.assign(carrier.src,{dribbling:50});
   Object.assign(defender,{x:x-dir*50,y:y+30,z:0,down:false,stun:0,keeper:false,
    action:'idle',actionTimer:0,dx:0,dy:0,moveVX:sample.moveVX,moveVY:sample.moveVY,
    face:dir,lightningMark:.32});
   Object.assign(defender.src,{defence:95});
   Object.assign(game.ball,{owner:carrier,x:x+dir*12,y,z:0,pass:false,passTarget:null,
    attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
   const hit=game.resolveLightningTrick(carrier),event=game.events.at(-1);
   assert.equal(event?.type,'lightningTrickResolved',JSON.stringify({team,...sample,event}));
   assert.equal(event?.countered,sample.countered,JSON.stringify({team,...sample,event}));
   assert.equal(hit,!sample.countered,JSON.stringify({team,...sample,hit}));
   assert.equal(defender.stun,sample.countered?0:.32,JSON.stringify({team,...sample,stun:defender.stun}));
   assert.equal(carrier.lightningPending,null);
   assert.equal(defender.lightningMark,0);
   assert.equal(game.ball.owner,carrier,'Lightning countering must not transfer possession');
  }
 }
});


test('an earned Magic Trick screen preserves established give-and-go cover on both teams',async()=>{
 const AI=await loadAI(),ENGINE=await loadEngine(),field=ENGINE.WORLD.field;
 const bounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=field.x+field.w*(team===0?.35:.65),y=field.y+field.h*.5;
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,humans:0,mode:'quick'});game.clock=2;
  const carrier=game.player(team,3),primary=game.player(1-team,3),
   screen=game.player(1-team,4),runner=game.player(team,4);
  for(const q of game.players)if(q!==carrier&&q!==primary&&q!==screen&&q!==runner&&!q.keeper){
   q.down=true;q.stun=1;
  }
  Object.assign(carrier,{x,y,z:0,down:false,stun:0,keeper:false,action:'idle',actionTimer:0,
   dx:dir,dy:0,moveVX:dir*180,moveVY:0,face:dir,hideBallTimer:0,
   firstTouchOutletReadTimer:0,firstTouchControlTimer:0,firstTouchPressure:0});
  Object.assign(primary,{x:x+dir*20,y,z:0,down:false,stun:0,keeper:false,
   action:'idle',actionTimer:0,dx:0,dy:0,moveVX:0,moveVY:0,face:-dir});
  Object.assign(screen,{x:x+dir*80,y,z:0,down:false,stun:0,keeper:false,
   action:'idle',actionTimer:0,dx:0,dy:0,moveVX:0,moveVY:0,face:-dir,
   magicReadCounterpressTimer:.42,aiTimer:0});
  Object.assign(runner,{x:x+dir*240,y:y+220,z:0,down:false,stun:0,keeper:false,
   action:'idle',actionTimer:0,dx:0,dy:0,moveVX:0,moveVY:0,
   aiGiveAndGoRun:{receiverId:carrier.src.id,target:{x:x+dir*340,y:y+220},expires:game.clock+1}});
  Object.assign(game.ball,{owner:carrier,x:x+dir*12,y,z:0,pass:false,passTarget:null,
   attacker:team,lastTouchTeam:team,shot:null,strike:null,ordinaryShot:false});
  const expected=AI.defensiveGiveAndGoCoverTarget(1-team,carrier,game.players,bounds,game.clock);
  const pressing=AI.defensivePressers(game.players,1-team,carrier,null,null);
  const counter=AI.defensiveMagicReadCounterpressTarget(1-team,carrier,game.players,bounds,screen,primary,null);
  assert.ok(expected,JSON.stringify({team,expected,carrier,runner:runner.aiGiveAndGoRun}));
  assert.equal(pressing.primary,primary);
  assert.equal(pressing.support,screen);
  assert.ok(counter,JSON.stringify({team,counter,primary,screen}));
  game.driveAI(screen,.016);
  assert.ok(Math.abs(screen.aiTarget.x-expected.x)<1e-6,
   JSON.stringify({team,actual:screen.aiTarget,expected,counter}));
  assert.ok(Math.abs(screen.aiTarget.y-expected.y)<1e-6,
   JSON.stringify({team,actual:screen.aiTarget,expected,counter}));
 }
});
