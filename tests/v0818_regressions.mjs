import assert from 'node:assert/strict';
import {GameEngine,WORLD,attackingStoppage,superShotKnockback} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const control={state:[{},{}],pressed:{},releasedActions:{},poll(){},just(t,a){return !!this.pressed[a]},released(t,a){return !!this.releasedActions[a]}};
function game(){control.state=[{},{}];control.pressed={};control.releasedActions={};const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},control);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear',halfSeconds:20}});g.cooldown=0;g.driveAI=()=>{};g.autoSwitch=()=>false;return g;}
const oldRandom=Math.random;
try{
 Math.random=()=>0;
 // Slide travels over time: standing vs running and a successful contact along its path.
 for(const running of [false,true]){
  const g=game(),a=g.player(0,3),v=g.player(1,3);
  for(const p of g.players)if(p!==a&&p!==v){p.x=p.t?3400:300;p.y=1100;}
  g.ball.owner=v;a.x=1300;a.y=700;v.x=1475;v.y=700;a.face=1;a.stun=0;a.cd=0;a.moveVX=running?1000:0;
  assert(g.tackle(a,true));const initial=a.x;const expectedReach=a.slideSpeed*a.slideTimer;
  assert(expectedReach>(running?185:105),'slide reach is substantially longer than old 26-unit nudge');
  for(let i=0;i<40;i++)g.updatePlayers(.016);
  assert(a.x-initial>100,'slide advances continuously through its duration');
  assert(v.stun>0,'slide impacts a target encountered along the movement path');
  assert(g.events.some(e=>e.type==='slideStart')&&g.events.some(e=>e.type==='tackleHit'));
 }
 // Straight tackles still work, but should not begin a travelling slide.
 {const g=game(),a=g.player(0,3),v=g.player(1,3);a.x=1400;a.y=700;v.x=1435;v.y=700;a.cd=0;g.tackle(a,false);assert(!a.slideTimer&&v.stun>0);}
 // Added time is conditional on a real ball carrier in their attacking third.
 {const g=game(),p=g.player(0,3);g.take(p);p.x=WORLD.field.x+WORLD.field.w*.86;assert(attackingStoppage(g.ball));g.clock=19.99;g.update(.02);assert.equal(g.matchState,'play');assert(g.stoppageAnnounced&&g.stoppageWindow>0);const cap=g.matchSeconds+g.stoppageWindow;g.clock=cap-.005;g.update(.02);assert.notEqual(g.matchState,'play','bounded extra time must expire even during an attack');}
 {const g=game(),p=g.player(0,3);g.take(p);p.x=WORLD.field.x+WORLD.field.w*.42;g.clock=19.99;g.update(.02);assert.equal(g.half,2,'no added time away from the attacking third');assert.equal(g.matchState,'paused');}
 {const g=game(),p=g.player(0,3);g.take(p);p.x=WORLD.field.x+WORLD.field.w*.85;g.clock=19.99;g.update(.02);assert.equal(g.matchState,'play');p.x=1600;g.update(.02);assert.equal(g.matchState,'paused','attack leaving goal zone ends extra time early');}
 // Stronger super shots and higher ability level launch more often; victim strength protects.
 assert(superShotKnockback(220,5,15)>superShotKnockback(110,1,15));
 assert(superShotKnockback(220,5,15)>superShotKnockback(220,5,95));
 {const g=game(),v=g.player(1,3);for(const p of g.players)if(p!==v){p.x=p.t?3430:310;p.y=1100;}
  v.x=1700;v.y=720;g.ball.owner=null;g.ball.x=v.x;g.ball.y=v.y;g.ball.z=18;g.ball.vx=1800;g.ball.vy=0;g.ball.vz=0;g.ball.shot={level:5,id:'nuts',behavior:'straight'};g.ball.power=210;g.ball.attacker=0;g.ball.canCollect=0;
  g.updateBall(.001);assert(v.stun>0,'super impact stuns');assert(v.z>0&&v.vz>0,'high super impact can launch a weaker player');assert(g.events.some(e=>e.type==='superShotLaunch'));
 }
 // Complete tap/hold distinction for carrying-ball jump and cross precedence.
 {const g=game(),p=g.player(0,3);g.take(p);control.state[0]={jump:1,x:1,y:0};control.pressed={jump:true};g.updatePlayers(.016);assert.equal(p.z,0,'holding Jump does not immediately jump');control.pressed={};for(let i=0;i<18;i++)g.updatePlayers(.016);assert.equal(p.z,0,'running hold stays grounded');control.state[0]={jump:0,x:0,y:0};control.releasedActions={jump:true};g.updatePlayers(.016);assert.equal(p.z,0,'releasing a long running hold must not jump');}
 {const g=game(),p=g.player(0,3);g.take(p);control.state[0]={jump:1,x:0,y:0};control.pressed={jump:true};g.updatePlayers(.016);control.state[0]={};control.pressed={};control.releasedActions={jump:true};g.updatePlayers(.016);assert(p.z>0,'quick jump tap triggers a jump');}
 {const g=game(),p=g.player(0,3);g.take(p);control.state[0]={pass:1,jump:1,dribble:0};control.pressed={pass:true,jump:true};g.updatePlayers(.016);assert.equal(g.ball.owner,p,'simultaneous Pass+Jump must NOT cross');assert.equal(g.events.filter(e=>e.type==='kick').length,0);control.state[0]={};control.pressed={};control.releasedActions={pass:true,jump:true};g.updatePlayers(.016);assert.equal(g.ball.owner,null,'pass still releases normally');assert.equal(g.events.filter(e=>e.type==='kick').length,1);}
 // Unassigned overlaps must not fire both base actions in one press/release cycle.
 {const g=game(),p=g.player(0,3);g.take(p);control.state[0]={shoot:1,pass:1,dribble:1};control.pressed={shoot:true,pass:true,dribble:true};g.updatePlayers(.016);
  assert.equal(g.events.filter(e=>e.type==='dribble').length,0,'Shoot+Dribble must not dash');
  control.state[0]={};control.pressed={};control.releasedActions={pass:true,shoot:true,dribble:true};g.updatePlayers(.016);
  assert(g.ball.owner===null,'Shoot wins possession action on release');assert.equal(g.events.filter(e=>e.type==='kick').length,1,'releasing Pass after Shoot must not create ghost Pass');
 }
 {const g=game(),p=g.player(0,3);g.take(p);control.state[0]={pass:1,dribble:1};control.pressed={pass:true,dribble:true};g.updatePlayers(.016);
  assert.equal(g.events.filter(e=>e.type==='dribble').length,0,'Pass+Dribble overlap gives Pass priority');
  control.state[0]={};control.pressed={};control.releasedActions={pass:true};g.updatePlayers(.016);
  assert.equal(g.ball.owner,null,'Pass+Dribble should still pass');
 }
 console.log('v0.8.18 REGRESSIONS PASS: moving/running slides, contact, ordinary tackle, bounded attacking stoppage, super-shot launch/stat resistance, held/tapped jump and cross priority');
}finally{Math.random=oldRandom;}
