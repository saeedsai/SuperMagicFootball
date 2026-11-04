'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const source=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const WORLD=mechanics.world,F=WORLD.field;
function method(name,next,globals={}){
 const a=source.indexOf(`\n ${name}(`),b=source.indexOf(`\n ${next}(`,a);
 assert.ok(a>=0&&b>a,`extract ${name}`);
 return vm.runInNewContext('({'+source.slice(a,b)+'})',globals)[name];
}
const isInPenaltyArea=method('isInPenaltyArea','handleEndlineRestart',{F,WORLD});
const slideContact=method('slideContact','tackle',{distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 contest:()=>({knockChance:1,duration:.4}),moraleFactor:()=>1,stat:()=>50,
 norm:(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d}},tackleStunDuration:()=>.4,
 Math:Object.assign(Object.create(Math),{random:()=>0})});
const penaltySource=source.slice(source.indexOf(' startPK(afterDraw=false'),source.indexOf('\n reactToMagicWall(',source.indexOf(' startPK(afterDraw=false')));
const penaltyMethods=vm.runInNewContext('({'+penaltySource.replace('\n updatePK(dt){',',\n updatePK(dt){')+'})',{
 WORLD,F,clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),randomBetween:(a,b)=>(a+b)/2,
 aiTuning:()=>({id:2,keeperRead:.5}),stat:()=>75
});

function foulFixture(victimTeam=0,x,y){
 const center=(WORLD.goalTop+WORLD.goalBottom)/2;
 const carrier={t:victimTeam,i:3,src:{id:`carrier-${victimTeam}`,name:'Carrier'},keeper:false,z:0,
  x:Number.isFinite(x)?x:victimTeam===0?F.x+F.w-90:F.x+90,y:Number.isFinite(y)?y:center,
  moveVX:victimTeam===0?100:-100,moveVY:0,stun:0,invuln:0,trickGuard:0};
 const tackler={t:1-victimTeam,i:2,src:{id:'tackler',name:'Tackler'},keeper:false,z:0,x:carrier.x+(victimTeam===0?-40:40),y:carrier.y,
  slideTimer:.3,slideRemaining:40,stun:0,invuln:0,trickGuard:0};
 const g={players:[tackler,carrier],ball:{owner:carrier},events:[],emit(type,data={}){this.events.push({type,...data})},
  isInPenaltyArea,startPK(_afterDraw,team){this.penaltyTeam=team;this.matchState='penalty';return true},
  startFreeKick(team,x,y){this.freeKick={team,x,y};return true}};
 Object.assign(g,{slideContact});return{g,tackler,carrier};
}

test('penalty-box classification mirrors both goals using standard field proportions and includes boundary lines',()=>{
 const center=(WORLD.goalTop+WORLD.goalBottom)/2,depth=F.w*16.5/105,halfWidth=F.h*40.32/68/2;
 for(const team of [0,1]){
  const x=team===0?F.x+F.w-depth:F.x+depth;
  assert.equal(isInPenaltyArea(team,x,center),true,`team ${team} goal line is inside`);
  assert.equal(isInPenaltyArea(team,team===0?F.x+F.w:F.x,center+halfWidth),true,'boundary belongs to the area');
  assert.equal(isInPenaltyArea(team,team===0?x-1:x+1,center),false,'one world unit beyond the box is outside');
  assert.equal(isInPenaltyArea(team,x,center+halfWidth+1),false,'one world unit beyond the side line is outside');
 }
 assert.equal(isInPenaltyArea(0,NaN,center),false);
});

test('grounded slide-from-behind foul in either penalty area enters the matching single-kick mode',()=>{
 for(const team of [0,1]){
  const {g,tackler,carrier}=foulFixture(team);
  assert.equal(g.slideContact(tackler),true);
  assert.equal(g.penaltyTeam,team);assert.equal(g.matchState,'penalty');
  assert.equal(tackler.slideTimer,0);assert.equal(tackler.slideRemaining,0);
  assert.equal(g.events[0].kind,'slideFromBehind');
 }
});

test('same foul outside the penalty box remains a direct free kick',()=>{
 const center=(WORLD.goalTop+WORLD.goalBottom)/2,depth=F.w*16.5/105;
 const {g,tackler}=foulFixture(0,F.x+F.w-depth-1,center);
 g.slideContact(tackler);assert.equal(g.matchState,undefined);assert.equal(g.freeKick.team,0);
});

function penaltyGame(team){
 const events=[],players=[0,1].map(t=>Array.from({length:6},(_,i)=>({t,i,keeper:i===0,src:{id:`${t}-${i}`,name:`P${t}-${i}`,shootAccuracy:80}}))).flat();
 const g={events,matchState:'play',humans:1,score:[2,1],ball:{owner:null,x:0,y:0,z:0,vx:0,vy:0,vz:0},
  players,rosters:[players.filter(p=>p.t===0).map(p=>p.src),players.filter(p=>p.t===1).map(p=>p.src)],
  teamPlans:[{penalty:3},{penalty:4}],input:{poll(){},state:[{},{}],just:()=>false},
  inControl:()=>false,player(t,i){return players.find(p=>p.t===t&&p.i===i)},take(p){this.ball.owner=p},
  _closeShotAudits(){},onGoalMorale(){},getTeam:t=>({name:`Team ${t}`}),burst(){},
  cancelPendingAbilityActions(){},
  emit(type,data={}){events.push({type,...data})},startPK:penaltyMethods.startPK,updatePK:penaltyMethods.updatePK};
 g.startPK(false,team);return g;
}
function resolveOneKick(g,goal){
 const pk=g.pk,cy=(WORLD.goalTop+WORLD.goalBottom)/2;
 pk.ready=0;pk.timer=8;pk.shotTimer=.001;pk.shotMax=.8;pk.shotTargetY=goal?cy+70:cy;pk.saveY=cy;
 g.updatePK(.02);
}

test('in-match penalty resolves once, updates score on goal, and returns to regular play',()=>{
 for(const team of [0,1]){
  const g=penaltyGame(team);assert.equal(g.pk.inMatchTeam,team);assert.equal(g.pk.turn,team);
  resolveOneKick(g,true);
  assert.equal(g.matchState,'play');assert.equal(g.pk,null);
  assert.equal(g.score[team],team===0?3:2);assert.equal(g.pendingKickoff.scorer,team);
  assert.equal(g.events.filter(e=>e.type==='goal').length,1);
  assert.equal(g.events.find(e=>e.type==='goal').penalty,true);
 }
});

test('missed in-match penalty returns play with the defending keeper and does not alter score',()=>{
 const g=penaltyGame(1),before=g.score.slice();resolveOneKick(g,false);
 assert.equal(g.matchState,'play');assert.equal(g.pk,null);assert.deepEqual(g.score,before);
 assert.equal(g.ball.owner,g.player(0,0));
 assert.deepEqual(g.events.filter(e=>e.type==='matchPenaltyResolved').map(e=>e.goal),[false]);
});

test('ordinary post-draw shootout remains the existing alternating lifecycle',()=>{
 const g=penaltyGame(0);g.startPK(false);
 assert.equal(g.pk.inMatchTeam,null);assert.equal(g.pk.turn,0);
});
