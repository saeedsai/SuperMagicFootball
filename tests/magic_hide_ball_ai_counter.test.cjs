'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const aiLevels=mechanics.aiLevels;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{const m=Math.hypot(x,y)||1;return{x:x/m,y:y/m};};
function extract(startText,endText,label){
 const start=engine.indexOf(startText),end=engine.indexOf(endText,start);
 assert.ok(start>=0&&end>start,'extract '+label);
 return engine.slice(start,end);
}
const reactSource=extract(' reactToHideBallTrick(p,dt,reactionSeconds){','\n reactToTeleportTrick(','Hide Ball CPU reaction');
const react=vm.runInNewContext('({'+reactSource+'})',{distance,norm}).reactToHideBallTrick;
const trickSource=extract(' tryMagicTrick(p){',' updateSpinBumpFx(p,dt){','live Magic Trick resolver');
const resolve=vm.runInNewContext('({'+trickSource+'})',{
 F:mechanics.world.field,distance,norm,
 clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
 stat:(p,k)=>p.src?.[k]??50,
 STATS:{verifiedRatingTierForPlayer:()=>null},
 placeBananaPeel:()=>[],placeIcePatch:()=>[]
}).tryMagicTrick;
function fixture(side=0,{hold=.35,gap=56,trick='hideBall',otherNear=false}={}){
 const carrier={t:1-side,x:400,y:300,keeper:false,stun:0,fatigue:0,face:side?-1:1,
  dx:side?-1:1,dy:0,dribbleHold:hold,magicReadyAt:0,src:{id:'caster',name:'Caster',magicTrick:trick,dribbling:90}};
 const defender={t:side,x:400+(side?-gap:gap),y:300,keeper:false,stun:0,z:0,down:false,
  action:'idle',actionTimer:0,cd:0,face:side?1:-1,dx:side?1:-1,dy:0,
  src:{id:'cpu',name:'CPU defender',defence:80,strength:70}};
 const other={t:side,x:400+(side?-(otherNear?20:260):(otherNear?20:260)),y:300+(otherNear?0:180),
  keeper:false,stun:0,z:0,down:false,action:'idle',actionTimer:0,cd:0,face:side?1:-1,dx:0,dy:0,
  src:{id:'cover',name:'Cover'}};
 const game={ball:{owner:carrier},players:[carrier,defender,other],clock:2,magicHazards:[],
  fatigueLedger:[{},{}],events:[],pokes:0,lastSlide:null,
  tackle(p,slide=false){
   this.pokes++;this.lastSlide=slide;
   if(p.cd>0||p.stun>0)return false;
   p.cd=slide?.68:.57;p.action=slide?'slide':'punch';p.actionTimer=slide?.48:.4;
   const aim=norm(carrier.x-p.x,carrier.y-p.y);p.x+=aim.x*16;p.y+=aim.y*16;return true;
  },
  burst(){},emit(type,data){this.events.push({type,...data});}
 };
 return {game,carrier,defender,other};
}
function humanBackupFixture(side=0,{humanCounter=false,backupFacing=true,backupGap=64}={}){
 const f=fixture(side,{hold:.9,gap:45});
 const {game,carrier,defender,other}=f,heading=side?1:-1,backupHeading=backupFacing?heading:-heading;
 Object.assign(defender,{i:3,x:carrier.x+(side?-45:45),y:carrier.y,dx:heading,dy:0,face:heading,
  src:{...defender.src,defence:20}});
 Object.assign(other,{i:4,x:carrier.x+(side?-backupGap:backupGap),y:carrier.y,dx:backupHeading,dy:0,
  face:backupHeading,src:{...other.src,defence:80}});
 if(humanCounter)Object.assign(defender,{action:'punch',actionTimer:.3,z:0});
 game.controlled=[null,null];game.controlled[side]=defender.i;game.inControl=team=>team===side;
 return f;
}
test('a selected human nearest marker is backed up by one ready CPU PASS poke',()=>{
 for(const side of [0,1]){
  const {game,carrier,defender,other}=humanBackupFixture(side);
  let elapsed=.35;const dt=1/120;
  while(elapsed<1&&!game.pokes){
   carrier.dribbleHold=elapsed;
   react.call(game,other,dt,0);
   elapsed=Math.min(1,elapsed+dt);
  }
  assert.equal(game.pokes,1,'CPU backup supplies the existing PASS poke on team '+side);
  assert.equal(game.lastSlide,false);
  assert.equal(other.action,'punch');
  assert.equal(defender.action,'idle','the selected human retains input authority');
  assert.equal(game.controlled[side],defender.i);
  carrier.dribbleHold=1;
  assert.equal(resolve.call(game,carrier),true,'the real Hide Ball resolver accepts the backup');
  assert.equal(game.events.at(-1).countered,true);
  assert.equal(carrier.hideBallTimer||0,0);
 }
});
test('an already-active selected-human PASS poke prevents a duplicate CPU backup',()=>{
 for(const side of [0,1]){
  const {game,carrier,defender,other}=humanBackupFixture(side,{humanCounter:true});
  react.call(game,other,.02,0);
  assert.equal(game.pokes,0,'CPU does not duplicate the human counter on team '+side);
  carrier.dribbleHold=1;
  assert.equal(resolve.call(game,carrier),true);
  assert.equal(game.events.at(-1).countered,true,'the human PASS poke remains accepted');
 }
});
test('a backup facing away cannot counter Hide Ball on behalf of an idle human marker',()=>{
 for(const side of [0,1]){
  const {game,carrier,other}=humanBackupFixture(side,{backupFacing:false});
  react.call(game,other,.02,0);
  assert.equal(game.pokes,0,'misaligned CPU does not poke on team '+side);
  carrier.dribbleHold=1;
  assert.equal(resolve.call(game,carrier),true);
  assert.equal(game.events.at(-1).countered,false);
  assert.equal(carrier.hideBallTimer,.65,'uncountered Hide Ball still conceals normally');
 }
});
test('AI times a normal PASS poke before Hide Ball casts across sides, difficulties and frame rates',()=>{
 for(const side of [0,1])for(const fps of [30,60,120])for(let level=1;level<aiLevels.length;level++){
  const {game,carrier,defender}=fixture(side),dt=1/fps,reaction=aiLevels[level].reaction;
  let elapsed=.35;
  while(elapsed<1&&!game.pokes){
   elapsed=Math.min(1,elapsed+dt);carrier.dribbleHold=elapsed;
   react.call(game,defender,dt,reaction);
  }
  assert.equal(game.pokes,1,aiLevels[level].name+', team '+side+', '+fps+'Hz');
  assert.equal(game.lastSlide,false,'Hide Ball uses the existing grounded PASS poke, not SHOOT-slide');
  assert.equal(defender.action,'punch');
  assert.ok(defender.actionTimer>0);
  carrier.dribbleHold=1;
  assert.equal(resolve.call(game,carrier),true,'the real resolver accepts the timed poke');
  assert.equal(game.events.at(-1).countered,true);
  assert.equal(carrier.hideBallTimer||0,0,'counter prevents concealment');
  assert.equal(carrier.magicReadyAt,8,'caster still pays the six-second cooldown');
  assert.equal(carrier.fatigue,.035,'caster still pays the normal fatigue cost');
 }
});
test('Rookie reaction stays too slow; no instant counter or hidden-position knowledge',()=>{
 for(const side of [0,1]){
  const {game,carrier,defender}=fixture(side),dt=1/120;
  let elapsed=.35;
  while(elapsed<1&&!game.pokes){elapsed=Math.min(1,elapsed+dt);carrier.dribbleHold=elapsed;react.call(game,defender,dt,aiLevels[0].reaction);}
  assert.equal(game.pokes,0,'Rookie cannot beat the visible wind-up with its slower reaction');
  carrier.dribbleHold=1;carrier.hideBallTimer=.65;carrier.hideBallLastKnown={x:carrier.x,y:carrier.y};
  assert.equal(react.call(game,defender,.02,.01),false,'already-cast Hide Ball is not revealed to the AI');
  assert.equal(game.pokes,0);
 }
});
test('Only the nearest, grounded, facing defender can react inside the PASS-poke cone',()=>{
 const cases=[
  {name:'outside counter range',setup:f=>{f.defender.x=f.carrier.x+71;}},
  {name:'not nearest',setup:f=>{f.other.x=f.carrier.x+20;f.other.y=f.carrier.y;}},
  {name:'facing away',setup:f=>{f.defender.face=f.defender.t===0?1:-1;f.defender.dx=f.defender.face;}},
  {name:'airborne',setup:f=>{f.defender.z=22;}},
  {name:'active slide',setup:f=>{f.defender.action='slide';f.defender.actionTimer=.2;}},
  {name:'active jump',setup:f=>{f.defender.action='jump';f.defender.actionTimer=.2;f.defender.z=22;}},
  {name:'hurt recovery',setup:f=>{f.defender.action='hurt';f.defender.actionTimer=.2;}},
  {name:'stunned',setup:f=>{f.defender.stun=.2;}},
  {name:'wrong trick',setup:f=>{f.carrier.src.magicTrick='teleport';}},
  {name:'before warning',setup:f=>{f.carrier.dribbleHold=.34;}},
  {name:'after cast',setup:f=>{f.carrier.dribbleHold=1;}}
 ];
 for(const side of [0,1])for(const c of cases){
  const f=fixture(side,{hold:.9});c.setup(f);
  react.call(f.game,f.defender,.02,.01);
  assert.equal(f.game.pokes,0,c.name+', team '+side);
 }
});
test('Invalid timing fails safely and releasing DRIBBLE clears the pending read',()=>{
 for(const side of [0,1]){
  const invalid=fixture(side,{hold:.9});
  react.call(invalid.game,invalid.defender,.02,NaN);
  assert.equal(invalid.game.pokes,0);
  assert.ok(invalid.defender.aiHideBallReaction>.7,'invalid difficulty timing uses a conservative delay');
  const pending=fixture(side,{hold:.6});
  react.call(pending.game,pending.defender,.02,.12);
  assert.equal(pending.defender.aiHideBallThreat,pending.carrier);
  pending.carrier.dribbleHold=0;
  react.call(pending.game,pending.defender,.02,.12);
  assert.equal(pending.defender.aiHideBallThreat,null,'released wind-up clears the pending response');
 }
});
test('AI dispatch, Studio counterplay guidance and four-action schema stay aligned',()=>{
 assert.match(engine,/if\(this\.reactToHideBallTrick\(p,dt,ai\.reaction\)\|\|p\.aiHideBallThreat\)return/);
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/hideBall:'[^']*timed PASS poke/);
 const input=fs.readFileSync('src/modules/input.js','utf8');
 assert.match(input,/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
});


test('neutral Hide Ball marker uses live closing velocity before stale facing',()=>{
 for(const side of [0,1]){
  const f=fixture(side,{hold:.9,gap:56});
  Object.assign(f.defender,{dx:0,dy:0,moveVX:side===0?-180:180,moveVY:0,face:side===0?1:-1});
  assert.equal(react.call(f.game,f.defender,.02,0),true,'live closing momentum should enter the existing PASS-poke response on team '+side);
  assert.equal(f.game.pokes,1);
  assert.equal(f.defender.action,'punch');
  f.carrier.dribbleHold=1;
  assert.equal(resolve.call(f.game,f.carrier),true);
  assert.equal(f.game.events.at(-1).countered,true);
  assert.equal(f.carrier.hideBallTimer||0,0);
 }
});

test('neutral Hide Ball marker trusts actual retreat velocity over stale facing',()=>{
 for(const side of [0,1]){
  const f=fixture(side,{hold:.9,gap:56});
  Object.assign(f.defender,{dx:0,dy:0,moveVX:side===0?180:-180,moveVY:0,face:side===0?-1:1});
  assert.equal(react.call(f.game,f.defender,.02,0),false,'retreating momentum must not be overridden by a facing-only fallback');
  assert.equal(f.game.pokes,0);
  f.carrier.dribbleHold=1;
  assert.equal(resolve.call(f.game,f.carrier),true);
  assert.equal(f.game.events.at(-1).countered,false);
  assert.equal(f.carrier.hideBallTimer,.65);
 }
});

test('Hide Ball retains facing fallback only when both input and live movement are neutral',()=>{
 for(const side of [0,1]){
  const f=fixture(side,{hold:.9,gap:56});
  Object.assign(f.defender,{dx:0,dy:0,moveVX:0,moveVY:0});
  assert.equal(react.call(f.game,f.defender,.02,0),true);
  assert.equal(f.game.pokes,1);
 }
});

test('actual GameEngine aligns a neutral-input Hide Ball PASS poke with closing movement',async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const {ENGINE}=await import('../src/modules/engine.js');
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,mode:'quick',humans:0});
  game.matchState='paused';game.clock=10;game.events=[];
  const field=ENGINE.WORLD.field,dir=team===0?1:-1,x=field.x+field.w/2,y=field.y+field.h/2;
  const defender=game.player(team,3),carrier=game.player(1-team,3);
  for(const q of game.players)if(q!==defender&&q!==carrier)Object.assign(q,{down:true,stun:1});
  carrier.src={...carrier.src,magicTrick:'hideBall',dribbling:90};
  Object.assign(carrier,{x,y,z:0,keeper:false,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,dribbleHold:.9,magicReadyAt:0,fatigue:0,breath:1});
  Object.assign(defender,{x:x+dir*56,y,z:0,keeper:false,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,cd:0,dx:0,dy:0,moveVX:-dir*180,moveVY:0,face:dir,src:{...defender.src,defence:80}});
  Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
  const originalRandom=Math.random;Math.random=()=>.999;
  try{
   assert.equal(game.reactToHideBallTrick(defender,.02,0),true);
   assert.equal(defender.action,'punch');
   const tx=carrier.x-defender.x,ty=carrier.y-defender.y,hl=Math.hypot(defender.dx,defender.dy);
   assert.ok(hl>.9&&(tx*defender.dx+ty*defender.dy)/(Math.hypot(tx,ty)*hl)>=.99,
    'neutral-input PASS poke must aim along live closing movement, not stale facing');
   carrier.dribbleHold=1;assert.equal(game.tryMagicTrick(carrier),true);
  }finally{Math.random=originalRandom;}
  assert.equal(game.events.at(-1).countered,true,'live resolver accepts the correctly aimed poke');
  assert.equal(game.ball.owner,carrier);assert.equal(carrier.hideBallTimer||0,0);
 }
});
