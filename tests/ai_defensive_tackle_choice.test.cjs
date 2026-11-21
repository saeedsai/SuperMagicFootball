'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

let AI,GameEngine,DEFAULT_OPTIONS;
test.before(async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 ({AI}=await import('../src/modules/ai.js'));
 ({GameEngine}=await import('../src/engine.js'));
 ({DEFAULT_OPTIONS}=await import('../src/data.js'));
});

const player=(t,x,y,extra={})=>({t,x,y,keeper:false,stun:0,invuln:0,down:false,z:0,...extra});

test('run-up slide reads an escaping carrier in either attacking direction',()=>{
 for(const dir of [1,-1]){
  const defender=player(0,1000,700,{moveVX:dir*220,moveVY:0});
  const carrier=player(1,1000+dir*60,700,{moveVX:dir*300,moveVY:0});
  assert.equal(AI.defensiveTackleSlide(defender,carrier,250),true);
 }
});

test('a carrier not escaping while the defender closes is met with a short poke',()=>{
 const defender=player(0,1000,700,{moveVX:220,moveVY:0});
 const carrier=player(1,1060,700,{moveVX:0,moveVY:0});
 assert.equal(AI.defensiveTackleSlide(defender,carrier,250),false);
});

test('a running defender can slide across a lateral cut when relative closure is bounded',()=>{
 const defender=player(0,1000,700,{moveVX:110,moveVY:0});
 const carrier=player(1,1060,700,{moveVX:40,moveVY:190});
 assert.equal(AI.defensiveTackleSlide(defender,carrier,160),true);
});

test('standing defenders, very close contact and invalid or unavailable carriers keep the poke',()=>{
 const running=player(0,1000,700,{moveVX:240,moveVY:0});
 const escaping=player(1,1060,700,{moveVX:320,moveVY:0});
 assert.equal(AI.defensiveTackleSlide({...running,moveVX:0,moveVY:0},escaping,250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,x:1040},250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,z:25},250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,invuln:.3},250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,down:true},250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,x:Infinity},250),false);
});

function inputStub(){
 return {
  state:[{},{}],edges:[{},{}],poll(){},
  just(team,action){return !!this.edges[team]?.[action]},
  held(team,action){return !!this.state[team]?.[action]},
  released(){return false},tapDuration(){return 0},canceled(){return false}
 };
}
function liveFixture(team,carrierVX){
 const input=inputStub();
 const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
 game.init({home:0,away:1,mode:'quick',humans:0,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
 game.humans=0;game.aiComboNext=[999,999];game.aiComboThink=[999,999];
 const dir=team===0?1:-1;
 const defender=game.players.find(p=>p.t===team&&p.i===3);
 const carrier=game.players.find(p=>p.t!==team&&p.i===3);
 for(const p of game.players){
  p.stun=0;p.down=false;p.z=0;p.action='idle';p.actionTimer=0;
  p.slideTimer=0;p.invuln=0;p.aiAssistTarget=null;
  if(p===defender||p===carrier)continue;
  if(p.t===team&&!p.keeper){p.x=350;p.y=250+p.i*25;}
  else if(p.t!==team&&!p.keeper){p.x=2050;p.y=1180-p.i*25;}
 }
 defender.x=1200;defender.y=700;defender.moveVX=dir*240;defender.moveVY=0;
 defender.dx=dir;defender.dy=0;defender.face=dir;defender.cd=0;
 defender.aiTimer=0;defender.aiTarget=null;defender.dashTimer=0;defender.sprintCharge=0;
 carrier.x=1200+dir*60;carrier.y=700;carrier.moveVX=carrierVX*dir;carrier.moveVY=0;
 carrier.cd=0;carrier.stun=0;carrier.invuln=0;carrier.down=false;carrier.z=0;carrier.dribbleHold=0;carrier.hideBallTimer=0;carrier.src.magicTrick=null;
 game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;game.ball.z=0;
 game.ball.vx=carrier.moveVX;game.ball.vy=0;
 game.supernova=null;game.magicWalls=[];game.events=[];game.matchState='play';
 return {game,defender,carrier};
}
function withZeroRandom(fn){
 const original=Math.random;
 try{Math.random=()=>0;return fn();}finally{Math.random=original;}
}

test('driveAI uses the run-up slide against an escaping carrier on both sides',()=>{
 for(const team of [0,1]){
  const {game,defender,carrier}=liveFixture(team,300);
  assert.equal(AI.defensiveTackleSlide(defender,carrier,game.playerSpeed(defender)),true);
  withZeroRandom(()=>game.driveAI(defender,1/60));
  assert.ok(game.events.some(event=>event.type==='slideStart'&&event.player===defender.src.name),
   'an eligible running defender should use the existing SHOOT slide');
 }
});

test('driveAI uses the short tackle when the carrier is closing into the defender',()=>{
 const {game,defender,carrier}=liveFixture(0,0);
 assert.equal(AI.defensiveTackleSlide(defender,carrier,game.playerSpeed(defender)),false);
 withZeroRandom(()=>game.driveAI(defender,1/60));
 assert.ok(defender.cd>0,'the CPU still attempts the tackle');
 assert.equal(game.events.some(event=>event.type==='slideStart'&&event.player===defender.src.name),false,
  'the close, approaching carrier should be met with the short PASS poke');
});
